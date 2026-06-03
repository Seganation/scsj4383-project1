"use client";

import { useSession } from "@/lib/auth-client";
import { MyOrdersPage } from "@/components/storefront/MyOrdersPage";
import { SignInPrompt } from "@/components/storefront/SignInPrompt";
import { useEffect } from "react";

export default function MyOrdersRoute() {
  const { data: session, isPending, error } = useSession();

  // Handle session error
  if (error) {
    console.error("Session error in my-orders:", error);
  }

  // Store redirect URL when user is not authenticated
  useEffect(() => {
    if (!isPending && (!session?.user || error)) {
      const currentUrl = window.location.pathname;
      localStorage.setItem("redirectAfterSignIn", currentUrl);
    }
  }, [isPending, session, error]);

  // Show loading while checking session
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not authenticated, show sign-in prompt
  if (!session?.user || error) {
    return <SignInPrompt />;
  }

  return <MyOrdersPage userId={session.user.id} />;
}
