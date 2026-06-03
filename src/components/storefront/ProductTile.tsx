"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import { useClientCart } from "@/hooks/use-client-cart";
import type { CartItem } from "@/lib/interfaces";

export interface ProductTileData {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: { name: string; slug: string } | null;
}

const FALLBACK =
  "https://picsum.photos/seed/archcool-product-fallback/1200/900";

export function ProductTile({
  product,
  size,
  index,
}: {
  product: ProductTileData;
  size: "hero" | "standard";
  index: number;
}) {
  const { addItem, isItemInCart } = useClientCart();
  const [fallback, setFallback] = useState(false);
  const inCart = isItemInCart(product.id);

  const src = fallback || !product.images?.length ? FALLBACK : product.images[0];
  const href = `/products/${encodeURIComponent(product.name)}`;

  const isHero = size === "hero";
  const indexLabel = String(index + 1).padStart(2, "0");

  const handleAdd = () => {
    if (inCart) return;
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      imageString: src,
      quantity: 1,
    };
    addItem(cartItem);
  };

  return (
    <article
      className={
        isHero
          ? "group col-span-12 md:col-span-6 md:row-span-2"
          : "group col-span-12 sm:col-span-6 md:col-span-3"
      }
    >
      <div
        className={`relative overflow-hidden bg-ink/[0.04] ${isHero ? "aspect-[4/5]" : "aspect-square"}`}
      >
        <Link href={href} className="absolute inset-0">
          <Image
            src={src}
            alt={product.name}
            fill
            sizes={
              isHero
                ? "(max-width: 768px) 100vw, 50vw"
                : "(max-width: 640px) 100vw, 25vw"
            }
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
            onError={() => setFallback(true)}
          />
          {/* copper-tinted bottom gradient for metadata legibility on hover */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(180deg, transparent 55%, hsl(var(--ink) / 0.55) 100%)",
            }}
          />
        </Link>

        {/* Top-left index tag */}
        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2">
          <span className="bg-ink/90 px-2.5 py-1.5 font-mono text-[0.75rem] font-medium uppercase tracking-[0.16em] text-paper backdrop-blur">
            № {indexLabel}
          </span>
          {product.category && (
            <span className="bg-paper/95 px-2.5 py-1.5 font-mono text-[0.75rem] font-medium uppercase tracking-[0.14em] text-ink">
              {product.category.name}
            </span>
          )}
        </div>

        {/* Add-to-cart floating */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={inCart}
          aria-label={inCart ? "Already in cart" : `Add ${product.name} to cart`}
          className={`absolute bottom-4 right-4 flex h-11 items-center gap-2 border px-4 text-sm font-medium uppercase tracking-[0.12em] transition-all duration-300 ${
            inCart
              ? "border-copper bg-copper text-paper"
              : "border-paper bg-ink/85 text-paper backdrop-blur-sm hover:border-copper hover:bg-copper hover:text-paper"
          }`}
        >
          {inCart ? (
            <>
              <Check className="h-4 w-4" />
              In bag
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add
            </>
          )}
        </button>
      </div>

      {/* Caption */}
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3
            className={`font-display font-semibold ${isHero ? "text-2xl md:text-3xl" : "text-lg md:text-xl"} leading-snug text-ink`}
          >
            <Link href={href} className="link-sweep inline hover:text-copper">
              {product.name}
            </Link>
          </h3>
          {isHero && product.description && (
            <p className="mt-3 line-clamp-2 max-w-md text-[0.95rem] leading-relaxed text-steel">
              {product.description}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <span className="eyebrow">GBP</span>
          <div className="font-display text-lg tabular-nums text-ink md:text-xl">
            £{product.price.toLocaleString("en-GB")}
          </div>
        </div>
      </div>
    </article>
  );
}
