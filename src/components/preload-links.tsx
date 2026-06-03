"use client";

import { useEffect } from "react";

interface PreloadLinksProps {
  images: string[];
}

export function PreloadLinks({ images }: PreloadLinksProps) {
  useEffect(() => {
    if (typeof window === "undefined" || !images.length) return;

    // Create preload links for critical images
    images.forEach((src, index) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;

      // Add fetchpriority for the first few images
      if (index < 3) {
        link.setAttribute("fetchpriority", "high");
      }

      // Add to head
      document.head.appendChild(link);
    });

    // Cleanup function to remove preload links
    return () => {
      const preloadLinks = document.querySelectorAll(
        'link[rel="preload"][as="image"]'
      );
      preloadLinks.forEach((link) => {
        if (images.includes(link.getAttribute("href") || "")) {
          link.remove();
        }
      });
    };
  }, [images]);

  return null; // This component doesn't render anything
}
