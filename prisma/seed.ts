import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "../src/lib/auth";
import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

// Use a fresh instance for seeding (Prisma 7 requires adapter or accelerateUrl).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const IMAGE_SEED_BY_LEGACY_ID: Record<string, string> = {
  "1556909114-f6e7ad7d3136": "archcool-kitchen-line",
  "1571175443880-49e1d25b2bc5": "archcool-refrigeration",
  "1544025162-d76694265947": "archcool-grills",
  "1556909114-5b94e4e20b31": "archcool-appliances",
  "1556909924-6e4c97d1a5e2": "archcool-commercial",
  "1574269909862-7e1d70bb8078": "archcool-oven",
  "1584622650111-993a426fbf0a": "archcool-countertop",
  "1565299624946-b28f40a0ca4b": "archcool-outdoor-cooking",
  "1600891964599-f61ba0e24092": "archcool-specialist-cta",
};

const toFreeImage = (url: string) => {
  if (!url.includes("images.unsplash.com")) return url;

  const idMatch = url.match(/photo-([a-zA-Z0-9-]+)/);
  const legacyId = idMatch?.[1];
  const seed = legacyId
    ? IMAGE_SEED_BY_LEGACY_ID[legacyId] || `archcool-${legacyId}`
    : "archcool-generic";

  const width = url.match(/[?&]w=(\d+)/)?.[1] || "1200";
  const height = url.match(/[?&]h=(\d+)/)?.[1] || "800";

  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
};

const toFreeImages = (images: string[]) => images.map(toFreeImage);

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Create categories using upsert to avoid duplicate queries
    const categories = [
      {
        name: "Cooking Equipment",
        slug: "cooking-equipment",
        imageUrl:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
      },
      {
        name: "Refrigeration",
        slug: "refrigeration",
        imageUrl:
          "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=300&fit=crop",
      },
      {
        name: "Grills",
        slug: "grills",
        imageUrl:
          "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
      },
      {
        name: "Kitchen Appliances",
        slug: "kitchen-appliances",
        imageUrl:
          "https://images.unsplash.com/photo-1556909114-5b94e4e20b31?w=400&h=300&fit=crop",
      },
      {
        name: "Outdoor Equipment",
        slug: "outdoor-equipment",
        imageUrl:
          "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
      },
      {
        name: "Commercial Equipment",
        slug: "commercial-equipment",
        imageUrl:
          "https://images.unsplash.com/photo-1556909924-6e4c97d1a5e2?w=400&h=300&fit=crop",
      },
    ];

    const createdCategories = [];
    for (const category of categories) {
      const result = await prisma.category.upsert({
        where: { slug: category.slug },
        update: { imageUrl: toFreeImage(category.imageUrl) },
        create: { ...category, imageUrl: toFreeImage(category.imageUrl) },
      });
      createdCategories.push(result);
      console.log(`✅ Category ready: ${category.name}`);
    }

    // Generate comprehensive product data
    const products = [
      // Cooking Equipment
      {
        name: "Professional Gas Range 6-Burner",
        description:
          "Heavy-duty 6-burner gas range perfect for professional kitchens. Features precise temperature control, durable stainless steel construction, and commercial-grade performance for high-volume cooking.",
        price: 299999, // £2999.99
        images: [
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1556909924-6e4c97d1a5e2?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&h=600&fit=crop",
        ],
        categorySlug: "cooking-equipment",
        isFeatured: true,
      },
      {
        name: "Induction Cooktop Pro",
        description:
          "State-of-the-art induction cooktop with 4 cooking zones. Energy-efficient design with precise temperature control and sleek glass surface. Perfect for modern kitchens.",
        price: 149999, // £1499.99
        images: [
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1556909114-5b94e4e20b31?w=800&h=600&fit=crop",
        ],
        categorySlug: "cooking-equipment",
        isFeatured: true,
      },
      {
        name: "Commercial Convection Oven",
        description:
          "High-capacity convection oven designed for commercial use. Even heat distribution, multiple rack positions, and digital controls for consistent baking and roasting results.",
        price: 399999, // £3999.99
        images: [
          "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1556909924-6e4c97d1a5e2?w=800&h=600&fit=crop",
        ],
        categorySlug: "cooking-equipment",
        isFeatured: false,
      },
      {
        name: "Electric Griddle Station",
        description:
          "Large electric griddle perfect for breakfast services and high-volume cooking. Non-stick surface, adjustable temperature zones, and easy-clean design.",
        price: 189999, // £1899.99
        images: [
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&h=600&fit=crop",
        ],
        categorySlug: "cooking-equipment",
        isFeatured: false,
      },
      {
        name: "Deep Fryer Dual Basket",
        description:
          "Professional dual-basket deep fryer with precise temperature control. High-efficiency heating elements and oil filtration system for consistent frying results.",
        price: 129999, // £1299.99
        images: [
          "https://images.unsplash.com/photo-1556909924-6e4c97d1a5e2?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&h=600&fit=crop",
        ],
        categorySlug: "cooking-equipment",
        isFeatured: false,
      },

      // Refrigeration
      {
        name: "Commercial Walk-in Cooler",
        description:
          "Large-capacity walk-in cooler for commercial kitchens and restaurants. Energy-efficient cooling system, digital temperature controls, and heavy-duty construction.",
        price: 799999, // £7999.99
        images: [
          "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop",
        ],
        categorySlug: "refrigeration",
        isFeatured: true,
      },
      {
        name: "Stainless Steel Refrigerator",
        description:
          "Professional-grade stainless steel refrigerator with double doors. Perfect for commercial kitchens with ample storage space and reliable cooling performance.",
        price: 249999, // £2499.99
        images: [
          "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop",
        ],
        categorySlug: "refrigeration",
        isFeatured: true,
      },
      {
        name: "Under-Counter Freezer",
        description:
          "Compact under-counter freezer perfect for small kitchens. Energy-efficient design with slide-out drawers for easy access and organization.",
        price: 89999, // £899.99
        images: [
          "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&h=600&fit=crop",
        ],
        categorySlug: "refrigeration",
        isFeatured: false,
      },
      {
        name: "Glass Door Display Cooler",
        description:
          "Elegant glass door display cooler for showcasing beverages and products. LED lighting, adjustable shelves, and energy-efficient cooling system.",
        price: 179999, // £1799.99
        images: [
          "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop",
        ],
        categorySlug: "refrigeration",
        isFeatured: false,
      },
      {
        name: "Ice Machine Commercial",
        description:
          "High-capacity commercial ice machine producing up to 500lbs of ice daily. Self-contained unit with built-in storage bin and easy maintenance features.",
        price: 349999, // £3499.99
        images: [
          "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&h=600&fit=crop",
        ],
        categorySlug: "refrigeration",
        isFeatured: false,
      },

      // Grills
      {
        name: "Professional Gas Grill XXL",
        description:
          "Heavy-duty outdoor gas grill with 6 burners and side burner. Perfect for large gatherings with ample cooking space and precise temperature control.",
        price: 199999, // £1999.99
        images: [
          "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop",
        ],
        categorySlug: "grills",
        isFeatured: true,
      },
      {
        name: "Charcoal Kettle Grill",
        description:
          "Classic charcoal kettle grill for authentic barbecue flavor. Porcelain-enameled bowl and lid with adjustable dampers for temperature control.",
        price: 49999, // £499.99
        images: [
          "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop",
        ],
        categorySlug: "grills",
        isFeatured: false,
      },
      {
        name: "Pellet Smoker Grill",
        description:
          "Versatile pellet smoker and grill with digital temperature control. Perfect for smoking, grilling, and slow cooking with wood-fired flavor.",
        price: 129999, // £1299.99
        images: [
          "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
        ],
        categorySlug: "grills",
        isFeatured: true,
      },
      {
        name: "Electric Indoor Grill",
        description:
          "Smokeless electric indoor grill perfect for year-round grilling. Non-stick surface, adjustable temperature, and removable drip tray for easy cleanup.",
        price: 29999, // £299.99
        images: [
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop",
        ],
        categorySlug: "grills",
        isFeatured: false,
      },
      {
        name: "Kamado Ceramic Grill",
        description:
          "Premium ceramic kamado grill for versatile outdoor cooking. Excellent heat retention and temperature control for grilling, smoking, and baking.",
        price: 89999, // £899.99
        images: [
          "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop",
        ],
        categorySlug: "grills",
        isFeatured: false,
      },

      // Kitchen Appliances
      {
        name: "Professional Stand Mixer",
        description:
          "Heavy-duty stand mixer with 8-quart capacity. Perfect for commercial bakeries and high-volume food preparation with multiple attachments included.",
        price: 79999, // £799.99
        images: [
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
        ],
        categorySlug: "kitchen-appliances",
        isFeatured: true,
      },
      {
        name: "Commercial Blender Pro",
        description:
          "High-performance commercial blender with variable speed control. Perfect for smoothies, soups, and frozen drinks with durable stainless steel blades.",
        price: 39999, // £399.99
        images: [
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop",
        ],
        categorySlug: "kitchen-appliances",
        isFeatured: false,
      },
      {
        name: "Food Processor Heavy Duty",
        description:
          "Large-capacity food processor with multiple blades and attachments. Perfect for chopping, slicing, and food preparation in commercial kitchens.",
        price: 59999, // £599.99
        images: [
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop",
        ],
        categorySlug: "kitchen-appliances",
        isFeatured: false,
      },
      {
        name: "Coffee Espresso Machine",
        description:
          "Professional espresso machine with dual boilers and steam wand. Perfect for cafes and restaurants with consistent brewing temperature and pressure.",
        price: 349999, // £3499.99
        images: [
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
        ],
        categorySlug: "kitchen-appliances",
        isFeatured: true,
      },
      {
        name: "Dishwasher Commercial",
        description:
          "High-efficiency commercial dishwasher with fast wash cycles. Perfect for restaurants and cafeterias with high-temperature sanitizing wash.",
        price: 449999, // £4499.99
        images: [
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop",
        ],
        categorySlug: "kitchen-appliances",
        isFeatured: false,
      },

      // Outdoor Equipment
      {
        name: "Outdoor Pizza Oven",
        description:
          "Wood-fired outdoor pizza oven with stone cooking surface. Perfect for backyard entertaining with authentic Italian-style pizza cooking.",
        price: 299999, // £2999.99
        images: [
          "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop",
        ],
        categorySlug: "outdoor-equipment",
        isFeatured: true,
      },
      {
        name: "Outdoor Kitchen Island",
        description:
          "Complete outdoor kitchen island with grill, side burners, and storage. Stainless steel construction perfect for outdoor entertaining spaces.",
        price: 499999, // £4999.99
        images: [
          "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
        ],
        categorySlug: "outdoor-equipment",
        isFeatured: true,
      },
      {
        name: "Portable Camping Stove",
        description:
          "Compact portable camping stove with dual burners. Perfect for outdoor cooking and camping with wind-resistant design and easy setup.",
        price: 9999, // £99.99
        images: [
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop",
        ],
        categorySlug: "outdoor-equipment",
        isFeatured: false,
      },
      {
        name: "Outdoor Refrigerator",
        description:
          "Weather-resistant outdoor refrigerator perfect for patio kitchens. Stainless steel construction with excellent temperature control.",
        price: 199999, // £1999.99
        images: [
          "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&h=600&fit=crop",
        ],
        categorySlug: "outdoor-equipment",
        isFeatured: false,
      },
      {
        name: "Fire Pit Grill Combo",
        description:
          "Versatile fire pit and grill combination perfect for outdoor gatherings. Includes cooking grate and spark screen for safe operation.",
        price: 69999, // £699.99
        images: [
          "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop",
        ],
        categorySlug: "outdoor-equipment",
        isFeatured: false,
      },

      // Commercial Equipment
      {
        name: "Commercial Dishwasher System",
        description:
          "Heavy-duty commercial dishwasher system for high-volume operations. Multi-stage washing with sanitizing rinse and energy-efficient design.",
        price: 899999, // £8999.99
        images: [
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
        ],
        categorySlug: "commercial-equipment",
        isFeatured: true,
      },
      {
        name: "Prep Table Refrigerated",
        description:
          "Refrigerated prep table with cutting board top and storage compartments. Perfect for food preparation in commercial kitchens.",
        price: 299999, // £2999.99
        images: [
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&h=600&fit=crop",
        ],
        categorySlug: "commercial-equipment",
        isFeatured: false,
      },
      {
        name: "Commercial Food Warmer",
        description:
          "Large-capacity food warmer for buffet service and catering. Multiple compartments with individual temperature controls for different foods.",
        price: 199999, // £1999.99
        images: [
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
        ],
        categorySlug: "commercial-equipment",
        isFeatured: false,
      },
      {
        name: "Ventilation Hood System",
        description:
          "Professional ventilation hood system for commercial kitchens. High-capacity exhaust with grease filtration and fire suppression ready.",
        price: 599999, // £5999.99
        images: [
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
        ],
        categorySlug: "commercial-equipment",
        isFeatured: false,
      },
      {
        name: "Commercial Meat Slicer",
        description:
          "Heavy-duty commercial meat slicer with adjustable thickness settings. Perfect for delis and restaurants with food-grade construction.",
        price: 149999, // £1499.99
        images: [
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
        ],
        categorySlug: "commercial-equipment",
        isFeatured: false,
      },
    ];

    // Create products
    let productCount = 0;
    for (const productData of products) {
      const category = createdCategories.find(
        (cat) => cat.slug === productData.categorySlug
      );
      if (!category) {
        console.warn(
          `⚠️ Category not found for slug: ${productData.categorySlug}`
        );
        continue;
      }

      const product = await prisma.product.upsert({
        where: { name: productData.name },
        update: {
          description: productData.description,
          price: productData.price,
          images: toFreeImages(productData.images),
          categoryId: category.id,
          status: "published",
          isFeatured: productData.isFeatured,
        },
        create: {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          images: toFreeImages(productData.images),
          categoryId: category.id,
          status: "published",
          isFeatured: productData.isFeatured,
        },
      });

      productCount++;
      console.log(
        `✅ Product created: ${productData.name} (${productData.isFeatured ? "Featured" : "Regular"})`
      );
    }

    // Create banner images for the homepage carousel
    const banners = [
      {
        title: "Premium Kitchen Equipment Collection",
        imageString:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1920&h=1080&q=90",
      },
      {
        title: "Professional Grilling Solutions",
        imageString:
          "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1920&h=1080&q=90",
      },
      {
        title: "Commercial Refrigeration Systems",
        imageString:
          "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=1920&h=1080&q=90",
      },
      {
        title: "Modern Kitchen Appliances",
        imageString:
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1920&h=1080&q=90",
      },
      {
        title: "Outdoor Cooking Excellence",
        imageString:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=1920&h=1080&q=90",
      },
    ];

    // Create/update banners
    let bannerCount = 0;
    for (const bannerData of banners) {
      // Check if banner already exists
      const existingBanner = await prisma.banner.findFirst({
        where: { title: bannerData.title },
      });

      const imageString = toFreeImage(bannerData.imageString);

      if (!existingBanner) {
        await prisma.banner.create({
          data: {
            title: bannerData.title,
            imageString,
          },
        });
        bannerCount++;
        console.log(`✅ Banner created: ${bannerData.title}`);
      } else {
        await prisma.banner.update({
          where: { id: existingBanner.id },
          data: { imageString },
        });
        bannerCount++;
        console.log(`✅ Banner updated: ${bannerData.title}`);
      }
    }

    // Create admin user with Better Auth compatible structure using Better Auth's password hashing
    const ctx = await auth.$context;
    const adminPasswordHash = await ctx.password.hash("admin123ASD");

    // First, check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@archcool.com" },
      include: { accounts: true },
    });

    if (existingAdmin) {
      // Update existing admin user to ensure proper role
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          role: "admin",
          emailVerified: true,
          name: "Admin User",
          firstName: "Admin",
          lastName: "User",
        },
      });

      // Update existing admin password using Better Auth's credential provider format
      await prisma.account.upsert({
        where: {
          providerId_accountId: {
            providerId: "credential",
            accountId: "admin@archcool.com",
          },
        },
        update: {
          password: adminPasswordHash,
        },
        create: {
          userId: existingAdmin.id,
          accountId: "admin@archcool.com",
          providerId: "credential",
          password: adminPasswordHash,
        },
      });
      console.log("✅ Admin user updated with proper role and password");
    } else {
      // Create new admin user according to Better Auth specifications
      const admin = await prisma.user.create({
        data: {
          email: "admin@archcool.com",
          name: "Admin User",
          firstName: "Admin",
          lastName: "User",
          role: "admin", // This should match adminRoles in auth.ts
          emailVerified: true,
          accounts: {
            create: {
              accountId: "admin@archcool.com",
              providerId: "credential", // Better Auth uses "credential" for email/password
              password: adminPasswordHash,
            },
          },
        },
      });
      console.log("✅ Admin user created with proper role");
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📋 Seeded data summary:");
    console.log(`📂 Categories: ${categories.length} created`);
    console.log(
      `🛍️ Products: ${productCount} created (${products.filter((p) => p.isFeatured).length} featured)`
    );
    console.log(`🖼️ Banners: ${bannerCount} synced for homepage carousel`);
    console.log("👤 Admin user: admin@archcool.com (password: admin123ASD)");
    console.log(
      "\n💡 Featured products are marked and will appear in the homepage featured section"
    );
    console.log(
      "🔄 Infinite scroll will work perfectly with this product dataset!"
    );
    console.log(
      "🎨 Beautiful banner carousel with fading transitions is ready to showcase!"
    );
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
