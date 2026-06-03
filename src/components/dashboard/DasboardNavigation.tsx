"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardNavigationProps {
  onNavigate?: () => void;
}

const links = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Orders",
    href: "/dashboard/orders",
  },
  {
    name: "Products",
    href: "/dashboard/products",
  },
  {
    name: "Categories",
    href: "/dashboard/categories",
  },
  {
    name: "Banners",
    href: "/dashboard/banner",
  },
  {
    name: "Users",
    href: "/dashboard/users",
  },
];

export function DashboardNavigation({ onNavigate }: DashboardNavigationProps = {}) {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            link.href === pathname
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={onNavigate}
        >
          {link.name}
        </Link>
      ))}
    </>
  );
}
