"use client";

import { useEffect, useRef } from "react";
import { useInfiniteProducts } from "@/hooks/use-products";
import { ProductTile } from "@/components/storefront/ProductTile";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

interface InfiniteProductGridProps {
  category?: string;
  featured?: boolean;
  initialLimit?: number;
  className?: string;
}

export function InfiniteProductGrid({
  category,
  featured = false,
  initialLimit = 10,
  className = "",
}: InfiniteProductGridProps) {
  const observerRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts({
    category: category === "all" ? undefined : category,
    featured,
    limit: initialLimit,
  });

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px", // Start loading 100px before the element is visible
      }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allProducts = data?.pages.flatMap((page) => page.items) || [];

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <Package className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Products
          </h2>
          <p className="text-gray-600 mb-6">
            There was an error loading the products. Please try again.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Initial Loading State */}
      {isLoading && allProducts.length === 0 && (
        <div className="grid grid-cols-12 gap-5 md:gap-6">
          {[...Array(initialLimit)].map((_, i) => (
            <div
              key={i}
              className="col-span-12 sm:col-span-6 md:col-span-3 aspect-square bg-ink/[0.05] animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Products Grid */}
      {allProducts.length > 0 && (
        <>
          <div className="grid grid-cols-12 gap-5 md:gap-6">
            {allProducts.map((product, index) => (
              <ProductTile
                key={`${product.id}-${index}`}
                product={product}
                size={index === 0 ? "hero" : "standard"}
                index={index}
              />
            ))}
          </div>

          {/* Loading More Indicator */}
          {isFetchingNextPage && (
            <div className="grid grid-cols-12 gap-5 md:gap-6 mt-6">
              {[...Array(Math.min(initialLimit, 6))].map((_, i) => (
                <div
                  key={`loading-${i}`}
                  className="col-span-12 sm:col-span-6 md:col-span-3 aspect-square bg-ink/[0.05] animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Intersection Observer Target */}
          <div
            ref={observerRef}
            className="h-10 flex items-center justify-center mt-8"
          >
            {hasNextPage && !isFetchingNextPage && (
              <Button
                onClick={() => fetchNextPage()}
                variant="outline"
                className="px-8 uppercase tracking-[0.16em]"
              >
                Load More Products
              </Button>
            )}
            {!hasNextPage && allProducts.length > initialLimit && (
              <p className="text-steel text-center text-sm uppercase tracking-[0.16em]">
                You've reached the end of our product collection
              </p>
            )}
          </div>
        </>
      )}

      {/* No Products Found */}
      {!isLoading && allProducts.length === 0 && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <Package className="h-16 w-16 text-steel/40 mx-auto mb-6" />
            <h2 className="display text-3xl text-ink mb-4">
              No Products Found
            </h2>
            <p className="text-steel mb-8">
              {category && category !== "all"
                ? `No products found in the ${category} category.`
                : featured
                  ? "No featured products available at the moment."
                  : "No products available at the moment."}
            </p>
            <div className="space-y-3">
              <Button asChild variant="outline">
                <a href="/products/category/all">Browse All Products</a>
              </Button>
              <div>
                <Button asChild variant="ghost">
                  <a href="/">← Back to Home</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
