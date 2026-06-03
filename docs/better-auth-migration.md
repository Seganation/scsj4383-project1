# Better Auth Migration Documentation

This document outlines the complete migration from Kinde Auth to Better Auth for the Archcool e-commerce platform.

## Overview

We have successfully migrated from Kinde Auth to Better Auth with the following features:

- Email/password authentication
- Multi-session support
- Admin functionality with single admin restriction
- JWT support for API authentication
- Stripe integration for payments
- Enhanced security with rate limiting and CSRF protection

## Schema Changes

### Updated Prisma Schema

The database schema has been completely updated to support Better Auth's requirements:

- **User Model**: Added `isAdmin`, `firstName`, `lastName`, `profileImage` fields
- **Session Model**: Better Auth-compatible session management
- **Account Model**: OAuth and credential provider support
- **VerificationToken Model**: Email verification and password reset tokens
- **Order/OrderItem Models**: Enhanced with proper relations and amount tracking

## Authentication Flow

### 1. Sign Up

- Users can register at `/auth/sign-up`
- Requires: firstName, lastName, email, password
- Minimum password length: 8 characters
- Email verification is currently disabled for development

### 2. Sign In

- Users can sign in at `/auth/sign-in`
- Supports email/password authentication
- Multi-session support (up to 5 concurrent sessions)

### 3. Admin Access

- Only one admin is allowed in the system
- Admin access is controlled via `ADMIN_USER_ID` environment variable
- Admin routes are protected by middleware at `/dashboard/*`

## API Routes

### Better Auth API

- `GET/POST /api/auth/[...betterAuth]` - Main Better Auth handler

### Stripe Integration

- `POST /api/stripe/webhook` - Handles Stripe webhooks for payment processing
- `POST /api/checkout` - Creates Stripe checkout sessions with order tracking

## Security Features

1. **Rate Limiting**: 100 requests per minute
2. **CSRF Protection**: Enabled for all routes
3. **Secure Cookies**: In production
4. **Session Management**: 7-day cookie cache
5. **Middleware Protection**: Route-based authentication

## Environment Variables Required

```env
# Database
DATABASE_URL="your-postgresql-database-url"

# Better Auth
BETTER_AUTH_SECRET="your-super-secret-key-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Admin Configuration
ADMIN_USER_ID="user-id-of-the-admin"
ADMIN_EMAIL="admin@example.com"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

## Updated Components

### Frontend Components

- `Navbar`: Uses Better Auth session instead of Kinde
- `UserDropdown`: Client-side sign out with Better Auth
- `SignInForm`: New authentication form
- `SignUpForm`: New registration form
- `Dashboard Layout`: Admin-only access with Better Auth

### Hooks

- `useSession`: Custom hook for session management
- `useUser`: Simplified user state management

## File Changes Summary

### New Files

- `src/lib/auth.ts` - Better Auth server configuration
- `src/lib/auth-client.ts` - Better Auth client configuration
- `src/app/api/auth/[...betterAuth]/route.ts` - Auth API handler
- `src/app/(auth)/sign-in/page.tsx` - Sign in page
- `src/app/(auth)/sign-up/page.tsx` - Sign up page
- `src/hooks/use-session.ts` - Session management hooks
- `src/components/dashboard/SignOutButton.tsx` - Sign out component
- `src/middleware.ts` - Route protection middleware
- `src/app/api/stripe/webhook/route.ts` - Stripe webhook handler

### Updated Files

- `prisma/schema.prisma` - Better Auth compatible schema
- `src/components/storefront/Navbar.tsx` - Better Auth integration
- `src/components/storefront/UserDropdown.tsx` - Client-side auth
- `src/app/dashboard/layout.tsx` - Admin protection
- `src/app/api/checkout/route.ts` - Better Auth and order integration

### Removed Dependencies

- `@kinde-oss/kinde-auth-nextjs` - Replaced with Better Auth

## Migration Steps

1. **Install Dependencies**

   ```bash
   pnpm add better-auth jose
   pnpm remove @kinde-oss/kinde-auth-nextjs
   ```

2. **Update Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in all required values

3. **Database Migration**

   ```bash
   npx prisma generate
   npx prisma db push  # or migrate dev if you prefer
   ```

4. **Create First Admin**
   - Register a user through the sign-up form
   - Set their user ID in the `ADMIN_USER_ID` environment variable
   - Update the user's `isAdmin` field to `true` in the database

5. **Stripe Webhook Setup**
   - Create webhook endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `payment_intent.payment_failed`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## Testing

1. **Authentication Flow**
   - Register new account at `/auth/sign-up`
   - Sign in at `/auth/sign-in`
   - Verify session persistence across page reloads

2. **Admin Access**
   - Access `/dashboard` with admin account
   - Verify non-admin users are redirected

3. **Payment Flow**
   - Add items to cart
   - Complete checkout process
   - Verify order creation and status updates

## Security Considerations

1. **Admin Setup**: Only one admin is allowed. Set up the first admin carefully.
2. **Environment Variables**: Keep `BETTER_AUTH_SECRET` secure and random.
3. **HTTPS**: Use HTTPS in production for secure cookies.
4. **Rate Limiting**: Monitor rate limiting effectiveness in production.

## Future Enhancements

1. **Email Verification**: Enable email verification in production
2. **Password Reset**: Implement password reset flow
3. **Social Login**: Add OAuth providers if needed
4. **Role-Based Access**: Extend beyond simple admin/user roles
5. **Session Management**: Add user session management in admin panel

## Troubleshooting

### Common Issues

1. **"Unauthorized" errors**: Check `BETTER_AUTH_SECRET` is set
2. **Admin access denied**: Verify `ADMIN_USER_ID` matches user's ID
3. **Stripe webhook failures**: Check webhook secret and endpoint URL
4. **Session not persisting**: Verify cookie settings and HTTPS in production

### Debug Steps

1. Check browser network tab for auth API calls
2. Verify environment variables are loaded
3. Check database for user records and session data
4. Monitor server logs for Better Auth errors
