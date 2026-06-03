import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Cart } from "@/lib/interfaces";
import { getCartFromStorage, setCartInStorage } from "@/lib/cart-storage";
import { headers } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get the product details
    const selectedProduct = await prisma.product.findUnique({
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
      },
      where: {
        id: productId,
      },
    });

    if (!selectedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get current cart
    let cart: Cart | null = await getCartFromStorage(userId);

    let myCart = {} as Cart;

    if (!cart || !cart.items) {
      myCart = {
        userId: userId,
        items: [
          {
            price: selectedProduct.price,
            id: selectedProduct.id,
            imageString: selectedProduct.images[0],
            name: selectedProduct.name,
            quantity: 1,
          },
        ],
      };
    } else {
      let itemFound = false;

      myCart.items = cart.items.map((item) => {
        if (item.id === productId) {
          itemFound = true;
          item.quantity += 1;
        }
        return item;
      });

      if (!itemFound) {
        myCart.items.push({
          id: selectedProduct.id,
          imageString: selectedProduct.images[0],
          name: selectedProduct.name,
          price: selectedProduct.price,
          quantity: 1,
        });
      }

      myCart.userId = userId;
    }

    await setCartInStorage(userId, myCart);

    return NextResponse.json(myCart);
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
