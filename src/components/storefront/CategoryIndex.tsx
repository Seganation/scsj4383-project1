import Image from "next/image";
import Link from "next/link";
import prisma from "@/app/lib/db";
import { unstable_cache } from "next/cache";
import { ArrowUpRight } from "lucide-react";

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  "cooking-equipment":
    "https://picsum.photos/seed/archcool-cooking-equipment/1200/800",
  refrigeration:
    "https://picsum.photos/seed/archcool-refrigeration/1200/800",
  grills:
    "https://picsum.photos/seed/archcool-grills/1200/800",
};

const getCategoriesWithCounts = unstable_cache(
  async () => {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      imageUrl: c.imageUrl,
      productCount: c._count.products,
    }));
  },
  ["categories-with-counts"],
  { revalidate: 300, tags: ["categories"] }
);

export async function CategoryIndex() {
  const raw = await getCategoriesWithCounts();
  // Pick the first 3 as the editorial spotlight; everything else collapses
  // into a compact footer list so admins adding extra categories don't break
  // the layout.
  const spotlight = raw.slice(0, 3);
  const extras = raw.slice(3);

  return (
    <section className="relative bg-paper text-ink">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 lg:px-14 lg:py-32">
        {/* Section header */}
        <div className="grid grid-cols-12 items-end gap-8 pb-14">
          <div className="col-span-12 md:col-span-5">
            <span className="eyebrow">§ 01 — The catalogue</span>
            <h2 className="display mt-4 text-[clamp(2.5rem,5vw,4.5rem)] text-ink">
              Three rooms of the kitchen.
            </h2>
          </div>
          <div className="col-span-12 md:col-span-5 md:col-start-8">
            <p className="text-base leading-relaxed text-steel md:text-lg">
              We stock the equipment you actually touch every shift — hot
              line, cold line, and the prep that connects them. Browse the
              category or talk to a specialist who has speced a kitchen like
              yours.
            </p>
          </div>
        </div>

        {/* Editorial asymmetric grid: tall feature + two stacked */}
        <div className="grid grid-cols-12 gap-6">
          {spotlight.map((cat, idx) => {
            const href = `/products/category/${cat.slug}`;
            const img =
              CATEGORY_FALLBACK_IMAGES[cat.slug] || cat.imageUrl;
            const isFeature = idx === 0;

            return (
              <Link
                key={cat.id}
                href={href}
                className={
                  isFeature
                    ? "group relative col-span-12 overflow-hidden bg-ink md:col-span-7 md:row-span-2 aspect-[4/5]"
                    : "group relative col-span-12 overflow-hidden bg-ink sm:col-span-6 md:col-span-5 aspect-[4/3]"
                }
              >
                <Image
                  src={img}
                  alt={cat.name}
                  fill
                  sizes={
                    isFeature
                      ? "(max-width: 768px) 100vw, 58vw"
                      : "(max-width: 640px) 100vw, 42vw"
                  }
                  className="object-cover grayscale-[20%] transition-all duration-[900ms] ease-out group-hover:scale-[1.03] group-hover:grayscale-0"
                />
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, hsl(var(--ink) / 0.08) 0%, hsl(var(--ink) / 0.15) 55%, hsl(var(--ink) / 0.9) 100%)",
                  }}
                />

                {/* Top meta */}
                <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-6 text-paper/90">
                  <span className="eyebrow !text-paper/80">
                    {String(idx + 1).padStart(2, "0")} / {String(spotlight.length).padStart(2, "0")}
                  </span>
                  <span className="eyebrow !text-copper">
                    {cat.productCount} {cat.productCount === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Bottom lockup */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <div className="flex items-end justify-between gap-6">
                    <h3
                      className={`display text-paper ${isFeature ? "text-[clamp(2rem,4.5vw,4rem)]" : "text-3xl md:text-4xl"}`}
                    >
                      {cat.name}
                    </h3>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-paper/40 text-paper transition-all duration-300 group-hover:border-copper group-hover:bg-copper group-hover:text-ink">
                      <ArrowUpRight className="h-5 w-5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Overflow list for any extra admin-added categories */}
        {extras.length > 0 && (
          <div className="mt-10 border-t border-ink/10 pt-8">
            <span className="eyebrow">Also in stock</span>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {extras.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/products/category/${cat.slug}`}
                    className="link-sweep inline-flex items-baseline gap-2 font-display text-lg text-ink/90 hover:text-copper"
                  >
                    <span className="font-mono text-xs text-steel">
                      {String(cat.productCount).padStart(2, "0")}
                    </span>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
