# Assignment 2 — Frameworks and REST
**Subject:** SCSJ4383 / SCJ4383 — Software Construction  
**Semester:** II 2021/2022  
**Application:** Archcool — Commercial Kitchen Equipment E-Commerce Platform  
**Framework:** Next.js 16 (App Router)  
**Repository:** https://github.com/Seganation/scsj4383-project1

---

## 1. Application Overview

**Archcool** is a full-stack e-commerce platform for commercial kitchen equipment. It enables customers to browse products, manage a shopping cart, complete secure payments, and track orders. Administrators manage the product catalogue, orders, banners, and users through a protected dashboard.

**Tech stack:**
| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript 5 |
| Database | PostgreSQL via Prisma ORM |
| Authentication | Better Auth (email, Google OAuth, OTP, magic link) |
| Payments | Stripe Checkout |
| File Uploads | UploadThing |
| State Management | TanStack Query v5 |
| Styling | Tailwind CSS + Radix UI |

---

## 2. Framework Setup — Next.js

### 2.1 Installation

```bash
# Project created with
npx create-next-app@latest scsj4383-project1 --typescript --tailwind --app
cd scsj4383-project1
pnpm install
```

### 2.2 Why Next.js

Next.js is a **React framework** that provides:
- **App Router** — file-system based routing with layouts, loading states, and error boundaries
- **Server Components** — default server-side rendering, zero client JS overhead
- **API Routes** — built-in REST endpoint handlers inside the same project (no separate Express server)
- **Middleware** — edge-compatible request interception for auth guards
- **Image Optimisation** — automatic WebP/AVIF conversion and lazy loading

### 2.3 Key Configuration (`next.config.mjs`)

```js
const nextConfig = {
  output: "standalone",        // Docker-compatible standalone build
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", ...],
  },
  images: {
    remotePatterns: [{ hostname: "utfs.io" }, { hostname: "picsum.photos" }],
  },
};
```

### 2.4 Directory Structure (App Router)

```
src/
├── app/
│   ├── (auth)/          # Sign-in, sign-up, reset-password, magic-link
│   ├── (public)/        # Storefront: products, bag, checkout, orders
│   ├── (protected)/     # Admin dashboard (role-gated)
│   │   └── dashboard/   # Products, orders, banners, categories, users
│   └── api/             # REST endpoints (see Section 4)
├── components/          # Reusable UI components
├── hooks/               # TanStack Query hooks
└── lib/                 # auth.ts, db.ts, stripe.ts, email.ts
```

---

## 3. Five Application Functionalities

### Functionality 1 — Product Catalogue

Users browse the full product catalogue with infinite scroll, category filtering, and full-text search.

- **Route:** `/products`, `/products/category/[category]`, `/products/[name]`
- **Implementation:** Server Component fetches products from PostgreSQL via Prisma. TanStack Query handles client-side cache and infinite scroll on the product list page.
- **Search:** MiniSearch library provides client-side fuzzy full-text search across product names and descriptions.

**Key files:**
- `src/app/(public)/products/page.tsx`
- `src/app/(public)/products/category/[category]/page.tsx`
- `src/hooks/use-products.ts`

---

### Functionality 2 — User Authentication

Multi-strategy authentication system supporting email/password, Google OAuth, OTP, and passwordless magic links.

- **Route:** `/sign-in`, `/sign-up`, `/email-auth`, `/reset-password`, `/magic-link-verify`
- **Implementation:** Better Auth library with Prisma adapter. Server config in `src/lib/auth.ts`. Plugins: `admin`, `multiSession`, `emailOTP`, `magicLink`.
- **Security:** Bcrypt password hashing, signed session cookies (24h), role-based access control (`admin` / `customer`).

**Key files:**
- `src/lib/auth.ts` — server config with all plugins
- `src/lib/auth-client.ts` — client-side session hooks
- `src/app/api/auth/[...betterAuth]/route.ts` — Better Auth catch-all handler

---

### Functionality 3 — Shopping Cart

Persistent cart that works for both guest and authenticated users.

- **Implementation:** Cart stored in `localStorage` via `CartStorage` class. On login, the local cart is merged with the server-side cart. TanStack Query manages cache invalidation.
- **Guest support:** Cart survives page refresh and login via `localStorage` serialisation.
- **Route:** `/bag`

**Key files:**
- `src/lib/cart-client.ts` — `CartStorage` class
- `src/hooks/use-client-cart.ts` — TanStack Query cart hook
- `src/app/(public)/bag/bag-client.tsx`

---

### Functionality 4 — Checkout and Payment (Stripe)

Secure checkout powered by Stripe Checkout Sessions with automatic order creation.

- **Flow:**
  1. User clicks Checkout → `POST /api/checkout` creates Stripe session + pending `Order` record
  2. User completes payment on Stripe-hosted page
  3. Stripe sends `checkout.session.completed` webhook to `/api/stripe/webhook`
  4. Webhook updates order to `paid`, sends confirmation email, and generates magic link for tracking
- **Guest checkout:** Stripe collects email and shipping address; a user account is auto-created post-payment
- **Route:** `/checkout`, `/payment/success`, `/payment/cancel`

**Key files:**
- `src/app/api/checkout/route.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/app/(public)/checkout/checkout-client.tsx`

---

### Functionality 5 — Order Management

Users and admins can view, track, and manage orders through dedicated dashboards.

- **Customer view:** `/my-orders` — list of all orders with status badges and item details
- **Admin view:** `/dashboard/orders` — full order management with status updates (pending → paid → fulfilled) and refund capability
- **Magic link tracking:** Guest users receive an email with a magic link to track their order without logging in
- **Route:** `/my-orders`, `/my-orders/[orderId]`, `/dashboard/orders`, `/dashboard/orders/[orderId]`

**Key files:**
- `src/app/(public)/my-orders/page.tsx`
- `src/app/(protected)/dashboard/orders/page.tsx`
- `src/app/api/orders/route.ts`

---

## 4. Two RESTful Web Services

The two selected RESTful web services are the **Products API** and the **Orders API**, both located under `src/app/api/`.

### 4.1 Products API

**Base path:** `/api/products`

This is a public API that exposes the product catalogue with filtering, search, and cursor-based pagination.

#### Endpoints

| Method | URL | Description |
|---|---|---|
| `GET` | `/api/products` | List products (paginated, filterable) |
| `GET` | `/api/products?search=grill` | Full-text search across name + description |
| `GET` | `/api/products?category=grills` | Filter by category slug |
| `GET` | `/api/products?featured=true` | Featured products only |
| `GET` | `/api/products?limit=20&cursor=<id>` | Cursor-based pagination |
| `GET` | `/api/products/:id` | Single product by ID |

#### REST Principles Applied

- **Stateless:** Every request is self-contained; no server-side session required
- **Uniform Interface:** Standard HTTP GET, JSON response body
- **Resource-based URLs:** `/api/products` = collection, `/api/products/:id` = single resource
- **Correct HTTP status codes:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

#### Example Request / Response

```bash
GET /api/products?category=grills&limit=5
```

```json
{
  "items": [
    {
      "id": "clx12345abc",
      "name": "Professional Gas Grill XXL",
      "description": "Heavy-duty outdoor gas grill with 6 burners...",
      "price": 199999,
      "images": ["https://picsum.photos/seed/archcool-grills/800/600"],
      "category": { "name": "Grills", "slug": "grills" },
      "isFeatured": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "nextCursor": null,
  "hasNextPage": false
}
```

#### Implementation (`src/app/api/products/route.ts`)

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search   = searchParams.get("search");
  const featured = searchParams.get("featured");
  const cursor   = searchParams.get("cursor");
  const limit    = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

  // Build dynamic where clause
  let whereClause: any = { status: "published" };
  if (search) {
    whereClause.OR = [
      { name:        { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category && category !== "all") {
    const categoryRecord = await prisma.category.findUnique({ where: { slug: category } });
    if (categoryRecord) whereClause.categoryId = categoryRecord.id;
  }
  if (featured === "true") whereClause.isFeatured = true;

  // Cursor-based pagination
  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasNextPage = products.length > limit;
  const items       = hasNextPage ? products.slice(0, -1) : products;
  const nextCursor  = hasNextPage ? products[products.length - 2].id : null;

  return NextResponse.json({ items, nextCursor, hasNextPage });
}
```

---

### 4.2 Orders API

**Base path:** `/api/orders`

This is a protected API that requires an authenticated session. It returns the current user's orders.

#### Endpoints

| Method | URL | Description | Auth |
|---|---|---|---|
| `GET` | `/api/orders` | List current user's orders | Required |
| `GET` | `/api/orders/:orderId` | Single order detail | Required |
| `POST` | `/api/orders` | Create order (called by checkout flow) | Required |
| `GET` | `/api/orders/verify-payment?session_id=...` | Verify Stripe payment + return order | None |
| `GET` | `/api/orders/by-user/:userId` | Orders by user ID | Required |

#### REST Principles Applied

- **Authentication via session cookie** — Better Auth session validated on every request
- **Authorization:** Users can only access their own orders (`where: { userId: session.user.id }`)
- **Correct HTTP status codes:** `200 OK`, `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`
- **Resource nesting:** `/api/orders/:orderId` follows RESTful resource hierarchy

#### Example Request / Response

```bash
GET /api/orders
Cookie: better-auth.session_token=<session>
```

```json
[
  {
    "id": "ord_abc123",
    "status": "fulfilled",
    "paymentStatus": "paid",
    "amount": 199999,
    "createdAt": "2024-01-20T14:00:00.000Z",
    "shippingName": "John Smith",
    "shippingAddress": "123 High Street",
    "shippingCity": "London",
    "items": [
      {
        "id": "item_xyz",
        "quantity": 1,
        "price": 199999,
        "product": {
          "id": "clx12345abc",
          "name": "Professional Gas Grill XXL",
          "images": ["https://picsum.photos/seed/archcool-grills/800/600"]
        }
      }
    ]
  }
]
```

#### Implementation (`src/app/api/orders/route.ts`)

```typescript
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    select: {
      id: true, status: true, paymentStatus: true, amount: true,
      createdAt: true, shippingName: true, shippingAddress: true,
      items: { include: { product: { select: { id: true, name: true, images: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
```

---

## 5. Summary

| Item | Detail |
|---|---|
| Framework | Next.js 16 (App Router) |
| Functionality 1 | Product Catalogue — browse, filter, search |
| Functionality 2 | User Authentication — email, Google, OTP, magic link |
| Functionality 3 | Shopping Cart — guest + authenticated, localStorage |
| Functionality 4 | Checkout & Payment — Stripe Checkout Sessions |
| Functionality 5 | Order Management — customer + admin views |
| RESTful Service 1 | `GET /api/products` — public, paginated, searchable |
| RESTful Service 2 | `GET /api/orders` — protected, session-authenticated |
| Source Code | https://github.com/Seganation/scsj4383-project1 |
