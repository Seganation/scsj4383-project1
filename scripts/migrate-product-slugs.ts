import { PrismaClient } from "@prisma/client";
import { createSlug, generateUniqueSlug } from "../src/app/lib/slug-utils";

const prisma = new PrismaClient();

async function migrateProductSlugs() {
  console.log("Starting product slug migration...");

  try {
    // First, let's check for duplicate names and rename them
    const products = await prisma.product.findMany({
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    });

    console.log(`Found ${products.length} products to process...`);

    // Group products by name to find duplicates
    const nameGroups = products.reduce(
      (acc, product) => {
        if (!acc[product.name]) {
          acc[product.name] = [];
        }
        acc[product.name].push(product);
        return acc;
      },
      {} as Record<string, typeof products>
    );

    // Handle duplicate names by appending numbers
    for (const [name, productGroup] of Object.entries(nameGroups)) {
      if (productGroup.length > 1) {
        console.log(
          `Found ${productGroup.length} products with name "${name}", renaming duplicates...`
        );

        // Keep first one as is, rename others
        for (let i = 1; i < productGroup.length; i++) {
          const newName = `${name} ${i + 1}`;
          await prisma.product.update({
            where: { id: productGroup[i].id },
            data: { name: newName },
          });
          console.log(
            `Renamed "${name}" to "${newName}" for product ${productGroup[i].id}`
          );
        }
      }
    }

    console.log("No slug migration needed - slugs not required");

    console.log("✅ Product slug migration completed successfully!");
  } catch (error) {
    console.error("❌ Error during migration:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  migrateProductSlugs();
}

export default migrateProductSlugs;
