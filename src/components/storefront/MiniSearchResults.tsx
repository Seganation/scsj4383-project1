"use client";

import { useState, useEffect } from "react";
import { ProductTile } from "@/components/storefront/ProductTile";
import { MiniSearchInput } from "./MiniSearchInput";
import { Search, Package, X } from "lucide-react";
import Link from "next/link";
import {
  useProductSearch,
  useSemanticSearch,
  useSearchStats,
} from "@/hooks/use-mini-search";

interface MiniSearchResultsProps {
  initialQuery?: string;
}

type SearchMode = "best" | "semantic" | "fuzzy";
type SortMode = "relevance" | "price-low" | "price-high" | "name";

export function MiniSearchResults({ initialQuery = "" }: MiniSearchResultsProps) {
  const [query, setQuery] = useState(initialQuery);
  const [searchMode] = useState<SearchMode>("best");
  const [sortMode, setSortMode] = useState<SortMode>("relevance");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, Infinity]);

  useEffect(() => setQuery(initialQuery), [initialQuery]);

  const bestMatchSearch = useProductSearch(query, {
    fuzzy: 0.1,
    boost: { name: 3, category: 2, description: 1 },
    limit: 50,
    filter: (result) =>
      (!selectedCategory || result.category === selectedCategory) &&
      result.price >= priceRange[0] &&
      result.price <= priceRange[1],
  });
  const semanticSearch = useSemanticSearch(query, 50);
  const fuzzySearch = useProductSearch(query, {
    fuzzy: 0.3,
    prefix: true,
    boost: { name: 2, description: 2, category: 1 },
    limit: 50,
    filter: (result) =>
      (!selectedCategory || result.category === selectedCategory) &&
      result.price >= priceRange[0] &&
      result.price <= priceRange[1],
  });
  const { stats } = useSearchStats();

  const { results, isSearching, isEmpty } =
    searchMode === "semantic" ? semanticSearch : searchMode === "fuzzy" ? fuzzySearch : bestMatchSearch;

  const sortedResults = [...results].sort((a, b) => {
    switch (sortMode) {
      case "price-low": return a.price - b.price;
      case "price-high": return b.price - a.price;
      case "name": return a.name.localeCompare(b.name);
      default: return b.score - a.score;
    }
  });

  const hasActiveFilters =
    !!selectedCategory || priceRange[0] > 0 || priceRange[1] < Infinity;

  return (
    <section className="bg-paper">
      {/* Hero header */}
      <div className="border-b border-ink/10 bg-blueprint">
        <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-10 lg:px-14 lg:py-16">
          <div className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-steel-light">
            <Link href="/" className="hover:text-copper">Home</Link>
            <span className="text-copper/60">/</span>
            <span className="text-ink">Search</span>
          </div>
          <div className="grid grid-cols-12 items-end gap-6">
            <div className="col-span-12 md:col-span-7">
              <div className="eyebrow-copper">§ 11 — Search results</div>
              <h1 className="display mt-4 text-[clamp(2rem,4vw,3.5rem)] text-ink">
                {query.trim() ? (
                  <>
                    Hits for{" "}
                    <span className="italic text-copper">
                      "{query}"
                    </span>
                  </>
                ) : (
                  <>Start your <span className="italic text-copper">search.</span></>
                )}
              </h1>
              {query.trim() && (
                <p className="mt-4 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-steel-light">
                  {isSearching
                    ? "Searching…"
                    : `${sortedResults.length} unit${sortedResults.length === 1 ? "" : "s"} · ${searchMode}`}
                </p>
              )}
            </div>
            <div className="col-span-12 md:col-span-5">
              <MiniSearchInput />
            </div>
          </div>
        </div>
      </div>

      {!query.trim() ? (
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 lg:px-14">
          <div className="mx-auto max-w-lg border border-ink/15 bg-paper-dim p-10 text-center">
            <Search className="mx-auto h-10 w-10 text-steel-light" strokeWidth={1.5} />
            <h2 className="display mt-5 text-2xl text-ink">Start typing.</h2>
            <p className="mt-3 text-steel">
              Search by product name, category, or part of the spec — we'll
              match the closest hits across the catalogue.
            </p>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-10 lg:px-14 lg:py-16">
          {/* Controls */}
          <div className="mb-8 flex flex-col gap-4 border-b border-ink/10 pb-5 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {stats && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-10 border border-ink/25 bg-paper px-3 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-ink focus:border-copper focus:outline-none"
                >
                  <option value="">All categories</option>
                  {stats.categories
                    .filter((c) => typeof c === "string" && c.length > 0)
                    .map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1).replace(/-/g, " ")}
                      </option>
                    ))}
                </select>
              )}
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setPriceRange([0, Infinity]);
                  }}
                  className="inline-flex h-10 items-center gap-1.5 border border-ink/25 px-3 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-steel hover:border-ink hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear filters
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-steel-light">
                Sort
              </span>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="h-10 border border-ink/25 bg-paper px-3 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-ink focus:border-copper focus:outline-none"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price · low→high</option>
                <option value="price-high">Price · high→low</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </div>

          {isSearching && (
            <div className="grid grid-cols-12 gap-5 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="col-span-12 sm:col-span-6 md:col-span-3 aspect-square animate-pulse bg-ink/[0.05]"
                />
              ))}
            </div>
          )}

          {!isSearching && sortedResults.length > 0 && (
            <div className="grid grid-cols-12 gap-5 md:gap-6">
              {sortedResults.map((product, index) => (
                <ProductTile
                  key={`${product.id}-${index}`}
                  product={{
                    ...product,
                    description: (product as any).description || "",
                    images: (product as any).images || [],
                    category: (product as any).category
                      ? {
                          name: (product as any).category,
                          slug: (product as any).categorySlug || (product as any).category,
                        }
                      : null,
                  } as any}
                  size="standard"
                  index={index}
                />
              ))}
            </div>
          )}

          {!isSearching && isEmpty && (
            <div className="mx-auto max-w-lg border border-ink/15 bg-paper-dim p-10 text-center">
              <Package className="mx-auto h-10 w-10 text-steel-light" strokeWidth={1.5} />
              <h2 className="display mt-5 text-2xl text-ink">Nothing matched.</h2>
              <p className="mt-3 text-steel">
                No results for "{query}". Try a different term, widen the
                filter, or browse the catalogue.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setPriceRange([0, Infinity]);
                    }}
                    className="btn-ghost"
                  >
                    Clear filters
                  </button>
                )}
                <Link href="/products/category/all" className="btn-ink">
                  Browse all
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
