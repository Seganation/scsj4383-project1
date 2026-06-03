import prisma from "@/app/lib/db";
import { CategoriesClient } from "./CategoriesClient";

async function getCategories() {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export default async function CategoriesPage() {
  const categories = await getCategories();
  return <CategoriesClient categories={categories} />;
}
