import { z } from "zod";

export const productSchema = z.object({
  name: z.string(),
  description: z.string(),
  status: z.enum(["draft", "published", "archived"]),
  price: z.number().min(1), // Store as pounds, no conversion needed
  images: z.array(z.string()).min(1, "At least one image is required"),
  category: z.enum(["cooking-equipment", "refrigeration", "grills"]),
  isFeatured: z.boolean().optional(),
});

export const bannerSchema = z.object({
  title: z.string(),
  imageString: z.string(),
});
