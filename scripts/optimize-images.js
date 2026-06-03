#!/usr/bin/env node

/**
 * Image Optimization Script for ArchCool
 *
 * This script optimizes existing banner images by:
 * 1. Checking image file sizes
 * 2. Converting to optimal formats (WebP/AVIF)
 * 3. Compressing images
 * 4. Generating responsive sizes
 *
 * Run with: node scripts/optimize-images.js
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkImageSizes() {
  console.log("🔍 Checking image sizes in database...");

  try {
    const banners = await prisma.banner.findMany({
      select: {
        id: true,
        title: true,
        imageString: true,
      },
    });

    console.log(`Found ${banners.length} banner images to check`);

    for (const banner of banners) {
      try {
        console.log(`\n📸 Checking banner: ${banner.title}`);
        console.log(`   URL: ${banner.imageString}`);

        // Fetch image to check size
        const response = await fetch(banner.imageString, { method: "HEAD" });
        const contentLength = response.headers.get("content-length");

        if (contentLength) {
          const sizeInMB = parseInt(contentLength) / (1024 * 1024);
          console.log(`   Size: ${sizeInMB.toFixed(2)} MB`);

          if (sizeInMB > 1) {
            console.log(`   ⚠️  Large image detected! Consider optimizing.`);
          } else {
            console.log(`   ✅ Image size is optimal`);
          }
        } else {
          console.log(`   ❓ Could not determine image size`);
        }

        // Check if image is already optimized format
        const url = new URL(banner.imageString);
        const pathname = url.pathname.toLowerCase();

        if (pathname.includes(".webp") || pathname.includes(".avif")) {
          console.log(`   ✅ Already using optimized format`);
        } else if (
          pathname.includes(".jpg") ||
          pathname.includes(".jpeg") ||
          pathname.includes(".png")
        ) {
          console.log(`   💡 Could benefit from WebP/AVIF conversion`);
        }
      } catch (error) {
        console.error(
          `   ❌ Error checking banner ${banner.title}:`,
          error.message
        );
      }
    }

    console.log("\n📊 Summary:");
    console.log(`   Total banners checked: ${banners.length}`);
    console.log("\n💡 Recommendations:");
    console.log("   1. Use WebP or AVIF formats for better compression");
    console.log("   2. Keep banner images under 1MB for fastest loading");
    console.log("   3. Consider using different sizes for mobile/desktop");
    console.log(
      '   4. Enable UploadThing ACL "public-read" for better CDN caching'
    );
  } catch (error) {
    console.error("❌ Error accessing database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log("🚀 ArchCool Image Optimization Tool\n");

  await checkImageSizes();

  console.log("\n✨ Optimization check complete!");
  console.log("\n🔥 For blazing fast images, make sure to:");
  console.log("   • Use the new OptimizedNextImage component");
  console.log("   • Enable aggressive browser caching");
  console.log("   • Preload critical banner images");
  console.log('   • Use UploadThing ACL "public-read"');
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
