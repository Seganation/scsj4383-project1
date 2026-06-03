import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { rateLimit, RATE_LIMITS } from "@/app/lib/rate-limit";

export async function GET(req: NextRequest) {
  const rl = await rateLimit(req, RATE_LIMITS.auth);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rl.headers });
  }

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check what providers the user has
    const hasGoogleAccount = user.accounts.some(account => account.providerId === "google");
    const hasPassword = user.accounts.some(account => account.providerId === "credential");

    return NextResponse.json({
      hasGoogleAccount,
      hasPassword,
      canResetPassword: hasPassword, // Only allow password reset if they have a password account
    });
  } catch (error) {
    console.error("user-provider error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 