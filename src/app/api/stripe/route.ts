import prisma from "@/lib/db";
import { stripe, syncStripeDataToDB } from "@/lib/stripe";
import { emailService } from "@/lib/email";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Ensure this route runs in Node.js runtime (Stripe SDK requires Node)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Events we track for Stripe data sync (following the guide's recommendations)
const allowedEvents: Stripe.Event.Type[] = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "customer.subscription.pending_update_applied",
  "customer.subscription.pending_update_expired",
  "customer.subscription.trial_will_end",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.payment_action_required",
  "invoice.upcoming",
  "invoice.marked_uncollectible",
  "invoice.payment_succeeded",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
  "charge.dispute.created",
  "charge.succeeded",
];

// Production-ready webhook handler with unified sync approach
export async function POST(req: Request) {
  const body = await req.text();
  // Header name is case-insensitive but Stripe sends "Stripe-Signature"
  const signature = (await headers()).get("Stripe-Signature") as string;

  if (!signature) {
    console.error("❌ Missing Stripe signature");
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      // Use a single, consistent env var for webhook secret
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error: unknown) {
    console.error("❌ Webhook signature verification failed:", error);
    return new Response("Webhook signature verification failed", {
      status: 400,
    });
  }

  // Log all events for monitoring
  console.log(`📡 Stripe webhook received: ${event.type} - ${event.id}`);

  try {
    // Handle specific events that need custom logic
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutSessionCompleted(event);
        break;
      }
      case "charge.dispute.created": {
        await handleDisputeCreated(event);
        break;
      }
      default: {
        // Use unified sync for all other events (following guide pattern)
        if (allowedEvents.includes(event.type)) {
          await processEventWithUnifiedSync(event);
        } else {
          console.log(`🔄 Unhandled event type: ${event.type}`);
        }
      }
    }

    console.log(
      `✅ Successfully processed webhook: ${event.type} - ${event.id}`
    );
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(`❌ Error processing webhook ${event.type}:`, error);
    // Return 500 so Stripe retries the webhook
    return new Response("Internal server error", { status: 500 });
  }
}

/**
 * UNIFIED EVENT PROCESSING
 * Following the guide's pattern - all events flow through syncStripeDataToDB
 */
async function processEventWithUnifiedSync(event: Stripe.Event) {
  try {
    // All the events we track have a customerId (following guide assumption)
    const { customer: customerId } = event?.data?.object as {
      customer: string;
    };

    // Type safety check (following guide pattern)
    if (typeof customerId !== "string") {
      throw new Error(
        `[STRIPE HOOK][CANCER] Customer ID isn't string.\nEvent type: ${event.type}`
      );
    }

    console.log(`🔄 Processing ${event.type} for customer ${customerId}`);

    // THE SINGLE SYNC FUNCTION handles everything
    await syncStripeDataToDB(customerId);

    console.log(`✅ Unified sync completed for customer ${customerId}`);
  } catch (error) {
    console.error(`❌ Unified sync failed for event ${event.type}:`, error);
    throw error; // Re-throw to trigger Stripe retry
  }
}

// Handle successful checkout completion
async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;

  if (!session.metadata?.userId || !session.metadata?.orderId) {
    console.error("❌ Missing metadata in session:", session.metadata);
    throw new Error("Missing required metadata");
  }

  // Validate amounts match
  const order = await prisma.order.findUnique({
    where: { id: session.metadata.orderId },
    include: { items: true },
  });

  if (!order) {
    console.error("❌ Order not found:", session.metadata.orderId);
    throw new Error("Order not found");
  }

  // Idempotency guard: skip if already processed
  if (order.paymentStatus === "succeeded") {
    console.log("ℹ️ Order already marked as succeeded, skipping:", order.id);
    return;
  }

  // Calculate expected amount in cents (Stripe uses cents)
  // Our DB stores amounts/prices in pounds per schema comments
  const expectedAmount = order.items.reduce((total, item) => {
    return total + Math.round(item.price * 100) * item.quantity;
  }, 0);

  // Validate the payment amount matches the order amount
  if (session.amount_total !== expectedAmount) {
    console.error("❌ Amount mismatch:", {
      sessionAmount: session.amount_total,
      orderAmount: expectedAmount,
      orderId: order.id,
    });
    throw new Error("Payment amount does not match order total");
  }

  // Get payment intent details for comprehensive recording
  const paymentIntentId = session.payment_intent as string | null;
  let stripeFeeCents: number | null = null;

  // If we have a payment intent, get the fees from Stripe
  if (paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId,
        { expand: ["latest_charge"] }
      );

      if (
        paymentIntent.latest_charge &&
        typeof paymentIntent.latest_charge === "object"
      ) {
        const charge = paymentIntent.latest_charge;
        if (charge.balance_transaction) {
          const balanceTransaction = await stripe.balanceTransactions.retrieve(
            charge.balance_transaction as string
          );
          stripeFeeCents = balanceTransaction.fee; // In cents
        }
      }
    } catch (error) {
      console.error("⚠️ Error fetching payment details:", error);
      // Don't throw - continue with order processing
    }
  }

  // Generate invoice number with better format
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}-${order.id.slice(-4)}`;

  try {
    // Capture customer details from Stripe session
    // Prefer explicit shipping details when available
    const shippingDetails = (session as any).shipping_details as any;
    const customerDetails = session.customer_details;
    const address =
      shippingDetails?.address || customerDetails?.address || null;

    // Prefer shipping_details name/email if present
    const customerEmail = shippingDetails?.name
      ? customerDetails?.email || session.customer_email
      : customerDetails?.email || session.customer_email;

    // Prefer shipping name, else fall back to customer_details name
    let customerName = shippingDetails?.name || customerDetails?.name || null;
    if (!customerName && customerEmail) {
      // Extract name from email (e.g., "rawa@example.com" -> "rawa")
      const emailName = customerEmail.split("@")[0];
      // Capitalize first letter and replace dots/underscores with spaces
      customerName = emailName
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
    }

    // Build complete shipping address string
    let fullShippingAddress = "";
    if (address) {
      const addressParts = [
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.postal_code,
        address.country,
      ].filter(Boolean); // Remove empty/undefined parts
      fullShippingAddress = addressParts.join(", ");
    }

    // Update order with complete payment information using transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update the order
      const orderUpdate = await tx.order.update({
        where: { id: session.metadata!.orderId },
        data: {
          status: "paid",
          paymentStatus: "succeeded",
          stripeSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
          // Store fee in pounds to match schema comment
          stripeFee:
            typeof stripeFeeCents === "number"
              ? Math.round(stripeFeeCents / 100)
              : null,
          paidAt: new Date(),
          invoiceNumber: invoiceNumber,
          // Update shipping information from Stripe
          shippingEmail: customerEmail || undefined,
          shippingName: customerName || undefined,
          shippingAddress: fullShippingAddress || undefined,
          shippingCity: address?.city || undefined,
          shippingState: address?.state || undefined,
          shippingPostalCode: address?.postal_code || undefined,
          shippingCountry: address?.country || undefined,
          shippingPhone:
            shippingDetails?.phone || customerDetails?.phone || undefined,
        },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Log the payment for audit trail
      console.log("✅ Order payment recorded successfully:", {
        orderId: session.metadata!.orderId,
        paymentIntentId,
        invoiceNumber,
        stripeFee: stripeFeeCents
          ? `£${(stripeFeeCents / 100).toFixed(2)}`
          : "N/A",
        amount: session.amount_total
          ? `£${(session.amount_total / 100).toFixed(2)}`
          : "N/A",
        customerEmail: customerEmail,
        timestamp: new Date().toISOString(),
      });

      return orderUpdate;
    });

    // SYNC STRIPE DATA after successful checkout (following guide pattern)
    if (updatedOrder.user?.stripeCustomerId) {
      try {
        console.log(
          `🔄 Post-checkout sync for customer: ${updatedOrder.user.stripeCustomerId}`
        );
        await syncStripeDataToDB(updatedOrder.user.stripeCustomerId);
        console.log(
          `✅ Post-checkout sync completed for customer: ${updatedOrder.user.stripeCustomerId}`
        );
      } catch (syncError) {
        console.error("⚠️ Post-checkout sync failed:", syncError);
        // Don't fail the webhook if sync fails
      }
    }

    // Send payment confirmation email
    if (updatedOrder.user?.email) {
      try {
        const orderData = {
          orderNumber: updatedOrder.id,
          invoiceNumber: updatedOrder.invoiceNumber,
          customerName:
            updatedOrder.user.firstName && updatedOrder.user.lastName
              ? `${updatedOrder.user.firstName} ${updatedOrder.user.lastName}`
              : updatedOrder.user.email,
          items: updatedOrder.items.map((item) => ({
            name: item.product?.name || "Product",
            quantity: item.quantity,
            price: item.price,
          })),
          total: updatedOrder.amount, // Amount is already in pounds
          paymentDate: new Date().toLocaleDateString(),
        };

        await emailService.sendPaymentConfirmed(
          updatedOrder.user.email,
          orderData
        );
        console.log(
          "✅ Payment confirmation email sent to:",
          updatedOrder.user.email
        );
      } catch (emailError) {
        console.error(
          "⚠️ Failed to send payment confirmation email:",
          emailError
        );
        // Don't throw - email failure shouldn't fail the webhook
      }
    }
  } catch (error) {
    console.error("❌ Database error updating order payment status:", error);
    throw error; // Re-throw to trigger Stripe retry
  }
}

// Handle successful payment intent
async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  console.log("✅ Payment Intent succeeded:", {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
  });

  // Additional processing if needed
}

// Handle failed payment
async function handlePaymentIntentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  console.error("❌ Payment failed:", {
    id: paymentIntent.id,
    lastPaymentError: paymentIntent.last_payment_error,
    amount: paymentIntent.amount,
  });

  try {
    await prisma.order.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        paymentStatus: "failed",
        status: "cancelled",
      },
    });

    console.log("✅ Payment failure recorded for intent:", paymentIntent.id);
  } catch (error) {
    console.error("❌ Error updating failed payment:", error);
    throw error;
  }
}

// Handle canceled payment
async function handlePaymentIntentCanceled(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  try {
    await prisma.order.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        paymentStatus: "cancelled",
        status: "cancelled",
      },
    });

    console.log(
      "🚫 Payment cancellation recorded for intent:",
      paymentIntent.id
    );
  } catch (error) {
    console.error("❌ Error updating cancelled payment:", error);
    throw error;
  }
}

// Handle disputes (chargebacks)
async function handleDisputeCreated(event: Stripe.Event) {
  const dispute = event.data.object as Stripe.Dispute;

  console.warn("⚠️ Dispute created:", {
    id: dispute.id,
    amount: dispute.amount,
    reason: dispute.reason,
    status: dispute.status,
  });

  try {
    // Find order by charge ID and mark as disputed
    const charge = await stripe.charges.retrieve(dispute.charge as string);

    await prisma.order.updateMany({
      where: { stripePaymentIntentId: charge.payment_intent as string },
      data: {
        paymentStatus: "disputed",
        // Don't change order status - may still be fulfilled
      },
    });

    console.log("⚠️ Dispute recorded for charge:", dispute.charge);
  } catch (error) {
    console.error("❌ Error recording dispute:", error);
    throw error;
  }
}

// Handle failed invoice payments (for subscriptions)
async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;

  console.warn("💳 Invoice payment failed:", {
    id: invoice.id,
    amount: invoice.amount_due,
    customer: invoice.customer,
  });
}

// Handle subscription deletions
async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  console.log("📦 Subscription deleted:", {
    id: subscription.id,
    customer: subscription.customer,
  });
}

// Handle amount capturable updates (for manual capture)
async function handleAmountCapturableUpdated(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  console.log("💰 Amount capturable updated:", {
    id: paymentIntent.id,
    amountCapturable: paymentIntent.amount_capturable,
  });
}

// Handle successful charges (additional validation)
async function handleChargeSucceeded(event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge;

  console.log("💳 Charge succeeded:", {
    id: charge.id,
    amount: charge.amount,
    currency: charge.currency,
    paymentMethod: charge.payment_method_details?.type,
  });
}
