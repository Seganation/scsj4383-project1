export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { linkGuestOrdersToUser } from "@/app/lib/order-linking";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { password, firstName, lastName } = await req.json();
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    // Set password for the current user
    await auth.api.setPassword({
      headers: req.headers,
      body: { newPassword: password },
    });
    // Optionally update firstName and lastName
    if (firstName || lastName) {
      await auth.api.updateUser({
        body: { firstName, lastName },
        headers: req.headers,
      });
    }
    // Link guest orders to this user (if any)
    let linkedOrders = 0;
    if (session.user?.email && session.user?.id) {
      try {
        const result = await linkGuestOrdersToUser(session.user.email, session.user.id);
        linkedOrders = result.linked || 0;
      } catch (e) {
        console.error("Error linking guest orders after registration:", e);
      }
    }
    return NextResponse.json({ success: true, linkedOrders });
  } catch (error) {
    console.error("Set password error:", error);
    return NextResponse.json({ error: "Failed to set password" }, { status: 500 });
  }
} 