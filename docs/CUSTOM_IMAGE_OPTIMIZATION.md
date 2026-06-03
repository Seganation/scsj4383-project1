# Custom Image Optimization with Sharp

A complete image optimization solution built with Sharp that rivals Vercel's Next.js Image component, giving you full control over the optimization pipeline.

## 🚀 Features

- **Automatic Format Selection**: AVIF → WebP → JPEG based on browser support
- **Responsive Images**: Automatic srcset generation with multiple breakpoints
- **Lazy Loading**: Intersection Observer API with configurable root margin
- **Blur Placeholders**: Low-quality image placeholders (LQIP) and blur data URLs
- **Error Handling**: Graceful fallbacks and error states
- **Security**: Domain validation and parameter sanitization
- **Performance**: Memory-efficient Sharp processing with optimized caching
- **TypeScript**: Full type safety and IntelliSense support

## 📁 File Structure

```
src/
├── app/
│   └── api/
│       └── image-optimizer/
│           └── route.ts              # Sharp optimization API
├── components/
│   ├── ui/
│   │   ├── image.tsx                 # Basic Image component
│   │   ├── optimized-image.tsx       # Advanced Image component
│   │   └── index.ts                  # Component exports
│   └── index.ts                      # Main exports
├── lib/
│   ├── image-config.ts               # Configuration and utilities
│   └── image-processor.ts            # Advanced Sharp utilities
└── app/
    └── image-demo/
        └── page.tsx                  # Demo page
```

## 🛠 Installation

The Sharp package is already included in your dependencies. All components are ready to use!

## 🎯 Quick Start

### Basic Usage

```tsx
import { Image } from "@/components";

export default function MyComponent() {
  return (
    <Image
      src="https://example.com/image.jpg"
      alt="Beautiful landscape"
      width={800}
      height={600}
    />
  );
}
```

### Advanced Usage

```tsx
import { OptimizedImage } from "@/components";

export default function AdvancedComponent() {
  return (
    <OptimizedImage
      src="https://example.com/image.jpg"
      alt="Responsive image"
      width={800}
      aspectRatio={16 / 9}
      objectFit="cover"
      placeholder="blur"
      enableBlurHash={true}
      fallback="/images/placeholder.jpg"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}
```

### Fill Container

```tsx
<div className="relative w-full h-64">
  <Image
    src="https://example.com/image.jpg"
    alt="Fill example"
    fill
    objectFit="cover"
  />
</div>
```

## 🔧 Configuration

### Image Domains

Add allowed domains in `src/lib/image-config.ts`:

```tsx
export const imageConfig = {
  domains: [
    "utfs.io",
    "picsum.photos",
    "your-domain.com",
    // Add your domains here
  ],
  // ... other config
};
```

### Custom Loader

```tsx
const customLoader = ({ src, width, quality }) => {
  return `https://my-cdn.com/api/images?url=${src}&w=${width}&q=${quality}`;
};

<Image
  src="image.jpg"
  alt="Custom loader"
  width={400}
  height={300}
  loader={customLoader}
/>;
```

## 📊 API Reference

### Image Component Props

| Prop          | Type       | Default      | Description                      |
| ------------- | ---------- | ------------ | -------------------------------- | ------------------------------ |
| `src`         | `string`   | **required** | Image source URL                 |
| `alt`         | `string`   | **required** | Alt text for accessibility       |
| `width`       | `number`   | -            | Image width in pixels            |
| `height`      | `number`   | -            | Image height in pixels           |
| `quality`     | `number`   | `85`         | Image quality (1-100)            |
| `priority`    | `boolean`  | `false`      | Load immediately (above fold)    |
| `placeholder` | `'blur' \\ | 'empty'`     | `'empty'`                        | Placeholder type while loading |
| `blurDataURL` | `string`   | -            | Custom blur placeholder data URL |
| `sizes`       | `string`   | `'100vw'`    | Responsive sizes attribute       |
| `fill`        | `boolean`  | `false`      | Fill parent container            |
| `unoptimized` | `boolean`  | `false`      | Skip optimization                |
| `loader`      | `function` | -            | Custom image loader function     |

### OptimizedImage Additional Props

| Prop                | Type          | Default         | Description                     |
| ------------------- | ------------- | --------------- | ------------------------------- | --------- | ------------- | --------- | ------------------------- |
| `responsive`        | `boolean`     | `true`          | Enable responsive features      |
| `aspectRatio`       | `number`      | -               | Aspect ratio (width/height)     |
| `objectFit`         | `'contain' \\ | 'cover' \\      | 'fill' \\                       | 'none' \\ | 'scale-down'` | `'cover'` | How image fills container |
| `objectPosition`    | `string`      | `'center'`      | Image position within container |
| `background`        | `string`      | `'transparent'` | Container background color      |
| `enableBlurHash`    | `boolean`     | `true`          | Auto-generate blur placeholder  |
| `fallback`          | `string`      | -               | Fallback image URL on error     |
| `onLoadingComplete` | `function`    | -               | Callback when image loads       |

## 🎨 Styling

Both components accept standard HTML image attributes and className for Tailwind CSS:

```tsx
<Image
  src="image.jpg"
  alt="Styled image"
  width={400}
  height={300}
  className="rounded-lg shadow-md hover:scale-105 transition-transform"
/>
```

## ⚡ Performance Features

### Format Optimization

The API automatically serves the best format based on browser support:

1. **AVIF**: 50% smaller than JPEG, modern browsers
2. **WebP**: 25-35% smaller than JPEG, wide support
3. **JPEG**: Universal fallback with progressive loading

### Responsive Breakpoints

Default device sizes: `[640, 750, 828, 1080, 1200, 1920, 2048, 3840]`

Customize in `image-config.ts`:

```tsx
export const imageConfig = {
  deviceSizes: [480, 640, 768, 1024, 1280, 1920],
  // ...
};
```

### Caching Strategy

- **Browser Cache**: 1 year with immutable headers
- **Sharp Processing**: In-memory optimization
- **CDN Ready**: Proper cache headers for CDN integration

## 🛡 Security Features

### Domain Validation

Only images from configured domains are processed:

```tsx
// Add to image-config.ts
domains: [
  "trusted-domain.com",
  "*.cdn-provider.com", // Wildcard support
];
```

### Parameter Validation

- Width must be from allowed device sizes
- Quality must be between 1-100
- Format must be supported (AVIF, WebP, JPEG, PNG)
- URL must be valid HTTP/HTTPS

## 🔄 Migration from Next.js Image

Replace imports and usage:

```tsx
// Before
import Image from "next/image";

// After
import { Image } from "@/components";
// or
import { OptimizedImage } from "@/components";
```

The API is mostly compatible with Next.js Image props!

## 🧪 Testing & Demo

Visit `/image-demo` in your application to see all features in action:

- Basic image optimization
- Responsive images
- Blur placeholders
- Error handling
- Quality comparisons
- Fill modes

## 🚀 Advanced Usage

### Image Processor Utility

For server-side image processing:

```tsx
import { ImageProcessor, optimizeImage } from "@/lib/image-processor";

// Process from URL
const processor = await ImageProcessor.fromUrl("https://example.com/image.jpg");
const optimized = await processor
  .resize({ width: 800, height: 600 })
  .quality(85)
  .format("webp")
  .toBuffer();

// Generate placeholder
const placeholder = await processor.generatePlaceholder(16, 16);

// Utility function
const buffer = await optimizeImage("https://example.com/image.jpg", {
  width: 800,
  height: 600,
  quality: 85,
  format: "webp",
});
```

### Responsive Image Sets

Generate multiple sizes:

```tsx
import { generateResponsiveImages } from "@/lib/image-processor";

const responsiveSet = await generateResponsiveImages(
  "https://example.com/image.jpg",
  [640, 1024, 1920],
  "webp",
  85
);

responsiveSet.forEach(({ width, buffer, size }) => {
  console.log(`${width}w: ${size} bytes`);
});
```

## 📈 Performance Tips

1. **Use Priority Loading**: Set `priority={true}` for above-fold images
2. **Optimize Quality**: Use 85 for photos, 100 for graphics
3. **Responsive Sizes**: Define accurate `sizes` attribute
4. **Preload Critical Images**: Use `priority` for hero images
5. **Lazy Load**: Let non-critical images load on demand

## 🐛 Troubleshooting

### Common Issues

1. **Domain Not Allowed**: Add your domain to `image-config.ts`
2. **Images Not Loading**: Check network tab for 400/500 errors
3. **Poor Quality**: Adjust quality settings per format
4. **Slow Loading**: Verify image sizes and network conditions

### Debug Mode

Enable debug logging:

```env
NEXT_PUBLIC_IMAGE_DEBUG=true
```

## 🤝 Contributing

Feel free to extend and customize these components for your needs:

1. Add new formats (HEIC, JXL)
2. Implement advanced filters
3. Add watermarking
4. Integrate with your CDN
5. Add analytics tracking

## 📄 License

This implementation is part of your project and follows your project's license.
