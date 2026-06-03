// Simple admin creation using Prisma
import prisma from "../src/app/lib/db";

async function makeUserAdmin(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: "admin" },
    });

    console.log("✅ User updated to admin:", {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("❌ Error updating user to admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line args or use default
const email = process.argv[2] || "admin@archcool.com";
makeUserAdmin(email);
