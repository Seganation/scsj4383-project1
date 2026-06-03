import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { stripe } from "@/app/lib/stripe";
import { emailService } from "@/app/lib/email";
import { auth } from "@/lib/auth";
import { rateLimit, RATE_LIMITS } from "@/app/lib/rate-limit";

export async function POST(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  try {
    // Rate limiting for admin actions
    const rateLimitResult = await rateLimit(request, RATE_LIMITS.admin);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reason } = await request.json();

    // Validate reason input
    if (reason && typeof reason === "string" && reason.length > 500) {
      return NextResponse.json(
        { error: "Refund reason too long (max 500 characters)" },
        { status: 400 }
      );
    }

    const sanitizedReason = reason?.trim() || undefined;
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order || !order.stripePaymentIntentId) {
      return NextResponse.json({ error: "Order/payment not found" }, { status: 404 });
    }
    if (order.status === "refunded") {
      return NextResponse.json({ error: "Order already refunded" }, { status: 400 });
    }

    // Create refund in Stripe
    let refund;
    try {
      refund = await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
        reason: reason || undefined,
      });
    } catch (stripeError) {
      console.error("Stripe refund error:", stripeError);
      return NextResponse.json({ error: "Stripe refund failed" }, { status: 500 });
    }

    // Update order in DB
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "refunded",
        refundReason: sanitizedReason,
        stripeRefundId: refund.id,
      },
    });

    // Send refund confirmation email
    try {
      if (order.shippingEmail) {
        await emailService.sendRefundConfirmation(order.shippingEmail, {
          referenceId: order.referenceId,
          amount: order.amount,
          reason: sanitizedReason,
          customerName: order.shippingName || undefined,
        });
      }
    } catch (emailError) {
      console.error("Failed to send refund confirmation email:", emailError);
      // Don't fail the refund if email fails
    }

    return NextResponse.json({ success: true, refundId: refund.id });
  } catch (error) {
    console.error("Refund error:", error);
    return NextResponse.json({ error: "Refund failed" }, { status: 500 });
  }
} 