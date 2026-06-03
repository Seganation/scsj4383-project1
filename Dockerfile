# Use official Node.js 20 Alpine image for smaller size
FROM node:20-alpine AS base

# Install dependencies only for packages that need them (sharp)
RUN apk add --no-cache libc6-compat

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
# Copy prisma schema before installing (needed for postinstall prisma generate)
COPY prisma ./prisma/

# Enable pnpm and install dependencies
RUN corepack enable pnpm && pnpm install --frozen-lockfile


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects anonymous telemetry data - disable it
ENV NEXT_TELEMETRY_DISABLED=1

# Set build-time environment variables (passed from GitHub Actions)
ARG NEXT_PUBLIC_APP_VERSION
ARG NEXT_PUBLIC_BUILD_TIME
ARG NEXT_PUBLIC_COMMIT_SHA

ENV NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION
ENV NEXT_PUBLIC_BUILD_TIME=$NEXT_PUBLIC_BUILD_TIME
ENV NEXT_PUBLIC_COMMIT_SHA=$NEXT_PUBLIC_COMMIT_SHA

# Provide minimal dummy env vars for build (won't be used at runtime)
# This satisfies Next.js page collection without exposing real secrets
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV BETTER_AUTH_SECRET="build-time-placeholder-secret-min-32-chars-long"
ENV UPLOADTHING_SECRET="sk_placeholder_build_secret"
ENV STRIPE_SECRET_KEY="sk_test_placeholder_build_secret"
ENV STRIPE_WEBHOOK_SECRET="whsec_placeholder_build_secret"

# Tell Next.js to skip static generation that requires DB
# Pages will be generated at runtime instead
ENV NEXT_PHASE="phase-production-build"
ENV SKIP_STATIC_GENERATION="true"

# Build the application
RUN corepack enable pnpm && pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
