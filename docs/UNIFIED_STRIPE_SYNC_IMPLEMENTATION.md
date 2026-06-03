# Unified Stripe Sync Implementation

## Overview

This document details the implementation of a unified Stripe sync system that follows the "How I Stay Sane Implementing Stripe" guide patterns, adapted for a Vercel deployment using PostgreSQL instead of Redis/KV.

## Implementation Status: ✅ COMPLETE

The implementation successfully addresses the core "split brain" problem identified in the guide by implementing a single source of truth for Stripe customer data.

## Architecture

### Core Philosophy

Following the guide's recommendation: **"Have a SINGLE syncStripeDataToDB function that syncs all of the data for a given Stripe customer to your database."**

Instead of KV store, we use PostgreSQL with JSON fields for caching, making it Vercel-compatible while maintaining the same architectural benefits.

## Key Components

### 1. Unified Sync Function (`syncStripeDataToDB`)

**Location**: `src/lib/stripe.ts`

```typescript
export async function syncStripeDataToDB(customerId: string): Promise<STRIPE_CUSTOMER_CACHE>
```

**Features**:
- ✅ Single function handles all Stripe customer/subscription data
- ✅ Fetches comprehensive subscription data with payment methods
- ✅ Stores structured cache in PostgreSQL JSON field
- ✅ Follows guide's exact data structure patterns
- ✅ Proper error handling and logging

**Data Structure**: Implements `STRIPE_CUSTOMER_CACHE` type matching the guide's recommendations:
```typescript
type STRIPE_CUSTOMER_CACHE = {
  customerId: string;
  subscriptionId: string | null;
  status: Stripe.Subscription.Status;
  priceId: string | null;
  currentPeriodStart: number | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  paymentMethod: {
    brand: string | null;
    last4: string | null;
  } | null;
  lastSyncAt: Date;
} | {
  customerId: string;
  status: "none";
  lastSyncAt: Date;
}
```

### 2. Intelligent Caching System

**Location**: `src/lib/stripe.ts`

```typescript
export async function getStripeCustomerData(customerId: string): Promise<STRIPE_CUSTOMER_CACHE | null>
```

**Features**:
- ✅ 5-minute cache TTL (matches guide's development recommendation)
- ✅ Automatic cache invalidation and refresh
- ✅ Reduces Stripe API calls while maintaining data freshness
- ✅ Graceful fallback to fresh sync on cache miss

### 3. Unified Webhook Processing

**Location**: `src/app/api/stripe/route.ts`

**Comprehensive Event Coverage**:
```typescript
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
```

**Unified Processing Function**:
```typescript
async function processEventWithUnifiedSync(event: Stripe.Event)
```

**Benefits**:
- ✅ All events flow through the single sync function
- ✅ Prevents split-brain scenarios
- ✅ Consistent error handling and retry logic
- ✅ Follows guide's event filtering approach

### 4. Eager Sync on Payment Success

**Location**: `src/app/api/orders/verify-payment/route.ts`

**Implementation**:
```typescript
// EAGER SYNC (following guide's recommendation)
if (order.user?.stripeCustomerId) {
  try {
    await syncStripeDataToDB(order.user.stripeCustomerId);
  } catch (syncError) {
    // Don't fail the request if sync fails - webhooks will retry
  }
}
```

**Benefits**:
- ✅ Prevents race conditions between user success page and webhook processing
- ✅ Ensures user sees consistent state immediately
- ✅ Follows guide's recommended pattern exactly

### 5. Customer Creation Before Checkout

**Locations**: 
- `src/app/api/checkout/route.ts`
- `src/app/api/checkout/hybrid/route.ts`

**Implementation**:
```typescript
// Create Stripe customer before checkout session
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
}
```

**Benefits**:
- ✅ Follows guide's key principle: "ALWAYS have the customer defined BEFORE YOU START CHECKOUT"
- ✅ Avoids ephemeral customer issues
- ✅ Enables proper customer tracking and sync

## Database Schema

### New Fields Added to User Model

```prisma
model User {
  // ... existing fields
  stripeCustomerId  String?   // Stripe customer ID for persistent linking
  stripeDataCache   Json?     // Cached Stripe customer/subscription data
  lastStripeSync    DateTime? // When Stripe data was last synced
  // ... rest of fields
}
```

**Migration Status**: ✅ Applied and active

## Verification Checklist

### ✅ Core Requirements Met

1. **Single Sync Function**: ✅ `syncStripeDataToDB` handles all customer data
2. **Unified Event Processing**: ✅ All webhook events flow through sync function
3. **Eager Sync**: ✅ Payment success triggers immediate sync
4. **Customer Before Checkout**: ✅ Customers created before session creation
5. **Comprehensive Event Coverage**: ✅ All subscription-related events handled
6. **Caching System**: ✅ Intelligent caching with TTL
7. **Error Handling**: ✅ Proper error handling and retry logic

### ✅ Guide Compliance

1. **No Split Brain**: ✅ Single source of truth implemented
2. **Race Condition Prevention**: ✅ Eager sync prevents webhook race conditions
3. **Event Filtering**: ✅ Only relevant events processed
4. **Type Safety**: ✅ Structured data types matching guide
5. **Logging**: ✅ Comprehensive logging for monitoring

### ✅ Vercel Compatibility

1. **No Redis Dependency**: ✅ Uses PostgreSQL JSON fields instead
2. **Serverless Ready**: ✅ All functions are stateless
3. **Environment Agnostic**: ✅ Works in Vercel's serverless environment

## Benefits Achieved

### 1. Eliminated Split Brain Problem
- **Before**: Order state in PostgreSQL, payment state in Stripe, potential inconsistencies
- **After**: Single sync function ensures consistent state across all systems

### 2. Race Condition Prevention
- **Before**: User might see success before webhooks process, causing confusion
- **After**: Eager sync ensures immediate consistency on payment success

### 3. Comprehensive Event Handling
- **Before**: Limited webhook events handled individually
- **After**: All subscription-related events flow through unified sync

### 4. Intelligent Caching
- **Before**: No caching, frequent Stripe API calls
- **After**: Smart caching reduces API calls while maintaining freshness

### 5. Better Error Handling
- **Before**: Individual error handling per webhook
- **After**: Centralized error handling with proper retry logic

## Monitoring and Debugging

### Console Logging
The implementation includes comprehensive logging for monitoring:

```typescript
console.log(`🔄 Syncing Stripe data for customer: ${customerId}`);
console.log(`✅ Stripe data synced for customer ${customerId}`);
console.log(`📦 Using cached Stripe data for customer ${customerId}`);
console.log(`🚀 Eager sync for customer: ${customerId}`);
```

### Error Tracking
All errors are logged with context:
```typescript
console.error(`❌ Failed to sync Stripe data for customer ${customerId}:`, error);
console.error(`❌ Unified sync failed for event ${event.type}:`, error);
```

## Testing Recommendations

### 1. Webhook Testing
Test all supported webhook events to ensure unified sync works:
```bash
stripe listen --forward-to localhost:3000/api/stripe
```

### 2. Race Condition Testing
Verify eager sync prevents race conditions:
1. Complete a payment
2. Immediately check success page
3. Verify customer data is synced

### 3. Cache Testing
Verify caching behavior:
1. Trigger sync for a customer
2. Check database for cached data
3. Verify subsequent calls use cache within TTL

## Future Enhancements

### 1. Vercel KV Migration
When ready, can easily migrate to Vercel KV:
```typescript
import { kv } from '@vercel/kv';

export async function syncStripeDataToKV(customerId: string) {
  // Follow guide's exact pattern with KV
  await kv.set(`stripe:customer:${customerId}`, subData);
}
```

### 2. Subscription Management
Add subscription management endpoints using the cached data:
```typescript
export async function getCustomerSubscription(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.stripeCustomerId) {
    return await getStripeCustomerData(user.stripeCustomerId);
  }
  return null;
}
```

### 3. Usage Tracking
Implement usage tracking for subscription limits:
```typescript
export async function incrementUsage(customerId: string, amount: number) {
  // Track usage against subscription limits
}
```

## Conclusion

The unified Stripe sync implementation successfully addresses all the core concerns raised in the "How I Stay Sane Implementing Stripe" guide:

1. ✅ **No Split Brain**: Single source of truth for customer data
2. ✅ **Race Condition Prevention**: Eager sync on payment success  
3. ✅ **Comprehensive Event Handling**: All relevant events processed uniformly
4. ✅ **Intelligent Caching**: Reduces API calls while maintaining freshness
5. ✅ **Vercel Compatible**: Uses PostgreSQL instead of Redis

This implementation provides a robust, maintainable, and scalable foundation for Stripe integration that follows industry best practices while being adapted for the specific constraints of a Vercel deployment.