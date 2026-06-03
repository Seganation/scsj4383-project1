import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Package } from "lucide-react";
import prisma from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import React from "react";


async function getAnalyticsData() {
  try {
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.aggregate({
        _sum: { amount: true },
        where: { 
          OR: [
            { status: "fulfilled" },
            { status: "paid" }
          ]
        },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

    return {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: totalRevenue._sum?.amount || 0,
      recentOrders,
      topProducts,
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return {
      totalUsers: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalRevenue: 0,
      recentOrders: 0,
      topProducts: [],
    };
  }
}

export default async function DashboardPage() {
  const analytics = await getAnalyticsData();

  const stats = [
    {
      title: "Total Orders",
      value: analytics.totalOrders.toString(),
      description: "All time orders",
      icon: ShoppingCart,
      trend: "+8.2%",
      trendUp: true,
    },
    {
      title: "Total Users",
      value: analytics.totalUsers.toString(),
      description: "Registered users",
      icon: Users,
      trend: "+15.3%",
      trendUp: true,
    },
    {
      title: "Total Products",
      value: analytics.totalProducts.toString(),
      description: "Active products",
      icon: Package,
      trend: "+2.1%",
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your admin dashboard. Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      {/* Analytics Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.trendUp ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span
                  className={stat.trendUp ? "text-green-500" : "text-red-500"}
                >
                  {stat.trend}
                </span>
                <span className="ml-1">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DashboardStats />

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <RecentSales />
        <QuickActions />
      </div>

      {/* Recent Activity (from analytics) */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest orders from the past 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Orders This Month</p>
                  <p className="text-2xl font-bold">{analytics.recentOrders}</p>
                </div>
                <Badge variant="outline">Last 30 days</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
