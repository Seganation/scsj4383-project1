"use client";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { AddToCartButton } from "./AddToCartButton";
import { useClientCart } from "@/hooks/use-client-cart";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

interface iAppProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
  };
  userId?: string | null;
}

export function ProductCard({ item, userId = null }: iAppProps) {
  const { cart } = useClientCart();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fallbackImage = "https://picsum.photos/seed/archcool-product-fallback/800/600";

  const getCartItemCount = (productId: string) => {
    if (!cart?.items) return 0;
    const cartItem = cart.items.find((cartItem) => cartItem.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Check if description needs truncation (more than ~150 characters)
  const needsTruncation = item.description.length > 150;
  const displayDescription =
    needsTruncation && !isDescriptionExpanded
      ? item.description.slice(0, 150) + "..."
      : item.description;

  return (
    <motion.div
      className="rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-white flex flex-col overflow-hidden min-h-[520px]"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      layout="size"
      transition={{
        layout: { duration: 0.3, ease: "easeInOut" },
        default: { duration: 0.3, ease: "easeOut" },
      }}
    >
      <Carousel className="w-full mx-auto">
        <CarouselContent>
          {item.images && item.images.length > 0 ? (
            item.images.map((imageUrl, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[240px] bg-gray-200">
                  <Image
                    src={imageError ? fallbackImage : imageUrl}
                    alt={`${item.name} - Image ${index + 1}`}
                    fill
                    className="object-cover object-center w-full h-full"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index === 0}
                    loading={index === 0 ? undefined : "lazy"}
                    onError={() => setImageError(true)}
                  />
                </div>
              </CarouselItem>
            ))
          ) : (
            <CarouselItem>
              <div className="relative h-[240px] bg-gray-200">
                <Image
                  src={fallbackImage}
                  alt={item.name}
                  fill
                  className="object-cover object-center w-full h-full"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
        <CarouselPrevious className="ml-16" />
        <CarouselNext className="mr-16" />
      </Carousel>

      <div className="flex flex-col flex-grow p-4">
        <div className="flex justify-between items-start mb-3">
          <h1 className="font-semibold text-lg line-clamp-2 flex-1 mr-2 min-h-[3.5rem]">
            <Link
              href={`/products/${encodeURIComponent(item.name)}`}
              className="hover:text-blue-600 transition-colors"
            >
              {item.name}
            </Link>
          </h1>
          <div className="text-lg font-semibold text-primary">
            £{item.price}
          </div>
        </div>

        {/* Description with show more/less functionality */}
        <div className="mb-3 min-h-[4rem] flex flex-col">
          <div className="overflow-hidden">
            <motion.p
              className="text-gray-600 text-sm leading-relaxed"
              key={displayDescription}
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {displayDescription}
            </motion.p>
          </div>
          {needsTruncation && (
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="text-blue-600 hover:text-blue-800 text-xs mt-1 self-start font-medium transition-colors"
            >
              {isDescriptionExpanded ? "Show Less" : "Show More"}
            </button>
          )}
        </div>

        {getCartItemCount(item.id) > 0 && (
          <p className="text-sm text-blue-600 mb-3 font-medium">
            In cart: {getCartItemCount(item.id)}
          </p>
        )}

        <div className="flex gap-2 mt-auto">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/products/${encodeURIComponent(item.name)}`}>
              View Details
            </Link>
          </Button>
          <div className="flex-1">
            <AddToCartButton
              productId={item.id}
              productName={item.name}
              productPrice={item.price}
              productImageUrl={item.images && item.images.length > 0 ? item.images[0] : fallbackImage}
              userId={userId}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function LoadingProductCard() {
  return (
    <div className="rounded-lg border border-gray-200 shadow-sm bg-white h-[520px] flex flex-col overflow-hidden">
      <Skeleton className="w-full h-[240px]" />
      <div className="flex flex-col p-4 gap-y-3 flex-grow">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-7 w-16" />
        </div>
        <div className="min-h-[4rem] flex flex-col gap-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex gap-2 mt-auto">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  );
}
