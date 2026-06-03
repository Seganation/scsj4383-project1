import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("verify");

  if (!token) {
    return NextResponse.json({ error: "Missing verification token" }, { status: 400 });
  }

  try {
    // Find order by reference ID and check if magic link token matches
    const order = await prisma.order.findFirst({
      where: {
        referenceId: orderId, // orderId in URL is actually the referenceId
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.magicLinkToken) {
      return NextResponse.json({ error: "No magic link available for this order" }, { status: 403 });
    }

    if (order.magicLinkToken !== token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    if (order.magicLinkExpiresAt && order.magicLinkExpiresAt < new Date()) {
      return NextResponse.json({ error: "Magic link has expired" }, { status: 403 });
    }

    // Return the order data
    return NextResponse.json(order);

  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("Magic link verification error:", err);
    }
    return NextResponse.json({ error: "Server error during verification" }, { status: 500 });
  }
} 