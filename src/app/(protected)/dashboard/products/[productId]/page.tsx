import { EditForm } from "@/components/dashboard/EditForm";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

async function getData(productId: string) {
  const data = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      category: true,
    },
  });

  if (!data) {
    return notFound();
  }

  // Transform to match EditForm's expected shape
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    status: data.status,
    price: data.price,
    images: data.images,
    category: data.category?.slug || data.categoryId,
    isFeatured: data.isFeatured,
  };
}

export default async function EditRoute({ params }: { params: Promise<{ productId: string }> }) {
  noStore();
  const { productId } = await params;
  const data = await getData(productId);
  return <EditForm data={data} />;
}
