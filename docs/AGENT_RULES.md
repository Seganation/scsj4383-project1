# AI Agent Rules for Better Auth Project

## Core Principles

### 1. **Trust Better Auth's Built-in Reactivity**
- Better Auth's `useSession` hook uses nanostore and updates automatically
- **NEVER** add manual session management with `useEffect` hooks
- **NEVER** use `window.location.reload()` or manual `router.refresh()`
- Let Better Auth handle redirects with `callbackURL` parameter

### 2. **Plugin Parity is Critical**
- Client plugins MUST match server plugins exactly
- If server doesn't have `magicLink` plugin, client shouldn't have `magicLinkClient()`
- Always check both `src/lib/auth.ts` and `src/app/lib/auth-client.ts` for plugin consistency
- Only include plugins that are actually used and configured

### 3. **Minimal Configuration for Development**
- Remove `trustedOrigins` for localhost development
- Remove `crossSubDomainCookies` for single domain setup
- Don't set `baseURL` when client/server are on same domain
- Use short cookie cache (5 minutes) for better reactivity during development

### 4. **Simple Sign-In/Sign-Out Handlers**
```typescript
// ✅ CORRECT - Let Better Auth handle everything
const handleGoogleSignIn = async () => {
  await authClient.signIn.social({ 
    provider: "google",
    callbackURL: redirectTo,
  });
  // useSession will update UI automatically
};

const handleSignOut = async () => {
  await authClient.signOut();
  // useSession will update UI automatically
};
```

### 5. **File Structure Rules**
- Server auth config: `src/lib/auth.ts`
- Client auth config: `src/app/lib/auth-client.ts`
- API route: `src/app/api/auth/[...betterAuth]/route.ts`
- Import auth type: `import type { auth } from "@/lib/auth"`

## Common Anti-Patterns to Avoid

### ❌ **Never Do These**
```typescript
// Manual session management
useEffect(() => {
  const checkSession = async () => {
    // Manual session checking
  };
}, []);

// Manual navigation in sign-in handlers
fetchOptions: {
  onSuccess: () => {
    router.push("/dashboard");
    router.refresh();
  },
}

// Complex session refresh logic
const refreshSession = async () => {
  // Manual session refresh
};

// Unnecessary baseURL
export const authClient = createAuthClient({
  baseURL: "http://localhost:3000", // Not needed
});

// Plugin mismatch
// Server: no magicLink plugin
// Client: magicLinkClient() // ❌ WRONG
```

### ✅ **Always Do These**
```typescript
// Simple useSession usage
const { data: session, isPending, error } = useSession();

// Let Better Auth handle redirects
await authClient.signIn.social({
  provider: "google",
  callbackURL: "/dashboard",
});

// Plugin parity
// Server: plugins: [admin(), multiSession(), emailOTP()]
// Client: plugins: [adminClient(), multiSessionClient(), emailOTPClient()]
```

## Debugging Rules

### 1. **Check Plugin Consistency First**
```bash
# Check server plugins
grep -r "plugins:" src/lib/auth.ts

# Check client plugins  
grep -r "plugins:" src/app/lib/auth-client.ts

# Ensure they match
```

### 2. **Test Auth Endpoint**
```bash
curl -s http://localhost:3000/api/auth/get-session
```

### 3. **Look for Console Errors**
- Missing endpoints (404s) = Plugin mismatch
- CORS errors = Origin restrictions
- Session not updating = Manual session management interfering

### 4. **Check Network Tab**
- Look for failed auth requests
- Check if cookies are being set properly
- Verify redirects are working

## Configuration Templates

### Server Auth Config (`src/lib/auth.ts`)
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

  // No trustedOrigins for development
  // No crossSubDomainCookies for single domain

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

  plugins: [
    admin(),
    multiSession(),
    emailOTP(),
  ],
});
```

### Client Auth Config (`src/app/lib/auth-client.ts`)
```typescript
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { multiSessionClient } from "better-auth/client/plugins";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { emailOTPClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    multiSessionClient(),
    adminClient(),
    emailOTPClient(),
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
} = authClient;
```

## Memory Rules

### Project-Specific Context
- This project uses Better Auth for authentication
- User prefers plain command lists without shell code fences
- Auth routes are under `src/app/(auth)` folder, not `src/app/auth`
- Storefront should be migrated to public routes
- User prefers Better Auth's built-in magic link and email OTP features

### Common Issues to Remember
1. **UI not updating after sign-in/sign-out** = Plugin mismatch or manual session management
2. **Authentication working but no UI update** = Trust Better Auth's reactivity, don't add manual logic
3. **Console errors about missing endpoints** = Check plugin parity between client and server
4. **CORS errors** = Remove `trustedOrigins` for development
5. **Session not persisting** = Check cookie configuration and domain settings

### Testing Checklist
- [ ] Google OAuth sign-in updates navbar immediately
- [ ] Email/password sign-in updates navbar immediately  
- [ ] Sign-out clears user state immediately
- [ ] No console errors about missing endpoints
- [ ] Session persists across page refreshes
- [ ] No manual `router.refresh()` calls needed

## When to Reference Documentation
- Check `docs/BETTER_AUTH_UI_REACTIVITY_FIX.md` for troubleshooting
- Review Better Auth docs in `docs/better-auth/` for specific features
- Use `docs/AGENT_RULES.md` (this file) for configuration guidance
- Reference `docs/BETTER_AUTH_UI_REACTIVITY_FIX.md` for common fixes

## Emergency Fixes
If UI reactivity breaks:
1. Check plugin parity between client/server
2. Remove any manual session management
3. Simplify sign-in handlers to use `callbackURL` only
4. Remove `trustedOrigins` and `crossSubDomainCookies`
5. Set short cookie cache (5 minutes)
6. Restart dev server 