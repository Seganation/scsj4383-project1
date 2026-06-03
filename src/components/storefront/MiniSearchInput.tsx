"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  useProductSearch,
  useSearchSuggestions,
  useSearchService,
} from "@/app/hooks/use-mini-search";
import { SearchResult } from "@/lib/mini-search";

interface SearchInputProps {
  placeholder?: string;
  showAdvanced?: boolean;
  limit?: number;
  className?: string;
}

export function MiniSearchInput({
  placeholder = "Search the catalogue…",
  showAdvanced = true,
  limit = 5,
  className = "",
}: SearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Use our MiniSearch hooks
  const { isInitialized } = useSearchService();

  // Optimized search options for best automatic matching
  const searchOptions = useMemo(
    () => ({
      fuzzy: 0.2, // Allow some fuzzy matching for typos
      boost: { name: 3, category: 2, description: 1 }, // Prioritize name matches
      limit,
    }),
    [limit]
  );

  const { results, isSearching } = useProductSearch(query, searchOptions);

  const { suggestions } = useSearchSuggestions(query);

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
    inputRef.current?.focus();
  };

  const showResults = isOpen && query.trim().length > 0 && isInitialized;
  const showSuggestions = suggestions.length > 0 && query.trim().length > 1;

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-light" strokeWidth={1.5} />
            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsOpen(true)}
              className="h-11 w-full border border-ink/25 bg-paper pl-10 pr-10 font-sans text-[0.95rem] text-ink placeholder:text-steel-light/70 focus:border-copper focus:bg-paper-dim focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-steel-light hover:text-ink"
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
            className="absolute top-full z-50 mt-2 max-h-96 w-full overflow-y-auto border border-ink/20 bg-paper shadow-xl"
          >
            {/* Loading state */}
            {(isSearching || !isInitialized) && (
              <div className="p-4 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {!isInitialized ? "Initializing search..." : "Searching..."}
                </p>
              </div>
            )}

            {/* Search results */}
            {isInitialized && !isSearching && results.length > 0 && (
              <>
                <div className="p-2">
                  {results.map((product: SearchResult, index) => (
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
                        <div className="mt-1">
                          <p className="text-sm font-semibold text-primary">
                            £{(product.price / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* View all results button */}
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
            )}

            {/* Suggestions */}
            {isInitialized &&
              !isSearching &&
              results.length === 0 &&
              showSuggestions && (
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-2">Did you mean:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(suggestion)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* No results */}
            {isInitialized &&
              !isSearching &&
              results.length === 0 &&
              !showSuggestions &&
              query.trim() && (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    No products found for "{query}"
                  </p>
                  <p className="text-xs text-gray-400">
                    Try using different keywords or check spelling
                  </p>
                </div>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Export as default and named export for compatibility
export default MiniSearchInput;
export { MiniSearchInput as SearchInput };
