# Archcool E-Commerce Platform

🌟 Modern e-commerce platform built with the latest technologies: Next.js, Kinde-Auth, Neon Database, TanStack Query, Prisma, Stripe, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PNPM 8+ (recommended package manager)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd archcool

# Install dependencies using pnpm
pnpm install

# Set up environment variables
cp .env.example .env.local
# Fill in your environment variables

# Set up the database
pnpm prisma generate
pnpm prisma db push

# Start development server
pnpm dev
```

### 🚀 Kinde Auth: https://dub.sh/xeU8r3v

## � Features

- 🌐 Next.js App Router with TypeScript
- 🔐 Kinde Authentication with MFA
- 📧 Passwordless Authentication
- 🔑 OAuth (Google and GitHub)
- 💰 Payments using Stripe
- 🪝 Stripe Webhooks Implementation
- 💿 Neon PostgreSQL Database
- 💨 Prisma ORM
- ⚡ TanStack Query for State Management (replaced Redis)
- 🛒 Real-time Cart Management
- 📈 Recharts for Analytics Dashboard
- ✅ Server Validation using Zod and Conform
- 🗂️ File Upload with Uploadthing
- 🎨 Styling with Tailwind CSS and Shadcn UI
- 🔥 React Hot Toast for Notifications
- 😶‍🌫️ Deployment Ready for Vercel

## 📝 Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm dev:debug    # Start with debugging enabled

# Building
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm type-check   # Run TypeScript type checking

# Database
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database
pnpm db:migrate   # Run database migrations
pnpm db:studio    # Open Prisma Studio

# Package Management
pnpm add <package>        # Add dependency
pnpm add -D <package>     # Add dev dependency
pnpm remove <package>     # Remove dependency
pnpm update              # Update all dependencies
pnpm audit               # Security audit
```

## 🏗️ Architecture

- **Frontend**: Next.js 14 with App Router
- **Backend**: Next.js API Routes
- **Database**: Neon PostgreSQL with Prisma ORM
- **Authentication**: Kinde Auth
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS + Shadcn UI
- **Payments**: Stripe
- **File Storage**: Uploadthing
- **Deployment**: Vercel

## 📚 Documentation

- [TanStack Query Implementation](./docs/tanstack-query-implementation.md)
- [PNPM Migration Guide](./docs/pnpm-migration.md)
- [Issues and Improvements](./docs/issues_and_improvements.md)
- [Project Documentation](./docs/project_docs.md)

## 🔧 Technologies

- **Next.js**: https://nextjs.org
- **Kinde**: https://dub.sh/xeU8r3v
- **Tailwind CSS**: https://tailwindcss.com
- **Shadcn/UI**: https://ui.shadcn.com
- **Stripe**: https://stripe.com
- **Prisma**: https://prisma.io
- **Neon**: https://neon.tech/
- **TanStack Query**: https://tanstack.com/query
- **React Hot Toast**: https://react-hot-toast.com
- **Recharts**: https://recharts.org/

## Products

### Product one

- Title: ULTRABOOST 1.0 ATR
- Price: 240
- Description An everyday sneaker with high-quality performance features. This Ultraboost shoe comes with metal buckles instead of laces, perfectly complementing its sleek, modern design. The adidas PRIMEKNIT upper wraps your foot snugly, and the energy-returning BOOST cushioning provides a comfortable feel and optimal support.
- Images in Public Folder

### Product Two

- Title: VaporMax 2023 Flyknit
- Price: $220
- Description: Have you ever walked on air? Check out the Air VaporMax 2023 to see how it feels. The perforated insole reveals the innovative technology (remove it to see more). The stretchy Flyknit upper is made from at least 20% recycled material by weight.
- Images in Public Folder

### Product Three

- Title: Nike Air Max Plus
- Price: 210
- Description: This tuned Nike Air design stands out with top-notch stability, unparalleled cushioning, and adds that special something to your style. Featuring classic '90s style, breathable mesh, and nature-inspired design lines, you can celebrate your bold style with great comfort.
- Images in public folder

### Product Four

- Title: ULTRABOOST DNA 5.0
- Price: 180
- Description: So much more than just a running shoe – with this adidas Ultraboost, you are perfectly equipped for everyday life. This version for kids and teens comes with all the functional features that runners swear by. Additionally, it provides pure comfort. You can thank the soft adidas PRIMEKNIT upper and the energy-returning BOOST midsole for that.
- Images in public folder





todo:


so can we also do another implementation for the headers icon of the users loged in circle icon displaying an image or whatever the ddropdown menu in the header for logged in users what 