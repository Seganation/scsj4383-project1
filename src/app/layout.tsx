import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "@uploadthing/react/styles.css";
import "./globals.css";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import { QueryProvider } from "@/components/query-provider";
import { Analytics } from "@vercel/analytics/next";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow zooming for accessibility (was 1)
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: {
    default: "ArchCool Store - Premium Kitchen & Outdoor Equipment",
    template: "%s | ArchCool Store",
  },
  description:
    "Shop premium kitchen appliances, outdoor grills, and refrigeration units at ArchCool Store. Grill season specials, cooking equipment, and summer sales up to 50% off.",
  keywords: [
    "kitchen appliances",
    "outdoor grills",
    "refrigeration units",
    "cooking equipment",
    "kitchen equipment",
    "commercial appliances",
    "grill season",
    "summer sale",
    "archcool",
    "premium appliances",
  ],
  authors: [{ name: "ArchCool Store" }],
  creator: "ArchCool Store",
  publisher: "ArchCool Store",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ArchCool Store",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    logo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/logo.png`,
    description:
      "Premium kitchen appliances, outdoor grills, and refrigeration units",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-555-ARCHCOOL",
      contactType: "customer service",
      availableLanguage: "English",
    },
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link
          rel="icon"
          href="/favicon-16x16.png"
          sizes="16x16"
          type="image/png"
        />
        <link
          rel="icon"
          href="/favicon-32x32.png"
          sizes="32x32"
          type="image/png"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon.png"
          sizes="180x180"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${instrumentSans.variable} ${fraunces.variable} ${jetbrainsMono.variable} font-sans antialiased bg-paper text-ink`}
      >
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <QueryProvider>{children}</QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
