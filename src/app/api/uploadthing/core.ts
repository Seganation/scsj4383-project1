import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/lib/auth";

const f = createUploadthing({
  errorFormatter: (err) => {
    if (process.env.NODE_ENV === "development") {
      console.error("UploadThing error:", err.message);
    }
    return { message: err.message };
  },
});

export const ourFileRouter = {
  // Product image upload route - Multi-file
  imageUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 10,
    },
  })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({ headers: req.headers });

      if (!session?.user || session.user.role !== "admin") {
        throw new UploadThingError("Unauthorized - Admin access required");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Product upload complete:", {
          userId: metadata.userId,
          name: file.name,
          size: file.size,
          url: file.url,
        });
      }

      return { uploadedBy: metadata.userId, success: true };
    }),

  // Banner image upload route
  bannerImageRoute: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({ headers: req.headers });

      if (!session?.user || session.user.role !== "admin") {
        throw new UploadThingError("Unauthorized - Admin access required");
      }

      return { userId: session.user.id, uploadTime: Date.now(), type: "banner" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Banner upload complete:", {
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
          url: file.url,
          uploadTime: `${Date.now() - metadata.uploadTime}ms`,
        });
      }

      return { success: true, type: metadata.type, optimized: true };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
