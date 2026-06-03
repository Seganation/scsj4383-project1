# Archcool E-Commerce Platform

🌟 **Archcool** is a high-performance, modern e-commerce platform built with the latest web technologies. It features a sleek storefront, a robust admin dashboard, and seamless integration with Stripe for payments and Better Auth for secure authentication.

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, `src` directory)
- **Authentication:** [Better Auth](https://better-auth.com/) (Email/Password, Google OAuth, Magic Link, OTP)
- **Database:** [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Payments:** [Stripe](https://stripe.com/) (Checkout & Webhooks)
- **File Uploads:** [UploadThing](https://uploadthing.com/)
- **State Management:** [TanStack Query](https://tanstack.com/query)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Search:** [MiniSearch](https://lucaong.github.io/minisearch/) (Client-side)

## 📦 Features

- 🛒 **Full Storefront:** Category browsing, product search, and responsive design.
- 🔐 **Secure Auth:** Multi-strategy authentication via Better Auth.
- 💳 **Seamless Payments:** Integrated Stripe Checkout with webhook synchronization.
- 🛠️ **Admin Dashboard:** Manage products, orders, categories, and banners.
- 📈 **Analytics:** Visualized sales data and performance metrics.
- 📧 **Email System:** Automated transactional emails for orders and auth.
- ⚡ **Performance:** Optimized images, server-side rendering, and efficient data fetching.

## 🛠️ Quick Start

### Prerequisites

- Node.js 20+
- PNPM 9+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd archcool

# Install dependencies
pnpm install

# Environment Setup
cp .env.example .env
# Configure your variables (DATABASE_URL, STRIPE_SECRET_KEY, BETTER_AUTH_SECRET, etc.)

# Database Setup
pnpm db:migrate
pnpm db:seed

# Run Development Server
pnpm dev
```

## 📜 Available Scripts

- `pnpm dev`: Start development server.
- `pnpm build`: Build for production.
- `pnpm start`: Start production server.
- `pnpm lint`: Run ESLint check.
- `pnpm db:migrate`: Deploy Prisma migrations.
- `pnpm db:seed`: Seed the database with initial data.
- `pnpm admin:setup`: Set up initial admin accounts.
- `pnpm optimize:images`: Run image optimization scripts.
- `pnpm generate:icons`: Generate PWA and site icons.

## 🏗️ Project Structure (Waterfall)

- **`src/app/(auth)`**: Authentication routes and pages.
- **`src/app/(protected)/dashboard`**: Admin-only management dashboard.
- **`src/app/(public)`**: Customer-facing storefront pages.
- **`src/app/api`**: Unified API routes (Auth, Stripe, UploadThing).
- **`src/lib`**: Shared utilities (DB client, Auth config, Stripe, Email).
- **`src/hooks`**: Custom React hooks for data fetching and UI state.
- **`src/components`**: Reusable UI, Storefront, Dashboard, and Auth components.
- **`docs/`**: Project documentation and guides.
- **`scripts/`**: Maintenance and utility scripts.
- **`prisma/`**: Database schema and migration files.

## 👟 Featured Products

- **ULTRABOOST 1.0 ATR**: High-performance sneaker with metal buckles and BOOST cushioning.
- **VaporMax 2023 Flyknit**: Innovative "walking on air" feel with recycled Flyknit upper.
- **Nike Air Max Plus**: Classic '90s style with Tuned Air cushioning and breathable mesh.
- **ULTRABOOST DNA 5.0**: Versatile everyday sneaker with PRIMEKNIT upper for all-day comfort.

---
Built with ❤️ by the Archcool Team.
