import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, Users, Image, BarChart3 } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  const actions = [
    {
      title: "Add Product",
      description: "Create a new product",
      icon: Package,
      href: "/dashboard/products/create",
      color: "bg-blue-500"
    },
    {
      title: "Add Category",
      description: "Create a new category",
      icon: Plus,
      href: "/dashboard/categories/new",
      color: "bg-green-500"
    },
    {
      title: "Add Banner",
      description: "Create a new banner",
      icon: Image,
      href: "/dashboard/banner/create",
      color: "bg-purple-500"
    },
    {
      title: "View Orders",
      description: "Manage recent orders",
      icon: BarChart3,
      href: "/dashboard/orders",
      color: "bg-orange-500"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks to manage your store
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.href}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              asChild
            >
              <Link href={action.href}>
                <div className={`p-2 rounded-md ${action.color}`}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}