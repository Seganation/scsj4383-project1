import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Cart } from "@/lib/interfaces";
import { getCartFromStorage, setCartInStorage } from "@/lib/cart-storage";
import { headers } from "next/headers";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; productId: string }> }
) {
  const { userId, productId } = await params;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let cart: Cart | null = await getCartFromStorage(userId);

    if (cart && cart.items) {
      const updateCart: Cart = {
        userId: userId,
        items: cart.items.filter((item) => item.id !== productId),
      };

      await setCartInStorage(userId, updateCart);
      return NextResponse.json(updateCart);
    }

    return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; productId: string }> }
) {
  const { userId, productId } = await params;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user || session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    let cart: Cart | null = await getCartFromStorage(userId);
    if (!cart || !cart.items) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }
    let updateCart: Cart = {
      userId: userId,
      items: cart.items.map((item) =>
        item.id === productId ? { ...item, quantity: 1 } : item
      ),
    };
    await setCartInStorage(userId, updateCart);
    return NextResponse.json(updateCart);
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; productId: string }> }
) {
  const { userId, productId } = await params;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quantity } = await request.json();

    if (typeof quantity !== "number" || quantity < 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    let cart: Cart | null = await getCartFromStorage(userId);

    if (cart && cart.items) {
      const updateCart: Cart = {
        userId: userId,
        items: cart.items
          .map((item) =>
            item.id === productId ? { ...item, quantity } : item
          )
          .filter((item) => item.quantity > 0), // Remove items with 0 quantity
      };

      await setCartInStorage(userId, updateCart);
      return NextResponse.json(updateCart);
    }

    return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
