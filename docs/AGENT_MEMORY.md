# AI Agent Memory - Better Auth Project

## Project Context

### Technology Stack
- **Framework**: Next.js 15.4.1
- **Authentication**: Better Auth (not NextAuth.js)
- **Database**: PostgreSQL with Prisma
- **UI**: React with Tailwind CSS
- **Package Manager**: pnpm

### Key File Locations
- **Server Auth Config**: `src/lib/auth.ts`
- **Client Auth Config**: `src/lib/auth-client.ts`
- **API Route**: `src/app/api/auth/[...betterAuth]/route.ts`
- **Auth Pages**: `src/app/(auth)/`
- **Public Pages**: `src/app/(public)/`
- **Protected Pages**: `src/app/(protected)/`

### User Preferences
- Prefers plain command lists without shell code fences
- Wants to use Better Auth's built-in features (magic link, email OTP)
- Auth routes should be under `src/app/(auth)` folder
- Storefront should be migrated to public routes

## Critical Learnings

### 1. Better Auth Reactivity
- `useSession` hook uses nanostore and updates automatically
- **NEVER** add manual session management
- **NEVER** use `window.location.reload()` or `router.refresh()`
- Let Better Auth handle redirects with `callbackURL`

### 2. Plugin Parity is Essential
- Client plugins MUST match server plugins exactly
- Common mistake: `magicLinkClient()` on client but no `magicLink` plugin on server
- Always check both auth config files for consistency

### 3. Development Configuration
- Remove `trustedOrigins` for localhost development
- Remove `crossSubDomainCookies` for single domain
- Don't set `baseURL` when client/server on same domain
- Use short cookie cache (5 minutes) for better reactivity

### 4. Simple is Better
- Complex sign-in handlers fight Better Auth's built-in functionality
- Use `callbackURL` instead of manual navigation
- Trust Better Auth's reactivity instead of adding manual logic

## Common Issues & Solutions

### Issue: UI not updating after sign-in/sign-out
**Causes**:
1. Plugin mismatch between client/server
2. Manual session management interfering
3. Restrictive origin settings
4. Long cookie cache duration

**Solutions**:
1. Check plugin parity
2. Remove manual session management
3. Remove `trustedOrigins` and `crossSubDomainCookies`
4. Set short cookie cache (5 minutes)

### Issue: Console errors about missing endpoints
**Cause**: Plugin mismatch
**Solution**: Ensure client plugins match server plugins exactly

### Issue: CORS errors
**Cause**: Restrictive origin settings
**Solution**: Remove `trustedOrigins` for development

### Issue: Session not persisting
**Cause**: Cookie configuration issues
**Solution**: Check domain settings and cookie configuration

## Working Configuration

### Server Auth (`src/lib/auth.ts`)
```typescript
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  
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
  
  emailAndPassword: { enabled: true },
  
  plugins: [admin(), multiSession(), emailOTP()],
});
```

### Client Auth (`src/lib/auth-client.ts`)
```typescript
export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    multiSessionClient(),
    adminClient(),
    emailOTPClient(),
  ],
});
```

## Testing Commands
```bash
# Test auth endpoint
curl -s http://localhost:3000/api/auth/get-session

# Check for missing endpoints
curl -s http://localhost:3000/api/auth/magic-link/send

# Restart dev server
pkill -f "next dev" && pnpm dev
```

## Documentation References
- **Troubleshooting**: `docs/BETTER_AUTH_UI_REACTIVITY_FIX.md`
- **Better Auth Docs**: `docs/better-auth/`
- **Agent Rules**: `docs/AGENT_RULES.md`

## Emergency Fixes
If UI reactivity breaks:
1. Check plugin parity between client/server
2. Remove any manual session management
3. Simplify sign-in handlers to use `callbackURL` only
4. Remove `trustedOrigins` and `crossSubDomainCookies`
5. Set short cookie cache (5 minutes)
6. Restart dev server

## Key Principles to Remember
1. **Trust Better Auth's built-in reactivity**
2. **Plugin parity is critical**
3. **Minimal configuration for development**
4. **Simple sign-in/sign-out handlers**
5. **Let Better Auth handle redirects**

## Success Indicators
- Google OAuth sign-in updates navbar immediately
- Email/password sign-in updates navbar immediately
- Sign-out clears user state immediately
- No console errors about missing endpoints
- Session persists across page refreshes
- No manual `router.refresh()` calls needed 