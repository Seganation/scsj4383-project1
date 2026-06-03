import prisma from "@/lib/db";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductTile } from "./ProductTile";

const FEATURED_LIMIT = 7;

const getFeaturedProducts = unstable_cache(
  async () => {
    // Prefer explicitly featured products. Top up with the newest published
    // products if fewer than FEATURED_LIMIT are flagged.
    const [featured, backfill] = await Promise.all([
      prisma.product.findMany({
        where: { isFeatured: true, status: "published" },
        orderBy: { createdAt: "desc" },
        take: FEATURED_LIMIT,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          images: true,
          category: { select: { name: true, slug: true } },
        },
      }),
      prisma.product.findMany({
        where: { isFeatured: false, status: "published" },
        orderBy: { createdAt: "desc" },
        take: FEATURED_LIMIT,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          images: true,
          category: { select: { name: true, slug: true } },
        },
      }),
    ]);
    const merged = [...featured];
    for (const p of backfill) {
      if (merged.length >= FEATURED_LIMIT) break;
      if (!merged.find((m) => m.id === p.id)) merged.push(p);
    }
    return merged.slice(0, FEATURED_LIMIT);
  },
  ["featured-products-v2"],
  { revalidate: 300, tags: ["products", "featured-products"] }
);

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  if (!products || products.length === 0) {
    return (
      <section className="bg-paper text-ink">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center text-steel">
          No featured products available yet.
        </div>
      </section>
    );
  }

  // Layout: first product is "the hero pick" (tall, spans 2 rows on md+).
  // Remaining six fill a 3x2 grid to the right/below in a dense mosaic.
  const [hero, ...rest] = products;

  return (
    <section className="relative bg-paper text-ink">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 lg:px-14 lg:py-32">
        {/* Section header */}
        <div className="grid grid-cols-12 items-end gap-8 pb-14">
          <div className="col-span-12 md:col-span-6">
            <span className="eyebrow">§ 02 — On the floor</span>
            <h2 className="display mt-4 text-[clamp(2.5rem,5vw,4.5rem)]">
              Seven pieces,
              <br />
              <span className="italic text-copper">hand-picked.</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-4 md:col-start-9">
            <p className="text-steel">
              A curated cross-section of what's working in kitchens this
              season — no endless scroll, no dead SKUs.
            </p>
            <Link
              href="/products"
              className="link-sweep mt-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-ink"
            >
              See full catalogue
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-5 md:gap-6">
          {/* Hero product */}
          <ProductTile product={hero} size="hero" index={0} />

          {/* 6 rest */}
          {rest.map((p, i) => (
            <ProductTile key={p.id} product={p} size="standard" index={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
