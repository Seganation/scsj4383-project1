import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api";

// Query keys for products
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  featured: () => [...productKeys.all, "featured"] as const,
  category: (category: string) =>
    [...productKeys.all, "category", category] as const,
  infinite: (filters: Record<string, any>) =>
    [...productKeys.all, "infinite", filters] as const,
  search: (query: string) => [...productKeys.all, "search", query] as const,
};

// Hook to get all products (legacy - for backward compatibility)
export const useProducts = () => {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: () => productApi.getProducts(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Hook for infinite scroll products
export const useInfiniteProducts = (params?: {
  search?: string;
  category?: string;
  featured?: boolean;
  limit?: number;
}) => {
  return useInfiniteQuery({
    queryKey: productKeys.infinite(params || {}),
    queryFn: ({ pageParam }) =>
      productApi.getProducts({
        cursor: pageParam,
        limit: params?.limit || 10,
        search: params?.search,
        category: params?.category,
        featured: params?.featured,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 20, // 20 minutes
  });
};

// Hook for search with infinite scroll
export const useInfiniteSearch = (query: string, limit = 10) => {
  return useInfiniteQuery({
    queryKey: productKeys.search(query),
    queryFn: ({ pageParam }) =>
      productApi.getProducts({
        cursor: pageParam,
        limit,
        search: query,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!query.trim(),
    staleTime: 1000 * 60 * 2, // 2 minutes for search results
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook to get a single product
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productApi.getProduct(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};

// Hook to get products by category (legacy - for backward compatibility)
export const useProductsByCategory = (category: string) => {
  return useQuery({
    queryKey: productKeys.category(category),
    queryFn: () => productApi.getProductsByCategory(category),
    enabled: !!category,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 20, // 20 minutes
  });
};

// Hook to get featured products (legacy - for backward compatibility)
export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: productApi.getFeaturedProducts,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};
