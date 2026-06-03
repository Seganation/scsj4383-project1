import { Hero } from "@/components/storefront/Hero";
import { ManifestoStrip } from "@/components/storefront/ManifestoStrip";
import { CategoryIndex } from "@/components/storefront/CategoryIndex";
import { FeaturedProducts } from "@/components/storefront/FeaturedProducts";
import { CredibilityStats } from "@/components/storefront/CredibilityStats";
import { SpecialistCTA } from "@/components/storefront/SpecialistCTA";
import { ClientNavbar } from "@/components/storefront/ClientNavbar";
import { Footer } from "@/components/storefront/Footer";
import type { Metadata } from "next";

// Force dynamic rendering (don't generate at build time)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Commercial kitchen equipment — ArchCool",
  description:
    "Restaurant-grade ovens, grills, refrigeration and prep gear, speced by chefs and installed by engineers. UK-wide next-day delivery.",
  keywords: [
    "commercial kitchen equipment",
    "restaurant appliances",
    "professional grills",
    "commercial refrigeration",
    "kitchen fit-out",
    "hospitality equipment",
  ],
  alternates: {
    canonical: "https://archcoolstore.com",
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ArchCool Store",
    url: "https://archcoolstore.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://archcoolstore.com/products/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const storeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "ArchCool Store",
    description:
      "Commercial kitchen equipment for restaurants and hospitality operators.",
    url: "https://archcoolstore.com",
    telephone: "+1-555-ARCHCOOL",
    address: {
      "@type": "PostalAddress",
      addressCountry: "UK",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
      />
      <ClientNavbar />
      <main className="bg-paper text-ink">
        <Hero />
        <ManifestoStrip />
        <CategoryIndex />
        <FeaturedProducts />
        <CredibilityStats />
        <SpecialistCTA />
      </main>
      <Footer />
    </>
  );
}
