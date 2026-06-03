// Product API functions
export const productApi = {
  // Get all products with pagination
  getProducts: async (params?: {
    cursor?: string;
    limit?: number;
    search?: string;
    category?: string;
    featured?: boolean;
  }): Promise<{
    items: any[];
    nextCursor: string | null;
    hasNextPage: boolean;
  }> => {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.set("cursor", params.cursor);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.featured) searchParams.set("featured", "true");

    const response = await fetch(`/api/products?${searchParams}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    return response.json();
  },

  // Get product by ID
  getProduct: async (id: string): Promise<any> => {
    const response = await fetch(`/api/products/${id}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    return response.json();
  },

  // Get products by category (legacy - for backward compatibility)
  getProductsByCategory: async (category: string): Promise<any[]> => {
    const response = await fetch(
      `/api/products?category=${encodeURIComponent(category)}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch products by category: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.items || data; // Handle both new paginated and old format
  },

  // Get featured products (legacy - for backward compatibility)
  getFeaturedProducts: async (): Promise<any[]> => {
    const response = await fetch("/api/products?featured=true", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch featured products: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.items || data; // Handle both new paginated and old format
  },
};

// Order API functions
export const orderApi = {
  // Get orders for user
  getOrders: async (userId: string): Promise<any[]> => {
    const response = await fetch(`/api/orders/${userId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    return response.json();
  },

  // Create checkout session
  createCheckoutSession: async (userId: string): Promise<{ url: string }> => {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create checkout session: ${response.statusText}`
      );
    }

    return response.json();
  },
};
