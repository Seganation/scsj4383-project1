PostgreSQL
PostgreSQL is a powerful, open-source relational database management system known for its advanced features, extensibility, and support for complex queries and large datasets. Read more here.

Example Usage
Make sure you have PostgreSQL installed and configured. Then, you can connect it straight into Better Auth.

auth.ts

import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
database: new Pool({
connectionString: "postgres://user:password@localhost:5432/database",
}),
});
For more information, read Kysely's documentation to the PostgresDialect.

Schema generation & migration
The Better Auth CLI allows you to generate or migrate your database schema based on your Better Auth configuration and plugins.

PostgreSQL Schema Generation

PostgreSQL Schema Migration

✅ Supported ✅ Supported
Schema Generation

npx @better-auth/cli@latest generate
Schema Migration

npx @better-auth/cli@latest migrate
Additional Information
PostgreSQL is supported under the hood via the Kysely adapter, any database supported by Kysely would also be supported. (Read more here)

If you're looking for performance improvements or tips, take a look at our guide to performance optimizations.
