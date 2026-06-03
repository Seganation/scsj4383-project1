"use client";

import { useSession as useBetterAuthSession } from "@/lib/auth-client";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

export function useSession() {
  const session = useBetterAuthSession();
  const hasLinkedOrders = useRef(false);

  useEffect(() => {
    // Only run after user is authenticated and only once per session
    if (
      session.data?.user &&
      !hasLinkedOrders.current &&
      !session.isPending &&
      !session.error
    ) {
      hasLinkedOrders.current = true;
      fetch("/api/orders/link-guest-orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.linked && data.linked > 0) {
            toast.success(
              `Linked ${data.linked} previous guest order${data.linked > 1 ? "s" : ""} to your account.`
            );
          }
        })
        .catch((err) => {
          // Silent fail, but log for debugging
          console.error("Guest order linking error:", err);
        });
    }
  }, [session.data?.user, session.isPending, session.error]);

  return {
    data: session.data,
    loading: session.isPending,
    error: session.error,
    user: session.data?.user,
    isAdmin: session.data?.user?.role === "admin",
    isAuthenticated: !!session.data?.session,
  };
}

export function useUser() {
  const { user, isAdmin, isAuthenticated } = useSession();

  return {
    user,
    isAdmin,
    isAuthenticated,
  };
}
