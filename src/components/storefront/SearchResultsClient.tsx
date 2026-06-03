"use client";

import { useState, useEffect } from "react";
import { useInfiniteSearch } from "@/app/hooks/use-products";
import {
  ProductCard,
  LoadingProductCard,
} from "@/components/storefront/ProductCard";
import { Button } from "@/components/ui/button";
import { SearchInput } from "./SearchInput";
import { Search, Package } from "lucide-react";
import { motion } from "framer-motion";

interface SearchResultsClientProps {
  initialQuery: string;
}

export function SearchResultsClient({
  initialQuery,
}: SearchResultsClientProps) {
  const [query, setQuery] = useState(initialQuery);

  const {
    data: searchResults,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSearch(query, 10); // 10 products per page

  // Update query when the URL search param changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const allProducts = searchResults?.pages.flatMap((page) => page.items) || [];
  const totalResults = allProducts.length;

  if (!query.trim()) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Start Your Search
          </h2>
          <p className="text-gray-600 mb-8">
            Enter a product name or description in the search bar above to find
            what you're looking for.
          </p>
          <div className="w-full max-w-sm mx-auto">
            <SearchInput />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <Package className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Search Error</h2>
            <p className="text-gray-600">
              There was an error performing your search. Please try again.
            </p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search Stats */}
      {!isLoading && (
        <div className="mb-6">
          <p className="text-gray-600">
            {totalResults === 0
              ? "No products found"
              : `${totalResults} product${totalResults === 1 ? "" : "s"} found`}
            {hasNextPage && " (showing first results)"}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <LoadingProductCard key={i} />
          ))}
        </div>
      )}

      {/* Results */}
      {!isLoading && allProducts.length > 0 && (
        <>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {allProducts.map((product, index) => (
              <motion.div
                key={`${product.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ProductCard item={product} />
              </motion.div>
            ))}
          </motion.div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="text-center">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                className="px-8 py-3"
              >
                {isFetchingNextPage ? "Loading more..." : "Load More Products"}
              </Button>
            </div>
          )}
        </>
      )}

      {/* No Results */}
      {!isLoading && allProducts.length === 0 && query.trim() && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              No Products Found
            </h2>
            <p className="text-gray-600 mb-8">
              We couldn't find any products matching "{query}". Try searching
              with different keywords or browse our categories.
            </p>
            <div className="space-y-4">
              <Button asChild variant="outline">
                <a href="/products/category/all">Browse All Products</a>
              </Button>
              <div className="text-sm text-gray-500">
                Or try searching for:
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {["grill", "refrigerator", "oven", "cooking equipment"].map(
                    (suggestion) => (
                      <Button
                        key={suggestion}
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const url = new URL(window.location.href);
                          url.searchParams.set("q", suggestion);
                          window.location.href = url.toString();
                        }}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
