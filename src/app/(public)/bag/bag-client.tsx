"use client";

import { BagPage } from "@/components/storefront/BagPage";
import { useSession } from "@/lib/auth-client";

export function BagClient() {
  // Use client session if available, but allow guests
  const { data: session } = useSession();
  return <BagPage userId={session?.user?.id || null} />;
}