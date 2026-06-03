import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    // Check if current user is admin
    const session = await auth.api.getSession({
      headers: await request.headers,
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prevent admin from suspending themselves
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: "You cannot suspend your own account" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { reason, expiresIn } = body;

    // Use Better Auth's admin plugin to ban the user
    await auth.api.banUser({
      headers: await request.headers,
      body: {
        userId: userId,
        banReason: reason || "Suspended by administrator",
        banExpiresIn: expiresIn || 60 * 60 * 24 * 7, // 7 days default
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error suspending user:", error);
    return NextResponse.json(
      { error: "Failed to suspend user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    // Check if current user is admin
    const session = await auth.api.getSession({
      headers: await request.headers,
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use Better Auth's admin plugin to unban the user
    await auth.api.unbanUser({
      headers: await request.headers,
      body: {
        userId: userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unsuspending user:", error);
    return NextResponse.json(
      { error: "Failed to unsuspend user" },
      { status: 500 }
    );
  }
} 