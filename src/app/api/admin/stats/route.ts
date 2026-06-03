import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paidStatuses = { status: { in: ["paid", "fulfilled"] as ("paid" | "fulfilled")[] } };

    const [totalRevenue, totalSales, totalProducts, totalUsers] =
      await Promise.all([
        prisma.order.aggregate({
          where: paidStatuses,
          _sum: {
            amount: true,
          },
        }),
        prisma.order.count({ where: paidStatuses }),
        prisma.product.count(),
        prisma.user.count(),
      ]);

    return NextResponse.json({
      totalRevenue: totalRevenue._sum?.amount || 0,
      totalSales,
      totalProducts,
      totalUsers,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
