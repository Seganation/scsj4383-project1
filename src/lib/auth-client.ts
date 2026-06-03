import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { multiSessionClient } from "better-auth/client/plugins";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { emailOTPClient } from "better-auth/client/plugins";
import { magicLinkClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  // No baseURL needed since client and server are on same domain
  plugins: [
    // Infer additional fields from server auth config
    inferAdditionalFields<typeof auth>(),

    // Multi-session support for concurrent logins
    multiSessionClient(),

    // Admin functionality
    adminClient(),

    // Email OTP functionality
    emailOTPClient(),

    // Magic link functionality
    magicLinkClient(),
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
  magicLink,
} = authClient;
