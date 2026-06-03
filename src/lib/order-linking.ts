import prisma from "@/lib/db";

/**
 * Links guest orders to a user account when they register
 * This function should be called after user registration
 */
export async function linkGuestOrdersToUser(userEmail: string, userId: string) {
  try {
    // Find all guest orders with this email that haven't been linked yet
    const guestOrders = await prisma.order.findMany({
      where: {
        shippingEmail: userEmail,
        userId: null,
      } as any,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (guestOrders.length === 0) {
      console.log(`No guest orders found for email: ${userEmail}`);
      return { linked: 0, orders: [] };
    }

    // Link all guest orders to the user
    const linkedOrders = [];
    for (const order of guestOrders) {
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          userId: userId,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      linkedOrders.push(updatedOrder);
    }

    console.log(
      `✅ Linked ${linkedOrders.length} guest orders to user ${userId}`
    );

    return {
      linked: linkedOrders.length,
      orders: linkedOrders,
    };
  } catch (error) {
    console.error("❌ Error linking guest orders to user:", error);
    throw error;
  }
}

/**
 * Check if a user has any guest orders that can be linked
 */
export async function checkForGuestOrders(userEmail: string) {
  try {
    const guestOrderCount = await prisma.order.count({
      where: {
        shippingEmail: userEmail,
        userId: null,
      } as any,
    });

    return guestOrderCount > 0;
  } catch (error) {
    console.error("Error checking for guest orders:", error);
    return false;
  }
}

/**
 * Get all orders for a user (both linked and original user orders)
 */
export async function getUserOrders(userId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return orders;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
}

/**
 * Find guest orders by email (for guest order lookup)
 */
export async function getGuestOrdersByEmail(email: string) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        shippingEmail: email,
        userId: null,
      } as any,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return orders;
  } catch (error) {
    console.error("Error fetching guest orders:", error);
    throw error;
  }
}
