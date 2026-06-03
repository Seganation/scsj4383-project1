import { InfiniteProductGrid } from "@/components/storefront/InfiniteProductGrid";
import { PageShell } from "@/components/storefront/PageShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products — The full catalogue",
  description:
    "Browse the full Archcool catalogue — commercial kitchen equipment, refrigeration and outdoor grills, all on one floor.",
  keywords: [
    "all products",
    "kitchen appliances",
    "outdoor equipment",
    "complete collection",
    "premium appliances",
    "kitchen equipment",
  ],
  alternates: {
    canonical: "https://archcoolstore.com/products",
  },
};

export default function AllProductsPage() {
  return (
    <PageShell
      section="§ 03 — Full catalogue"
      breadcrumbs={[{ name: "Home", href: "/" }, { name: "Catalogue" }]}
      title={
        <>
          All products,
          <br />
          <span className="italic text-copper">one floor.</span>
        </>
      }
      lede="Every published piece of Archcool gear in one searchable surface. Same editorial layout as the landing page, but built for deep discovery."
      aside={
        <div className="border border-ink/15 bg-paper-dim p-5">
          <div className="eyebrow-copper">§ Need help narrowing?</div>
          <p className="mt-3 text-sm leading-relaxed text-steel">
            Floor plan, service style, cover count — send us the brief and
            we'll come back with a focused short-list instead of a grid.
          </p>
          <a
            href="/contact"
            className="mt-4 inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-copper hover:text-ink"
          >
            Send a brief →
          </a>
        </div>
      }
    >
      <InfiniteProductGrid category="all" initialLimit={10} className="pb-6" />
    </PageShell>
  );
}
