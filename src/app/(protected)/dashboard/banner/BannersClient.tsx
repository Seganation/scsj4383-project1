"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { Image } from "@/components";
import Link from "next/link";

interface Banner {
  id: string;
  title: string;
  imageString: string;
  createdAt: Date;
}

interface BannersClientProps {
  data: Banner[];
}

export function BannersClient({ data }: BannersClientProps) {
  const columns: ColumnDef<Banner>[] = [
    {
      accessorKey: "imageString",
      header: "Image",
      enableSorting: false,
      cell: ({ row }) => (
        <Image
          alt={row.original.title}
          src={row.original.imageString}
          width={64}
          height={64}
          className="rounded-lg object-cover h-14 w-14"
        />
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
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
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/banner/${row.original.id}/delete`}>
                  Delete
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Banners</h1>
          <p className="text-muted-foreground text-sm">
            Manage your homepage banners
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/banner/create">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Banner
          </Link>
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        searchKey="title"
        searchPlaceholder="Search banners..."
        pageSize={10}
      />
    </div>
  );
}
