"use client";

import { Cart, CartItem } from "./interfaces";

const CART_STORAGE_KEY = "archcool_cart";

export class CartStorage {
  // Get cart from localStorage
  static getCart(): Cart | null {
    if (typeof window === "undefined") return null;

    try {
      const cartData = localStorage.getItem(CART_STORAGE_KEY);
      return cartData ? JSON.parse(cartData) : null;
    } catch {
      return null;
    }
  }

  // Save cart to localStorage
  static setCart(cart: Cart): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      // Dispatch custom event for immediate sync within the same tab
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: cart }));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }

  // Clear cart from localStorage
  static clearCart(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      // Dispatch custom event for immediate sync within the same tab
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: null }));
    } catch (error) {
      console.error("Failed to clear cart from localStorage:", error);
    }
  }

  // Add item to cart
  static addItem(item: CartItem): Cart {
    const currentCart = this.getCart() || { userId: "", items: [] };

    const existingItemIndex = currentCart.items.findIndex(
      (cartItem) => cartItem.id === item.id
    );

    // If item already exists, return current cart without changes
    if (existingItemIndex >= 0) {
      return currentCart;
    }

    // Add new item - create new array
    const newItems = [...currentCart.items, item];
    const newCart = { ...currentCart, items: newItems };
    this.setCart(newCart);
    return newCart;
  }

  // Update item quantity
  static updateItemQuantity(productId: string, quantity: number): Cart | null {
    const currentCart = this.getCart();
    if (!currentCart) return null;

    let newItems;
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative - create new array
      newItems = currentCart.items.filter((item) => item.id !== productId);
    } else {
      // Update quantity - create new array
      newItems = currentCart.items.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
    }

    const newCart = { ...currentCart, items: newItems };
    this.setCart(newCart);
    return newCart;
  }

  // Remove item from cart
  static removeItem(productId: string): Cart | null {
    const currentCart = this.getCart();
    if (!currentCart) return null;

    // Create new array without the item
    const newItems = currentCart.items.filter((item) => item.id !== productId);
    const newCart = { ...currentCart, items: newItems };

    this.setCart(newCart);
    return newCart;
  }

  // Get cart total
  static getCartTotal(): number {
    const cart = this.getCart();
    if (!cart) return 0;

    return cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  // Get cart item count
  static getCartItemCount(): number {
    const cart = this.getCart();
    if (!cart) return 0;

    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  // Check if item is in cart
  static isItemInCart(productId: string): boolean {
    const cart = this.getCart();
    if (!cart) return false;

    return cart.items.some((item) => item.id === productId);
  }
}
