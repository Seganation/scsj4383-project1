import { Order, User } from "@prisma/client";

/**
 * Utility functions for handling order emails in the refactored system
 */

type OrderWithUser = Order & {
  user?: User | null;
};

/**
 * Get the email for order notifications and communications
 * Uses shippingEmail as the single source of truth for all orders
 */
export function getOrderEmail(order: OrderWithUser): string {
  return order.shippingEmail;
}

/**
 * Get the current user email (if order belongs to a registered user)
 * Useful when you need the user's current email rather than the snapshot
 */
export function getCurrentUserEmail(order: OrderWithUser): string | null {
  return order.user?.email || null;
}

/**
 * Check if an order was placed by a guest
 */
export function isGuestOrder(order: Order): boolean {
  return order.userId === null;
}

/**
 * Check if an order belongs to a specific user email
 * Uses shippingEmail for comparison to handle both guest and user orders
 */
export function isOrderForEmail(order: Order, email: string): boolean {
  return order.shippingEmail.toLowerCase() === email.toLowerCase();
}

/**
 * Get display name for order (shipping name as fallback for guest orders)
 */
export function getOrderDisplayName(order: OrderWithUser): string {
  if (order.user?.name) {
    return order.user.name;
  }
  if (order.user?.firstName && order.user?.lastName) {
    return `${order.user.firstName} ${order.user.lastName}`;
  }
  return order.shippingName;
}

/**
 * Get the phone number for order communications
 * Uses shippingPhone as the single source of truth for all orders
 */
export function getOrderPhone(order: OrderWithUser): string | null {
  return order.shippingPhone;
}

/**
 * Get the current user phone (if order belongs to a registered user)
 * Useful when you need the user's current phone rather than the snapshot
 */
export function getCurrentUserPhone(order: OrderWithUser): string | null {
  return order.user?.phone || null;
}
