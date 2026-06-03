import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Admin API functions
const adminApi = {
  getDashboardStats: async () => {
    const response = await fetch("/api/admin/stats", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch dashboard stats: ${response.statusText}`
      );
    }

    return response.json();
  },

  getRecentSales: async () => {
    const response = await fetch("/api/admin/recent-sales", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recent sales: ${response.statusText}`);
    }

    return response.json();
  },

  getChartData: async () => {
    const response = await fetch("/api/admin/chart-data", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch chart data: ${response.statusText}`);
    }

    return response.json();
  },

  getAllOrders: async () => {
    const response = await fetch("/api/admin/orders", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    return response.json();
  },

  getBanners: async () => {
    const response = await fetch("/api/admin/banners", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch banners: ${response.statusText}`);
    }

    return response.json();
  },

  createBanner: async (bannerData: any) => {
    const response = await fetch("/api/admin/banners", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(bannerData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create banner: ${response.statusText}`);
    }

    return response.json();
  },

  deleteBanner: async (bannerId: string) => {
    const response = await fetch(`/api/admin/banners/${bannerId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete banner: ${response.statusText}`);
    }

    return response.json();
  },

  createProduct: async (productData: any) => {
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create product: ${response.statusText}`);
    }

    return response.json();
  },

  updateProduct: async ({ id, ...productData }: any) => {
    const response = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update product: ${response.statusText}`);
    }

    return response.json();
  },

  deleteProduct: async (productId: string) => {
    const response = await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.statusText}`);
    }

    return response.json();
  },
};

// Query keys for admin operations
export const adminKeys = {
  all: ["admin"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  recentSales: () => [...adminKeys.all, "recent-sales"] as const,
  chartData: () => [...adminKeys.all, "chart-data"] as const,
  orders: () => [...adminKeys.all, "orders"] as const,
  banners: () => [...adminKeys.all, "banners"] as const,
  products: () => [...adminKeys.all, "products"] as const,
};

// Dashboard stats hook
export const useDashboardStats = () => {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: adminApi.getDashboardStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Recent sales hook
export const useRecentSales = () => {
  return useQuery({
    queryKey: adminKeys.recentSales(),
    queryFn: adminApi.getRecentSales,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Chart data hook
export const useChartData = () => {
  return useQuery({
    queryKey: adminKeys.chartData(),
    queryFn: adminApi.getChartData,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// All orders hook
export const useAdminOrders = () => {
  return useQuery({
    queryKey: adminKeys.orders(),
    queryFn: adminApi.getAllOrders,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Banners hook
export const useBanners = () => {
  return useQuery({
    queryKey: adminKeys.banners(),
    queryFn: adminApi.getBanners,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
};

// Create banner mutation
export const useCreateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.createBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.banners() });
      toast.success("Banner created successfully!");
    },
    onError: (error: any) => {
      console.error("Create banner error:", error);
      toast.error("Failed to create banner");
    },
  });
};

// Delete banner mutation
export const useDeleteBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.banners() });
      toast.success("Banner deleted successfully!");
    },
    onError: (error: any) => {
      console.error("Delete banner error:", error);
      toast.error("Failed to delete banner");
    },
  });
};

// Create product mutation
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.createProduct,
    onSuccess: () => {
      // Invalidate all product-related queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
      toast.success("Product created successfully!");
    },
    onError: (error: any) => {
      console.error("Create product error:", error);
      toast.error("Failed to create product");
    },
  });
};

// Update product mutation
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.updateProduct,
    onSuccess: () => {
      // Invalidate all product-related queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
      toast.success("Product updated successfully!");
    },
    onError: (error: any) => {
      console.error("Update product error:", error);
      toast.error("Failed to update product");
    },
  });
};

// Delete product mutation
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.deleteProduct,
    onSuccess: () => {
      // Invalidate all product-related queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
      toast.success("Product deleted successfully!");
    },
    onError: (error: any) => {
      console.error("Delete product error:", error);
      toast.error("Failed to delete product");
    },
  });
};
