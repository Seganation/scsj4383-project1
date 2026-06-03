import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Check if user is authenticated and is admin
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Get recent pending orders for notifications
    const pendingOrders = await prisma.order.findMany({
      where: {
        OR: [
          { paymentStatus: "pending" },
          { status: "pending" },
          {
            AND: [
              { paymentStatus: "succeeded" },
              { status: "paid" },
              { status: { not: "fulfilled" } },
            ],
          },
        ],
      },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        amount: true,
        createdAt: true,
        shippingName: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10, // Only get the 10 most recent
    });

    return NextResponse.json(pendingOrders);
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
