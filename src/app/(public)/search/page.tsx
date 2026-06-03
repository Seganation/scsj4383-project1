"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MiniSearchResults } from "@/components/storefront/MiniSearchResults";
import { Loader2 } from "lucide-react";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  return <MiniSearchResults initialQuery={query} />;
}

function SearchLoadingFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-paper">
      <div className="flex items-center gap-3 font-mono text-[0.78rem] uppercase tracking-[0.16em] text-steel">
        <Loader2 className="h-4 w-4 animate-spin text-copper" />
        Loading search…
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoadingFallback />}>
      <SearchPageContent />
    </Suspense>
  );
}
