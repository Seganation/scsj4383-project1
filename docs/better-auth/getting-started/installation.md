Installation
Install the Package
Let's start by adding Better Auth to your project:

npm
pnpm
yarn
bun

pnpm add better-auth
If you're using a separate client and server setup, make sure to install Better Auth in both parts of your project.

Set Environment Variables
Create a .env file in the root of your project and add the following environment variables:

Secret Key
Random value used by the library for encryption and generating hashes. You can generate one using the button below or you can use something like openssl.

.env

BETTER_AUTH_SECRET=
Generate Secret
Set Base URL
.env

BETTER_AUTH_URL=http://localhost:3000 #Base URL of your app
Create A Better Auth Instance
Create a file named auth.ts in one of these locations:

Project root
lib/ folder
utils/ folder
You can also nest any of these folders under src/, app/ or server/ folder. (e.g. src/lib/auth.ts, app/lib/auth.ts).

And in this file, import Better Auth and create your auth instance. Make sure to export the auth instance with the variable name auth or as a default export.

auth.ts

import { betterAuth } from "better-auth";

export const auth = betterAuth({
//...
})
Configure Database
Better Auth requires a database to store user data. You can easily configure Better Auth to use SQLite, PostgreSQL, or MySQL, with Kysely handling queries and migrations for these databases.

sqlite
postgres
mysql
auth.ts

import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
database: new Pool({
// connection options
})
})
You can also provide any Kysely dialect or a Kysely instance to the database option.

Example with LibsqlDialect:

auth.ts

import { betterAuth } from "better-auth";
import { LibsqlDialect } from "@libsql/kysely-libsql";

const dialect = new LibsqlDialect({
url: process.env.TURSO_DATABASE_URL || "",
authToken: process.env.TURSO_AUTH_TOKEN || "",
})

export const auth = betterAuth({
database: {
dialect,
type: "sqlite"
}
});
Adapters

If you prefer to use an ORM or if your database is not supported by Kysely, you can use one of the built-in adapters.

prisma
drizzle
mongodb
auth.ts

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();
export const auth = betterAuth({
database: prismaAdapter(prisma, {
provider: "sqlite", // or "mysql", "postgresql", ...etc
}),
});
Create Database Tables
Better Auth includes a CLI tool to help manage the schema required by the library.

Generate: This command generates an ORM schema or SQL migration file.
If you're using Kysely, you can apply the migration directly with migrate command below. Use generate only if you plan to apply the migration manually.

Terminal

npx @better-auth/cli generate
Migrate: This command creates the required tables directly in the database. (Available only for the built-in Kysely adapter)
Terminal

npx @better-auth/cli migrate
see the CLI documentation for more information.

If you instead want to create the schema manually, you can find the core schema required in the database section.

Authentication Methods
Configure the authentication methods you want to use. Better Auth comes with built-in support for email/password, and social sign-on providers.

auth.ts

import { betterAuth } from "better-auth"

export const auth = betterAuth({
//...other options
emailAndPassword: {
enabled: true
},
socialProviders: {
github: {
clientId: process.env.GITHUB_CLIENT_ID as string,
clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
},
},
});
You can use even more authentication methods like passkey, username, magic link and more through plugins.

Mount Handler
To handle API requests, you need to set up a route handler on your server.

Create a new file or route in your framework's designated catch-all route handler. This route should handle requests for the path /api/auth/\* (unless you've configured a different base path).

Better Auth supports any backend framework with standard Request and Response objects and offers helper functions for popular frameworks.

next-js
nuxt
svelte-kit
remix
solid-start
hono
express
elysia
tanstack-start
expo
/app/api/auth/[...all]/route.ts

import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
Create Client Instance
The client-side library helps you interact with the auth server. Better Auth comes with a client for all the popular web frameworks, including vanilla JavaScript.

Import createAuthClient from the package for your framework (e.g., "better-auth/react" for React).
Call the function to create your client.
Pass the base URL of your auth server. (If the auth server is running on the same domain as your client, you can skip this step.)
If you're using a different base path other than /api/auth make sure to pass the whole URL including the path. (e.g. http://localhost:3000/custom-path/auth)

react
vue
svelte
solid
vanilla
lib/auth-client.ts

import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
/\*_ The base URL of the server (optional if you're using the same domain) _/
baseURL: "http://localhost:3000"
})
Tip: You can also export specific methods if you prefer:

export const { signIn, signUp, useSession } = createAuthClient()
🎉 That's it!
That's it! You're now ready to use better-auth in your application. Continue to basic usage to learn how to use the auth instance to sign in users.
