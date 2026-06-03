"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useInfiniteSearch } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function SearchInput() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const {
    data: searchResults,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSearch(debouncedQuery, 5); // Limit to 5 results in dropdown

  // Handle clicking outside to close search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  const clearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
    inputRef.current?.focus();
  };

  const allProducts = searchResults?.pages.flatMap((page) => page.items) || [];
  const showResults = isOpen && debouncedQuery.trim().length > 0;

  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsOpen(true)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white text-sm placeholder:text-gray-500"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </form>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">Searching...</p>
              </div>
            ) : allProducts.length > 0 ? (
              <>
                <div className="p-2">
                  {allProducts.map((product, index) => (
                    <Link
                      key={`${product.id}-${index}`}
                      href={`/products/${encodeURIComponent(product.name)}`}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => {
                        setIsOpen(false);
                        setQuery("");
                      }}
                    >
                      <div className="w-12 h-12 relative flex-shrink-0">
                        <Image
                          src={product.images?.[0] || "/placeholder.png"}
                          alt={product.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {product.description}
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          £{product.price}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                {hasNextPage && (
                  <div className="p-2 border-t border-gray-100">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="w-full text-sm text-primary hover:text-primary/80 font-medium py-2 transition-colors"
                    >
                      {isFetchingNextPage ? "Loading more..." : "Load more"}
                    </button>
                  </div>
                )}

                <div className="p-2 border-t border-gray-100">
                  <Button
                    onClick={handleSearch}
                    className="w-full text-sm py-2"
                    variant="outline"
                  >
                    View all results for "{query}"
                  </Button>
                </div>
              </>
            ) : debouncedQuery.trim() ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500 mb-2">
                  No products found for "{debouncedQuery}"
                </p>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
