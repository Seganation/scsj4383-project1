import Stripe from "stripe";
import prisma from "./db";
import type { Prisma } from "@prisma/client";

// Lazy Stripe client — avoids throwing at module load during `next build`
// page-data collection when STRIPE_SECRET_KEY is not available (e.g. Docker/CI).
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  _stripe = new Stripe(key, { typescript: true });
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  },
});

// Custom Stripe subscription cache type (adapted from the guide)
export type STRIPE_CUSTOMER_CACHE =
  | {
      customerId: string;
      subscriptionId: string | null;
      status: Stripe.Subscription.Status;
      priceId: string | null;
      currentPeriodStart: number | null;
      currentPeriodEnd: number | null;
      cancelAtPeriodEnd: boolean;
      paymentMethod: {
        brand: string | null; // e.g., "visa", "mastercard"
        last4: string | null; // e.g., "4242"
      } | null;
      lastSyncAt: Date;
    }
  | {
      customerId: string;
      status: "none";
      lastSyncAt: Date;
    };

/**
 * UNIFIED STRIPE SYNC FUNCTION
 * Following the guide's pattern but using PostgreSQL instead of KV
 * This is the SINGLE function that syncs all Stripe data for a customer
 */
export async function syncStripeDataToDB(customerId: string): Promise<STRIPE_CUSTOMER_CACHE> {
  try {
    console.log(`🔄 Syncing Stripe data for customer: ${customerId}`);

    // Fetch latest subscription data from Stripe (following guide exactly)
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: "all",
      expand: ["data.default_payment_method"],
    });

    let customerData: STRIPE_CUSTOMER_CACHE;

    if (subscriptions.data.length === 0) {
      // No subscription found
      customerData = { 
        customerId,
        status: "none",
        lastSyncAt: new Date()
      };
    } else {
      // If a user can have multiple subscriptions, that's your problem (per guide)
      const subscription = subscriptions.data[0];
      // Stripe API 2025-10-29 moved period fields onto subscription items.
      const firstItem = subscription.items.data[0];

      // Store complete subscription state (following guide structure)
      customerData = {
        customerId,
        subscriptionId: subscription.id,
        status: subscription.status,
        priceId: firstItem?.price.id || null,
        currentPeriodEnd: firstItem?.current_period_end ?? null,
        currentPeriodStart: firstItem?.current_period_start ?? null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        paymentMethod:
          subscription.default_payment_method &&
          typeof subscription.default_payment_method !== "string"
            ? {
                brand: subscription.default_payment_method.card?.brand ?? null,
                last4: subscription.default_payment_method.card?.last4 ?? null,
              }
            : null,
        lastSyncAt: new Date(),
      };
    }

    // Store the data in PostgreSQL (our "KV" replacement)
    await prisma.user.updateMany({
      where: { stripeCustomerId: customerId },
      data: {
        // @ts-ignore - New fields not yet in types until restart
        stripeDataCache: customerData,
        lastStripeSync: new Date(),
      },
    });

    console.log(`✅ Stripe data synced for customer ${customerId}:`, {
      status: customerData.status,
      subscriptionId: customerData.status !== "none" ? customerData.subscriptionId : "none",
    });

    return customerData;
  } catch (error) {
    console.error(`❌ Failed to sync Stripe data for customer ${customerId}:`, error);
    throw error;
  }
}

/**
 * Get cached Stripe data for a customer
 * This would normally read from KV, but we'll adapt for database
 */
export async function getStripeCustomerData(customerId: string): Promise<STRIPE_CUSTOMER_CACHE | null> {
  try {
    // Check if we have fresh cached data (within last 5 minutes)
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
      select: { 
        // @ts-ignore - New fields not yet in types until restart
        stripeDataCache: true, 
        lastStripeSync: true 
      },
    }) as any;

    const cacheAge = user?.lastStripeSync ? 
      Date.now() - user.lastStripeSync.getTime() : 
      Infinity;
    
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

    // Return cached data if fresh enough
    if (user?.stripeDataCache && cacheAge < CACHE_TTL) {
      console.log(`📦 Using cached Stripe data for customer ${customerId}`);
      return user.stripeDataCache as STRIPE_CUSTOMER_CACHE;
    }

    // Otherwise, sync fresh data
    console.log(`🔄 Cache miss/stale for customer ${customerId}, syncing fresh data`);
    return await syncStripeDataToDB(customerId);
  } catch (error) {
    console.error(`❌ Failed to get Stripe data for customer ${customerId}:`, error);
    return null;
  }
}
