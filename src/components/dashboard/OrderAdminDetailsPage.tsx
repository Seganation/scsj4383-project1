"use client";

import { useState } from "react";
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
import {
  CalendarIcon,
  MapPinIcon,
  PackageIcon,
  CreditCardIcon,
  ArrowLeftIcon,
  UserIcon,
  TruckIcon,
} from "lucide-react";
import Link from "next/link";
import { Image } from "@/components";
import { toast } from "react-hot-toast";

type OrderWithDetails = {
  id: string;
  status: "pending" | "paid" | "cancelled" | "fulfilled";
  amount: number;
  createdAt: Date;
  paymentStatus?:
    | "pending"
    | "processing"
    | "succeeded"
    | "failed"
    | "cancelled"
    | "refunded"
    | null;
  paidAt?: Date | null;
  shippingName: string;
  shippingEmail: string;
  shippingPhone?: string | null;
  shippingAddress: string;
  shippingCity: string;
  shippingState?: string | null;
  shippingPostalCode: string;
  shippingCountry: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      images: string[];
      description: string;
      category:
        | string
        | { id: string; name: string; slug: string; imageUrl: string };
    };
  }>;
  address: {
    id: string;
    label: string;
    fullName: string;
    phone?: string | null;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state?: string | null;
    postalCode: string;
    country: string;
  } | null;
  user: {
    id: string;
    name?: string | null;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

interface OrderAdminDetailsPageProps {
  order: OrderWithDetails;
}

function OrderAdminDetailsPage({ order }: OrderAdminDetailsPageProps) {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const updateOrderStatus = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      let requestBody: { status: string; reason?: string } = {
        status: newStatus,
      };

      // If cancelling, prompt for reason
      if (newStatus === "cancelled") {
        const reason = prompt("Please provide a reason for cancellation:");
        if (reason) {
          requestBody.reason = reason;
        }
      }

      const response = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        toast.success("Order status updated successfully");
        // Refresh the page to show updated status
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Error updating order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string, paymentStatus?: string) => {
    // Payment status colors
    if (paymentStatus === "succeeded")
      return "bg-green-100 text-green-800 border-green-200";
    if (paymentStatus === "pending")
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (paymentStatus === "failed")
      return "bg-red-100 text-red-800 border-red-200";

    // Order status colors
    switch (status) {
      case "paid":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "fulfilled":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const subtotal = order.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const customerName =
    order.user?.firstName && order.user?.lastName
      ? `${order.user.firstName} ${order.user.lastName}`
      : order.user?.name || order.shippingName;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/orders">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order #{order.id.slice(-8)}</h1>
            <p className="text-gray-600">
              Placed on {order.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Payment Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCardIcon className="h-5 w-5" />
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Badge className={getStatusColor("", order.paymentStatus || "")}>
                {order.paymentStatus === "succeeded"
                  ? "✅ PAYMENT CONFIRMED"
                  : order.paymentStatus === "processing"
                    ? "🔄 PAYMENT PROCESSING"
                    : order.paymentStatus === "pending"
                      ? "⏳ PAYMENT PENDING"
                      : order.paymentStatus === "failed"
                        ? "❌ PAYMENT FAILED"
                        : "Unknown"}
              </Badge>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Amount:</strong> £{order.amount}
                </p>
                <p>
                  <strong>Order Date:</strong>{" "}
                  {order.createdAt.toLocaleDateString()}
                </p>
                {order.paidAt && (
                  <p>
                    <strong>Payment Date:</strong>{" "}
                    {order.paidAt.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageIcon className="h-5 w-5" />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Badge className={getStatusColor(order.status)}>
                {order.status === "pending"
                  ? "⏳ PENDING"
                  : order.status === "paid"
                    ? "💳 PAID - READY TO SHIP"
                    : order.status === "fulfilled"
                      ? "📦 FULFILLED"
                      : order.status === "cancelled"
                        ? "❌ CANCELLED"
                        : "UNKNOWN STATUS"}
              </Badge>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Update Order Status:
                </label>
                <Select
                  onValueChange={updateOrderStatus}
                  disabled={updatingStatus}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Show only valid status transitions based on current status */}
                    {order.status === "pending" && (
                      <>
                        <SelectItem value="paid">
                          Paid - Ready to Ship
                        </SelectItem>
                        <SelectItem value="cancelled">Cancel Order</SelectItem>
                      </>
                    )}
                    {order.status === "paid" && (
                      <SelectItem value="fulfilled">
                        Fulfilled - Delivered
                      </SelectItem>
                    )}
                    {(order.status === "cancelled" ||
                      order.status === "fulfilled") && (
                      <SelectItem value="" disabled>
                        No further updates allowed
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {updatingStatus && (
                  <p className="text-sm text-blue-600">Updating...</p>
                )}
                {/* Show status workflow info */}
                <div className="text-xs text-gray-500 mt-2">
                  {order.status === "pending" && "Can mark as paid or cancel"}
                  {order.status === "paid" &&
                    "Can only mark as fulfilled (delivered)"}
                  {order.status === "cancelled" &&
                    "Order is cancelled - no further updates"}
                  {order.status === "fulfilled" &&
                    "Order is delivered - no further updates"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">{customerName}</p>
              <p className="text-sm text-gray-600">
                {order.user?.email || order.shippingEmail}
              </p>
            </div>
            <div>
              <p className="text-sm">
                <strong>Customer ID:</strong> {order.user?.id || "Guest"}
              </p>
              {order.shippingPhone && (
                <p className="text-sm">
                  <strong>Phone:</strong> {order.shippingPhone}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-4 p-4 border rounded-lg"
            >
              <div className="relative h-16 w-16 flex-shrink-0">
                <Image
                  src={item.product.images && item.product.images.length > 0 ? item.product.images[0] : "/placeholder.jpg"}
                  alt={item.product.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{item.product.name}</h4>
                <p className="text-sm text-gray-600 capitalize">
                  Category:{" "}
                  {item.product?.category &&
                  typeof item.product.category === "object" &&
                  item.product.category.name
                    ? item.product.category.name
                    : typeof item.product.category === "string"
                      ? item.product.category.replace("_", " ")
                      : "N/A"}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm">Quantity: {item.quantity}</span>
                  <span className="text-sm">Unit Price: £{item.price}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">£{item.price * item.quantity}</p>
              </div>
            </div>
          ))}

          {/* Order Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>£{subtotal}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>£{order.amount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPinIcon className="h-5 w-5" />
            Shipping Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium">{order.shippingName}</p>
            <p>{order.shippingAddress}</p>
            <p>
              {order.shippingCity}
              {order.shippingState && `, ${order.shippingState}`}{" "}
              {order.shippingPostalCode}
            </p>
            <p>{order.shippingCountry}</p>
            {order.shippingPhone && (
              <p className="text-sm text-gray-600">
                Phone: {order.shippingPhone}
              </p>
            )}
            <p className="text-sm text-gray-600">
              Email: {order.shippingEmail}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <TruckIcon className="h-4 w-4 mr-2" />
              Generate Shipping Label
            </Button>
            <Button variant="outline" size="sm">
              Send Order Update Email
            </Button>
            <Button variant="outline" size="sm">
              Contact Customer
            </Button>
            <Button variant="outline" size="sm">
              Print Order Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OrderAdminDetailsPage;
