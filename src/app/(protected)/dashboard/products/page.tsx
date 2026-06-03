import prisma from "@/app/lib/db";
import { unstable_noStore as noStore } from "next/cache";
import { ProductsClient } from "./ProductsClient";

async function getData() {
  const data = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return data;
}

export default async function ProductsRoute() {
  noStore();
  const data = await getData();
  return <ProductsClient data={data} />;
}
