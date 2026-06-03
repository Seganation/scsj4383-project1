import { MetadataRoute } from "next";
import prisma from "@/app/lib/db";
import { isBuildTime } from "@/lib/build-time";

// Prevent static generation during build
export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // If we're in build time (Docker build), return minimal sitemap
  if (isBuildTime()) {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
    ];
  }

  try {
    // Get all published products
    const products = await prisma.product.findMany({
      where: { status: "published" },
      select: { name: true, createdAt: true },
    });

    // Get all categories
    const categories = await prisma.category.findMany({
      select: { slug: true },
    });

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${baseUrl}/products/category/all`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${baseUrl}/bag`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
    ];

    // Product category routes
    const categoryRoutes: MetadataRoute.Sitemap = categories.map(
      (category) => ({
        url: `${baseUrl}/products/category/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      })
    );

    // Product detail routes
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/products/${encodeURIComponent(product.name)}`,
      lastModified: product.createdAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return basic sitemap if database fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
    ];
  }
}
