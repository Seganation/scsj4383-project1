import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center bg-paper px-6 py-24 text-ink">
      <div className="mx-auto max-w-xl text-center">
        <div className="eyebrow-copper">§ 404 — Category not on the floor</div>
        <h1 className="display mt-4 text-[clamp(2.5rem,6vw,5rem)] text-ink">
          Category{" "}
          <span className="italic text-copper">not found.</span>
        </h1>
        <p className="mt-5 text-steel">
          The section you're looking for either doesn't exist or was moved
          when we restocked the catalogue.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/products/category/all" className="btn-ink">
            Browse the full catalogue
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/" className="btn-ghost">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
