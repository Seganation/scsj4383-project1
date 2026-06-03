"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ImageSliderWithZoom({ images }: { images: string[] }) {
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));

  const fallbackImage = "https://picsum.photos/seed/archcool-product-fallback/800/600";

  // Preload next and previous images for instant switching
  useEffect(() => {
    const preloadIndexes = [
      mainImageIndex,
      mainImageIndex + 1,
      mainImageIndex - 1,
    ].filter((idx) => idx >= 0 && idx < images.length);

    preloadIndexes.forEach((idx) => {
      if (!loadedImages.has(idx)) {
        const img = new window.Image();
        img.src = images[idx];
        img.onload = () => {
          setLoadedImages((prev) => new Set(prev).add(idx));
        };
      }
    });
  }, [mainImageIndex, images, loadedImages]);

  const nextImage = useCallback(() => {
    setMainImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setMainImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Function to handle image load completion
  const handleImageLoad = useCallback(() => {
    setIsImageLoading(false);
  }, []);

  // Reset loading state when image changes
  useEffect(() => {
    setIsImageLoading(true);
    setImageError(false);
  }, [mainImageIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (images.length <= 1) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prevImage();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        nextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, nextImage, prevImage]);

  const handleImageChange = (idx: number) => {
    setMainImageIndex(idx);
    setImageError(false);
  };

  const displayImage = imageError ? fallbackImage : images[mainImageIndex];

  return (
    <div className="w-full">
      <div
        className="group relative aspect-square w-full overflow-hidden border border-ink/15 bg-paper focus-within:border-copper"
        tabIndex={0}
        role="img"
        aria-label={`Product image ${mainImageIndex + 1} of ${images.length}`}
      >
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper-dim">
            <div className="h-8 w-8 animate-spin border-b-2 border-copper" />
          </div>
        )}
        <Image
          src={displayImage}
          alt="Product image"
          fill
          className="object-contain p-8"
          sizes="(max-width: 768px) 100vw, 600px"
          priority={mainImageIndex === 0} // Only prioritize first image
          quality={85} // Reduced from 90 for better performance
          onLoad={handleImageLoad}
          onError={() => setImageError(true)}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg=="
        />

        {/* Navigation arrows - only show if there are multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-ink bg-paper/90 text-ink opacity-0 backdrop-blur transition-opacity duration-200 focus:opacity-100 focus:outline-none group-hover:opacity-100 hover:bg-ink hover:text-paper"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-ink bg-paper/90 text-ink opacity-0 backdrop-blur transition-opacity duration-200 focus:opacity-100 focus:outline-none group-hover:opacity-100 hover:bg-ink hover:text-paper"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Image counter indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-ink/90 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-paper">
            {String(mainImageIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </div>
        )}
      </div>

      {/* Thumbnail grid with fixed sizing and responsive behavior */}
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-6">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative aspect-square cursor-pointer overflow-hidden border transition-colors duration-200 hover:border-ink ${
                idx === mainImageIndex
                  ? "border-copper ring-1 ring-copper"
                  : "border-ink/15"
              }`}
              onClick={() => handleImageChange(idx)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleImageChange(idx);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`View image ${idx + 1}`}
            >
              <Image
                src={img}
                alt={`Product thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 16vw"
                loading={idx < 3 ? undefined : "lazy"}
                quality={60}
              />
              {/* Active indicator overlay */}
              {idx === mainImageIndex && (
                <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
