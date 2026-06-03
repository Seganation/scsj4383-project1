"use client";

import { useSession } from "@/lib/auth-client";
import { useMemo } from "react";

export function useAdminCheck() {
  const { data: session, isPending, error } = useSession();

  const isAdmin = useMemo(() => {
    if (!session?.user) return false;

    // Check if user has admin role
    // Better Auth stores role as a property on the user object
    const userRole = (session.user as any).role;
    return userRole === "admin";
  }, [session?.user]);

  return {
    isAdmin,
    isPending,
    error,
    user: session?.user,
  };
}
