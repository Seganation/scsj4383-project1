"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  MapPinIcon,
  PackageIcon,
  CreditCardIcon,
  DownloadIcon,
  PrinterIcon,
  ArrowLeftIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type OrderWithDetails = {
  id: string;
  referenceId: string;
  status: string; // Allow any string for status
  amount: number;
  createdAt: Date;
  paymentStatus?: string | null; // Allow any string for paymentStatus
  paidAt?: Date | null;
  invoiceNumber?: string | null;
  invoiceUrl?: string | null;
  stripeSessionId?: string | null;
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
};

interface OrderDetailsPageProps {
  order: OrderWithDetails;
}

export function OrderDetailsPage({ order }: OrderDetailsPageProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  // Fix: Convert createdAt and paidAt to Date objects if they are strings
  const createdAt =
    typeof order.createdAt === "string"
      ? new Date(order.createdAt)
      : order.createdAt;
  const paidAt = order.paidAt
    ? typeof order.paidAt === "string"
      ? new Date(order.paidAt)
      : order.paidAt
    : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "succeeded":
        return "bg-green-100 text-green-800";
      case "pending":
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-800";
      case "fulfilled":
        return "bg-blue-100 text-blue-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "fulfilled":
        return <PackageIcon className="h-4 w-4" />;
      case "paid":
      case "succeeded":
        return <CreditCardIcon className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setIsPrinting(false);
  };

  const subtotal = order.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/my-orders">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order #{order.referenceId}</h1>
            <p className="text-gray-600">
              Placed on {createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={isPrinting}
          >
            <PrinterIcon className="h-4 w-4 mr-2" />
            {isPrinting ? "Printing..." : "Print"}
          </Button>
          {order.invoiceUrl && (
            <Button variant="outline" size="sm" asChild>
              <Link href={order.invoiceUrl} target="_blank">
                <DownloadIcon className="h-4 w-4 mr-2" />
                Download Invoice
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Order Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order Status</span>
            <div className="flex gap-2">
              <Badge className={getStatusColor(order.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </Badge>
              {order.paymentStatus && order.paymentStatus !== order.status && (
                <Badge className={getStatusColor(order.paymentStatus)}>
                  Payment:{" "}
                  {order.paymentStatus.charAt(0).toUpperCase() +
                    order.paymentStatus.slice(1)}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Order Date:</span>
              <span className="ml-2">{createdAt.toLocaleDateString()}</span>
            </div>
            {paidAt && (
              <div>
                <span className="font-medium">Payment Date:</span>
                <span className="ml-2">{paidAt.toLocaleDateString()}</span>
              </div>
            )}
            {order.invoiceNumber && (
              <div>
                <span className="font-medium">Invoice Number:</span>
                <span className="ml-2">{order.invoiceNumber}</span>
              </div>
            )}
            {order.stripeSessionId && (
              <div>
                <span className="font-medium">Payment ID:</span>
                <span className="ml-2">{order.stripeSessionId.slice(-8)}</span>
              </div>
            )}
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
                <p
                  className="text-sm text-gray-600 overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {item.product.description}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm">Quantity: {item.quantity}</span>
                  <span className="text-sm">Price: £{item.price}</span>
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
              <span>£{subtotal.toFixed(2)}</span>
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

      {/* Additional Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {order.status === "paid" && (
              <Button variant="outline" size="sm">
                Track Package
              </Button>
            )}
            {order.status === "fulfilled" && (
              <Button variant="outline" size="sm">
                Leave Review
              </Button>
            )}
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/products/category/all">Order Again</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
