
# Archcool E-commerce Platform: Project Documentation

This document provides a comprehensive overview of the Archcool e-commerce platform, detailing its architecture, features, and technical implementation.

## 1. Project Overview

Archcool is a modern, full-stack e-commerce application built with Next.js, TypeScript, and other leading web technologies. It provides a complete online shopping experience, from browsing products to secure checkout. The platform also includes a dedicated dashboard for administrators to manage products, orders, and other store-related data.

### 1.1. Core Technologies

- **Framework:** [Next.js](https://nextjs.org/) (React framework for server-side rendering and static site generation)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Statically typed superset of JavaScript)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS framework)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/) (Accessible and customizable UI components)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (via [Prisma ORM](https://www.prisma.io/))
- **Authentication:** [Kinde](https://kinde.com/) (for secure user authentication)
- **Payment Processing:** [Stripe](https://stripe.com/) (for handling online payments)
- **File Uploads:** [UploadThing](https://uploadthing.com/) (for managing product image uploads)
- **In-memory Data Store:** [Redis](https://redis.io/) (for caching and session management)

### 1.2. Key Features

- **Storefront:**
  - Product browsing and filtering by category
  - Detailed product pages with image sliders
  - Shopping cart functionality
  - Secure checkout with Stripe
  - User authentication and profile management
- **Dashboard (Admin):**
  - Product creation, editing, and deletion
  - Order management and tracking
  - Sales analytics and reporting
  - Banner management for promotional content

## 2. Project Structure

The project is organized into several key directories:

- **`/app`**: The core of the Next.js application, containing all routes, UI components, and business logic.
  - **`/app/(storefront)`**: Routes and components for the customer-facing storefront.
  - **`/app/dashboard`**: Routes and components for the admin dashboard.
  - **`/app/api`**: API routes for handling server-side logic, such as authentication, payment processing, and file uploads.
  - **`/app/components`**: Reusable React components used throughout the application.
  - **`/app/lib`**: Utility functions, database connection, and other shared modules.
- **`/components`**: Additional UI components, particularly those from Shadcn UI.
- **`/lib`**: General utility functions.
- **`/prisma`**: Prisma schema and database-related files.
- **`/public`**: Static assets, such as images and fonts.

## 3. Database Schema

The database schema is defined in `/prisma/schema.prisma` and includes the following models:

- **`User`**: Stores user information, including name, email, and profile image.
- **`Product`**: Represents a product in the store, with fields for name, description, price, images, and category.
- **`Order`**: Tracks customer orders, including order details, payment information, and shipping status.
- **`Banner`**: Manages promotional banners displayed on the storefront.

## 4. Authentication Flow

User authentication is handled by Kinde. When a user signs up or logs in, Kinde creates a new user record in the database and manages their session. The application uses Kinde's server-side helpers to protect routes and access user information.

## 5. Payment Processing

Stripe is integrated for secure payment processing. When a user proceeds to checkout, the application creates a Stripe Checkout session and redirects the user to the Stripe payment page. After the payment is completed, Stripe sends a webhook to the application to confirm the order and update its status.

## 6. File Uploads

Product images are uploaded using UploadThing. The application provides a secure endpoint for uploading files, which are then stored in a cloud storage bucket. The URLs of the uploaded images are saved in the `Product` model.

## 7. Deployment

The application is designed to be deployed on a modern hosting platform like Vercel or Netlify. The deployment process involves connecting the Git repository, configuring environment variables, and running the build command.

This documentation provides a high-level overview of the Archcool e-commerce platform. For more detailed information, please refer to the source code and the documentation of the individual technologies used in the project.
