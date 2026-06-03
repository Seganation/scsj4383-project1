import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

const addressSchema = z.object({
  label: z.string().trim().min(1).max(50),
  fullName: z.string().trim().min(1).max(100),
  phone: z.string().trim().max(30).optional().nullable(),
  addressLine1: z.string().trim().min(1).max(200),
  addressLine2: z.string().trim().max(200).optional().nullable(),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().max(100).optional().nullable(),
  postalCode: z.string().trim().min(1).max(20),
  country: z.string().trim().min(2).max(100),
  isDefault: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raw = await request.json();
    const parsed = addressSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid address data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const addressData = parsed.data;

    // If this is the first address or marked as default, make it default
    const existingAddresses = await prisma.address.count({
      where: { userId: session.user.id },
    });

    const isDefault = existingAddresses === 0 || !!addressData.isDefault;

    // If setting as default, remove default from other addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        label: addressData.label,
        fullName: addressData.fullName,
        phone: addressData.phone || null,
        addressLine1: addressData.addressLine1,
        addressLine2: addressData.addressLine2 || null,
        city: addressData.city,
        state: addressData.state || null,
        postalCode: addressData.postalCode,
        country: addressData.country,
        isDefault,
      },
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
