"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const navbarLinks = [
  { id: 0, name: "Home", shortName: "Home", href: "/", code: "00" },
  {
    id: 1,
    name: "All Products",
    shortName: "Catalogue",
    href: "/products/category/all",
    code: "01",
  },
  {
    id: 2,
    name: "Cooking Equipment",
    shortName: "Hot Line",
    href: "/products/category/cooking-equipment",
    code: "02",
  },
  {
    id: 3,
    name: "Refrigeration",
    shortName: "Cold Line",
    href: "/products/category/refrigeration",
    code: "03",
  },
  {
    id: 4,
    name: "Grills",
    shortName: "Grills",
    href: "/products/category/grills",
    code: "04",
  },
  {
    id: 5,
    name: "My Orders",
    shortName: "Orders",
    href: "/my-orders",
    code: "05",
  },
];

interface NavbarLinksProps {
  mode?: "desktop" | "mobile";
  onNavigate?: () => void;
}

export function NavbarLinks({ mode = "desktop", onNavigate }: NavbarLinksProps) {
  const pathname = usePathname();

  if (mode === "mobile") {
    return (
      <nav className="flex flex-col">
        {navbarLinks.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              href={item.href}
              key={item.id}
              onClick={onNavigate}
              className={cn(
                "group flex items-baseline justify-between border-t border-ink/10 py-4 transition-colors",
                active
                  ? "text-copper"
                  : "text-ink hover:text-copper"
              )}
            >
              <span className="flex items-baseline gap-3">
                <span className="font-mono text-[0.65rem] text-steel-light">
                  {item.code}
                </span>
                <span className="font-display text-xl font-semibold">
                  {item.name}
                </span>
              </span>
              <span
                className={cn(
                  "font-mono text-xs transition-transform group-hover:translate-x-1",
                  active ? "text-copper" : "text-steel-light"
                )}
              >
                →
              </span>
            </Link>
          );
        })}
      </nav>
    );
  }

  // Desktop
  return (
    <div className="flex items-center gap-1">
      {navbarLinks.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            href={item.href}
            key={item.id}
            className={cn(
              "group relative inline-flex h-10 items-center px-3 font-mono text-[0.72rem] uppercase tracking-[0.16em] transition-colors",
              active
                ? "text-copper"
                : "text-ink hover:text-copper"
            )}
          >
            {item.shortName}
            <span
              className={cn(
                "pointer-events-none absolute inset-x-3 bottom-1 h-px transition-transform duration-300",
                active
                  ? "bg-copper scale-x-100"
                  : "bg-copper/60 scale-x-0 group-hover:scale-x-100"
              )}
              style={{ transformOrigin: active ? "left" : undefined }}
            />
          </Link>
        );
      })}
    </div>
  );
}
