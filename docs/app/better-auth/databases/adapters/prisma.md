Prisma
Prisma ORM is an open-source database toolkit that simplifies database access and management in applications by providing a type-safe query builder and an intuitive data modeling interface. Read more here.

Example Usage
Make sure you have Prisma installed and configured. Then, you can use the Prisma adapter to connect to your database.

auth.ts

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
database: prismaAdapter(prisma, {
provider: "sqlite",
}),
});
If you have configured a custom output directory in your schema.prisma file (e.g., output = "../src/generated/prisma"), make sure to import the Prisma client from that location instead of @prisma/client. Learn more about custom output directories in the Prisma documentation.

Schema generation & migration
The Better Auth CLI allows you to generate or migrate your database schema based on your Better Auth configuration and plugins.

Prisma Schema Generation

Prisma Schema Migration

✅ Supported ❌ Not Supported
Schema Generation

npx @better-auth/cli@latest generate
Additional Information
If you're looking for performance improvements or tips, take a look at our guide to performance optimizations.
