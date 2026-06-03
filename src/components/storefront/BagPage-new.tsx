"use client";

import { useClientCart, useClientCheckout } from "@/app/hooks/use-client-cart";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface BagPageProps {
  userId: string;
}

export function BagPage({ userId }: BagPageProps) {
  const { cart, isLoading, updateItemQuantity, removeItem } = useClientCart();
  const { checkout, isLoading: isCheckingOut } = useClientCheckout();

  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className="min-h-screen w-full max-w-2xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen w-full max-w-2xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
            Your cart is empty
          </h1>
          <p className="mt-4 text-gray-500">
            Start adding some items to your cart
          </p>
          <Button asChild className="mt-8">
            <Link href="/products/category/all">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  const totalPrice = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;

    setUpdatingItems((prev) => new Set(prev).add(productId));
    updateItemQuantity(productId, quantity);
    setUpdatingItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };

  const handleCheckout = async () => {
    if (cart?.items) {
      await checkout(cart.items);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-2xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>

      <div className="space-y-6">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center space-x-4 bg-white p-4 rounded-lg border"
          >
            <div className="relative h-20 w-20 flex-shrink-0">
              <Image
                src={item.imageString}
                alt={item.name}
                fill
                className="object-cover rounded-md"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {item.name}
              </h3>
              <p className="text-sm text-gray-600">£{item.price} each</p>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1 || updatingItems.has(item.id)}
              >
                -
              </Button>
              <span className="w-8 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                disabled={updatingItems.has(item.id)}
              >
                +
              </Button>
            </div>

            <div className="text-right">
              <p className="font-medium">£{item.price * item.quantity}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveItem(item.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-medium">Total:</span>
          <span className="text-lg font-semibold">£{totalPrice}</span>
        </div>

        <div className="space-y-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/products/category/all">Continue Shopping</Link>
          </Button>
          <Button
            onClick={handleCheckout}
            className="w-full"
            disabled={isCheckingOut}
          >
            {isCheckingOut ? "Processing..." : "Checkout"}
          </Button>
        </div>
      </div>
    </div>
  );
}
