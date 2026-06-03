import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  linkGuestOrdersToUser,
  checkForGuestOrders,
} from "@/app/lib/order-linking";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userEmail } = await req.json();

    // Use session email if not provided
    const emailToCheck = userEmail || session.user.email;

    if (!emailToCheck) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if there are any guest orders to link
    const hasGuestOrders = await checkForGuestOrders(emailToCheck);

    if (!hasGuestOrders) {
      return NextResponse.json({
        success: true,
        message: "No guest orders found to link",
        linked: 0,
        orders: [],
      });
    }

    // Link guest orders to the user
    const result = await linkGuestOrdersToUser(emailToCheck, session.user.id);

    return NextResponse.json({
      success: true,
      message: `Successfully linked ${result.linked} orders to your account`,
      linked: result.linked,
      orders: result.orders,
    });
  } catch (error) {
    console.error("❌ Error linking orders:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has linkable guest orders
    const hasGuestOrders = await checkForGuestOrders(session.user.email);

    return NextResponse.json({
      hasGuestOrders,
      userEmail: session.user.email,
    });
  } catch (error) {
    console.error("❌ Error checking for guest orders:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
