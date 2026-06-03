# Shipping Address Capture Fix

## Problem
When customers completed checkout through Stripe, the shipping address information was not being properly captured and saved to the database. The admin panel was showing "Guest" and "To be filled by Stripe" instead of the actual customer shipping details.

## Root Cause
1. **Missing Address Collection Parameters**: The Stripe checkout sessions were not configured to collect billing and shipping addresses
2. **Incomplete Webhook Processing**: The webhook handlers were not properly extracting and saving the customer details from the Stripe session

## Solution

### 1. Updated Checkout Session Configuration
Added the following parameters to all checkout session creation calls:

```typescript
billing_address_collection: "required",
shipping_address_collection: {
  allowed_countries: [
    "US", "CA", "GB", "AU", "NZ", "IE", "FR", "DE", "IT", "ES", "NL", "BE", "AT", "DK", "FI", "NO", "SE", "CH", "PT", "LU", "SG", "JP", "HK"
  ]
},
customer_creation: "always",
```

**Files Updated:**
- `src/app/api/checkout/route.ts`
- `src/app/api/checkout/hybrid/route.ts`
- `src/app/api/orders/[orderId]/pay/route.ts`
- `src/app/actions-new.ts`

### 2. Enhanced Webhook Processing
Updated all webhook handlers to properly capture and save shipping information from Stripe:

```typescript
// Capture customer details from Stripe session
const customerDetails = session.customer_details;
const address = customerDetails?.address;

// Build complete shipping address string
let fullShippingAddress = "";
if (address) {
  const addressParts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postal_code,
    address.country
  ].filter(Boolean); // Remove empty/undefined parts
  fullShippingAddress = addressParts.join(", ");
}

// Update order with shipping information
await prisma.order.update({
  where: { id: session.metadata!.orderId },
  data: {
    // ... payment info
    shippingEmail: customerDetails?.email || session.customer_email || undefined,
    shippingName: customerDetails?.name || undefined,
    shippingAddress: fullShippingAddress || undefined,
    shippingCity: address?.city || undefined,
    shippingState: address?.state || undefined,
    shippingPostalCode: address?.postal_code || undefined,
    shippingCountry: address?.country || undefined,
    shippingPhone: customerDetails?.phone || undefined,
  },
});
```

**Files Updated:**
- `src/app/api/stripe/webhook/route.ts`
- `src/app/api/stripe/route.ts`
- `src/app/api/stripe/route-production.ts`

### 3. Data Structure
The shipping information is now properly captured in the following database fields:

- `shippingEmail`: Customer's email address
- `shippingName`: Customer's full name
- `shippingAddress`: Complete address string (line1, line2, city, state, postal_code, country)
- `shippingCity`: City
- `shippingState`: State/Province
- `shippingPostalCode`: Postal/ZIP code
- `shippingCountry`: Country
- `shippingPhone`: Phone number

## Testing

### Manual Test
1. Create a new order through the checkout process
2. Complete payment with Stripe (use test card: 4242 4242 4242 4242)
3. Check the admin panel - shipping information should now be populated

### Automated Test
Run the test script to verify webhook functionality:

```bash
node scripts/test-shipping-webhook.js
```

## Expected Behavior
After this fix:

1. **During Checkout**: Stripe will collect billing and shipping addresses from customers
2. **After Payment**: Webhook will capture all customer details and save them to the database
3. **In Admin Panel**: Shipping information will display the actual customer details instead of "Guest" and "To be filled by Stripe"

## Verification
To verify the fix is working:

1. Check that new orders show proper shipping information in the admin panel
2. Verify that the `customer_details` object is present in Stripe webhook events
3. Confirm that all address fields are being populated in the database

## Related Documentation
- [Stripe Events Documentation](docs/stripe/events.md)
- [Stripe Plugin Documentation](docs/better-auth/plugins/3rd-party/stripe.md)
- [Order Management System](docs/ORDER_TRACKING_SYSTEM.md) 