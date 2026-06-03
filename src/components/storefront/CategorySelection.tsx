import Image from "next/image";
import Link from "next/link";
import prisma from "@/app/lib/db";

export async function CategoriesSelection() {
  // Fetch all categories from the database
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  // Always include 'All Products' as the first card
  const allCard = {
    id: "all",
    name: "All Products",
    slug: "all",
    imageUrl:
      "https://picsum.photos/seed/archcool-category-all/800/600",
  };

  const allCategories = [allCard, ...categories];

  // Enhanced category images for better visual appeal
  const categoryImages = {
    all: "https://picsum.photos/seed/archcool-category-all/800/600",
    "cooking-equipment":
      "https://picsum.photos/seed/archcool-cooking-equipment/800/600",
    refrigeration:
      "https://picsum.photos/seed/archcool-refrigeration/800/600",
    grills:
      "https://picsum.photos/seed/archcool-grills/800/600",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {allCategories.map((cat, index) => {
        const imageUrl =
          categoryImages[cat.slug as keyof typeof categoryImages] ||
          cat.imageUrl;

        return (
          <Link
            key={cat.id}
            href={
              cat.slug === "all"
                ? "/products/category/all"
                : `/products/category/${cat.slug}`
            }
            className="group relative overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105"
          >
            {/* Enhanced Image Container */}
            <div className="aspect-[4/3] relative overflow-hidden">
              <Image
                src={imageUrl}
                alt={cat.name}
                className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Category Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-white font-bold text-xl mb-2 group-hover:text-orange-300 transition-colors duration-300">
                  {cat.name}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-white/90 text-sm font-medium">
                    Browse Collection
                  </p>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <span className="text-white text-lg transform group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-3 h-3 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"></div>
            <div className="absolute top-8 right-8 w-2 h-2 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200"></div>
          </Link>
        );
      })}
    </div>
  );
}
