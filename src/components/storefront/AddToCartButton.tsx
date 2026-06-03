"use client";

import { useClientCart } from "@/app/hooks/use-client-cart";
import { useSession } from "@/app/lib/auth-client";
import { Check, Eye, Plus, ShieldAlert } from "lucide-react";
import { CartItem } from "@/app/lib/interfaces";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  productPrice: number;
  productImageUrl: string;
  userId?: string | null;
}

export function AddToCartButton({
  productId,
  productName,
  productPrice,
  productImageUrl,
}: AddToCartButtonProps) {
  const { addItem, isItemInCart } = useClientCart();
  const { data: session } = useSession();

  const isAdmin = session?.user && (session.user as any).role === "admin";
  const isInCart = isItemInCart(productId);

  const handleAddToCart = () => {
    if (isAdmin) {
      toast.error("Admins cannot add items to cart.");
      return;
    }
    if (isInCart) return;
    const cartItem: CartItem = {
      id: productId,
      name: productName,
      price: productPrice,
      imageString: productImageUrl,
      quantity: 1,
    };
    addItem(cartItem);
    toast.success(`${productName} added to bag`);
  };

  if (isInCart) {
    return (
      <Link href="/bag" className="btn-ghost w-full border-copper text-copper hover:bg-copper hover:text-paper">
        <Check className="h-4 w-4" />
        In bag — view
      </Link>
    );
  }

  if (isAdmin) {
    return (
      <button
        disabled
        className="btn-ghost w-full cursor-not-allowed border-ink/20 text-steel-light"
      >
        <ShieldAlert className="h-4 w-4" />
        Admin — cannot add
      </button>
    );
  }

  return (
    <button onClick={handleAddToCart} className="btn-ink w-full">
      <Plus className="h-4 w-4" />
      Add to bag
    </button>
  );
}
