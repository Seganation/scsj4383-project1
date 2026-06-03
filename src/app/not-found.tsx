import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description:
    "The page you are looking for could not be found. Browse our premium kitchen appliances and outdoor equipment.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved or doesn't exist.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
          >
            Go Home
          </Link>
          <div className="text-sm text-gray-500">
            <Link
              href="/products/category/all"
              className="text-primary hover:underline"
            >
              Browse All Products
            </Link>
            {" | "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
