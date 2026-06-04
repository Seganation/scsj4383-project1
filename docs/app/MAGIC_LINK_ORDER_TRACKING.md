# Magic Link Order Tracking Implementation

## Overview
This document describes the implementation of magic link order tracking for both guests and registered users in the ArchCool project. The feature allows customers to track their orders via a secure, time-limited link sent to their email after checkout—no sign-in required.

---

## What Was Implemented
- **Magic link generation and storage** for each order after successful payment (guest or user).
- **Magic link included in order confirmation and payment confirmation emails.**
- **API endpoint to validate magic link tokens** and return order details if valid.
- **Frontend logic to allow order tracking via magic link** (even if not signed in).
- **Works for both guests and registered users.**

---

## Where (File Locations)

### **Database/Prisma**
- `prisma/schema.prisma`
  - Added fields to `Order` model:
    - `magicLinkToken String?`
    - `magicLinkExpiresAt DateTime?`

### **Backend**
- `app/api/stripe/webhook/route.ts`
  - After payment, generates a secure token, sets expiry, stores in the order, and sends the magic link in the confirmation email.
- `app/api/orders/[id]/magic-link/route.ts`
  - API endpoint to validate the magic link token and expiry, and return order details if valid.

### **Email**
- `app/lib/email.ts`
  - Updated `orderConfirmed` and `paymentConfirmed` email templates to include a "Track Your Order" button using the magic link.
  - Updated `sendOrderConfirmation` and `sendPaymentConfirmed` to accept and pass the magic link.

### **Frontend**
- `app/(public)/my-orders/[id]/page.tsx`
  - Accepts a `token` query param. If present, calls the magic link API endpoint and shows order details if valid, even if not signed in. Otherwise, requires sign-in as before.
- `app/components/storefront/OrderDetailsPage.tsx`
  - Updated type to support all possible order status values.

---

## How (Key Steps & Logic)

1. **Database Migration**
   - Added `magicLinkToken` and `magicLinkExpiresAt` to the `Order` model.
   - Ran `npx prisma migrate dev --name add-magic-link-to-order` and `npx prisma generate`.

2. **Magic Link Generation**
   - In the Stripe webhook (`checkout.session.completed`), after payment:
     - Generate a secure random token (`crypto.randomBytes(32).toString("hex")`).
     - Set expiry (e.g., 7 days).
     - Store both in the order record.
     - Build a magic link: `/my-orders/[id]?token=...`.
     - Send this link in the order confirmation and payment confirmation emails.

3. **Email Template Update**
   - The email templates now include a "Track Your Order" button using the magic link if provided.

4. **API Endpoint for Validation**
   - New endpoint: `/api/orders/[id]/magic-link?token=...`
   - Validates the token and expiry, returns order details if valid, otherwise returns an error.

5. **Frontend Logic**
   - On `/my-orders/[id]`, if a `token` is present in the URL, fetch order details via the API endpoint and show them (no sign-in required).
   - If no token, fallback to requiring sign-in and showing the order for the signed-in user only.

---

## Security Notes
- Magic links are time-limited and securely generated.
- Only the recipient of the email can access the order via the link.
- Tokens are stored in the database and can be revoked/expired.

---

## Testing
- Complete a checkout as a guest or registered user.
- Receive an email with a "Track Your Order" button.
- Click the link to view the order details without signing in.
- Try using an expired or invalid link to confirm error handling.

---

**This feature brings a seamless, secure order tracking experience for all customers!** 