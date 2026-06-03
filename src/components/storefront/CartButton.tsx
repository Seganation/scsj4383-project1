"use client";

import { useClientCart } from "@/app/hooks/use-client-cart";
import { ShoppingBagIcon } from "lucide-react";
import Link from "next/link";

interface CartButtonProps {
  userId?: string | null;
}

export function CartButton({ userId }: CartButtonProps) {
  const { getCartItemCount } = useClientCart();
  const itemCount = getCartItemCount();
  const displayCount = itemCount > 99 ? "99+" : String(itemCount).padStart(2, "0");

  return (
    <Link
      href="/bag"
      className="group relative inline-flex h-10 items-center gap-2 border border-transparent px-2 text-ink hover:border-ink md:px-3"
      aria-label={`Shopping bag, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
    >
      <ShoppingBagIcon className="h-5 w-5" strokeWidth={1.5} />
      <span className="hidden font-mono text-[0.72rem] uppercase tracking-[0.16em] md:inline">
        Bag
      </span>
      <span
        className={`font-mono text-[0.68rem] uppercase tracking-[0.12em] transition-colors ${
          itemCount > 0 ? "text-copper" : "text-steel-light"
        }`}
      >
        [{displayCount}]
      </span>
    </Link>
  );
}
