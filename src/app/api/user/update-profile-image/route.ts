import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/app/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { image } = await request.json();
    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }
    // Only allow HTTPS URLs from trusted CDN domains
    const allowedHosts = ["utfs.io", "ufs.sh", "lh3.googleusercontent.com"];
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(image);
    } catch {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }
    const hostAllowed = allowedHosts.some(
      (h) => parsedUrl.hostname === h || parsedUrl.hostname.endsWith(`.${h}`)
    );
    if (parsedUrl.protocol !== "https:" || !hostAllowed) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }
    // Explicitly cast data to match Prisma UserUpdateInput
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: image as string },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating profile image:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 