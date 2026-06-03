import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { emailService } from "@/app/lib/email";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Check authentication + admin role via session
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { orderId, status } = await req.json();

    const allowedStatuses = ["pending", "paid", "fulfilled", "shipped", "cancelled", "refunded"];
    if (!orderId || typeof orderId !== "string" || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid order id or status" },
        { status: 400 }
      );
    }

    // Get order with user details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // Send appropriate email based on status
    if (order.user?.email) {
      try {
        const orderData = {
          orderNumber: order.id,
          customerName:
            order.user.firstName && order.user.lastName
              ? `${order.user.firstName} ${order.user.lastName}`
              : order.user.email,
          items: order.items.map((item) => ({
            name: item.product?.name || "Product",
            quantity: item.quantity,
            price: item.price,
          })),
          total: order.amount,
          trackingNumber: `ARCH${order.id.slice(-6).toUpperCase()}`,
          estimatedDelivery: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toLocaleDateString(),
        };

        if (status === "shipped") {
          await emailService.sendOrderShipped(order.user.email, orderData);
          if (process.env.NODE_ENV === "development") {
            console.log("✅ Order shipped email sent to:", order.user.email);
          }
        }

        return NextResponse.json({
          success: true,
          message: `Order status updated to ${status} and email sent`,
          order: updatedOrder,
        });
      } catch (emailError) {
        console.error("⚠️ Failed to send order status email:", emailError);
        return NextResponse.json({
          success: true,
          message: `Order status updated to ${status} but email failed`,
          order: updatedOrder,
          emailError: "Failed to send email notification",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
