import { genUploader } from "uploadthing/client";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// v7: genUploader now returns { uploadFiles, createUpload }
export const { uploadFiles } = genUploader<OurFileRouter>({
  url: "/api/uploadthing",
  package: "@uploadthing/react",
});

export const isImageFile = (file: File) => file.type.startsWith("image/");
