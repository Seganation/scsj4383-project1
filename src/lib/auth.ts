import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { multiSession } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins";
import { magicLink } from "better-auth/plugins";
import prisma from "./db";
// Remove direct import of emailService to avoid Edge Runtime issues

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Trusted origins - use environment variable for production
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "http://localhost:3000", // Keep for development
  ],

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // Optionally, you can add:
      // prompt: "select_account",
      // accessType: "offline",
      mapProfileToUser: async (profile: any, existingUser?: any) => {
        // Only update fields if they are missing, otherwise preserve existing
        const updates: any = {};
        let needsProfileMerge = false;
        if (existingUser) {
          if (!existingUser.firstName && profile.given_name) {
            updates.firstName = profile.given_name;
          } else if (existingUser.firstName && profile.given_name && existingUser.firstName !== profile.given_name) {
            needsProfileMerge = true;
          }
          if (!existingUser.lastName && profile.family_name) {
            updates.lastName = profile.family_name;
          } else if (existingUser.lastName && profile.family_name && existingUser.lastName !== profile.family_name) {
            needsProfileMerge = true;
          }
          if (!existingUser.image && profile.picture) {
            updates.image = profile.picture;
          } else if (existingUser.image && profile.picture && existingUser.image !== profile.picture) {
            needsProfileMerge = true;
          }
          // DO NOT set 'image' property
        } else {
          updates.firstName = profile.given_name;
          updates.lastName = profile.family_name;
          updates.image = profile.picture;
          // DO NOT set 'image' property
        }
        updates.needsProfileMerge = needsProfileMerge;
        return updates;
      },
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // 24 hours for production
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // We'll use OTP for verification instead
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url, token }, request) => {
      try {
        // Dynamic import to avoid Edge Runtime issues
        const { emailService } = await import("./email");
        // Construct the reset link (ensure it points to the correct frontend route)
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;
        await emailService.sendMagicLink(user.email, resetUrl);
      } catch (error) {
        console.error(`❌ Failed to send password reset magic link to ${user.email}:`, error);
        throw error;
      }
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // We'll use OTP for email verification instead of links
      // This is kept for compatibility but won't be used
    },
    autoSignInAfterVerification: true, // Auto sign in after email verification
  },

  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: false,
      },
      lastName: {
        type: "string",
        required: false,
      },
      image: {
        type: "string",
        required: false,
      },
    },
  },

  plugins: [
    // Multi-session support for concurrent logins
    multiSession({
      maximumSessions: 5,
    }),

    // Admin functionality with role-based admin check
    admin({
      defaultRole: "customer", // New users get "customer" role by default
      adminRoles: ["admin"], // Users with "admin" role will be considered admins
    }),

    // Email OTP for sign-in, email verification, and password reset
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        try {
          // Dynamic import to avoid Edge Runtime issues
          const { emailService } = await import("./email");
          // "change-email" is a new type in better-auth v1.5; treat it like email-verification
          const emailType = (type === "change-email" ? "email-verification" : type) as
            | "sign-in"
            | "email-verification"
            | "forget-password";
          await emailService.sendOTP(email, otp, emailType);
        } catch (error) {
          console.error(`❌ Failed to send ${type} OTP to ${email}:`, error);
          throw error;
        }
      },
    }),

    // Magic link functionality
    magicLink({
      async sendMagicLink({ email, url }) {
        try {
          // Dynamic import to avoid Edge Runtime issues
          const { emailService } = await import("./email");
          await emailService.sendMagicLink(email, url);
        } catch (error) {
          console.error(`❌ Failed to send magic link to ${email}:`, error);
          throw error;
        }
      },
    }),
  ],
});