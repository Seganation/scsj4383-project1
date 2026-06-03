import prisma from "@/lib/db";
import { unstable_cache } from "next/cache";
import { HeroClient } from "./HeroClient";

// Cache banner data for 5 minutes to improve performance
const getCachedBanners = unstable_cache(
  async () => {
    const data = await prisma.banner.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        imageString: true,
        createdAt: true,
      },
    });
    return data;
  },
  ["banners"],
  {
    revalidate: 300, // 5 minutes
    tags: ["banners"],
  }
);

const FALLBACK_BANNER = {
  id: "fallback",
  title: "Professional Kitchen Equipment",
  imageString:
    "https://picsum.photos/seed/archcool-hero-fallback/2000/1125",
  createdAt: new Date(),
};

export async function Hero() {
  const data = await getCachedBanners();
  const banners = data && data.length > 0 ? data : [FALLBACK_BANNER];
  const firstBanner = banners[0]?.imageString;

  return (
    <>
      {firstBanner && (
        <link rel="preload" as="image" href={firstBanner} fetchPriority="high" />
      )}
      <HeroClient banners={banners} />
    </>
  );
}
