"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { BellIcon, ClockIcon, CreditCardIcon, PackageIcon } from "lucide-react";
import Link from "next/link";

interface NotificationOrder {
  id: string;
  status: string;
  paymentStatus: string;
  amount: number;
  createdAt: string;
  shippingName: string;
}

export function AdminNotifications() {
  const [pendingOrders, setPendingOrders] = useState<NotificationOrder[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const response = await fetch("/api/admin/notifications");
      if (response.ok) {
        const orders = await response.json();
        setPendingOrders(orders);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const pendingCount = pendingOrders.length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <BellIcon className="h-4 w-4" />
          {pendingCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {pendingCount > 9 ? "9+" : pendingCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {pendingCount > 0 && (
            <Badge variant="secondary">{pendingCount} pending</Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {pendingOrders.length === 0 ? (
          <DropdownMenuItem disabled>
            <div className="flex flex-col items-center text-center py-4">
              <BellIcon className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">No pending notifications</p>
            </div>
          </DropdownMenuItem>
        ) : (
          <>
            {pendingOrders.slice(0, 5).map((order) => (
              <DropdownMenuItem key={order.id} className="p-0">
                <Link
                  href={`/dashboard/orders`}
                  className="w-full p-2 hover:bg-gray-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {order.paymentStatus === "succeeded" ||
                      order.status === "paid" ? (
                        <CreditCardIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <ClockIcon className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        New order from {order.shippingName}
                      </p>
                      <p className="text-xs text-gray-600">
                        £{order.amount} • Order #
                        {order.id.slice(-8)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge
                        variant={
                          order.paymentStatus === "succeeded" ||
                          order.status === "paid"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {order.paymentStatus === "succeeded" ||
                        order.status === "paid"
                          ? "Paid"
                          : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}

            {pendingOrders.length > 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center">
                  <Link
                    href="/dashboard/orders"
                    className="w-full text-sm text-blue-600"
                  >
                    View all {pendingOrders.length} notifications
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/orders" className="w-full">
            <PackageIcon className="h-4 w-4 mr-2" />
            Manage All Orders
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
