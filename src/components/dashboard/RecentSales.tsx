import prisma from "@/app/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getData() {
  const data = await prisma.order.findMany({
    select: {
      amount: true,
      id: true,
      status: true,
      createdAt: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          image: true,
          email: true,
        },
      },
      shippingName: true,
      shippingEmail: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 7,
  });

  return data;
}

export async function RecentSales() {
  const data = await getData();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent sales</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        {data.map((item) => {
          // Use user data if available, otherwise use shipping data for guest orders
          const customerName = item.user?.firstName 
            ? `${item.user.firstName} ${item.user.lastName || ''}`.trim()
            : item.shippingName || 'Guest Customer';
          
          const customerEmail = item.user?.email || item.shippingEmail || 'No email';
          
          const avatarFallback = item.user?.firstName 
            ? item.user.firstName.slice(0, 2).toUpperCase()
            : customerName.slice(0, 2).toUpperCase();
          
          const isGuest = !item.user;
          
          return (
            <div className="flex items-center gap-4" key={item.id}>
              <Avatar className="hidden sm:flex h-9 w-9">
                <AvatarImage
                  src={item.user?.image || undefined}
                  alt="Avatar Image"
                />
                <AvatarFallback className={isGuest ? "bg-gray-100 text-gray-600" : ""}>
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium">
                  {customerName}
                  {isGuest && <span className="ml-1 text-xs text-gray-500">(Guest)</span>}
                </p>
                <p className="text-sm text-muted-foreground">
                  {customerEmail}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.status} • {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className="ml-auto font-medium">
                +£{new Intl.NumberFormat("en-GB").format(item.amount)}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
