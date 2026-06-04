import path from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required for Docker deployment (Dockerfile uses .next/standalone)
  output: "standalone",
  // Turbopack resolves the `types` condition of @uploadthing packages,
  // pulling in .d.cts declaration files as modules → transpilePackages forces
  // SWC to own the transpilation and use only the `import` condition instead.
  transpilePackages: [
    "uploadthing",
    "@uploadthing/react",
    "@uploadthing/shared",
    "@uploadthing/mime-types",
  ],
  experimental: {
    optimizePackageImports: [
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "lucide-react",
      "react-icons",
      "framer-motion",
      "recharts",
    ],
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      // Keep legacy compatibility while existing DB rows are migrated.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    qualities: [75, 92],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Basic security headers
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(self)",
          },
          // Content Security Policy - protects against XSS
          // 'unsafe-eval' is dev-only (Next/Turbopack HMR); production drops it.
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              `script-src 'self' ${process.env.NODE_ENV === "production" ? "" : "'unsafe-eval'"} 'unsafe-inline' https://js.stripe.com https://maps.googleapis.com; ` +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "font-src 'self' https://fonts.gstatic.com; " +
              "img-src 'self' data: https: blob:; " +
              "connect-src 'self' https://api.stripe.com https://maps.googleapis.com https://utfs.io https://*.ufs.sh; " +
              "frame-src https://js.stripe.com https://hooks.stripe.com; " +
              "worker-src 'self' blob:; " +
              "object-src 'none'; base-uri 'self'; form-action 'self'; " +
              "frame-ancestors 'none'; upgrade-insecure-requests;",
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/:path*\\.(jpg|jpeg|png|gif|ico|svg|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  webpack(config) {
    // pnpm creates separate node_modules copies per peer-dep hash, so react-query-devtools
    // gets its own @tanstack/react-query instance (different QueryClientContext object).
    // Alias both to the canonical path to merge all instances into one.
    const tanstackRQ = path.resolve(
      __dirname,
      "node_modules/.pnpm/@tanstack+react-query@5.99.0_react@19.1.0/node_modules/@tanstack/react-query"
    );
    const tanstackQCore = path.resolve(
      __dirname,
      "node_modules/.pnpm/@tanstack+query-core@5.99.0/node_modules/@tanstack/query-core"
    );
    config.resolve.alias["@tanstack/react-query"] = tanstackRQ;
    config.resolve.alias["@tanstack/query-core"] = tanstackQCore;
    return config;
  },
};

export default nextConfig;
