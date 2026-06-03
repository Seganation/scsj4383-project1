import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { stripe, syncStripeDataToDB } from "@/app/lib/stripe";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const {
      items,
      shippingAddress,
      isGuest,
      createAccount,
      selectedAddressId,
    } = await req.json();

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (
      !shippingAddress ||
      !shippingAddress.email ||
      !shippingAddress.fullName
    ) {
      return NextResponse.json(
        { error: "Shipping address and email are required" },
        { status: 400 }
      );
    }

    // Get session for authenticated users
    let session = null;
    if (!isGuest) {
      try {
        session = await auth.api.getSession({
          headers: req.headers,
        });
      } catch (error) {
        console.log("No valid session found, proceeding as guest");
      }
    }

    // Stripe customer logic
    let stripeCustomerId = null;
    if (session?.user) {
      let user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!user?.stripeCustomerId) {
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

    // Fetch products to validate and calculate total
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: "published",
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "Some products are no longer available" },
        { status: 400 }
      );
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      };
    });

    // Shipping and tax are not calculated here; shipping is paid on delivery and varies by location.
    // VAT is included in product prices. No extra tax is added at checkout.
    // totalAmount remains unchanged; shipping and tax are not added.

    // Create order in database
    const baseOrderData = {
      amount: totalAmount,
      shippingName: shippingAddress.fullName,
      shippingEmail: shippingAddress.email,
      shippingPhone: shippingAddress.phone || null,
      shippingAddress: shippingAddress.addressLine2
        ? `${shippingAddress.addressLine1}, ${shippingAddress.addressLine2}`
        : shippingAddress.addressLine1,
      shippingCity: shippingAddress.city,
      shippingState: shippingAddress.state || null,
      shippingPostalCode: shippingAddress.postalCode,
      shippingCountry: shippingAddress.country,
      items: {
        create: orderItems,
      },
    };

    // Add user data if authenticated
    const orderData = session?.user
      ? {
          ...baseOrderData,
          userId: session.user.id,
          addressId: selectedAddressId || null,
        }
      : baseOrderData;

    const order = await prisma.order.create({
      data: orderData as any, // Type assertion to handle complex union type
    });

    // Create Stripe checkout session
    const isValidUrl = (url: string): boolean => {
      try {
        const urlObj = new URL(url);
        // Stripe requires HTTPS URLs for production, but allows HTTP for localhost
        if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
          return false;
        }
        // Check if the URL is accessible (basic validation)
        return urlObj.hostname.length > 0 && urlObj.pathname.length > 0;
      } catch {
        return false;
      }
    };

    const makeAbsoluteUrl = (url: string) => {
      if (!url || typeof url !== "string") return null;
      
      // If it's already a full URL, return it
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
      }
      
      // If it's a relative URL, try to make it absolute
      const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const cleanBase = base.replace(/\/$/, "");
      
      let absoluteUrl: string;
      if (url.startsWith("/")) {
        absoluteUrl = `${cleanBase}${url}`;
      } else {
        absoluteUrl = `${cleanBase}/${url}`;
      }
      
      // URL encode the path to handle spaces and special characters
      try {
        const urlObj = new URL(absoluteUrl);
        // Re-encode the pathname to handle spaces and special characters
        urlObj.pathname = encodeURI(urlObj.pathname);
        return urlObj.toString();
      } catch (error) {
        console.error("Error encoding URL:", error);
        return null;
      }
    };

    const stripeLineItems = products.map((product) => {
      const item = items.find((i: any) => i.productId === product.id);
      let validImages: string[] = [];
      
      if (Array.isArray(product.images)) {
        validImages = product.images
          .map((img: any) => {
            if (typeof img !== "string" || !img.trim()) return null;
            const cleanImg = img.trim();
            const abs = makeAbsoluteUrl(cleanImg);
            return abs && abs.trim() && isValidUrl(abs) ? abs : null;
          })
          .filter((abs): abs is string => abs !== null);
      }
      
              const productData: any = {
          name: product.name,
          description: product.description,
        };
        
        // Only add images if we have valid URLs
        if (validImages.length > 0) {
          productData.images = validImages;
        }
        
        return {
          price_data: {
            currency: "gbp",
            product_data: productData,
            unit_amount: Math.round(product.price * 100),
          },
          quantity: item.quantity,
        };
    });

    // Add shipping as a line item
    stripeLineItems.push({
      price_data: {
        currency: "gbp",
        product_data: {
          name: "Standard Shipping (2-4 business days)",
          description: "Standard shipping delivery",
          images: [],
        },
        unit_amount: 0, // Shipping is paid on delivery, not included in totalAmount
      },
      quantity: 1,
    });

    // Add tax as a line item
    stripeLineItems.push({
      price_data: {
        currency: "gbp",
        product_data: {
          name: "Tax",
          description: "Sales tax",
          images: [],
        },
        unit_amount: 0, // VAT is included in product prices, no extra tax at checkout
      },
      quantity: 1,
    });

    // Ensure we have a valid base URL for success/cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const stripeSessionPayload: import('stripe').Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: stripeLineItems,
      mode: 'payment',
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancel`,
      metadata: {
        orderId: order.id,
        userId: session?.user?.id || "guest",
        isGuest: isGuest.toString(),
        createAccount: createAccount.toString(),
      },
      ...(stripeCustomerId ? { customer: stripeCustomerId } : {
        customer_creation: "always"
      }),
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0, // Shipping is paid on delivery, not included in totalAmount
              currency: "gbp",
            },
            display_name: "Standard Shipping",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 2,
              },
              maximum: {
                unit: "business_day",
                value: 4,
              },
            },
          },
        },
      ],
    };

    const stripeSession = await stripe.checkout.sessions.create(stripeSessionPayload);

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id },
    });

    return NextResponse.json({
      success: true,
      url: stripeSession.url,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Hybrid checkout error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
