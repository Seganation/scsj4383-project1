# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Archcool is a modern e-commerce platform built with Next.js 15, featuring Better Auth for authentication, Stripe for payments, Prisma + PostgreSQL for database, TanStack Query for state management, and UploadThing for file uploads. The platform supports both authenticated users and guest checkout with automatic account creation.

## Common Development Commands

### Development
```bash
pnpm dev                    # Start development server on localhost:3000
pnpm build                  # Build for production (runs postbuild migration)
pnpm start                  # Start production server
pnpm lint                   # Run ESLint
```

### Database Operations
```bash
pnpm prisma generate        # Generate Prisma client (auto-runs on postinstall)
pnpm prisma db push         # Push schema changes to database
pnpm prisma migrate deploy  # Deploy migrations (auto-runs on postbuild)
pnpm db:seed                # Seed database with initial data
```

### Utilities
```bash
pnpm generate:icons         # Generate icon assets
pnpm test-email             # Test first email template
pnpm test-email-2           # Test second email template
```

## Architecture Overview

### Directory Structure

**Route Groups:**
- `src/app/(auth)/` - Authentication routes (sign-in, sign-up, reset-password, email-auth, magic-link-verify)
- `src/app/(protected)/dashboard/` - Admin dashboard (requires admin role)
- `src/app/(public)/` - Public storefront routes (products, bag, checkout, my-orders, profile, policies)

**Key Directories:**
- `src/app/api/` - Next.js API routes for REST endpoints
- `src/app/hooks/` - Custom React hooks for data fetching and state management
- `src/app/lib/` - Core utilities, auth config, database client, email service
- `src/components/` - Reusable components (auth, storefront, dashboard, ui)
- `prisma/` - Database schema and migrations

### Authentication System (Better Auth)

**Critical Rule: Plugin Parity**
- Server plugins in `src/lib/auth.ts` MUST exactly match client plugins in `src/app/lib/auth-client.ts`
- Current plugins: `admin`, `multiSession`, `emailOTP`, `magicLink`
- NEVER add manual session management with `useEffect` hooks
- Let Better Auth handle redirects with `callbackURL` parameter
- Trust Better Auth's built-in reactivity - `useSession` auto-updates

**Auth Flow:**
1. Server config: `src/lib/auth.ts` (betterAuth with Prisma adapter)
2. Client config: `src/app/lib/auth-client.ts` (createAuthClient)
3. API route: `src/app/api/auth/[...betterAuth]/route.ts`
4. Usage: Import from `@/app/lib/auth-client` (NOT from `@/lib/auth`)

**Session Management:**
- Use `const { data: session } = useSession()` from `@/app/lib/auth-client`
- Admin check: `session?.user?.role === "admin"`
- Multi-session support enabled (max 5 concurrent sessions)
- Cookie cache: 24 hours in production, 5 minutes recommended for development

### Database Architecture (Prisma + PostgreSQL)

**Core Models:**
- `User` - Better Auth users with additional fields (firstName, lastName, image, role, stripeCustomerId)
- `Session`, `Account`, `verification` - Better Auth authentication tables
- `Address` - User address book with default address support
- `Product` - Products with status (draft/published/archived) and featured flag
- `Category` - Product categories with unique slugs
- `Order` - Orders with payment tracking, shipping snapshots, and magic link support
- `OrderItem` - Order line items (snapshot of price at purchase time)
- `Banner` - Homepage banners

**Order Flow:**
1. Guest or authenticated user adds items to cart (localStorage-based)
2. Checkout creates Stripe session and pending Order with shipping snapshot
3. Webhook updates Order status to "paid" and creates User if guest checkout
4. Order linked to user account, magic link generated for tracking
5. Admin can update status: pending → paid → fulfilled (or cancelled/refunded)

**Important Patterns:**
- Prices stored in pounds (integer, NOT pence)
- Shipping info stored as snapshots in Order for historical integrity
- Guest orders automatically linked to user accounts on payment
- Magic links for order tracking (7-day expiry)

### Payment Processing (Stripe)

**Webhook Integration:**
- Route: `src/app/api/stripe/webhook/route.ts`
- Events handled: `checkout.session.completed`, `payment_intent.payment_failed`, `invoice.*`
- Idempotency guards prevent duplicate processing
- Automatically creates user accounts for guest checkouts
- Sends order confirmation emails with magic links
- Shipping details extracted from Stripe and stored as snapshots

**Checkout Flow:**
- Client initiates checkout via `/api/checkout` with cart items
- Stripe Checkout session created with shipping address collection
- Success URL: `/payment/success?session_id={CHECKOUT_SESSION_ID}`
- Cancel URL: `/payment/cancel`
- Webhook processes payment and updates order status

### State Management (TanStack Query)

**Replaced Redis** - TanStack Query now handles all client-side caching and state management

**Cart Management:**
- Client-side localStorage via `CartStorage` class (`src/app/lib/cart-client.ts`)
- Hook: `useClientCart()` from `src/app/hooks/use-client-cart.ts`
- Auto-migrates cart when user logs in/out
- Cart cleared after successful checkout
- Admins prevented from making purchases

**Cache Strategy:**
- Cart: 2-minute stale time, localStorage persistence
- Products: 10-15 minute stale time
- Orders: 5-minute stale time
- Admin stats: 5-minute stale time

**Query Keys:**
```typescript
["cart", userId]
["products", "featured"]
["products", "detail", productId]
["orders", userId]
["admin", "stats"]
```

### Email Service (Nodemailer)

**Configuration:** `src/app/lib/email.ts`
- SMTP: mail.privateemail.com:587
- From: archcool@archcoolstore.com

**Email Types:**
- OTP emails (sign-in, email verification, password reset)
- Magic link for passwordless login
- Order status (confirmed, shipped, fulfilled, cancelled, refunded)
- Payment confirmation
- Contact form submissions

**Usage in Better Auth:**
- Dynamic imports to avoid Edge Runtime issues
- Callbacks in auth config call `emailService.sendOTP()` and `emailService.sendMagicLink()`

### File Upload (UploadThing)

- Route: `src/app/api/uploadthing/route.ts` and `core.ts`
- Client-side upload components from `@uploadthing/react`
- Used for product images, banner images, user profile images
- Images stored in UploadThing CDN

### Admin Dashboard

**Access Control:**
- Route group: `src/app/(protected)/dashboard/`
- Middleware checks admin role from Better Auth
- Admin role set via database (User.role = "admin")

**Features:**
- Dashboard stats (revenue, sales, products, users)
- Recent sales with Recharts visualization
- Product CRUD (create, edit, delete, featured toggle)
- Order management (status updates, refunds)
- Category management
- Banner management
- User management (suspend/ban users)

**API Routes:**
- `/api/admin/stats` - Dashboard statistics
- `/api/admin/recent-sales` - Sales data for charts
- `/api/admin/orders` - Order management
- `/api/admin/users/[userId]/suspend` - User suspension
- `/api/admin/categories` - Category CRUD

## Key Patterns and Conventions

### Form Validation
- **Conform + Zod** for server-side validation
- Forms use `useForm` from `@conform-to/react`
- Validation schemas with `parseWithZod` from `@conform-to/zod`

### Component Patterns
- Server Components by default (Next.js 15 App Router)
- `"use client"` for interactive components
- Shadcn UI components in `src/components/ui/`
- Custom submit buttons in `src/components/SubmitButtons.tsx`

### Error Handling
- Toast notifications via React Hot Toast
- Error boundaries for production (`src/app/error.tsx`)
- API routes return structured JSON errors

### Styling
- Tailwind CSS with custom configuration
- Utility function `cn()` from `src/utils/cn.ts` (tailwind-merge + clsx)
- Responsive design with mobile-first approach

## Environment Variables

Required environment variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - Google OAuth
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`, `STRIPE_WEBHOOK_SECRET` - Stripe
- `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` - UploadThing
- `NEXT_PUBLIC_APP_URL` - Application URL for redirects and emails

## Important Notes

### Better Auth Best Practices
1. Always maintain plugin parity between server and client
2. Never use manual session refresh or `router.refresh()`
3. Let Better Auth handle redirects with `callbackURL`
4. For development, remove `trustedOrigins` and use short cookie cache (5 minutes)
5. Auth routes under `(auth)` folder, not `auth`

### Price Handling
- ALL prices in pounds (not pence)
- Display: `£${amount}` (already in pounds)
- Stripe expects smallest currency unit, so multiply by 100 when sending to Stripe

### Shipping Notes
- ALL emails include: "All product prices include VAT. Shipping is not included and will be paid separately on delivery. Shipping costs vary by location."
- Shipping address collected via Stripe Checkout
- Shipping snapshots stored in Order for historical integrity

### Guest Checkout Flow
1. Guest adds items to cart (localStorage)
2. Checkout creates Order with shipping snapshot
3. Stripe processes payment
4. Webhook creates User account from customer email
5. Order automatically linked to new User
6. Magic link sent for order tracking

### Testing
- Use test Stripe cards in development
- Test email templates with `pnpm test-email`
- Better Auth session testing: `curl http://localhost:3000/api/auth/get-session`

## Deployment

**Build Process:**
1. `pnpm build` - Next.js build
2. `postbuild` hook runs `prisma migrate deploy`
3. Prisma client already generated from `postinstall` hook

**Production Checklist:**
- Set `NODE_ENV=production`
- Configure `NEXT_PUBLIC_APP_URL` to production domain
- Set secure `STRIPE_WEBHOOK_SECRET` from Stripe dashboard
- Increase Better Auth cookie cache to 24 hours
- Add `trustedOrigins` for production domain
- Configure SMTP for production email sending
- Set up proper error monitoring

## Common Tasks

### Adding a New Product Field
1. Update `prisma/schema.prisma` Product model
2. Run `pnpm prisma db push`
3. Update product forms in `src/app/(protected)/dashboard/products/`
4. Update product display in `src/components/storefront/`

### Adding a New Email Template
1. Add template to `emailTemplates` in `src/app/lib/email.ts`
2. Add service function to `emailService` export
3. Call from appropriate API route or webhook

### Debugging Better Auth Issues
1. Check plugin parity: `src/lib/auth.ts` vs `src/app/lib/auth-client.ts`
2. Look for console errors about missing endpoints (404s = plugin mismatch)
3. Test endpoint: `curl http://localhost:3000/api/auth/get-session`
4. Check network tab for failed auth requests
5. Remove manual session management code

### Creating a New Admin Feature
1. Add API route under `src/app/api/admin/`
2. Add UI page under `src/app/(protected)/dashboard/`
3. Check admin role: `session?.user?.role === "admin"`
4. Add TanStack Query hooks in `src/app/hooks/use-admin.ts`
5. Invalidate relevant query keys after mutations
