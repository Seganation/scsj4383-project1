# Order Reference ID Migration

## Overview

This document describes the migration from exposing internal order IDs to using public-facing, production-grade order reference IDs (`referenceId`) throughout the ArchCool e-commerce platform. The new format is `ORD-yymmdd-nnn` (e.g., `ORD-250715-001`), which is globally unique, user-friendly, and never exposes internal database IDs to customers.

---

## Motivation

- **Security:** Prevents leaking internal database IDs to users or attackers.
- **User Experience:** Provides a short, readable, and shareable order number for customers.
- **Support:** Makes it easier for support staff and customers to reference orders.

---

## Implementation Summary

### 1. **Database Schema**
- Added a unique `referenceId` field to the `Order` model in Prisma.
- Ensured all new orders are assigned a `referenceId` at creation, using the format `ORD-yymmdd-nnn`.

### 2. **Backend API**
- All public and user-facing API endpoints now use `referenceId` for order lookup and URLs (including magic link, order details, guest order lookup, and payment verification).
- Stripe webhook and magic link logic updated to use and send `referenceId` in emails and links.

### 3. **Frontend**
- All order details, My Orders page, and order links now display and use `referenceId` instead of internal order `id`.
- Types and components updated to expect and show `referenceId` everywhere the order number is visible to users.

### 4. **Emails**
- All order-related email templates (confirmation, shipped, payment, refund) now use `referenceId` in the subject, body, and links.
- Email sending logic updated to pass `referenceId` instead of `orderId`.

---

## Best Practices for Future Development

- **Never expose internal order IDs to users.** Always use `referenceId` in all user-facing contexts, URLs, and communications.
- **When creating new features or emails involving orders,** ensure you use and display `referenceId`.
- **For admin/internal tools,** you may use the internal `id` for database operations, but never show it to customers.
- **When linking to order details or tracking pages,** always use `/my-orders/[referenceId]` or similar routes.

---

## Testing & Verification

- Place an order as a guest and as a registered user.
- Confirm that all order confirmation, payment, and shipping emails show the new order reference number.
- Check that all frontend order details, My Orders, and magic link tracking pages use and display `referenceId`.
- Ensure no internal order IDs are visible in any user-facing context.

---

## Migration Date

- **Completed:** July 15, 2025
- **Lead:** AI Assistant
- **Reviewed by:** [Your Name]

---

For questions or follow-up, see the implementation notes in this file or contact the project maintainer. 