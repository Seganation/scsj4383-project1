import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/app/lib/db";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";
import { ImageSliderWithZoom } from "@/components/storefront/ImageSliderWithZoom";
import { RelatedProductCard } from "@/components/storefront/RelatedProductCard";
import type { Metadata } from "next";
import { isBuildTime } from "@/lib/build-time";
import { ArrowUpRight, Check, Phone, Truck, Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ name: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (isBuildTime()) {
    return { title: "Product", description: "Product details" };
  }
  const { name } = await params;
  const product = await prisma.product.findFirst({
    where: { name: { equals: decodeURIComponent(name), mode: "insensitive" } },
    include: { category: true },
  });
  if (!product) {
    return { title: "Product Not Found", description: "The requested product could not be found." };
  }
  const price = product.price;
  const images =
    product.images && product.images.length > 0 ? product.images : ["/placeholder.png"];
  return {
    title: product.name,
    description:
      product.description ||
      `Shop ${product.name} at ArchCool Store. Premium ${product.category?.name?.toLowerCase() || ""} equipment.`,
    keywords: [product.name, product.category?.name || "", "kitchen equipment", "archcool"].filter(Boolean),
    openGraph: {
      title: `${product.name} — £${price}`,
      description: product.description,
      images: [{ url: images[0].startsWith("/") ? `https://archcoolstore.com${images[0]}` : images[0], width: 800, height: 600, alt: product.name }],
      url: `https://archcoolstore.com/products/${encodeURIComponent(product.name)}`,
      type: "website",
      siteName: "ArchCool Store",
    },
    twitter: { card: "summary_large_image", title: `${product.name} — £${price}`, description: product.description },
    alternates: { canonical: `https://archcoolstore.com/products/${encodeURIComponent(product.name)}` },
  };
}

export default async function ProductDetailsPage({ params }: Props) {
  if (isBuildTime()) return notFound();

  const { name } = await params;
  const product = await prisma.product.findFirst({
    where: { name: { equals: decodeURIComponent(name), mode: "insensitive" } },
    include: { category: true },
  });
  if (!product) return notFound();

  const images =
    product.images && product.images.length > 0 ? product.images : ["/placeholder.png"];

  let relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      status: "published",
      NOT: { name: product.name },
    },
    select: { id: true, name: true, description: true, price: true, images: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
  if (relatedProducts.length === 0) {
    relatedProducts = await prisma.product.findMany({
      where: { status: "published", NOT: { name: product.name } },
      select: { id: true, name: true, description: true, price: true, images: true },
      take: 4,
      orderBy: { createdAt: "desc" },
    });
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images,
    brand: { "@type": "Brand", name: "ArchCool Store" },
    offers: {
      "@type": "Offer",
      url: `https://archcoolstore.com/products/${encodeURIComponent(product.name)}`,
      priceCurrency: "GBP",
      price: product.price,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "ArchCool Store" },
    },
    category: product.category?.name || "Kitchen Equipment",
    sku: product.id,
  };

  const skuShort = product.id.slice(0, 8).toUpperCase();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      {/* Breadcrumb strip */}
      <div className="border-b border-ink/10 bg-paper-dim">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-6 py-4 md:px-10 lg:px-14">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-steel-light"
          >
            <Link href="/" className="hover:text-copper">Home</Link>
            <span className="text-copper/60">/</span>
            <Link href="/products/category/all" className="hover:text-copper">Catalogue</Link>
            {product.category && (
              <>
                <span className="text-copper/60">/</span>
                <Link
                  href={`/products/category/${product.category.slug}`}
                  className="hover:text-copper"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span className="text-copper/60">/</span>
            <span className="truncate text-ink">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product stage */}
      <section className="mx-auto max-w-[1440px] px-6 py-12 md:px-10 md:py-16 lg:px-14 lg:py-20">
        <div className="grid grid-cols-12 gap-10 lg:gap-14">
          {/* Gallery */}
          <div className="col-span-12 lg:col-span-7">
            <div className="border border-ink/10 bg-paper-dim p-4 md:p-6">
              <ImageSliderWithZoom images={images} />
            </div>
          </div>

          {/* Info column */}
          <div className="col-span-12 lg:col-span-5">
            <div className="sticky top-28 space-y-8">
              <div>
                <div className="flex items-center gap-3">
                  {product.category && (
                    <span className="border border-ink px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink">
                      {product.category.name}
                    </span>
                  )}
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-steel-light">
                    SKU · {skuShort}
                  </span>
                </div>
                <h1 className="display mt-5 text-[clamp(2rem,4vw,3.25rem)] text-ink">
                  {product.name}
                </h1>

                <div className="mt-6 flex items-baseline gap-3 border-t border-ink/10 pt-6">
                  <span className="font-display text-5xl font-semibold tabular-nums text-ink">
                    £{product.price.toLocaleString("en-GB")}
                  </span>
                  <span className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-steel-light">
                    GBP · incl. VAT
                  </span>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="border-t border-ink/10 pt-6">
                  <div className="eyebrow-copper">§ The spec</div>
                  <p className="mt-3 whitespace-pre-line text-[0.95rem] leading-relaxed text-steel">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Guarantees */}
              <ul className="grid grid-cols-1 gap-3 border-t border-ink/10 pt-6">
                <GuaranteeRow
                  icon={<Truck className="h-4 w-4" />}
                  label="UK delivery"
                  body="Quoted at checkout · typ. 48 hrs, most regions"
                />
                <GuaranteeRow
                  icon={<Wrench className="h-4 w-4" />}
                  label="Engineer install"
                  body="Optional install by trade-certified engineers"
                />
                <GuaranteeRow
                  icon={<Check className="h-4 w-4" />}
                  label="12-month warranty"
                  body="Full cover, parts and labour, via our break-fix line"
                />
              </ul>

              {/* Actions */}
              <div className="space-y-3 border-t border-ink/10 pt-6">
                <AddToCartButton
                  productId={product.id}
                  productName={product.name}
                  productPrice={product.price}
                  productImageUrl={images[0]}
                />
                <Link
                  href="/contact"
                  className="btn-ghost w-full border-ink/30"
                >
                  <Phone className="h-4 w-4" />
                  Talk to a specialist
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews placeholder — editorial */}
      <section className="border-t border-ink/10 bg-paper-dim">
        <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-8 px-6 py-16 md:px-10 lg:px-14">
          <div className="col-span-12 md:col-span-5">
            <div className="eyebrow-copper">§ 07 — On the record</div>
            <h2 className="display mt-4 text-[clamp(1.75rem,3vw,2.5rem)] text-ink">
              Reviews on this unit.
            </h2>
          </div>
          <div className="col-span-12 md:col-span-6 md:col-start-7">
            <div className="border border-dashed border-ink/25 bg-paper p-8 text-center">
              <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-steel-light">
                Reviews in calibration
              </p>
              <p className="mt-4 text-steel">
                We collect reviews directly from verified installs — this unit
                hasn't accumulated a public set yet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-ink/10 bg-paper">
          <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-10 lg:px-14 lg:py-20">
            <div className="mb-10 grid grid-cols-12 items-end gap-6">
              <div className="col-span-12 md:col-span-8">
                <div className="eyebrow-copper">§ 08 — Adjacent in the catalogue</div>
                <h2 className="display mt-4 text-[clamp(1.75rem,3vw,2.75rem)] text-ink">
                  More from{" "}
                  <span className="italic text-copper">{product.category?.name}</span>
                </h2>
              </div>
              <div className="col-span-12 md:col-span-3 md:col-start-10 md:justify-self-end">
                <Link
                  href={`/products/category/${product.category?.slug || "all"}`}
                  className="inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-ink hover:text-copper"
                >
                  See full section
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 items-start">
              {relatedProducts.map((item) => (
                <RelatedProductCard item={item} key={item.id} userId={null} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function GuaranteeRow({
  icon,
  label,
  body,
}: {
  icon: React.ReactNode;
  label: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-ink text-ink">
        {icon}
      </span>
      <div>
        <div className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-ink">
          {label}
        </div>
        <div className="mt-0.5 text-[0.85rem] text-steel-light">{body}</div>
      </div>
    </li>
  );
}
