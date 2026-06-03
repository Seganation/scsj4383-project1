"use client";

import NextImage from "next/image";

interface OptimizedNextImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
}

export function OptimizedNextImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  sizes = "100vw",
  quality = 85,
  onLoad,
  onError,
  style,
}: OptimizedNextImageProps) {
  return (
    <NextImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      priority={priority}
      sizes={sizes}
      quality={quality}
      onLoad={onLoad}
      onError={onError}
      style={style}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      unoptimized={false}
    />
  );
}
