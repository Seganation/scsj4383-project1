import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Production-ready cache revalidation for banner updates
export async function POST(request: NextRequest) {
  try {
    // Verify the request is legitimate (you might want to add authentication here)
    const authorization = request.headers.get("authorization");

    const revalidateSecret = process.env.REVALIDATE_SECRET;
    if (
      !revalidateSecret ||
      !authorization ||
      authorization !== `Bearer ${revalidateSecret}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Revalidate banner cache
    revalidateTag("banners", "default");

    console.log("✅ Banner cache revalidated");

    return NextResponse.json(
      {
        success: true,
        message: "Banner cache revalidated",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error revalidating banner cache:", error);

    return NextResponse.json(
      {
        error: "Failed to revalidate cache",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Allow GET for testing in development
export async function GET() {
  if (process.env.NODE_ENV === "development") {
    revalidateTag("banners", "default");
    return NextResponse.json({
      success: true,
      message: "Banner cache revalidated (development)",
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json(
    { error: "Method not allowed in production" },
    { status: 405 }
  );
}
