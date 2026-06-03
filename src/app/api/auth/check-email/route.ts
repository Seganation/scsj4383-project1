import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { rateLimit, RATE_LIMITS } from "@/app/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, RATE_LIMITS.auth);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rl.headers });
  }

  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    // Check if email is a registered user (has a user record)
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      // If user has any accounts (any provider), treat as existing user
      const account = await prisma.account.findFirst({
        where: { userId: user.id },
      });
      if (account) {
        return NextResponse.json({ status: "user" });
      }
      // If user has a userId (should always be true if user exists), treat as existing user
      if (user.id) {
        return NextResponse.json({ status: "user" });
      }
    }
    // Check if email has guest orders
    const guestOrder = await prisma.order.findFirst({
      where: { shippingEmail: email, userId: null },
    });
    if (guestOrder) {
      return NextResponse.json({ status: "guest" });
    }
    // Otherwise, it's a new email
    return NextResponse.json({ status: "new" });
  } catch (error) {
    console.error("check-email error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 