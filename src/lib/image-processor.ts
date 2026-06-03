import sharp from "sharp";

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp" | "avif";
  blur?: number;
  sharpen?: boolean;
  grayscale?: boolean;
  normalize?: boolean;
  background?: string;
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  position?: string;
}

export class ImageProcessor {
  private buffer: Buffer;
  private sharpInstance: sharp.Sharp;

  constructor(buffer: Buffer) {
    this.buffer = buffer;
    this.sharpInstance = sharp(buffer);
  }

  static async fromUrl(url: string): Promise<ImageProcessor> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return new ImageProcessor(buffer);
  }

  static fromBuffer(buffer: Buffer): ImageProcessor {
    return new ImageProcessor(buffer);
  }

  async getMetadata(): Promise<sharp.Metadata> {
    return await this.sharpInstance.metadata();
  }

  resize(options: {
    width?: number;
    height?: number;
    fit?: ImageTransformOptions["fit"];
  }): this {
    this.sharpInstance = this.sharpInstance.resize(
      options.width,
      options.height,
      {
        fit: options.fit || "cover",
        withoutEnlargement: true,
      }
    );
    return this;
  }

  quality(quality: number): this {
    // Store quality for later use when converting to format
    (this as any)._quality = quality;
    return this;
  }

  format(format: "jpeg" | "png" | "webp" | "avif", options?: any): this {
    const quality = (this as any)._quality || 85;

    switch (format) {
      case "jpeg":
        this.sharpInstance = this.sharpInstance.jpeg({
          quality,
          progressive: true,
          mozjpeg: true,
          ...options,
        });
        break;
      case "png":
        this.sharpInstance = this.sharpInstance.png({
          quality,
          compressionLevel: 6,
          ...options,
        });
        break;
      case "webp":
        this.sharpInstance = this.sharpInstance.webp({
          quality,
          effort: 4,
          ...options,
        });
        break;
      case "avif":
        this.sharpInstance = this.sharpInstance.avif({
          quality: Math.min(quality, 60), // AVIF works better with lower quality
          effort: 4,
          ...options,
        });
        break;
    }
    return this;
  }

  blur(sigma: number): this {
    this.sharpInstance = this.sharpInstance.blur(sigma);
    return this;
  }

  sharpen(): this {
    this.sharpInstance = this.sharpInstance.sharpen();
    return this;
  }

  grayscale(): this {
    this.sharpInstance = this.sharpInstance.grayscale();
    return this;
  }

  normalize(): this {
    this.sharpInstance = this.sharpInstance.normalize();
    return this;
  }

  background(color: string): this {
    this.sharpInstance = this.sharpInstance.flatten({ background: color });
    return this;
  }

  crop(left: number, top: number, width: number, height: number): this {
    this.sharpInstance = this.sharpInstance.extract({
      left,
      top,
      width,
      height,
    });
    return this;
  }

  rotate(angle: number): this {
    this.sharpInstance = this.sharpInstance.rotate(angle);
    return this;
  }

  flip(): this {
    this.sharpInstance = this.sharpInstance.flip();
    return this;
  }

  flop(): this {
    this.sharpInstance = this.sharpInstance.flop();
    return this;
  }

  // Generate a low-quality placeholder (LQIP)
  async generatePlaceholder(
    width: number = 16,
    height: number = 16
  ): Promise<string> {
    const placeholderBuffer = await sharp(this.buffer)
      .resize(width, height, { fit: "cover" })
      .jpeg({ quality: 1, progressive: false })
      .toBuffer();

    return `data:image/jpeg;base64,${placeholderBuffer.toString("base64")}`;
  }

  // Generate a simple blur placeholder
  async generateBlurHash(): Promise<string> {
    // Simple blur placeholder without external dependencies
    const placeholderBuffer = await sharp(this.buffer)
      .resize(8, 8, { fit: "cover" })
      .blur(2)
      .jpeg({ quality: 20 })
      .toBuffer();

    return `data:image/jpeg;base64,${placeholderBuffer.toString("base64")}`;
  }

  // Create responsive image set
  async generateResponsiveSet(
    widths: number[] = [640, 750, 828, 1080, 1200, 1920],
    format: "jpeg" | "webp" | "avif" = "webp",
    quality: number = 85
  ): Promise<Array<{ width: number; buffer: Buffer; size: number }>> {
    const results = [];

    for (const width of widths) {
      const buffer = await sharp(this.buffer)
        .resize(width, undefined, { withoutEnlargement: true })
        [format]({ quality })
        .toBuffer();

      results.push({
        width,
        buffer,
        size: buffer.length,
      });
    }

    return results;
  }

  async toBuffer(): Promise<Buffer> {
    return await this.sharpInstance.toBuffer();
  }

  async toFile(path: string): Promise<sharp.OutputInfo> {
    return await this.sharpInstance.toFile(path);
  }

  // Chain multiple operations
  transform(options: ImageTransformOptions): this {
    if (options.width || options.height) {
      this.resize({
        width: options.width,
        height: options.height,
        fit: options.fit,
      });
    }

    if (options.quality) {
      this.quality(options.quality);
    }

    if (options.format) {
      this.format(options.format);
    }

    if (options.blur) {
      this.blur(options.blur);
    }

    if (options.sharpen) {
      this.sharpen();
    }

    if (options.grayscale) {
      this.grayscale();
    }

    if (options.normalize) {
      this.normalize();
    }

    if (options.background) {
      this.background(options.background);
    }

    return this;
  }
}

// Utility functions
export async function optimizeImage(
  input: string | Buffer,
  options: ImageTransformOptions
): Promise<Buffer> {
  let processor: ImageProcessor;

  if (typeof input === "string") {
    processor = await ImageProcessor.fromUrl(input);
  } else {
    processor = ImageProcessor.fromBuffer(input);
  }

  return await processor.transform(options).toBuffer();
}

export async function generateImagePlaceholder(
  input: string | Buffer,
  width: number = 16,
  height: number = 16
): Promise<string> {
  let processor: ImageProcessor;

  if (typeof input === "string") {
    processor = await ImageProcessor.fromUrl(input);
  } else {
    processor = ImageProcessor.fromBuffer(input);
  }

  return await processor.generatePlaceholder(width, height);
}

export async function generateResponsiveImages(
  input: string | Buffer,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920],
  format: "jpeg" | "webp" | "avif" = "webp",
  quality: number = 85
): Promise<Array<{ width: number; buffer: Buffer; size: number }>> {
  let processor: ImageProcessor;

  if (typeof input === "string") {
    processor = await ImageProcessor.fromUrl(input);
  } else {
    processor = ImageProcessor.fromBuffer(input);
  }

  return await processor.generateResponsiveSet(widths, format, quality);
}
