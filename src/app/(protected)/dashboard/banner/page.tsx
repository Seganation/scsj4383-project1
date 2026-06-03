import prisma from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";
import { BannersClient } from "./BannersClient";

async function getData() {
  const data = await prisma.banner.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return data;
}

export default async function BannerRoute() {
  noStore();
  const data = await getData();
  return <BannersClient data={data} />;
}
