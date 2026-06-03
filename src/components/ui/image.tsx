"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  fill?: boolean;
}

function generateBlurDataURL(width: number = 8, height: number = 8): string {
  if (typeof document === "undefined") return "";

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#f3f4f6");
    gradient.addColorStop(1, "#e5e7eb");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  return canvas.toDataURL();
}

export function Image({
  src,
  alt,
  width,
  height,
  priority = false,
  placeholder = "empty",
  blurDataURL,
  fill = false,
  className,
  style,
  onLoad,
  onError,
  ...props
}: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const [blurData, setBlurData] = useState<string>("");

  // Generate blur placeholder if needed
  useEffect(() => {
    if (placeholder === "blur" && !blurDataURL) {
      setBlurData(generateBlurDataURL(width, height));
    } else if (blurDataURL) {
      setBlurData(blurDataURL);
    }
  }, [placeholder, blurDataURL, width, height]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px",
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    setIsLoaded(false);
    onError?.(e);
  };

  // Just use the src directly - no custom optimization
  const imageSrc = isInView ? src : "";

  // Calculate container styles for fill mode
  const containerStyle = fill
    ? {
        position: "absolute" as const,
        inset: 0,
        color: "transparent",
      }
    : {};

  // Calculate image styles
  const imageStyle: React.CSSProperties = {
    ...style,
    ...(fill
      ? {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }
      : {
          // Don't set inline dimensions if CSS classes control sizing
          // This allows CSS classes like "h-14 w-auto" to take precedence
          ...(width &&
          !(className?.includes("w-") || className?.includes("w-auto"))
            ? { width: `${width}px` }
            : {}),
          ...(height &&
          !(className?.includes("h-") || className?.includes("max-h-"))
            ? { height: `${height}px` }
            : {}),
        }),
    transition: "opacity 0.3s ease-in-out",
    opacity: isLoaded ? 1 : placeholder === "blur" ? 0.5 : 0,
  };

  // Show placeholder while loading
  if (!isInView || (!isLoaded && placeholder === "blur" && blurData)) {
    const containerStyles = fill
      ? containerStyle
      : {
          ...(width &&
          !(className?.includes("w-") || className?.includes("w-auto"))
            ? { width: `${width}px` }
            : {}),
          ...(height &&
          !(className?.includes("h-") || className?.includes("max-h-"))
            ? { height: `${height}px` }
            : {}),
        };

    return (
      <div
        ref={imgRef}
        className={cn("overflow-hidden", className)}
        style={containerStyles}
      >
        {placeholder === "blur" && blurData && (
          <img
            src={blurData}
            alt=""
            aria-hidden="true"
            className={cn(
              "blur-sm scale-110",
              fill && "absolute inset-0 w-full h-full object-cover"
            )}
            style={{
              ...(fill
                ? {}
                : {
                    ...(width &&
                    !(
                      className?.includes("w-") || className?.includes("w-auto")
                    )
                      ? { width: `${width}px` }
                      : {}),
                    ...(height &&
                    !(
                      className?.includes("h-") || className?.includes("max-h-")
                    )
                      ? { height: `${height}px` }
                      : {}),
                  }),
            }}
          />
        )}
        {isInView && (
          <img
            {...props}
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className={cn("transition-opacity duration-300", className)}
            style={imageStyle}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </div>
    );
  }

  // Show error state
  if (hasError) {
    const errorContainerStyles = fill
      ? containerStyle
      : {
          ...(width &&
          !(className?.includes("w-") || className?.includes("w-auto"))
            ? { width: `${width}px` }
            : {}),
          ...(height &&
          !(className?.includes("h-") || className?.includes("max-h-"))
            ? { height: `${height}px` }
            : {}),
        };

    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 text-gray-400",
          className
        )}
        style={errorContainerStyles}
        ref={imgRef}
      >
        <div className="text-center">
          <svg
            className="mx-auto h-8 w-8 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs">Failed to load</p>
        </div>
      </div>
    );
  }

  // Show the main image
  return (
    <div
      className={cn(fill && "relative", className)}
      style={fill ? containerStyle : undefined}
      ref={imgRef}
    >
      <img
        {...props}
        src={imageSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn(
          "transition-opacity duration-300",
          fill && "absolute inset-0 w-full h-full object-cover"
        )}
        style={imageStyle}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
