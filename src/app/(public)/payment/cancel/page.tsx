import Link from "next/link";
import { XCircle, ArrowUpRight, ShoppingBag } from "lucide-react";

export default function CancelRoute() {
  return (
    <section className="bg-paper">
      <div className="relative border-b border-ink/10 bg-ink text-paper">
        <div className="bg-grain absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-[1440px] px-6 py-16 md:px-10 lg:px-14 lg:py-20">
          <div className="grid grid-cols-12 items-end gap-8">
            <div className="col-span-12 md:col-span-8">
              <div className="flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-ember">
                <span className="flex h-2 w-2 rounded-full bg-ember" />
                § — Payment cancelled
              </div>
              <h1 className="display mt-5 text-[clamp(2.25rem,5vw,4.5rem)]">
                Nothing <span className="italic text-copper">charged.</span>
              </h1>
              <p className="mt-6 max-w-xl text-paper/80">
                Your payment didn't go through — and no card was charged. Your
                bag is still where you left it, ready to retry when you are.
              </p>
            </div>
            <div className="col-span-12 md:col-span-4 md:justify-self-end">
              <div className="inline-flex h-20 w-20 items-center justify-center border border-ember bg-ember/15 text-ember">
                <XCircle className="h-10 w-10" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-6 py-16 md:px-10 md:py-20">
        <div className="border border-ink/15 bg-paper-dim p-8 md:p-12">
          <div className="eyebrow-copper">§ What to try</div>
          <ol className="mt-5 grid gap-4 text-[0.95rem] leading-relaxed text-steel md:grid-cols-2">
            <li className="flex gap-3">
              <span className="text-copper">01</span>
              Retry with the same card — most failures are one-offs.
            </li>
            <li className="flex gap-3">
              <span className="text-copper">02</span>
              Try a different payment method (Apple Pay, Google Pay).
            </li>
            <li className="flex gap-3">
              <span className="text-copper">03</span>
              Check your bag — quantities and shipping postcode.
            </li>
            <li className="flex gap-3">
              <span className="text-copper">04</span>
              Still stuck? Our team can take card over the phone.
            </li>
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/bag" className="btn-ink">
              <ShoppingBag className="h-4 w-4" />
              Return to bag
            </Link>
            <Link href="/contact" className="btn-ghost">
              Talk to a specialist
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
