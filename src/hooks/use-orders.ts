import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "@/lib/api";
import toast from "react-hot-toast";

// Query keys for orders
export const orderKeys = {
  all: ["orders"] as const,
  byUser: (userId: string) => [...orderKeys.all, userId] as const,
};

// Hook to get user orders
export const useOrders = (userId: string | null) => {
  return useQuery({
    queryKey: orderKeys.byUser(userId || ""),
    queryFn: () => orderApi.getOrders(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 20, // 20 minutes
  });
};

// Hook for checkout process
export const useCheckout = (userId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => orderApi.createCheckoutSession(userId!),
    onSuccess: (data) => {
      toast.success("Redirecting to checkout...");
      // Redirect to Stripe checkout
      window.location.href = data.url;
    },
    onError: (error: any) => {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout process");
    },
    onSettled: () => {
      // Invalidate orders after checkout attempt
      if (userId) {
        queryClient.invalidateQueries({ queryKey: orderKeys.byUser(userId) });
      }
    },
  });
};
