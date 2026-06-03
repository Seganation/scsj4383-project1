// Check for UploadThing URLs in database
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function findUploadThingUrls() {
  try {
    console.log("Searching for UploadThing URLs in database...\n");

    // Check products table - search all products since images is a string array
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        images: true,
      },
    });

    // Filter products with UploadThing URLs
    const uploadThingProducts = products.filter((product) =>
      product.images.some((image) => image.includes("utfs.io"))
    );

    console.log("Products with UploadThing URLs:");
    uploadThingProducts.forEach((product) => {
      console.log(`- ${product.name}:`);
      product.images.forEach((url, i) => {
        if (url.includes("utfs.io")) {
          console.log(`  Image ${i + 1}: ${url}`);
        }
      });
    });

    if (uploadThingProducts.length === 0) {
      console.log("No UploadThing URLs found in products.");
      console.log("\nSample of existing images:");
      products.slice(0, 3).forEach((product) => {
        console.log(`- ${product.name}:`);
        product.images.slice(0, 2).forEach((url, i) => {
          console.log(`  Image ${i + 1}: ${url}`);
        });
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findUploadThingUrls();
