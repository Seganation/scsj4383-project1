"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, EyeIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  ClockIcon,
  CheckCircleIcon,
  PackageIcon,
  DollarSignIcon,
} from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string[];
  };
}

interface Order {
  id: string;
  status: "pending" | "paid" | "cancelled" | "fulfilled";
  paymentStatus:
    | "pending"
    | "processing"
    | "succeeded"
    | "failed"
    | "cancelled"
    | "refunded";
  amount: number;
  createdAt: string;
  paidAt?: string;
  shippingName: string;
  shippingEmail: string;
  items: OrderItem[];
}

function getPaymentStatusBadge(paymentStatus: string) {
  switch (paymentStatus) {
    case "succeeded":
      return <Badge className="bg-green-100 text-green-800 border-0">Paid</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 border-0">Pending</Badge>;
    case "processing":
      return <Badge className="bg-blue-100 text-blue-800 border-0">Processing</Badge>;
    case "failed":
      return <Badge className="bg-red-100 text-red-800 border-0">Failed</Badge>;
    case "refunded":
      return <Badge className="bg-purple-100 text-purple-800 border-0">Refunded</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

function getOrderStatusBadge(status: string, paymentStatus: string) {
  if (paymentStatus === "succeeded") {
    switch (status) {
      case "pending":
      case "paid":
        return <Badge className="bg-blue-100 text-blue-800 border-0">Ready to Ship</Badge>;
      case "fulfilled":
        return <Badge className="bg-emerald-100 text-emerald-800 border-0">Fulfilled</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 border-0">Cancelled</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 border-0">Ready to Ship</Badge>;
    }
  }
  switch (paymentStatus) {
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 border-0">Payment Pending</Badge>;
    case "processing":
      return <Badge className="bg-blue-100 text-blue-800 border-0">Payment Processing</Badge>;
    case "failed":
      return <Badge className="bg-red-100 text-red-800 border-0">Payment Failed</Badge>;
    case "cancelled":
      return <Badge className="bg-red-100 text-red-800 border-0">Payment Cancelled</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

function OrderActionsCell({
  order,
  updatingStatus,
  updateOrderStatus,
}: {
  order: Order;
  updatingStatus: string | null;
  updateOrderStatus: (id: string, status: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 min-w-[120px]">
      {order.paymentStatus === "succeeded" ? (
        <Select
          onValueChange={(value) => updateOrderStatus(order.id, value)}
          disabled={updatingStatus === order.id}
        >
          <SelectTrigger className="w-full h-8 text-xs">
            <SelectValue placeholder="Update status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paid">Ready to Ship</SelectItem>
            <SelectItem value="fulfilled">Mark Fulfilled</SelectItem>
            <SelectItem value="cancelled">Cancel Order</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <span className="text-xs text-muted-foreground">Auto-detected</span>
      )}
      <Button variant="outline" size="sm" asChild className="h-7 text-xs">
        <Link href={`/dashboard/orders/${order.id}`}>
          <EyeIcon className="h-3 w-3 mr-1" />
          View
        </Link>
      </Button>
      {updatingStatus === order.id && (
        <span className="text-xs text-blue-600">Updating...</span>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders");
      if (response.ok) {
        const ordersData = await response.json();
        setOrders(ordersData);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error fetching orders");
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        toast.success("Order status updated successfully");
        fetchOrders();
      } else {
        toast.error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Error updating order status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }) => (
        <span className="font-mono text-sm">#{row.original.id.slice(-8)}</span>
      ),
    },
    {
      accessorKey: "shippingName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.original.shippingName}</p>
          <p className="text-xs text-muted-foreground">{row.original.shippingEmail}</p>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">£{row.original.amount}</span>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => getPaymentStatusBadge(row.original.paymentStatus),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) =>
        getOrderStatusBadge(row.original.status, row.original.paymentStatus),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="text-sm">{new Date(row.original.createdAt).toLocaleDateString()}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <OrderActionsCell
          order={row.original}
          updatingStatus={updatingStatus}
          updateOrderStatus={updateOrderStatus}
        />
      ),
    },
  ];

  const pendingPaymentOrders = orders.filter(
    (o) => o.paymentStatus === "pending" || o.paymentStatus === "processing"
  );
  const readyToShipOrders = orders.filter(
    (o) =>
      o.paymentStatus === "succeeded" &&
      (o.status === "pending" || o.status === "paid")
  );
  const fulfilledOrders = orders.filter((o) => o.status === "fulfilled");
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "succeeded")
    .reduce((total, o) => total + o.amount, 0);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="h-12 bg-muted rounded" />
        <div className="h-96 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground text-sm">
          View and manage all customer orders
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <ClockIcon className="h-8 w-8 text-yellow-600 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{pendingPaymentOrders.length}</p>
              <p className="text-xs text-muted-foreground">Awaiting Payment</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircleIcon className="h-8 w-8 text-blue-600 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{readyToShipOrders.length}</p>
              <p className="text-xs text-muted-foreground">Ready to Ship</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <PackageIcon className="h-8 w-8 text-emerald-600 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{fulfilledOrders.length}</p>
              <p className="text-xs text-muted-foreground">Fulfilled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSignIcon className="h-8 w-8 text-green-600 shrink-0" />
            <div>
              <p className="text-2xl font-bold">£{totalRevenue}</p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={orders}
            searchKey="shippingName"
            searchPlaceholder="Search by customer name..."
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  );
}
