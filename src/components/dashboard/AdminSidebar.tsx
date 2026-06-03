"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Folder,
  Image,
  Users,
  LogOut,
  ChevronRight,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { authClient } from "@/app/lib/auth-client"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: { title: string; href: string }[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: Package,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: ShoppingBag,
    children: [
      { title: "All Products", href: "/dashboard/products" },
      { title: "New Product", href: "/dashboard/products/create" },
    ],
  },
  {
    title: "Categories",
    href: "/dashboard/categories",
    icon: Folder,
    children: [
      { title: "All Categories", href: "/dashboard/categories" },
      { title: "New Category", href: "/dashboard/categories/new" },
    ],
  },
  {
    title: "Banners",
    href: "/dashboard/banner",
    icon: Image,
    children: [
      { title: "All Banners", href: "/dashboard/banner" },
      { title: "New Banner", href: "/dashboard/banner/create" },
    ],
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
]

interface AdminSidebarProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully")
            router.push("/")
            router.refresh()
          },
        },
      })
    } catch (error) {
      toast.error("Failed to sign out")
      console.error(error)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
            A
          </div>
          <span className="font-semibold text-sidebar-foreground">Archcool Admin</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href)

                if (item.children) {
                  return (
                    <Collapsible
                      key={item.href}
                      defaultOpen={isActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            isActive={isActive}
                            className="w-full"
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((child) => (
                              <SidebarMenuSubItem key={child.href}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === child.href}
                                >
                                  <Link href={child.href}>{child.title}</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user?.image ?? ""} />
            <AvatarFallback className="text-xs">
              {user?.name?.charAt(0) ?? user?.email?.charAt(0) ?? "A"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {user?.name ?? "Admin"}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              {user?.email ?? ""}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/60",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            )}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
