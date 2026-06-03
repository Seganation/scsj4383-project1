/**
 * Cron Jobs for ArchCool E-Commerce Platform
 *
 * These jobs handle automated cleanup and maintenance tasks.
 * Designed to be lightweight and VPS-friendly.
 */

import prisma from "@/app/lib/db";
import { emailService, emailTransporter } from "@/app/lib/email";

// ============================================================================
// JOB 1: Clean Expired Sessions (Better Auth)
// ============================================================================

/**
 * Removes expired session tokens from the database
 * Runs: Daily at 2 AM
 * Impact: Reduces database size, improves query performance
 */
export async function cleanExpiredSessions() {
  const startTime = Date.now();

  try {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(), // Less than now = expired
        },
      },
    });

    const duration = Date.now() - startTime;
    console.log(`✅ [CRON] Cleaned ${result.count} expired sessions in ${duration}ms`);

    return { success: true, deleted: result.count, duration };
  } catch (error) {
    console.error("❌ [CRON] Failed to clean expired sessions:", error);
    return { success: false, error };
  }
}

// ============================================================================
// JOB 2: Clean Expired Verification Codes (OTP, Magic Links)
// ============================================================================

/**
 * Removes expired OTP and magic link verification codes
 * Runs: Daily at 2:15 AM
 * Impact: Security (prevents old codes from being reused)
 */
export async function cleanExpiredVerifications() {
  const startTime = Date.now();

  try {
    const result = await prisma.verification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    const duration = Date.now() - startTime;
    console.log(`✅ [CRON] Cleaned ${result.count} expired verifications in ${duration}ms`);

    return { success: true, deleted: result.count, duration };
  } catch (error) {
    console.error("❌ [CRON] Failed to clean expired verifications:", error);
    return { success: false, error };
  }
}

// ============================================================================
// JOB 3: Unban Users with Expired Bans
// ============================================================================

/**
 * Automatically unbans users whose ban period has expired
 * Runs: Every 6 hours
 * Impact: User experience (auto-restore access)
 */
export async function processBanExpiry() {
  const startTime = Date.now();

  try {
    const result = await prisma.user.updateMany({
      where: {
        banned: true,
        banExpires: {
          not: null,
          lt: new Date(), // Ban expired
        },
      },
      data: {
        banned: false,
        banReason: null,
        banExpires: null,
      },
    });

    const duration = Date.now() - startTime;
    console.log(`✅ [CRON] Unbanned ${result.count} users in ${duration}ms`);

    return { success: true, unbanned: result.count, duration };
  } catch (error) {
    console.error("❌ [CRON] Failed to process ban expiry:", error);
    return { success: false, error };
  }
}

// ============================================================================
// JOB 4: Clean Expired Magic Links from Orders
// ============================================================================

/**
 * Removes expired magic link tokens from orders (7+ days old)
 * Runs: Daily at 3 AM
 * Impact: Security (old tokens can't be reused)
 */
export async function cleanExpiredMagicLinks() {
  const startTime = Date.now();

  try {
    const result = await prisma.order.updateMany({
      where: {
        magicLinkExpiresAt: {
          not: null,
          lt: new Date(),
        },
      },
      data: {
        magicLinkToken: null,
        magicLinkExpiresAt: null,
      },
    });

    const duration = Date.now() - startTime;
    console.log(`✅ [CRON] Cleaned ${result.count} expired magic links in ${duration}ms`);

    return { success: true, cleaned: result.count, duration };
  } catch (error) {
    console.error("❌ [CRON] Failed to clean expired magic links:", error);
    return { success: false, error };
  }
}

// ============================================================================
// JOB 5: Cancel Abandoned Orders (Pending > 24 Hours)
// ============================================================================

/**
 * Automatically cancels orders stuck in "pending" for more than 24 hours
 * Runs: Every 6 hours
 * Impact: Database cleanliness, accurate analytics
 */
export async function cancelAbandonedOrders() {
  const startTime = Date.now();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const result = await prisma.order.updateMany({
      where: {
        status: "pending",
        paymentStatus: "pending",
        createdAt: {
          lt: twentyFourHoursAgo,
        },
      },
      data: {
        status: "cancelled",
      },
    });

    const duration = Date.now() - startTime;
    console.log(`✅ [CRON] Cancelled ${result.count} abandoned orders in ${duration}ms`);

    return { success: true, cancelled: result.count, duration };
  } catch (error) {
    console.error("❌ [CRON] Failed to cancel abandoned orders:", error);
    return { success: false, error };
  }
}

// ============================================================================
// JOB 6: Send Daily Sales Report to Admin
// ============================================================================

/**
 * Generates and emails daily sales report to admins
 * Runs: Daily at 9 AM
 * Impact: Business insights
 */
export async function sendDailySalesReport() {
  const startTime = Date.now();

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get yesterday's stats
    const orders = await prisma.order.findMany({
      where: {
        status: "paid",
        paidAt: {
          gte: yesterday,
          lt: today,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
    const totalOrders = orders.length;

    // Get admin emails
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { email: true, name: true },
    });

    if (admins.length === 0) {
      console.log("⚠️  [CRON] No admin users found, skipping sales report");
      return { success: true, skipped: true };
    }

    // Send email to each admin
    for (const admin of admins) {
      await emailTransporter.sendMail({
        from: '"ArchCool Store" <archcool@archcoolstore.com>',
        to: admin.email,
        subject: `Daily Sales Report - ${yesterday.toLocaleDateString()}`,
        html: `
          <h2>Daily Sales Summary</h2>
          <p>Hi ${admin.name || "Admin"},</p>
          <p>Here's your sales report for ${yesterday.toLocaleDateString()}:</p>
          <ul>
            <li><strong>Total Orders:</strong> ${totalOrders}</li>
            <li><strong>Total Revenue:</strong> £${totalRevenue}</li>
            <li><strong>Average Order Value:</strong> £${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0}</li>
          </ul>
          <p>Login to your <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">dashboard</a> for more details.</p>
        `,
      });
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [CRON] Sent daily report to ${admins.length} admins in ${duration}ms`);

    return {
      success: true,
      stats: { totalOrders, totalRevenue },
      sentTo: admins.length,
      duration,
    };
  } catch (error) {
    console.error("❌ [CRON] Failed to send daily sales report:", error);
    return { success: false, error };
  }
}

// ============================================================================
// JOB 7: Alert on Stuck Orders (Paid but Not Fulfilled > 7 Days)
// ============================================================================

/**
 * Alerts admins about orders stuck in "paid" status for > 7 days
 * Runs: Daily at 10 AM
 * Impact: Customer satisfaction (catch unfulfilled orders)
 */
export async function alertStuckOrders() {
  const startTime = Date.now();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const stuckOrders = await prisma.order.findMany({
      where: {
        status: "paid",
        paidAt: {
          lt: sevenDaysAgo,
        },
      },
      select: {
        id: true,
        referenceId: true,
        amount: true,
        paidAt: true,
        shippingEmail: true,
      },
    });

    if (stuckOrders.length === 0) {
      console.log("✅ [CRON] No stuck orders found");
      return { success: true, stuckOrders: 0 };
    }

    // Get admin emails
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { email: true, name: true },
    });

    if (admins.length > 0) {
      const orderList = stuckOrders
        .map(
          (order) =>
            `- Order ${order.referenceId}: £${order.amount} (paid ${order.paidAt?.toLocaleDateString()})`
        )
        .join("\n");

      for (const admin of admins) {
        await emailTransporter.sendMail({
          from: '"ArchCool Store" <archcool@archcoolstore.com>',
          to: admin.email,
          subject: `⚠️ ${stuckOrders.length} Orders Need Fulfillment`,
          html: `
            <h2>Stuck Orders Alert</h2>
            <p>Hi ${admin.name || "Admin"},</p>
            <p>The following orders have been paid but not fulfilled for over 7 days:</p>
            <pre>${orderList}</pre>
            <p>Please <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders">review and fulfill these orders</a> as soon as possible.</p>
          `,
        });
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [CRON] Alerted about ${stuckOrders.length} stuck orders in ${duration}ms`);

    return {
      success: true,
      stuckOrders: stuckOrders.length,
      duration,
    };
  } catch (error) {
    console.error("❌ [CRON] Failed to alert stuck orders:", error);
    return { success: false, error };
  }
}

// ============================================================================
// JOB 8: Database Vacuum (PostgreSQL Optimization)
// ============================================================================

/**
 * Runs VACUUM ANALYZE on PostgreSQL to optimize performance
 * Runs: Weekly on Sunday at 4 AM
 * Impact: Database performance, reclaim disk space
 */
export async function vacuumDatabase() {
  const startTime = Date.now();

  try {
    // VACUUM ANALYZE cannot run inside a transaction, so we use $executeRawUnsafe
    await prisma.$executeRawUnsafe(`VACUUM ANALYZE;`);

    const duration = Date.now() - startTime;
    console.log(`✅ [CRON] Database vacuum completed in ${duration}ms`);

    return { success: true, duration };
  } catch (error) {
    console.error("❌ [CRON] Failed to vacuum database:", error);
    return { success: false, error };
  }
}

// ============================================================================
// MASTER CRON SCHEDULER
// ============================================================================

/**
 * Determines which jobs to run based on current time
 * Called by the cron endpoint
 */
export async function runScheduledJobs(jobType?: string) {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0 = Sunday

  const results: Record<string, any> = {};

  // If specific job requested, run only that
  if (jobType) {
    switch (jobType) {
      case "sessions":
        results.sessions = await cleanExpiredSessions();
        break;
      case "verifications":
        results.verifications = await cleanExpiredVerifications();
        break;
      case "bans":
        results.bans = await processBanExpiry();
        break;
      case "magic-links":
        results.magicLinks = await cleanExpiredMagicLinks();
        break;
      case "abandoned-orders":
        results.abandonedOrders = await cancelAbandonedOrders();
        break;
      case "daily-report":
        results.dailyReport = await sendDailySalesReport();
        break;
      case "stuck-orders":
        results.stuckOrders = await alertStuckOrders();
        break;
      case "vacuum":
        results.vacuum = await vacuumDatabase();
        break;
      default:
        throw new Error(`Unknown job type: ${jobType}`);
    }
    return results;
  }

  // Otherwise, run jobs based on schedule
  console.log(`[CRON] Running scheduled jobs at ${now.toISOString()}`);

  // Every 6 hours: Ban expiry and abandoned orders
  if (hour % 6 === 0) {
    results.bans = await processBanExpiry();
    results.abandonedOrders = await cancelAbandonedOrders();
  }

  // Daily at 2 AM: Cleanup jobs
  if (hour === 2) {
    results.sessions = await cleanExpiredSessions();
    results.verifications = await cleanExpiredVerifications();
  }

  // Daily at 3 AM: Magic link cleanup
  if (hour === 3) {
    results.magicLinks = await cleanExpiredMagicLinks();
  }

  // Daily at 9 AM: Sales report
  if (hour === 9) {
    results.dailyReport = await sendDailySalesReport();
  }

  // Daily at 10 AM: Stuck order alerts
  if (hour === 10) {
    results.stuckOrders = await alertStuckOrders();
  }

  // Weekly on Sunday at 4 AM: Database vacuum
  if (dayOfWeek === 0 && hour === 4) {
    results.vacuum = await vacuumDatabase();
  }

  return results;
}
