"use client";

import { createBanner } from "@/app/actions";
import { bannerSchema } from "@/lib/zodSchemas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { ChevronLeft, Loader2, XIcon } from "lucide-react";
import { Image } from "@/components";
import Link from "next/link";
import { useState, useTransition } from "react";
import React from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { uploadFiles, isImageFile } from "@/lib/ut-client";

export default function BannerRoute() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: bannerSchema });
    },
    shouldValidate: "onSubmit",
    shouldRevalidate: "onSubmit",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 4 * 1024 * 1024) {
      toast.error("File size too large. Maximum file size is 4MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type. Please upload an image file.");
      return;
    }

    setImageFile(file);

    // Create preview
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);

    toast.success("Image selected successfully!");
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error("Please select an image");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData(e.currentTarget);
        if (!isImageFile(imageFile!) || imageFile!.size > 10 * 1024 * 1024) {
          toast.error("Only image files up to 10MB are allowed");
          return;
        }

        let imageUrl: string | null = null;
        try {
          const uploadResult = await uploadFiles("bannerImageRoute", {
            files: [imageFile!],
          });
          if (Array.isArray(uploadResult) && uploadResult[0]?.url) {
            imageUrl = uploadResult[0].url as string;
          } else {
            throw new Error("Unexpected UploadThing result");
          }
        } catch (err: any) {
          try {
            const fd = new FormData();
            fd.append("files", imageFile!);
            const resp = await fetch("/api/upload-direct", {
              method: "POST",
              body: fd,
            });
            const data = await resp.json();
            if (
              !resp.ok ||
              !Array.isArray(data?.urls) ||
              data.urls.length === 0
            ) {
              toast.error(data?.error || "Image upload failed");
              return;
            }
            imageUrl = data.urls[0] as string;
          } catch (fallbackErr: any) {
            toast.error(fallbackErr?.message || "Image upload failed");
            return;
          }
        }

        formData.set("imageString", imageUrl!);
        await createBanner(undefined, formData);
      } catch (err: any) {
        if (
          err?.digest === "NEXT_REDIRECT" ||
          err?.message === "NEXT_REDIRECT"
        ) {
          return; // redirect is expected, avoid false toast
        }
        toast.error(err?.message || "Failed to create banner");
      }
    });
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <form id={form.id} onSubmit={handleSubmit}>
      <div className="flex items-center gap-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/banner">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">New Banner</h1>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Banner Details</CardTitle>
          <CardDescription>Create your banner right here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-y-6">
            <div className="flex flex-col gap-3">
              <Label>Name</Label>
              <Input
                name={fields.title.name}
                key={fields.title.key}
                defaultValue={fields.title.initialValue}
                type="text"
                placeholder="Create title for Banner"
              />
              <p className="text-red-500">{fields.title.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Image</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isPending}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
              <p className="text-sm text-gray-500">
                Upload a single banner image. Max 4MB. Accepted formats: JPG,
                PNG, WebP.
              </p>

              {imagePreview && (
                <div className="relative w-[300px] h-[200px] mt-4">
                  <Image
                    src={imagePreview}
                    alt="Banner Preview"
                    width={300}
                    height={200}
                    className="w-full h-full object-cover rounded-lg border"
                  />
                  <button
                    onClick={handleRemoveImage}
                    type="button"
                    className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 p-2 rounded-lg text-white transition-colors"
                    disabled={isPending}
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              )}

              <p className="text-red-500">{fields.imageString.errors}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending || !imageFile}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Banner...
              </>
            ) : (
              "Create Banner"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
