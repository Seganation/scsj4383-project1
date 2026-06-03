"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useClientCart } from "@/hooks/use-client-cart";
import { Check, Plus } from "lucide-react";
import type { CartItem } from "@/lib/interfaces";

interface RelatedProductCardProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
  };
  userId?: string | null;
}

const FALLBACK = "https://picsum.photos/seed/archcool-product-fallback/800/600";

export function RelatedProductCard({ item }: RelatedProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const { addItem, isItemInCart } = useClientCart();
  const inCart = isItemInCart(item.id);

  const displayImage = imageError
    ? FALLBACK
    : item.images && item.images.length > 0
      ? item.images[0]
      : FALLBACK;

  const href = `/products/${encodeURIComponent(item.name)}`;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCart) return;
    const cartItem: CartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      imageString: displayImage,
      quantity: 1,
    };
    addItem(cartItem);
  };

  return (
    <article className="group">
      <Link href={href} className="block">
        <div className="relative aspect-square overflow-hidden border border-ink/10 bg-paper-dim">
          <Image
            src={displayImage}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
            loading="lazy"
            quality={75}
            onError={() => setImageError(true)}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={inCart}
            aria-label={inCart ? "Already in bag" : `Add ${item.name} to bag`}
            className={`absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center border transition-all duration-200 ${
              inCart
                ? "border-copper bg-copper text-paper"
                : "border-paper bg-ink/85 text-paper backdrop-blur-sm hover:bg-copper hover:border-copper"
            }`}
          >
            {inCart ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </button>
        </div>
      </Link>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold leading-snug text-ink">
            <Link href={href} className="link-sweep hover:text-copper">
              {item.name}
            </Link>
          </h3>
        </div>
        <div className="shrink-0 font-display text-base font-semibold tabular-nums text-ink">
          £{item.price.toLocaleString("en-GB")}
        </div>
      </div>
    </article>
  );
}

export function LoadingRelatedProductCard() {
  return (
    <div className="flex flex-col">
      <div className="aspect-square animate-pulse bg-paper-dim" />
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="h-4 w-2/3 animate-pulse bg-bone" />
        <div className="h-4 w-12 animate-pulse bg-bone" />
      </div>
    </div>
  );
}
