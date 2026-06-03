const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log("Checking users in database...");
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
      },
    });

    console.log("Found users:", JSON.stringify(users, null, 2));

    console.log("\nChecking admin user specifically...");
    const admin = await prisma.user.findUnique({
      where: { email: "admin@archcool.com" },
      include: { accounts: true },
    });

    console.log("Admin user:", JSON.stringify(admin, null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
