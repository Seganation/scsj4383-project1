import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { stripe, syncStripeDataToDB } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get Stripe session details
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (!stripeSession) {
      return NextResponse.json(
        { error: "Invalid session ID" },
        { status: 404 }
      );
    }

    // Find the order associated with this session
    const order = await prisma.order.findFirst({
      where: {
        stripeSessionId: sessionId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
        address: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // EAGER SYNC (following guide's recommendation)
    // This prevents race conditions where user sees success before webhooks process
    if (order.user?.stripeCustomerId) {
      try {
        console.log(`🚀 Eager sync for customer: ${order.user.stripeCustomerId}`);
        await syncStripeDataToDB(order.user.stripeCustomerId);
        console.log(`✅ Eager sync completed for customer: ${order.user.stripeCustomerId}`);
      } catch (syncError) {
        console.error("⚠️ Eager sync failed (continuing anyway):", syncError);
        // Don't fail the request if sync fails - webhooks will retry
      }
    }

    // Return order details and metadata
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        referenceId: (order as any).referenceId,
        amount: order.amount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        shippingEmail: order.shippingEmail,
        userId: order.userId,
        items: order.items,
        shippingAddress: {
          name: order.shippingName,
          email: order.shippingEmail,
          phone: order.shippingPhone,
          address: order.shippingAddress,
          city: order.shippingCity,
          state: order.shippingState,
          postalCode: order.shippingPostalCode,
          country: order.shippingCountry,
        },
        createdAt: order.createdAt,
      },
      metadata: stripeSession.metadata,
      stripeSession: {
        paymentStatus: stripeSession.payment_status,
        customerEmail: stripeSession.customer_email,
      },
    });
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
