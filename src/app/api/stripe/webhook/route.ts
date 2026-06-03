import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import type Stripe from "stripe";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Rate limiting - protect against webhook floods
  const rateLimitResult = await rateLimit(req, RATE_LIMITS.webhook);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: rateLimitResult.headers }
    );
  }

  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe signature" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Webhook signature verification failed:", error);
    }
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Update order status to paid
      if (session.metadata?.orderId) {
        // Idempotency guard: if already succeeded, no-op
        const existing = await prisma.order.findUnique({
          where: { id: session.metadata.orderId },
          select: { paymentStatus: true, stripePaymentIntentId: true },
        });
        if (
          existing?.paymentStatus === "succeeded" &&
          existing?.stripePaymentIntentId
        ) {
          return NextResponse.json({ received: true, skipped: true });
        }
        // Always update the order with the real Stripe customer email and shipping details
        const shippingDetails = (session as any).shipping_details as any;
        const customerDetails = session.customer_details;
        const address =
          shippingDetails?.address || customerDetails?.address || null;

        // Get customer email
        const customerEmail =
          customerDetails?.email || session.customer_email || undefined;

        // Extract name from email if no name provided
        let customerName = shippingDetails?.name || customerDetails?.name;
        if (!customerName && customerEmail) {
          // Extract name from email (e.g., "john.doe@example.com" -> "John Doe")
          const emailName = customerEmail.split("@")[0];
          // Sanitize: remove special chars, replace dots/underscores/hyphens/plus with spaces
          customerName = emailName
            .replace(/[._+\-]/g, " ")  // Replace separators with spaces
            .replace(/[^a-zA-Z0-9\s]/g, "")  // Remove other special chars
            .replace(/\s+/g, " ")  // Collapse multiple spaces
            .trim()
            .replace(/\b\w/g, (l) => l.toUpperCase());  // Capitalize each word

          // Fallback if extraction failed
          if (!customerName || customerName.length === 0) {
            customerName = "Guest";
          }
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

        let updatedOrder = await prisma.order.update({
          where: { id: session.metadata.orderId },
          data: {
            status: "paid",
            paidAt: new Date(),
            paymentStatus: "succeeded",
            stripeSessionId: session.id,
            stripePaymentIntentId:
              (session.payment_intent as string) || undefined,
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
        });

        // --- PRODUCTION: Create user for guest checkout and link order ---
        if (!updatedOrder.userId && customerEmail) {
          // Check if user exists
          let user = await prisma.user.findUnique({
            where: { email: customerEmail },
          });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email: customerEmail,
                emailVerified: true, // or false if you want to require verification
                name: customerName || "Guest",
              },
            });
          }
          // Link order to user
          await prisma.order.update({
            where: { id: updatedOrder.id },
            data: { userId: user.id },
          });
        }

        // Send order confirmation email with magic link
        try {
          const order = await prisma.order.findUnique({
            where: { id: session.metadata.orderId },
            select: {
              id: true,
              referenceId: true,
              shippingName: true,
              shippingEmail: true,
              amount: true,
              items: {
                include: {
                  product: true,
                },
              },
            },
          });

          if (order && order.shippingEmail) {
            try {
              // Generate secure magic link token for order tracking
              const crypto = await import("node:crypto");
              const magicLinkToken = crypto.randomBytes(32).toString("hex");
              const magicLinkExpiresAt = new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
              ); // 7 days

              // Store in order
              await prisma.order.update({
                where: { id: order.id },
                data: {
                  magicLinkToken: magicLinkToken,
                  magicLinkExpiresAt: magicLinkExpiresAt,
                },
              });

              // Build magic link URL
              const baseUrl =
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
              const magicLink = `${baseUrl}/my-orders/${order.referenceId}?verify=${magicLinkToken}`;

              const { emailService } = await import("@/lib/email");
              // Send order confirmation email with magic link
              await emailService.sendOrderConfirmation(order.shippingEmail, {
                referenceId: order.referenceId,
                customerName: order.shippingName,
                amount: order.amount,
                items: order.items,
                magicLink,
              });
            } catch (emailError) {
              if (process.env.NODE_ENV === "development") {
                console.error("Error sending order confirmation email:", emailError);
              }
            }
          }
        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            console.error("Error sending order confirmation email:", err);
          }
        }
      }

      // After updating order status, try to fetch and save invoice if available
      if (session.invoice) {
        try {
          const invoice = await stripe.invoices.retrieve(
            session.invoice as string
          );
          await prisma.order.update({
            where: { id: session.metadata?.orderId },
            data: {
              invoiceUrl: invoice.invoice_pdf || undefined,
              invoiceNumber: invoice.number || undefined,
            },
          });
        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            console.error("Failed to fetch or save Stripe invoice:", err);
          }
        }
      }

      if (process.env.NODE_ENV === "development") {
        console.log("Payment successful:", session.id);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;

      // Handle failed payment
      if (paymentIntent.metadata?.orderId) {
        await prisma.order.update({
          where: { id: paymentIntent.metadata.orderId },
          data: { status: "cancelled" },
        });
      }

      if (process.env.NODE_ENV === "development") {
        console.log("Payment failed:", paymentIntent.id);
      }
      break;
    }

    case "invoice.payment_succeeded":
    case "invoice.created": {
      const invoice = event.data.object;
      // Find the order by Stripe session or metadata if possible
      let orderId = invoice.metadata?.orderId;
      if (!orderId && (invoice as any).subscription) {
        // Optionally, fetch order by subscription if you support subscriptions
      }
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            invoiceUrl: invoice.invoice_pdf || undefined,
            invoiceNumber: invoice.number || undefined,
          },
        });
      }
      break;
    }

    default:
      if (process.env.NODE_ENV === "development") {
        console.log(`Unhandled event type: ${event.type}`);
      }
  }

  return NextResponse.json({ received: true });
}
