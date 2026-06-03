import { auth } from "@/lib/auth";
import OrderAdminDetailsPage from "@/components/dashboard/OrderAdminDetailsPage";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";

interface OrderAdminDetailsRouteProps {
  params: {
    orderId: string;
  };
}

async function getOrderDetails(orderId: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              description: true,
              category: true,
            },
          },
        },
      },
      address: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return order;
}

export default async function OrderAdminDetailsRoute({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    return redirect("/");
  }

  let order = await getOrderDetails(orderId);

  if (!order) {
    return notFound();
  }

  // Map 'refunded' status to 'cancelled' for compatibility with OrderWithDetails
  if (order.status === "refunded") {
    order = { ...order, status: "cancelled" } as any;
  }

  return <OrderAdminDetailsPage order={order as any} />;
}
