import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/app/lib/db";
import { emailService } from "@/app/lib/email";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Check if user is authenticated and is admin
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { status, reason } = await request.json();

    // Validate status
    const validStatuses = ["pending", "paid", "cancelled", "fulfilled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Get current order to check status workflow
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Validate status transitions
    if (currentOrder.status === "cancelled") {
      return NextResponse.json({ 
        error: "Cannot update cancelled orders" 
      }, { status: 400 });
    }

    if (currentOrder.status === "fulfilled") {
      return NextResponse.json({ 
        error: "Cannot update fulfilled orders" 
      }, { status: 400 });
    }

    if (currentOrder.status === "paid" && status === "cancelled") {
      return NextResponse.json({ 
        error: "Cannot cancel orders that are ready to ship. Only fulfillment is allowed." 
      }, { status: 400 });
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status,
        // If marking as paid, also update payment status
        ...(status === "paid" && {
          paymentStatus: "succeeded",
          paidAt: new Date(),
        }),
      },
    });

    // Send appropriate email based on status change
    if (currentOrder.shippingEmail) {
      const customerName = currentOrder.shippingName || 
                          currentOrder.user?.name || 
                          currentOrder.shippingEmail.split('@')[0];

      const magicLink = currentOrder.magicLinkToken
        ? `${process.env.NEXT_PUBLIC_APP_URL}/my-orders/${currentOrder.referenceId}?verify=${currentOrder.magicLinkToken}`
        : undefined;

      try {
        switch (status) {
          case "paid":
            // Order is ready to ship
            await emailService.sendOrderReadyToShip(currentOrder.shippingEmail, {
              referenceId: currentOrder.referenceId,
              customerName,
              magicLink,
            });
            break;

          case "fulfilled":
            // Order has been delivered
            await emailService.sendOrderFulfilled(currentOrder.shippingEmail, {
              referenceId: currentOrder.referenceId,
              customerName,
              magicLink,
            });
            break;

          case "cancelled":
            // Order has been cancelled
            await emailService.sendOrderCancelled(currentOrder.shippingEmail, {
              referenceId: currentOrder.referenceId,
              customerName,
              reason,
            });
            break;

          case "pending":
            // No email for pending status (usually initial state)
            break;
        }
      } catch (emailError) {
        console.error(`Failed to send ${status} email:`, emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
