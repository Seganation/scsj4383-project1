"use client";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-6xl font-bold text-red-500 mb-4">Something went wrong</h1>
      <h2 className="text-2xl font-semibold mb-2">An unexpected error occurred.</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Please try again later or return to the home page.
      </p>
      <div className="flex gap-4">
        <button
          className="px-6 py-3 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition"
          onClick={() => reset()}
        >
          Try Again
        </button>
        <Link href="/">
          <button className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition">
            Return to Home Page
          </button>
        </Link>
      </div>
    </div>
  );
} 