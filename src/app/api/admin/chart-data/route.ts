import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/app/lib/db";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const data = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
        amount: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by date
    const groupedData = data.reduce(
      (acc, order) => {
        const date = order.createdAt.toDateString();
        if (!acc[date]) {
          acc[date] = { date, revenue: 0, sales: 0 };
        }
        acc[date].revenue += order.amount;
        acc[date].sales += 1;
        return acc;
      },
      {} as Record<string, { date: string; revenue: number; sales: number }>
    );

    return NextResponse.json(Object.values(groupedData));
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
