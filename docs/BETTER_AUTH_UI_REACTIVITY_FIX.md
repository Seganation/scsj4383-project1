# Better Auth UI Reactivity Fix Guide

## Problem Description
When signing in or signing out with Better Auth, the UI doesn't update to reflect the authentication state changes. The authentication works (you can see successful API calls), but the navbar and other components don't show the user as logged in/out.

## Root Causes & Solutions

### 1. **Plugin Mismatch Between Client and Server**

**Problem**: Client has plugins that don't exist on the server side.

**Symptoms**:
- Console errors about missing endpoints
- Authentication works but UI doesn't update
- `magicLinkClient()` in client but no `magicLink` plugin on server

**Solution**:
```typescript
// ❌ WRONG - Client has magicLinkClient but server doesn't have magicLink
// auth-client.ts
plugins: [
  magicLinkClient(), // This will cause issues
]

// ✅ CORRECT - Only include plugins that exist on both sides
// auth-client.ts
plugins: [
  adminClient(),
  multiSessionClient(),
  emailOTPClient(),
  // Remove magicLinkClient() if server doesn't have magicLink plugin
]
```

### 2. **Restrictive Origin Settings**

**Problem**: `trustedOrigins` and `crossSubDomainCookies` blocking localhost development.

**Symptoms**:
- Authentication fails on localhost
- CORS errors in console
- Session cookies not being set properly

**Solution**:
```typescript
// ❌ WRONG - Too restrictive for development
export const auth = betterAuth({
  trustedOrigins: [
    "http://localhost:3000",
    "https://archcoolstore.com",
  ],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: ".archcoolstore.com",
    },
  },
});

// ✅ CORRECT - Remove for development, add back for production
export const auth = betterAuth({
  // Remove trustedOrigins for localhost development
  // Remove crossSubDomainCookies for single domain
});
```

### 3. **Unnecessary Base URL Configuration**

**Problem**: Setting `baseURL` when client and server are on the same domain.

**Symptoms**:
- Network requests going to wrong URLs
- Authentication working but session not persisting

**Solution**:
```typescript
// ❌ WRONG - Unnecessary for same-domain setup
export const authClient = createAuthClient({
  baseURL: "http://localhost:3000", // Not needed
});

// ✅ CORRECT - Let Better Auth auto-detect
export const authClient = createAuthClient({
  // No baseURL needed when client/server on same domain
});
```

### 4. **Manual Session Management Interfering**

**Problem**: Custom session refresh logic fighting Better Auth's built-in reactivity.

**Symptoms**:
- Complex `useEffect` hooks for session management
- Manual `localStorage` events
- `window.location.reload()` calls

**Solution**:
```typescript
// ❌ WRONG - Manual session management
useEffect(() => {
  const checkSession = async () => {
    // Manual session checking
  };
  checkSession();
}, []);

// ✅ CORRECT - Let Better Auth handle it
const { data: session, isPending, error, refetch } = useSession();
// Better Auth's useSession is reactive by default
```

### 5. **Overly Complex Sign-In Handlers**

**Problem**: Manual navigation and refresh logic instead of trusting Better Auth.

**Symptoms**:
- `router.push()` and `router.refresh()` in sign-in handlers
- Manual success/error callbacks
- Fighting Better Auth's built-in redirects

**Solution**:
```typescript
// ❌ WRONG - Manual navigation
const result = await authClient.signIn.social({
  provider: "google",
  fetchOptions: {
    onSuccess: () => {
      router.push("/dashboard");
      router.refresh();
    },
  },
});

// ✅ CORRECT - Let Better Auth handle it
await authClient.signIn.social({
  provider: "google",
  callbackURL: "/dashboard", // Better Auth handles redirect
});
// useSession hook will update UI automatically
```

### 6. **Long Cookie Cache Duration**

**Problem**: Session cache too long, making UI updates slow.

**Symptoms**:
- UI takes time to reflect authentication changes
- Session appears stale

**Solution**:
```typescript
// ❌ WRONG - Too long cache for development
session: {
  cookieCache: {
    enabled: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
},

// ✅ CORRECT - Shorter cache for better reactivity
session: {
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60, // 5 minutes for development
  },
},
```

## Complete Working Configuration

### Server Configuration (`src/lib/auth.ts`)
```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { multiSession } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins";
import prisma from "./db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Remove trustedOrigins for development
  // Remove crossSubDomainCookies for single domain

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes for development
    },
  },

  emailAndPassword: {
    enabled: true,
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // Your email sending logic
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },

  plugins: [
    admin(),
    multiSession(),
    emailOTP(),
    // Only include plugins you actually use
  ],
});
```

### Client Configuration (`src/app/lib/auth-client.ts`)
```typescript
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { multiSessionClient } from "better-auth/client/plugins";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { emailOTPClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  // No baseURL needed when client/server on same domain
  plugins: [
    // Infer additional fields from server auth config
    inferAdditionalFields<typeof auth>(),

    // Multi-session support for concurrent logins
    multiSessionClient(),

    // Admin functionality
    adminClient(),

    // Email OTP functionality
    emailOTPClient(),

    // Only include plugins that exist on server
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  admin,
  multiSession,
  emailOtp,
  // Only export what you actually use
} = authClient;
```

### Simple Sign-In Handler
```typescript
const handleGoogleSignIn = async () => {
  setIsGoogleLoading(true);
  try {
    // Let Better Auth handle redirects automatically
    await authClient.signIn.social({ 
      provider: "google",
      callbackURL: redirectTo,
    });
    
    // Better Auth will handle the redirect automatically
    // The useSession hook will update the UI reactively
    
  } catch (error: any) {
    console.error("Google sign in error:", error);
    toast.error(error.message || "Failed to sign in with Google.");
    setIsGoogleLoading(false);
  }
};
```

### Simple Sign-Out Handler
```typescript
const handleSignOut = async () => {
  try {
    await authClient.signOut();
    // useSession hook will automatically update the UI
    toast.success("Signed out successfully");
  } catch (error) {
    toast.error("Failed to sign out");
    console.error(error);
  }
};
```

## Key Principles

1. **Trust Better Auth's Built-in Reactivity**: The `useSession` hook uses nanostore and updates automatically
2. **Plugin Parity**: Client plugins must match server plugins
3. **Minimal Configuration**: Remove unnecessary settings for development
4. **Let Better Auth Handle Redirects**: Use `callbackURL` instead of manual navigation
5. **Short Cache for Development**: Use 5-minute cache instead of days

## Testing Checklist

- [ ] Google OAuth sign-in updates navbar immediately
- [ ] Email/password sign-in updates navbar immediately  
- [ ] Sign-out clears user state immediately
- [ ] No console errors about missing endpoints
- [ ] Session persists across page refreshes
- [ ] No manual `router.refresh()` calls needed

## Production Considerations

When deploying to production, you may want to:
- Add back `trustedOrigins` with your production domains
- Increase cookie cache duration for performance
- Add `crossSubDomainCookies` if needed
- Set appropriate `baseURL` if client/server are on different domains

## Debugging Commands

```bash
# Test auth endpoint
curl -s http://localhost:3000/api/auth/get-session

# Check for missing endpoints
curl -s http://localhost:3000/api/auth/magic-link/send

# Monitor network requests in browser dev tools
# Look for 404s on auth endpoints
```

This guide should help you quickly identify and fix Better Auth UI reactivity issues in the future! 