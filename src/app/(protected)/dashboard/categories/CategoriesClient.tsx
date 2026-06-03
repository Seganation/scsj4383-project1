"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

interface CategoriesClientProps {
  categories: Category[];
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const columns: ColumnDef<Category>[] = [
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
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.original.slug}
        </span>
      ),
    },
    {
      id: "productCount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Products
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorFn: (row) => row._count.products,
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original._count.products} products</Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/categories/${row.original.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/categories/${row.original.id}/delete`}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground text-sm">
            Manage product categories
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={categories}
        searchKey="name"
        searchPlaceholder="Search categories..."
        pageSize={10}
      />
    </div>
  );
}
