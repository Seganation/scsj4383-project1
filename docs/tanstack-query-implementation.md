# TanStack Query Implementation Guide

This document outlines the complete TanStack Query implementation that has replaced Redis functionality in the Archcool e-commerce platform.

## Overview

The previous Redis-based cart and caching system has been completely replaced with TanStack Query (React Query) for client-side state management and caching. This provides better:

- **Type Safety**: Full TypeScript support
- **Error Handling**: Comprehensive error states and retry mechanisms
- **Caching**: Intelligent cache invalidation and stale-while-revalidate patterns
- **Performance**: Automatic background refetching and optimistic updates
- **Developer Experience**: DevTools, loading states, and better debugging

## Features Implemented

### 1. Cart Management

- **Add to Cart**: Optimistic updates with rollback on failure
- **Remove from Cart**: Immediate UI updates with server sync
- **Update Quantities**: Real-time quantity changes
- **Cart Persistence**: Session-based storage (can be easily moved to database)

### 2. Product Management

- **Featured Products**: Cached with 15-minute stale time
- **Product Details**: Individual product caching
- **Category Filtering**: Separate cache keys for different categories
- **Search**: Ready for implementation

### 3. Order Management

- **Order History**: User-specific order fetching
- **Checkout Process**: Stripe integration with cart clearing
- **Order Tracking**: Ready for implementation

### 4. Admin Dashboard

- **Sales Analytics**: Real-time dashboard stats
- **Recent Sales**: Live updates with proper caching
- **Product Management**: CRUD operations with cache invalidation
- **Chart Data**: Optimized for dashboard visualizations

## File Structure

```
app/
├── hooks/
│   ├── use-cart.ts          # Cart management hooks
│   ├── use-products.ts      # Product fetching hooks
│   ├── use-orders.ts        # Order management hooks
│   └── use-admin.ts         # Admin dashboard hooks
├── lib/
│   ├── query-client.ts      # TanStack Query configuration
│   ├── api.ts              # API client functions
│   └── cart-storage.ts     # Temporary cart storage
├── components/
│   ├── query-provider.tsx   # Query client provider
│   └── storefront/
│       ├── CartButton.tsx
│       ├── BagPage.tsx
│       ├── AddToCartButton.tsx
│       └── FeaturedProducts.tsx
└── api/
    ├── cart/               # Cart API routes
    ├── products/           # Product API routes
    ├── orders/             # Order API routes
    ├── checkout/           # Checkout API routes
    └── admin/              # Admin API routes
```

## Key Hooks and Their Usage

### Cart Hooks

```typescript
// Get cart data
const { data: cart, isLoading, error } = useCart(userId);

// Add item to cart
const addToCart = useAddToCart(userId);
addToCart.mutate({ productId });

// Remove item from cart
const removeFromCart = useRemoveFromCart(userId);
removeFromCart.mutate({ productId });

// Update quantity
const updateQuantity = useUpdateCartItemQuantity(userId);
updateQuantity.mutate({ productId, quantity: 5 });
```

### Product Hooks

```typescript
// Get featured products
const { data: products } = useFeaturedProducts();

// Get single product
const { data: product } = useProduct(productId);

// Get products by category
const { data: products } = useProductsByCategory("electronics");
```

### Order Hooks

```typescript
// Get user orders
const { data: orders } = useOrders(userId);

// Checkout process
const checkout = useCheckout(userId);
checkout.mutate();
```

## Error Handling

All hooks include comprehensive error handling:

```typescript
const { data, error, isLoading, isError } = useCart(userId);

if (isError) {
  // Handle error state
  return <ErrorComponent error={error} />;
}

if (isLoading) {
  // Handle loading state
  return <LoadingComponent />;
}

// Handle success state
return <SuccessComponent data={data} />;
```

## Toast Notifications

React Hot Toast is integrated for all mutations:

```typescript
const addToCart = useAddToCart(userId);

// Success toast is automatically shown
addToCart.mutate({ productId });

// Error toast is automatically shown on failure
```

## Cache Invalidation Strategy

### Cart Operations

- Adding items: Optimistic updates + server sync
- Removing items: Immediate cache update
- Quantity changes: Real-time updates

### Product Operations

- Creating products: Invalidates all product queries
- Updating products: Invalidates specific product and lists
- Deleting products: Invalidates all product queries

### Order Operations

- Checkout: Clears cart cache and invalidates orders
- Order updates: Invalidates user orders

## Query Keys

Consistent query key patterns for easy invalidation:

```typescript
// Cart keys
["cart", userId][
  // Product keys
  "products"
][("products", "list")][("products", "detail", productId)][
  ("products", "featured")
][("products", "category", categoryName)][
  // Order keys
  ("orders", userId)
][
  // Admin keys
  ("admin", "stats")
][("admin", "recent-sales")][("admin", "orders")];
```

## Performance Optimizations

### Stale Time Configuration

- **Cart**: 2 minutes (frequently updated)
- **Products**: 10-15 minutes (relatively stable)
- **Orders**: 5 minutes (updated occasionally)
- **Admin Stats**: 5 minutes (dashboard data)

### Cache Time Configuration

- **Cart**: 5 minutes
- **Products**: 30 minutes - 1 hour
- **Orders**: 20 minutes
- **Admin**: 10-30 minutes

### Background Refetching

- **On Window Focus**: Disabled (prevents unnecessary requests)
- **On Reconnect**: Always (ensures fresh data after connectivity issues)
- **Retry Logic**: 3 attempts with exponential backoff

## Migration from Redis

### What was replaced:

1. **Redis cart storage** → In-memory Map (temporary) + Database (production ready)
2. **Server-side cart fetching** → Client-side React Query hooks
3. **Manual cache invalidation** → Automatic query invalidation
4. **Server actions for cart** → API routes + React Query mutations

### Benefits of the migration:

1. **Better UX**: Optimistic updates and real-time feedback
2. **Type Safety**: Full TypeScript support throughout
3. **Error Handling**: Comprehensive error states and retry logic
4. **Performance**: Intelligent caching and background updates
5. **Developer Experience**: DevTools, loading states, and better debugging

## Production Considerations

### Cart Storage

Currently using in-memory storage for demonstration. For production:

```typescript
// Replace cart-storage.ts with database implementation
export async function getCartFromStorage(userId: string): Promise<Cart | null> {
  return await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });
}
```

### Security

- All API routes include authentication checks
- Cart operations are user-scoped
- Admin operations require specific email verification

### Monitoring

- React Query DevTools enabled in development
- Error boundaries recommended for production
- Consider implementing analytics for query performance

## Best Practices Implemented

1. **Optimistic Updates**: Cart operations show immediate feedback
2. **Error Boundaries**: Graceful error handling
3. **Loading States**: Skeleton components for better UX
4. **Cache Invalidation**: Automatic and manual invalidation strategies
5. **Type Safety**: Full TypeScript coverage
6. **Performance**: Efficient query patterns and caching strategies

This implementation provides a robust, type-safe, and performant alternative to Redis with better developer experience and user experience.
