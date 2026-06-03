"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { UserActions } from "@/components/dashboard/UserActions";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  banned: boolean;
  banReason?: string | null;
  banExpires?: Date | null;
  emailVerified: boolean;
  createdAt: Date;
  _count: { orders: number };
}

interface UsersClientProps {
  users: User[];
}

function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  if (diffInDays === 0) return "today";
  if (diffInDays === 1) return "1 day ago";
  if (diffInDays < 30) return `${diffInDays} days ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

export function UsersClient({ users }: UsersClientProps) {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.image ?? ""} />
            <AvatarFallback className="text-xs">
              {row.original.name?.charAt(0) ?? row.original.email.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">
              {row.original.name ?? "No name"}
            </div>
            <div className="text-xs text-muted-foreground">
              {row.original.emailVerified ? "Verified" : "Unverified"}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant={row.original.role === "admin" ? "default" : "secondary"}>
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: "banned",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.banned ? "destructive" : "default"}>
          {row.original.banned ? "Suspended" : "Active"}
        </Badge>
      ),
    },
    {
      id: "orders",
      header: "Orders",
      accessorFn: (row) => row._count.orders,
      cell: ({ row }) => (
        <Badge variant="outline">{row.original._count.orders} orders</Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Joined
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.createdAt))}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="text-right">
          <UserActions user={row.original} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground text-sm">
            Manage user accounts and permissions
          </p>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={users}
        searchKey="email"
        searchPlaceholder="Search by email..."
        pageSize={10}
      />
    </div>
  );
}
