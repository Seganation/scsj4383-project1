import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/app/lib/db";
import { stripe } from "@/app/lib/stripe";

export async function POST(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  try {
    const session = await auth.api.getSession({ headers: await request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: { referenceId: orderId, userId: session.user.id } as any,
      include: { items: { include: { product: true } } },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (order.status !== "pending") {
      return NextResponse.json({ error: "Order is not pending" }, { status: 400 });
    }

    // Stripe customer logic
    let stripeCustomerId = null;
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user) {
      if (!user.stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name || undefined,
        });
        stripeCustomerId = customer.id;
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId },
        });
      } else {
        stripeCustomerId = user.stripeCustomerId;
      }
    }
    // For orders without users, don't create Stripe customers - let them enter their email in checkout

    // Create Stripe Checkout Session
    const line_items = order.items.map((item) => ({
      price_data: {
        currency: "gbp",
        product_data: {
          name: item.product.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      ...(stripeCustomerId ? { customer: stripeCustomerId } : {
        customer_creation: "always"
      }),
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: [
          "US", "CA", "GB", "AU", "NZ", "IE", "FR", "DE", "IT", "ES", "NL", "BE", "AT", "DK", "FI", "NO", "SE", "CH", "PT", "LU", "SG", "JP", "HK"
        ]
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      metadata: {
        referenceId: (order as any).referenceId,
        userId: session.user.id,
        createAccount: !order.userId ? "true" : "false",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating Stripe Checkout Session for order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 