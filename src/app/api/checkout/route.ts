import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, syncStripeDataToDB } from "@/app/lib/stripe";
import prisma from "@/app/lib/db";
import { generateNextOrderReferenceId } from "@/app/lib/db";
import { rateLimit, RATE_LIMITS } from "@/app/lib/rate-limit";

// Helper function to validate URL
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Helper function to validate session and user
async function validateSessionAndUser(session: any) {
  if (!session?.user?.id) {
    return { isValid: true, userId: null, user: null, isGuest: true };
  }

  try {
    // Verify the user actually exists in the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true,
        banned: true,
        banExpires: true
      }
    });
    
    if (!user) {
      if (process.env.NODE_ENV === "development") {
        console.error("User ID from session does not exist in database:", session.user.id);
      }
      return { 
        isValid: false, 
        userId: null, 
        user: null, 
        error: "Invalid user session. Please sign in again." 
      };
    }

    // Check if user is banned
    if (user.banned) {
      const now = new Date();
      if (!user.banExpires || user.banExpires > now) {
        return { 
          isValid: false, 
          userId: null, 
          user: null, 
          error: "Your account has been suspended. Please contact support." 
        };
      }
    }

    return { 
      isValid: true, 
      userId: user.id, 
      user: user, 
      isGuest: false 
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error validating user:", error);
    }
    return { 
      isValid: false, 
      userId: null, 
      user: null, 
      error: "Session validation failed. Please sign in again." 
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - prevent checkout spam
    const rateLimitResult = await rateLimit(request, RATE_LIMITS.checkout);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many checkout attempts. Please try again in a minute." },
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    // Try to get session, but allow guests
    let session = null;
    let sessionError = null;
    
    try {
      session = await auth.api.getSession({ headers: request.headers });
    } catch (e) {
      session = null;
      sessionError = e;
      if (process.env.NODE_ENV === "development") {
        console.log("Session retrieval failed (this is normal for guests):", e);
      }
    }

    const { cartItems } = await request.json();

    // STRICT VALIDATION: Cart must not be empty
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // STRICT VALIDATION: shape check
    for (const item of cartItems) {
      if (!item?.id || typeof item.id !== "string" || !Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 100) {
        return NextResponse.json(
          { error: "Invalid items in cart" },
          { status: 400 }
        );
      }
    }

    // PRICE INTEGRITY: never trust client-supplied prices. Fetch authoritative prices from DB.
    const productIds: string[] = cartItems.map((item: any) => item.id);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "published" },
      select: { id: true, name: true, price: true },
    });
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    if (productMap.size !== new Set(productIds).size) {
      return NextResponse.json(
        { error: "One or more items are unavailable" },
        { status: 400 }
      );
    }
    const trustedItems = cartItems.map((item: any) => {
      const product = productMap.get(item.id)!;
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    });

    // VALIDATE SESSION AND USER
    const validation = await validateSessionAndUser(session);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 401 }
      );
    }

    // PREVENT ADMINS FROM CHECKING OUT
    if (validation.user && validation.user.role === "admin") {
      return NextResponse.json(
        { error: "Admins cannot make purchases from their own store" },
        { status: 403 }
      );
    }

    // Provide required shipping snapshot fields with placeholders
    const shippingSnapshot = {
      shippingName: validation.user?.name || "Guest",
      shippingEmail: validation.user?.email || "guest@example.com",
      shippingPhone: null,
      shippingAddress: "To be filled by Stripe",
      shippingCity: "",
      shippingState: null,
      shippingPostalCode: "",
      shippingCountry: "",
    };

    // Stripe customer logic
    let stripeCustomerId = null;
    if (validation.user) {
      // Fetch user with stripeCustomerId
      let user = await prisma.user.findUnique({ where: { id: validation.user.id } });
      if (!user?.stripeCustomerId) {
        // Create Stripe customer
        const customer = await stripe.customers.create({
          email: user?.email || "",
          name: user?.name || undefined,
        });
        stripeCustomerId = customer.id;
        await prisma.user.update({
          where: { id: user?.id },
          data: { stripeCustomerId },
        });
      } else {
        stripeCustomerId = user.stripeCustomerId;
      }
    }
    // For guests, don't create Stripe customers - let them enter their email in checkout
    // This allows them to use their real email instead of the guest email

    // Create order in database (pending until payment succeeds)
    // VAT is included in product prices. Shipping is not calculated here; it is paid on delivery and varies by location.
    const totalAmount = trustedItems.reduce(
      (total: number, item) => total + item.price * item.quantity,
      0
    );

    // Generate a unique referenceId for the order
    const referenceId = await generateNextOrderReferenceId();

    // Create order with validated user ID or null for guests
    const order = await prisma.order.create({
      data: {
        userId: validation.userId, // null for guests, validated ID for users
        amount: totalAmount, // Store in pounds
        status: "pending",
        referenceId, // Save the public reference ID
        ...shippingSnapshot,
        items: {
          create: trustedItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price, // Store in pounds
          })),
        },
      },
    } as any);

    const lineItems = trustedItems.map((item) => ({
      price_data: {
        currency: "gbp",
        unit_amount: Math.round(item.price * 100), // Convert pounds to pence for Stripe
        product_data: {
          name: item.name,
        },
      },
      quantity: item.quantity,
    }));

      // Validate and construct URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    if (!isValidUrl(baseUrl)) {
      if (process.env.NODE_ENV === "development") {
        console.error("Invalid NEXT_PUBLIC_APP_URL:", baseUrl);
      }
      return NextResponse.json(
        { error: "Invalid application configuration" },
        { status: 500 }
      );
    }

    // Debug log for Stripe payload (development only)
    const stripePayload: import('stripe').Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      line_items: lineItems,
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancel`,
      metadata: {
        userId: validation.userId || "guest",
        orderId: order.id,
        referenceId: referenceId,
        isGuest: validation.isGuest?.toString() || "false",
      },
      ...(stripeCustomerId ? { customer: stripeCustomerId } : {
        customer_creation: "always"
      }),
      // No automatic tax - prices are exactly as set
      // No customer_update needed since we're not using automatic tax
      allow_promotion_codes: true,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: [
          "US", "CA", "GB", "AU", "NZ", "IE", "FR", "DE", "IT", "ES", "NL", "BE", "AT", "DK", "FI", "NO", "SE", "CH", "PT", "LU", "SG", "JP", "HK"
        ]
      },
      shipping_options: [],
    };

    if (process.env.NODE_ENV === "development") {
      console.log("Stripe payload:", JSON.stringify(stripePayload, null, 2));
    }

    const checkoutSession = await stripe.checkout.sessions.create(stripePayload);

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error creating checkout session:", error);
    }
    
    // Handle specific Prisma foreign key constraint errors
    if (error instanceof Error && error.message.includes('P2003')) {
      return NextResponse.json(
        { error: "Invalid user session. Please sign in again." },
        { status: 401 }
      );
    }
    
    // Handle other Prisma errors
    if (error instanceof Error && error.message.includes('P2002')) {
      return NextResponse.json(
        { error: "Order reference ID conflict. Please try again." },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
