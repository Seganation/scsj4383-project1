"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, XIcon } from "lucide-react";
import Link from "next/link";
import { SubmitButton } from "../SubmitButtons";
import { Switch } from "@/components/ui/switch";
import { Image } from "@/components";
import { categories } from "@/app/lib/categories";
import { useState, useRef } from "react";
import { useActionState } from "react";
import { createProduct, editProduct } from "@/app/actions";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { productSchema } from "@/app/lib/zodSchemas";
import toast from "react-hot-toast";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { SortableImageList } from "@/components/dashboard/SortableImageList";

interface iAppProps {
  data: {
    id: string;
    name: string;
    description: string;
    status: string;
    price: number;
    images: string[];
    category: string;
    isFeatured: boolean;
  };
}

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
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      <Image
        height={100}
        width={100}
        src={image}
        alt="Product Image"
        className="w-full h-full object-cover rounded-lg border"
      />
      <button
        onClick={() => handleDelete(index)}
        type="button"
        className="absolute -top-3 -right-3 bg-red-500 p-2 rounded-lg text-white"
      >
        <XIcon className="w-3 h-3" />
      </button>
      <span className="absolute bottom-1 left-1 bg-white/80 rounded p-1 text-xs font-bold">
        {index + 1}
      </span>
      <span className="absolute top-1 left-1 cursor-grab text-gray-500">
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

export function EditForm({ data }: iAppProps) {
  const [existingImages, setExistingImages] = useState<string[]>(data.images);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(data.images);
  const [uploading, setUploading] = useState(false);
  const [lastResult, action] = useActionState(editProduct, undefined);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: productSchema });
    },
    shouldValidate: "onSubmit",
    shouldRevalidate: "onSubmit",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (file) => file.size <= 4 * 1024 * 1024 && file.type.startsWith("image/")
    );
    if (validFiles.length !== files.length) {
      toast.error("Some files were too large or not images.");
    }
    setNewImages((prev) =>
      [...prev, ...validFiles].slice(0, 10 - existingImages.length)
    );
    setImagePreviews((prev) =>
      [...prev, ...validFiles.map((file) => URL.createObjectURL(file))].slice(
        0,
        10
      )
    );
  };

  // Handle delete (removes from previews and either existing or new)
  const handleDelete = (index: number) => {
    if (index < existingImages.length) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      const newIndex = index - existingImages.length;
      setNewImages((prev) => prev.filter((_, i) => i !== newIndex));
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Drag-and-drop reordering
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData(e.currentTarget);
      // Upload new images (deferred, just like create page)
      let uploadedUrls: string[] = [];
      if (newImages.length > 0) {
        const { uploadFiles, isImageFile } = await import("@/utils/ut-client");
        const valid = newImages.every(
          (f) => isImageFile(f) && f.size <= 10 * 1024 * 1024
        );
        if (!valid) {
          toast.error("Only image files up to 10MB are allowed");
          setUploading(false);
          return;
        }
        try {
          const uploadResult = await uploadFiles("imageUploader", {
            files: newImages,
          });
          if (
            !Array.isArray(uploadResult) ||
            !uploadResult.every((r: any) => r?.url)
          ) {
            throw new Error("Unexpected UploadThing result");
          }
          uploadedUrls = uploadResult.map((r: any) => r.url);
        } catch (err: any) {
          // Fallback: server-side upload
          try {
            const fd = new FormData();
            newImages.forEach((file) => fd.append("files", file));
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
              setUploading(false);
              return;
            }
            uploadedUrls = data.urls as string[];
          } catch (fallbackErr: any) {
            toast.error(fallbackErr?.message || "Image upload failed");
            setUploading(false);
            return;
          }
        }
      }
      // Final images array: existing (after delete/reorder) + uploaded
      const finalImages = [...existingImages, ...uploadedUrls];
      formData.set("images", finalImages.join(","));
      // Track original images for deletion
      formData.set("originalImages", data.images.join(","));
      // Submit to server
      const result = await editProduct(undefined, formData);
      if ((result as any)?.success) {
        toast.success("Product updated successfully!");
        window.location.href = "/dashboard/products";
      } else if ((result as any)?.error) {
        toast.error((result as any).error);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update product");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form id={form.id} onSubmit={handleSubmit}>
      <input type="hidden" name="productId" value={data.id} />
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/products">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">Edit Product</h1>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            In this form you can update your product
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
                defaultValue={data.name}
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
                defaultValue={data.description}
                placeholder="Write your description right here..."
              />
              <p className="text-red-500">{fields.description.errors}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Label>Price (£)</Label>
              <Input
                key={fields.price.key}
                name={fields.price.name}
                defaultValue={data.price}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="750.00"
              />
              <p className="text-red-500">{fields.price.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Featured Product</Label>
              <Switch
                key={fields.isFeatured.key}
                name={fields.isFeatured.name}
                defaultChecked={data.isFeatured}
              />
              <p className="text-red-500">{fields.isFeatured.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Status</Label>
              <Select
                key={fields.status.key}
                name={fields.status.name}
                defaultValue={data.status}
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
                defaultValue={data.category}
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
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={
                  existingImages.length + newImages.length >= 10 || uploading
                }
                className="mb-2"
              >
                Add Images
              </Button>
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={
                  existingImages.length + newImages.length >= 10 || uploading
                }
                style={{ display: "none" }}
              />
              {imagePreviews.length > 0 && (
                <SortableImageList
                  images={imagePreviews}
                  onReorder={(newOrder) => {
                    setImagePreviews(newOrder);
                    // Reorder existingImages and newImages accordingly
                    const existingCount = existingImages.length;
                    const newExisting: string[] = [];
                    const newNew: File[] = [];
                    newOrder.forEach((img, idx) => {
                      if (idx < existingCount) {
                        newExisting.push(img);
                      } else {
                        // Find the corresponding File by preview URL
                        const fileIdx =
                          imagePreviews.indexOf(img) - existingCount;
                        if (fileIdx >= 0 && newImages[fileIdx]) {
                          newNew.push(newImages[fileIdx]);
                        }
                      }
                    });
                    setExistingImages(newExisting);
                    setNewImages(newNew);
                  }}
                  handleDelete={handleDelete}
                />
              )}
              <p className="text-red-500">{fields.images.errors}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton text={uploading ? "Uploading..." : "Edit Product"} />
        </CardFooter>
      </Card>
    </form>
  );
}
