"use client";

import { useState, useEffect, useCallback } from "react";
import { CartStorage } from "@/lib/cart-client";
import { Cart, CartItem } from "@/lib/interfaces";
import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";

// Custom hook for cart state management
export function useClientCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = CartStorage.getCart();
        setCart(savedCart);
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();

    // Listen for storage changes to sync cart across tabs/components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "archcool_cart") {
        try {
          const newCart = e.newValue ? JSON.parse(e.newValue) : null;
          setCart(newCart);
        } catch (error) {
          console.error("Error syncing cart from storage:", error);
        }
      }
    };

    // Listen for custom cart update events for immediate sync within the same tab
    const handleCartUpdate = (e: CustomEvent) => {
      setCart(e.detail);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleCartUpdate as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "cartUpdated",
        handleCartUpdate as EventListener
      );
    };
  }, []);

  // Handle session changes and cart migration
  useEffect(() => {
    const handleSessionChange = () => {
      const currentCart = CartStorage.getCart();
      const currentUserId = session?.user?.id || "";
      
      if (!currentCart) return;

      // If user logged in and cart has different userId, migrate cart
      if (session?.user?.id && currentCart.userId !== currentUserId) {
        console.log("User logged in, migrating cart from guest to user");
        
        // Keep the same items but update userId
        const migratedCart = {
          ...currentCart,
          userId: currentUserId
        };
        
        CartStorage.setCart(migratedCart);
        setCart(migratedCart);
        toast.success("Cart migrated to your account");
      }
      
      // If user logged out and cart has userId, clear userId
      if (!session?.user?.id && currentCart.userId) {
        console.log("User logged out, converting cart to guest");
        
        const guestCart = {
          ...currentCart,
          userId: ""
        };
        
        CartStorage.setCart(guestCart);
        setCart(guestCart);
      }
    };

    handleSessionChange();
  }, [session?.user?.id]);

  // Update cart and save to localStorage
  const updateCart = useCallback((newCart: Cart | null) => {
    setCart(newCart);
    if (newCart) {
      CartStorage.setCart(newCart);
    }
  }, []);

  // Add item to cart
  const addItem = useCallback((item: CartItem) => {
    try {
      // Check if item is already in cart
      if (CartStorage.isItemInCart(item.id)) {
        toast.error("Item is already in cart");
        return null;
      }

      const updatedCart = CartStorage.addItem(item);
      setCart(updatedCart); // Set the new cart directly
      toast.success("Item added to cart!");
      return updatedCart;
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error("Failed to add item to cart");
      return null;
    }
  }, []);

  // Update item quantity
  const updateItemQuantity = useCallback(
    (productId: string, quantity: number) => {
      try {
        const updatedCart = CartStorage.updateItemQuantity(productId, quantity);
        setCart(updatedCart); // Set the new cart directly
        if (quantity === 0) {
          toast.success("Item removed from cart");
        } else {
          toast.success("Cart updated");
        }
        return updatedCart;
      } catch (error) {
        console.error("Error updating cart item:", error);
        toast.error("Failed to update cart");
        return null;
      }
    },
    []
  );

  // Remove item from cart
  const removeItem = useCallback((productId: string) => {
    try {
      const updatedCart = CartStorage.removeItem(productId);
      setCart(updatedCart); // Set the new cart directly
      toast.success("Item removed from cart");
      return updatedCart;
    } catch (error) {
      console.error("Error removing item from cart:", error);
      toast.error("Failed to remove item");
      return null;
    }
  }, []);

  // Clear entire cart
  const clearCart = useCallback(() => {
    try {
      CartStorage.clearCart();
      setCart({ userId: "", items: [] });
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
    }
  }, []);

  // Get cart totals
  const getCartTotal = useCallback(() => {
    if (!cart) return 0;
    return cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cart]);

  const getCartItemCount = useCallback(() => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  // Check if item is in cart
  const isItemInCart = useCallback(
    (productId: string) => {
      if (!cart) return false;
      return cart.items.some((item) => item.id === productId);
    },
    [cart]
  );

  // Check if user is admin
  const isAdmin = session?.user && (session.user as any).role === "admin";

  return {
    cart,
    isLoading,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isItemInCart,
    updateCart,
    isAdmin,
    isAuthenticated: !!session?.user?.id,
  };
}

// Hook for checkout functionality
export function useClientCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const checkout = useCallback(async (cartItems: CartItem[]) => {
    if (!cartItems.length) {
      toast.error("Cart is empty");
      return null;
    }

    // Check if user is admin
    const isAdmin = session?.user && (session.user as any).role === "admin";
    if (isAdmin) {
      toast.error("Admins cannot make purchases. You cannot buy from yourself!");
      return null;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartItems }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
        return data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMessage = error instanceof Error ? error.message : "Checkout failed. Please try again.";
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  return {
    checkout,
    isLoading,
  };
}
