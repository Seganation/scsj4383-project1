"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod/v4";
import { bannerSchema, productSchema } from "@/lib/zodSchemas";
import prisma from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { UTApi } from "uploadthing/server";
const utapi = new UTApi();

// Extracted: was duplicated identically in createProduct and editProduct
function parseImageUrls(images: string[]): string[] {
  return images.flatMap((urlString) =>
    urlString.split(",").map((url) => url.trim())
  );
}

// Extracted: same 4 revalidatePath calls repeated in every product mutation
function revalidateProductPaths() {
  revalidatePath("/dashboard/products");
  revalidatePath("/products");
  revalidatePath("/api/products");
  revalidatePath("/");
}

async function getAuthenticatedAdminUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  return session.user;
}

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  return session.user;
}

export async function createProduct(prevState: unknown, formData: FormData) {
  await getAuthenticatedAdminUser();

  const submission = parseWithZod(formData, {
    schema: productSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  await prisma.product.create({
    data: {
      name: submission.value.name,
      description: submission.value.description,
      status: submission.value.status,
      price: submission.value.price,
      images: parseImageUrls(submission.value.images),
      category: { connect: { slug: submission.value.category } },
      isFeatured: Boolean(submission.value.isFeatured),
    },
  });

  revalidateProductPaths();
  redirect("/dashboard/products");
}

export async function editProduct(prevState: unknown, formData: FormData) {
  await getAuthenticatedAdminUser();

  const submission = parseWithZod(formData, {
    schema: productSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const flattenUrls = parseImageUrls(submission.value.images);
  const productId = formData.get("productId") as string;
  const originalImages = ((formData.get("originalImages") as string) || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
  const removedImages = originalImages.filter(
    (img) => !flattenUrls.includes(img)
  );

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: submission.value.name,
      description: submission.value.description,
      category: { connect: { slug: submission.value.category } },
      price: submission.value.price,
      isFeatured: Boolean(submission.value.isFeatured),
      status: submission.value.status,
      images: flattenUrls,
    },
  });

  if (removedImages.length > 0) {
    const fileKeys = removedImages.map((url) => url.split("/").at(-1)!);
    await utapi.deleteFiles(fileKeys);
  }

  revalidateProductPaths();
  redirect("/dashboard/products");
}

export async function deleteProduct(formData: FormData) {
  await getAuthenticatedAdminUser();

  await prisma.product.delete({
    where: { id: formData.get("productId") as string },
  });

  revalidateProductPaths();
  redirect("/dashboard/products");
}

export async function createBanner(prevState: unknown, formData: FormData) {
  await getAuthenticatedAdminUser();

  const submission = parseWithZod(formData, {
    schema: bannerSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  await prisma.banner.create({
    data: {
      title: submission.value.title,
      imageString: submission.value.imageString,
    },
  });

  // Revalidate banner cache for instant updates
  revalidateTag("banners", "default");
  revalidatePath("/");

  redirect("/dashboard/banner");
}

export async function deleteBanner(formData: FormData) {
  await getAuthenticatedAdminUser();
  await prisma.banner.delete({
    where: {
      id: formData.get("bannerId") as string,
    },
  });

  // Revalidate banner cache for instant updates
  revalidateTag("banners", "default");
  revalidatePath("/");

  redirect("/dashboard/banner");
}

// Removed obsolete createProductWithImages and createBannerWithImage in favor of client-side UploadThing uploads
