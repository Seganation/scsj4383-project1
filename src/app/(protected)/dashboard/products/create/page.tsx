"use client";

import { createProduct } from "@/app/actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, XIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import { uploadFiles, isImageFile } from "@/utils/ut-client";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { productSchema } from "@/app/lib/zodSchemas";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Image } from "@/components";
import { categories } from "@/app/lib/categories";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

function DraggableImage({
  image,
  index,
  handleDelete,
  listeners,
  attributes,
  isDragging,
  transform,
  transition,
}: any) {
  return (
    <div
      className={`relative w-[100px] h-[100px] ${isDragging ? "opacity-50" : ""}`}
      style={{
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition,
      }}
      {...attributes}
      {...listeners}
    >
      <Image
        height={100}
        width={100}
        src={image}
        alt={`Product Preview ${index + 1}`}
        className="w-full h-full object-cover rounded-lg border"
      />
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDelete(index);
        }}
        type="button"
        className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 p-2 rounded-lg text-white transition-colors"
      >
        <XIcon className="w-3 h-3" />
      </button>
      <span className="absolute bottom-1 left-1 bg-white/80 rounded p-1 text-xs font-bold">
        {index + 1}
      </span>
      <span className="absolute top-1 left-1 cursor-grab text-gray-500 hover:text-gray-700">
        <GripVertical size={16} />
      </span>
    </div>
  );
}

function SortableImage({ image, index, handleDelete, id }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ touchAction: "none" }}>
      <DraggableImage
        image={image}
        index={index}
        handleDelete={handleDelete}
        listeners={listeners}
        attributes={attributes}
        isDragging={isDragging}
        transform={transform}
        transition={transition}
      />
    </div>
  );
}

export default function ProductCreateRoute() {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: productSchema });
    },
    shouldValidate: "onSubmit",
    shouldRevalidate: "onSubmit",
  });

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate size/type here
    const validFiles = files.filter((file) => {
      if (file.size > 4 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 4MB.`);
        return false;
      }
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const remainingSlots = 10 - images.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (filesToAdd.length < validFiles.length) {
      toast.error(
        `Only ${filesToAdd.length} files added. Maximum 10 images allowed.`
      );
    }

    setImages((prev) => [...prev, ...filesToAdd]);
    setImagePreviews((prev) => [
      ...prev,
      ...filesToAdd.map((file) => URL.createObjectURL(file)),
    ]);

    // Clear the input
    e.target.value = "";
  };

  const handleDelete = (index: number) => {
    // Clean up the object URL to prevent memory leaks
    const urlToRevoke = imagePreviews[index];
    if (urlToRevoke && urlToRevoke.startsWith("blob:")) {
      URL.revokeObjectURL(urlToRevoke);
    }

    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreviews]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error("At least one image is required");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData(e.currentTarget);
        // 1) Upload images to UploadThing directly from the client
        const valid = images.every(
          (f) => isImageFile(f) && f.size <= 10 * 1024 * 1024
        );
        if (!valid) {
          toast.error("Only image files up to 10MB are allowed");
          return;
        }
        let uploadedUrls: string[] = [];
        try {
          const uploadResult = await uploadFiles("imageUploader", {
            files: images,
          });
          if (
            Array.isArray(uploadResult) &&
            uploadResult.every((r: any) => r?.url)
          ) {
            uploadedUrls = uploadResult.map((r: any) => r.url);
          } else {
            throw new Error("Unexpected UploadThing result");
          }
        } catch (err: any) {
          console.error("UploadThing error:", err);
          // Fallback: server-side upload via UTApi
          try {
            const fd = new FormData();
            images.forEach((file) => fd.append("files", file));
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
            uploadedUrls = data.urls as string[];
          } catch (fallbackErr: any) {
            console.error("Upload direct fallback error:", fallbackErr);
            toast.error(fallbackErr?.message || "Image upload failed");
            return;
          }
        }

        // 2) Submit only URLs to the Server Action as multiple fields
        formData.delete("images");
        uploadedUrls.forEach((url) => formData.append("images", url));
        await createProduct(undefined, formData); // will redirect on success
      } catch (err: any) {
        if (
          err?.digest === "NEXT_REDIRECT" ||
          err?.message === "NEXT_REDIRECT"
        ) {
          return; // redirect is expected, don't toast
        }
        toast.error(err?.message || "Failed to create product");
      }
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  return (
    <form id={form.id} onSubmit={handleSubmit}>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/products">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">New Product</h1>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            In this form you can create your product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <Label>Name</Label>
              <Input
                type="text"
                key={fields.name.key}
                name={fields.name.name}
                defaultValue={fields.name.initialValue}
                className="w-full"
                placeholder="Product Name"
              />

              <p className="text-red-500">{fields.name.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Description</Label>
              <Textarea
                key={fields.description.key}
                name={fields.description.name}
                defaultValue={fields.description.initialValue}
                placeholder="Write your description right here..."
              />
              <p className="text-red-500">{fields.description.errors}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Label>Price (£)</Label>
              <Input
                key={fields.price.key}
                name={fields.price.name}
                defaultValue={fields.price.initialValue}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="55.00"
              />
              <p className="text-red-500">{fields.price.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Featured Product</Label>
              <Switch
                key={fields.isFeatured.key}
                name={fields.isFeatured.name}
                defaultValue={fields.isFeatured.initialValue}
              />
              <p className="text-red-500">{fields.isFeatured.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Status</Label>
              <Select
                key={fields.status.key}
                name={fields.status.name}
                defaultValue={fields.status.initialValue}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-red-500">{fields.status.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Category</Label>
              <Select
                key={fields.category.key}
                name={fields.category.name}
                defaultValue={fields.category.initialValue}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.value}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-red-500">{fields.category.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Images</Label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                disabled={images.length >= 10 || isPending}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-sm text-gray-500">
                Upload up to 10 images. Max 4MB per image. {images.length}/10
                uploaded.
              </p>
              {imagePreviews.length > 0 && isMounted && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={({ active, over }) => {
                    if (active.id !== over?.id) {
                      const oldIndex = imagePreviews.findIndex(
                        (img) => img === active.id
                      );
                      const newIndex = imagePreviews.findIndex(
                        (img) => img === over?.id
                      );
                      if (oldIndex !== -1 && newIndex !== -1) {
                        setImagePreviews(
                          arrayMove(imagePreviews, oldIndex, newIndex)
                        );
                        setImages(arrayMove(images, oldIndex, newIndex));
                      }
                    }
                  }}
                >
                  <SortableContext
                    items={imagePreviews}
                    strategy={horizontalListSortingStrategy}
                  >
                    <div className="flex gap-5 mt-2 flex-wrap">
                      {imagePreviews.map((preview, index) => (
                        <SortableImage
                          key={preview}
                          id={preview}
                          image={preview}
                          index={index}
                          handleDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
              {imagePreviews.length > 0 && !isMounted && (
                <div className="flex gap-5 mt-2 flex-wrap">
                  {imagePreviews.map((preview, index) => (
                    <div key={preview} className="relative w-[100px] h-[100px]">
                      <Image
                        height={100}
                        width={100}
                        src={preview}
                        alt={`Product Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(index);
                        }}
                        type="button"
                        className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 p-2 rounded-lg text-white transition-colors"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-white/80 rounded p-1 text-xs font-bold">
                        {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-red-500">{fields.images.errors}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending || images.length === 0}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Product...
              </>
            ) : (
              "Create Product"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
