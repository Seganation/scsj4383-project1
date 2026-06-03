import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for session cookie (optimistic, not secure for sensitive checks)
  const sessionCookie = getSessionCookie(request);

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/sign-in",
    "/sign-up",
    "/auth/sign-in", // Keep for backward compatibility
    "/auth/sign-up", // Keep for backward compatibility
    "/products",
    "/product",
    "/search", // Allow guests to search
    "/bag", // Allow guests to view their cart
    "/checkout", // Allow guests to checkout
    "/payment", // Allow guests to access payment pages
    "/api/auth",
    "/api/products",
    "/api/stripe/webhook",
    "/api/uploadthing", // Add UploadThing API route
    "/api/upload-direct", // Allow server-side UTApi fallback
    "/api/checkout", // Allow checkout API access
  ];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Admin routes that require admin privileges
  const adminRoutes = ["/dashboard"];
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // If trying to access admin routes
  if (isAdminRoute) {
    // Redirect to sign-in if not authenticated
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Check if user is admin
    // NOTE: You cannot securely check user role in middleware with only the cookie.
    // For admin checks, do a secure check in the page/server action itself.
  }

  // If trying to access protected routes (non-public, non-admin)
  if (!isPublicRoute && !isAdminRoute) {
    // Redirect to sign-in if not authenticated
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // If authenticated user tries to access auth pages, redirect to appropriate page
  // NOTE: You cannot securely redirect based on user role in middleware with only the cookie.
  // Do this logic in the page/server action instead.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
