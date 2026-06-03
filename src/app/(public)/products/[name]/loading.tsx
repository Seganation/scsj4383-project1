import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingFile() {
  return (
    <section className="max-w-5xl mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* Left: Image Gallery Skeleton */}
      <div>
        <div className="mb-6">
          <Skeleton className="w-full h-[400px] md:h-[500px] rounded-lg" />
        </div>
      </div>

      {/* Right: Product Info Skeleton */}
      <div className="flex flex-col gap-6">
        {/* Product Title */}
        <Skeleton className="h-10 w-3/4 mb-2" />

        {/* Price */}
        <Skeleton className="h-8 w-24 mb-2" />

        {/* Description */}
        <div className="mb-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Add to Cart Button */}
        <Skeleton className="h-12 w-full" />
      </div>

      {/* Full width: Reviews placeholder skeleton */}
      <div className="md:col-span-2 mt-12">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>

      {/* Related Products skeleton */}
      <div className="md:col-span-2 mt-16 pb-12">
        <div className="mb-4">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-start">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 shadow-sm bg-white flex flex-col overflow-hidden"
            >
              <Skeleton className="w-full h-48" />
              <div className="p-3 flex flex-col gap-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
