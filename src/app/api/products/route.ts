import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50); // Max 50 items per page

    const baseSelect = {
      id: true,
      name: true,
      description: true,
      price: true,
      images: true,
      category: true,
      isFeatured: true,
      createdAt: true,
    };

    let whereClause: any = {
      status: "published",
    };

    // Add search functionality
    if (search && search.trim()) {
      whereClause = {
        ...whereClause,
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      };
    }

    // Add category filter
    if (category && category !== "all") {
      const categoryRecord = await prisma.category.findUnique({
        where: { slug: category },
      });
      if (categoryRecord) {
        whereClause.categoryId = categoryRecord.id;
      }
    }

    // Add featured filter
    if (featured === "true") {
      whereClause.isFeatured = true;
    }

    // Add cursor-based pagination
    const queryOptions: any = {
      where: whereClause,
      select: baseSelect,
      orderBy: {
        createdAt: "desc",
      },
      take: limit + 1, // Take one extra to determine if there's a next page
    };

    if (cursor) {
      queryOptions.cursor = {
        id: cursor,
      };
      queryOptions.skip = 1; // Skip the cursor item
    }

    const products = await prisma.product.findMany(queryOptions);

    // Check if there's a next page
    const hasNextPage = products.length > limit;
    const items = hasNextPage ? products.slice(0, -1) : products;
    const nextCursor = hasNextPage ? products[products.length - 2].id : null;

    return NextResponse.json({
      items,
      nextCursor,
      hasNextPage,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
