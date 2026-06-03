"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, PlusCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { CopyUrlButton } from "@/components/dashboard/CopyUrlButton";
import { ClientDate } from "@/components/ClientDate";

interface Product {
  id: string;
  name: string;
  price: number;
  status: string;
  images: string[];
  isFeatured: boolean;
  createdAt: Date;
}

interface ProductsClientProps {
  data: Product[];
}

export function ProductsClient({ data }: ProductsClientProps) {
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "images",
      header: "Image",
      enableSorting: false,
      cell: ({ row }) => (
        <Image
          alt={row.original.name}
          src={
            row.original.images && row.original.images.length > 0
              ? row.original.images[0]
              : "/placeholder.png"
          }
          height={48}
          width={48}
          className="rounded-md object-cover h-12 w-12"
        />
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const variantMap: Record<string, string> = {
          published: "bg-green-100 text-green-800 border-0",
          draft: "bg-yellow-100 text-yellow-800 border-0",
          archived: "bg-gray-100 text-gray-800 border-0",
        };
        return (
          <Badge className={variantMap[status] ?? ""}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span>£{row.original.price}</span>,
    },
    {
      accessorKey: "isFeatured",
      header: "Featured",
      cell: ({ row }) =>
        row.original.isFeatured ? (
          <Badge className="bg-blue-100 text-blue-800 border-0">Featured</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
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
        <ClientDate date={row.original.createdAt.toString()} />
      ),
    },
    {
      id: "url",
      header: "URL",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" asChild className="h-7 text-xs">
            <Link
              href={`/products/${encodeURIComponent(row.original.name)}`}
              target="_blank"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View
            </Link>
          </Button>
          <CopyUrlButton productName={row.original.name} />
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
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
              <Link href={`/dashboard/products/${row.original.id}`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/products/${row.original.id}/delete`}>
                Delete
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground text-sm">
            Manage your products and view their sales performance
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/create">
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Search products..."
        pageSize={10}
      />
    </div>
  );
}
