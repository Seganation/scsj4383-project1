"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api";
import {
  getSearchService,
  ProductSearchItem,
  SearchResult,
  SearchOptions,
  convertToSearchItem,
} from "@/lib/mini-search";

// Hook to initialize and manage the search service
export const useSearchService = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const searchService = useRef(getSearchService());

  // Fetch all products to initialize the search index
  const { data: apiProducts, isLoading } = useQuery({
    queryKey: ["products", "all-for-search"],
    queryFn: async () => {
      // Fetch all products without pagination for search index
      const response = await fetch("/api/products?limit=1000");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      return data.items || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Initialize search service when products are loaded
  useEffect(() => {
    if (apiProducts && apiProducts.length > 0 && !isInitialized) {
      const searchItems = apiProducts.map(convertToSearchItem);
      searchService.current.initialize(searchItems);
      setIsInitialized(true);
    }
  }, [apiProducts, isInitialized]);

  return {
    searchService: searchService.current,
    isLoading,
    isInitialized: isInitialized && !isLoading,
    productsCount: apiProducts?.length || 0,
  };
};

// Hook for performing searches with debouncing
export const useProductSearch = (
  query: string,
  options: SearchOptions = {},
  debounceMs = 300
) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchService, isInitialized } = useSearchService();

  // Memoize options to prevent infinite re-renders
  const memoizedOptions = useMemo(() => options, [JSON.stringify(options)]);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (!isInitialized || !debouncedQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      const searchResults = searchService.search(
        debouncedQuery,
        memoizedOptions
      );
      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [debouncedQuery, memoizedOptions, searchService, isInitialized]);

  return {
    results,
    isSearching: isSearching || !isInitialized,
    query: debouncedQuery,
    isEmpty:
      results.length === 0 && debouncedQuery.trim().length > 0 && !isSearching,
  };
};

// Hook for semantic search (best match search)
export const useSemanticSearch = (query: string, limit = 20) => {
  const { searchService, isInitialized } = useSearchService();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = useCallback(async () => {
    if (!isInitialized || !query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const searchResults = searchService.semanticSearch(query, limit);
      setResults(searchResults);
    } catch (error) {
      console.error("Semantic search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, limit, searchService, isInitialized]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  return {
    results,
    isSearching: isSearching || !isInitialized,
    isEmpty: results.length === 0 && query.trim().length > 0 && !isSearching,
  };
};

// Hook for category-based search
export const useCategorySearch = (category: string) => {
  const { searchService, isInitialized } = useSearchService();
  const [products, setProducts] = useState<ProductSearchItem[]>([]);

  useEffect(() => {
    if (!isInitialized || !category) {
      setProducts([]);
      return;
    }

    try {
      const categoryProducts = searchService.getProductsByCategory(category);
      setProducts(categoryProducts);
    } catch (error) {
      console.error("Category search error:", error);
      setProducts([]);
    }
  }, [category, searchService, isInitialized]);

  return {
    products,
    isLoading: !isInitialized,
    isEmpty: products.length === 0 && isInitialized,
  };
};

// Hook for search suggestions
export const useSearchSuggestions = (query: string, limit = 5) => {
  const { searchService, isInitialized } = useSearchService();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!isInitialized || !query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const searchSuggestions = searchService.getSuggestions(query, limit);
      setSuggestions(searchSuggestions);
    } catch (error) {
      console.error("Suggestions error:", error);
      setSuggestions([]);
    }
  }, [query, limit, searchService, isInitialized]);

  return {
    suggestions,
    isLoading: !isInitialized,
    isEmpty: suggestions.length === 0 && query.length >= 2 && isInitialized,
  };
};

// Hook for featured products
export const useFeaturedProductsSearch = () => {
  const { searchService, isInitialized } = useSearchService();
  const [products, setProducts] = useState<ProductSearchItem[]>([]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    try {
      const featuredProducts = searchService.getFeaturedProducts();
      setProducts(featuredProducts);
    } catch (error) {
      console.error("Featured products error:", error);
      setProducts([]);
    }
  }, [searchService, isInitialized]);

  return {
    products,
    isLoading: !isInitialized,
    isEmpty: products.length === 0 && isInitialized,
  };
};

// Hook for similar products
export const useSimilarProducts = (
  product: ProductSearchItem | null,
  limit = 5
) => {
  const { searchService, isInitialized } = useSearchService();
  const [similarProducts, setSimilarProducts] = useState<ProductSearchItem[]>(
    []
  );

  useEffect(() => {
    if (!isInitialized || !product) {
      setSimilarProducts([]);
      return;
    }

    try {
      const similar = searchService.getSimilarProducts(product, limit);
      setSimilarProducts(similar);
    } catch (error) {
      console.error("Similar products error:", error);
      setSimilarProducts([]);
    }
  }, [product, limit, searchService, isInitialized]);

  return {
    similarProducts,
    isLoading: !isInitialized,
    isEmpty: similarProducts.length === 0 && isInitialized && product !== null,
  };
};

// Hook for search statistics
export const useSearchStats = () => {
  const { searchService, isInitialized } = useSearchService();
  const [stats, setStats] = useState<ReturnType<
    typeof searchService.getStats
  > | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    try {
      const searchStats = searchService.getStats();
      setStats(searchStats);
    } catch (error) {
      console.error("Search stats error:", error);
      setStats(null);
    }
  }, [searchService, isInitialized]);

  return {
    stats,
    isLoading: !isInitialized,
  };
};
