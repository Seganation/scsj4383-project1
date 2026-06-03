"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";

interface CopyUrlButtonProps {
  productName: string;
}

export function CopyUrlButton({ productName }: CopyUrlButtonProps) {
  const handleCopy = () => {
    const url = `${window.location.origin}/product/${encodeURIComponent(productName)}`;
    navigator.clipboard.writeText(url);
    toast.success("Product URL copied to clipboard!");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={handleCopy}
    >
      <Copy className="h-3 w-3" />
    </Button>
  );
}
