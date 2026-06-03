import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { runScheduledJobs } from "@/lib/cron-jobs";

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

// This API route is called by cron services (Coolify, EasyCron, etc.)
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Cron job endpoint
 *
 * Security: Protected by secret token from environment variable
 * Usage:
 *   GET /api/cron?secret=YOUR_CRON_SECRET
 *   GET /api/cron?secret=YOUR_CRON_SECRET&job=sessions
 */
export async function GET(request: NextRequest) {
  try {
    // Security: Verify cron secret
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const jobType = searchParams.get("job");

    if (!process.env.CRON_SECRET || !secret || !safeCompare(secret, process.env.CRON_SECRET)) {
      console.warn("❌ [CRON] Unauthorized cron attempt from", request.headers.get("x-forwarded-for"));
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[CRON] Running jobs at ${new Date().toISOString()}${jobType ? ` (job: ${jobType})` : ""}`);

    // Run jobs
    const results = await runScheduledJobs(jobType || undefined);

    // Count successes and failures
    const stats = Object.entries(results).reduce(
      (acc, [job, result]) => {
        if (result.success) acc.success++;
        else acc.failed++;
        return acc;
      },
      { success: 0, failed: 0 }
    );

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats,
      results,
    });
  } catch (error) {
    console.error("❌ [CRON] Error running scheduled jobs:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
