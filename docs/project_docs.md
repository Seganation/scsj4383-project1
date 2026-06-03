# Archcool: Technical Project Documentation

This document provides a comprehensive technical overview of the Archcool e-commerce platform, detailing its architecture, core technologies, and implementation patterns.

## 1. Project Overview

Archcool is a modern, full-stack e-commerce application built with Next.js 15. It is designed for high performance, scalability, and security. The platform provides a seamless shopping experience for users and a powerful management interface for administrators.

### 1.1. Core Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
- **Authentication:** [Better Auth](https://better-auth.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Payments:** [Stripe](https://stripe.com/)
- **File Uploads:** [UploadThing](https://uploadthing.com/)
- **State Management:** [TanStack Query v5](https://tanstack.com/query)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Search:** [MiniSearch](https://lucaong.github.io/minisearch/)

## 2. Project Architecture

The project follows a "Waterfall" structure within the `src` directory to maintain a clean separation of concerns.

### 2.1. Directory Structure

- **`src/app/(auth)`**: Handles authentication flows (Login, Register, Forgot Password, Magic Link).
- **`src/app/(protected)/dashboard`**: Protected admin routes for store management.
- **`src/app/(public)`**: Public-facing storefront (Home, Product Details, Category pages, Cart).
- **`src/app/api`**: Server-side API endpoints for Better Auth, Stripe Webhooks, and UploadThing handlers.
- **`src/lib`**: Unified library directory containing:
  - `db.ts`: Prisma client initialization.
  - `auth.ts`: Better Auth server configuration.
  - `stripe.ts`: Stripe client and helper functions.
  - `email.ts`: Nodemailer configuration and transactional email templates.
  - `query-client.ts`: TanStack Query client setup.
- **`src/hooks`**: Custom hooks for client-side state and data fetching (e.g., `use-products`, `use-session`, `use-client-cart`).
- **`src/components`**: Modular component library categorized by domain (`ui`, `storefront`, `dashboard`, `auth`).

## 3. Key Systems

### 3.1. Authentication (Better Auth)
Archcool uses **Better Auth** for robust security. Supported strategies include:
- **Email & Password**: Traditional login with secure hashing.
- **Google OAuth**: Social sign-in integration.
- **Magic Link**: Passwordless authentication via email.
- **OTP (One-Time Password)**: Enhanced security for sensitive actions.

### 3.2. Database & Schema
The database is powered by **PostgreSQL** and managed via **Prisma**.
Key models include:
- `User`: Profiles, roles (Admin/User), and session data.
- `Product`: Comprehensive product data (name, description, price, images, category, inventory).
- `Order`: Transaction history, shipping status, and Stripe payment references.
- `Banner`: Dynamic promotional content for the storefront.

### 3.3. Payment Processing (Stripe)
The platform integrates **Stripe Checkout** for secure transactions.
- **Webhooks**: A dedicated endpoint (`/api/stripe/webhook`) handles asynchronous events like `checkout.session.completed` to update order statuses and trigger confirmation emails.

### 3.4. File Management (UploadThing)
Product images and banners are managed via **UploadThing**. This provides a secure, serverless way to handle file uploads with automatic optimization and cloud storage.

### 3.5. Search & Optimization
- **Search**: Integrated **MiniSearch** provides blazing-fast, client-side full-text search across the product catalog.
- **Images**: Custom image optimization scripts and Next.js `Image` component ensure minimal layout shift and fast load times.

## 4. Administrative Workflow

Administrators have access to a dedicated dashboard to:
- **Product Management**: Create, update, and delete products with real-time image previews.
- **Order Tracking**: Monitor sales, update shipping statuses, and view customer details.
- **Content Management**: Update homepage banners and promotional content dynamically.

## 5. Development & Maintenance

Utility scripts located in `scripts/` assist with:
- `admin:setup`: Quickly creating or promoting admin users.
- `optimize:images`: Pre-processing assets for production.
- `db:check`: Verifying database connectivity and health.

---
For more detailed implementation guides, refer to the files in the `docs/` directory.
