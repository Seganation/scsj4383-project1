import { Cart } from "@/lib/interfaces";

// Temporary in-memory storage - in production, use proper database tables
const cartStorage = new Map<string, Cart>();

export async function getCartFromStorage(userId: string): Promise<Cart | null> {
  return cartStorage.get(userId) || null;
}

export async function setCartInStorage(
  userId: string,
  cart: Cart
): Promise<void> {
  cartStorage.set(userId, cart);
}

export async function clearCartFromStorage(userId: string): Promise<void> {
  cartStorage.delete(userId);
}
