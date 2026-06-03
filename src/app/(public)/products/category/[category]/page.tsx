import { InfiniteProductGrid } from "@/components/storefront/InfiniteProductGrid";
import { PageShell } from "@/components/storefront/PageShell";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;

  const categoryData = {
    all: {
      title: "All Products",
      description:
        "Browse our complete collection of premium kitchen appliances, outdoor grills, and refrigeration units. Find the perfect equipment for your home or business.",
      keywords: [
        "all products",
        "kitchen appliances",
        "outdoor equipment",
        "complete collection",
      ],
    },
    "cooking-equipment": {
      title: "Cooking Equipment",
      description:
        "Discover professional-grade cooking equipment including ranges, ovens, cooktops, and more. Upgrade your kitchen with premium cooking appliances.",
      keywords: [
        "cooking equipment",
        "kitchen appliances",
        "professional ranges",
        "ovens",
        "cooktops",
      ],
    },
    refrigeration: {
      title: "Refrigeration Units",
      description:
        "Shop premium refrigeration units including commercial refrigerators, freezers, and cooling systems. Energy-efficient and reliable refrigeration solutions.",
      keywords: [
        "refrigeration",
        "commercial refrigerators",
        "freezers",
        "cooling systems",
        "energy efficient",
      ],
    },
    grills: {
      title: "Outdoor Grills",
      description:
        "Grill season is here! Shop our premium outdoor grills including gas grills, charcoal grills, and smokers. Perfect for backyard BBQ and outdoor cooking.",
      keywords: [
        "outdoor grills",
        "grill season",
        "gas grills",
        "charcoal grills",
        "BBQ",
        "smokers",
      ],
    },
  };

  const meta =
    categoryData[category as keyof typeof categoryData] || categoryData.all;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,

    alternates: {
      canonical: `https://archcoolstore.com/products/category/${category}`,
    },
  };
}

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  // Validate category
  const validCategories = [
    "all",
    "cooking-equipment",
    "refrigeration",
    "grills",
  ];
  if (!validCategories.includes(category)) {
    return notFound();
  }

  const categoryTitles = {
    all: "All Products",
    "cooking-equipment": "Cooking Equipment",
    refrigeration: "Refrigeration",
    grills: "Grills",
  };
  const categoryDescriptions = {
    all: "Everything we currently stock for the commercial kitchen floor.",
    "cooking-equipment":
      "Heat, fire, and throughput — ranges, ovens, and cooking-line essentials.",
    refrigeration:
      "Cold storage built for service reliability, safe holding, and prep flow.",
    grills:
      "Gas, charcoal, and smoking equipment for volume and consistency.",
  };

  const title = categoryTitles[category as keyof typeof categoryTitles];
  const description =
    categoryDescriptions[category as keyof typeof categoryDescriptions];

  const sectionCode: Record<string, string> = {
    all: "§ 03 — Full catalogue",
    "cooking-equipment": "§ 03.01 — Hot line",
    refrigeration: "§ 03.02 — Cold line",
    grills: "§ 03.03 — Fire & smoke",
  };

  return (
    <PageShell
      section={sectionCode[category] || "§ 03 — Category"}
      breadcrumbs={[
        { name: "Home", href: "/" },
        { name: "Catalogue", href: "/products/category/all" },
        { name: title },
      ]}
      title={
        <>
          {title.split(" ").slice(0, -1).join(" ")}{" "}
          <span className="italic text-copper">
            {title.split(" ").slice(-1)}
          </span>
        </>
      }
      lede={description}
      aside={
        <div className="border border-ink/15 bg-paper-dim p-5">
          <div className="eyebrow-copper">Section brief</div>
          <p className="mt-3 text-sm leading-relaxed text-steel">
            Not sure what's right for your service? Send us your floor plan
            and we'll match the gear to your volume, not your cart total.
          </p>
          <a
            href="/contact"
            className="mt-4 inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-copper hover:text-ink"
          >
            Talk to a specialist →
          </a>
        </div>
      }
    >
      <InfiniteProductGrid
        category={category}
        initialLimit={10}
        className="pb-6"
      />
    </PageShell>
  );
}
