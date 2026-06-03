import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prismaClientSingleton = () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// Generates the next order referenceId in the format ORD-yymmdd-nnn
export async function generateNextOrderReferenceId() {
  try {
    const latestOrder: any = await prisma.order.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let nextN = 1;
    if (latestOrder && latestOrder.referenceId) {
      const match = latestOrder.referenceId.match(/ORD-\d{6}-(\d{3})/);
      if (match) {
        nextN = parseInt(match[1], 10) + 1;
      }
    }

    const now = new Date();
    const y = String(now.getFullYear()).slice(-2);
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const datePart = `${y}${m}${d}`;
    const nnn = String(nextN).padStart(3, "0");
    return `ORD-${datePart}-${nnn}`;
  } catch (error) {
    console.error("Error generating order reference ID:", error);
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-6);
    return `ORD-${timestamp}`;
  }
}

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
