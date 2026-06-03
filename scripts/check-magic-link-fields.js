const { PrismaClient } = require('@prisma/client');

async function checkMagicLinkFields() {
  const prisma = new PrismaClient();
  
  try {
    console.log("Checking database schema for magic link fields...");
    
    // Try to query an order with magic link fields
    const order = await prisma.order.findFirst({
      select: {
        id: true,
        referenceId: true,
        magicLinkToken: true,
        magicLinkExpiresAt: true,
      },
      take: 1,
    });
    
    console.log("✅ Magic link fields exist in database schema");
    console.log("Sample order structure:", {
      id: order?.id || "no orders found",
      referenceId: order?.referenceId || "no orders found", 
      hasToken: !!order?.magicLinkToken,
      hasExpiry: !!order?.magicLinkExpiresAt,
    });
    
    // Check for any orders with magic link tokens
    const ordersWithTokens = await prisma.order.count({
      where: {
        magicLinkToken: {
          not: null
        }
      }
    });
    
    console.log(`Orders with magic link tokens: ${ordersWithTokens}`);
    
  } catch (error) {
    console.error("❌ Error checking magic link fields:", error.message);
    
    if (error.message.includes('Unknown arg `magicLinkToken`')) {
      console.log("🔧 The magicLinkToken field doesn't exist in your database schema.");
      console.log("Please run: npx prisma db push");
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkMagicLinkFields(); 