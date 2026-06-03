"use client";

import { useClientCart } from "@/app/hooks/use-client-cart";
import { ShoppingBag, User, Lock, Check, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell } from "./PageShell";

export function SignInPrompt() {
  const { cart, getCartItemCount } = useClientCart();
  const [itemCount, setItemCount] = useState(0);
  const [redirectUrl, setRedirectUrl] = useState("/sign-in");

  useEffect(() => {
    setItemCount(getCartItemCount());
  }, [cart, getCartItemCount]);

  useEffect(() => {
    const storedRedirect = localStorage.getItem("redirectAfterSignIn");
    const currentPath = window.location.pathname;
    if (storedRedirect) {
      setRedirectUrl(`/sign-in?redirectTo=${encodeURIComponent(storedRedirect)}`);
    } else if (currentPath !== "/") {
      setRedirectUrl(`/sign-in?redirectTo=${encodeURIComponent(currentPath)}`);
    }
  }, []);

  return (
    <PageShell
      section="§ — Gated area"
      breadcrumbs={[{ name: "Home", href: "/" }, { name: "Sign-in required" }]}
      title={
        <>
          Sign in to <span className="italic text-copper">continue.</span>
        </>
      }
      lede="This section of the house needs a signed-in account. It's a two-minute sign-up — and guest checkout is still available."
    >
      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-7">
          <div className="border border-ink/15 bg-paper-dim p-8 md:p-10">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center border border-copper bg-copper text-paper">
                <User className="h-5 w-5" />
              </span>
              <div>
                <div className="eyebrow-copper">§ Access required</div>
                <div className="mt-1 font-display text-2xl font-semibold text-ink">
                  Sign in to your account
                </div>
              </div>
            </div>

            {itemCount > 0 && (
              <div className="mt-6 flex items-start gap-3 border border-copper/40 bg-copper/5 p-5 text-ink">
                <ShoppingBag className="mt-0.5 h-5 w-5 shrink-0 text-copper" />
                <div>
                  <div className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-copper">
                    Bag preserved
                  </div>
                  <p className="mt-1 text-sm text-steel">
                    You have <strong className="text-ink">{itemCount}</strong>{" "}
                    item{itemCount === 1 ? "" : "s"} waiting — they'll still be
                    there once you sign in.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-7 grid gap-3">
              <Link href={redirectUrl} className="btn-ink w-full">
                <Lock className="h-4 w-4" />
                Sign in
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/sign-up" className="btn-ghost w-full">
                Create an account
              </Link>
            </div>
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-5">
          <div className="border border-ink/15 bg-paper-dim p-6">
            <div className="eyebrow-copper">§ Why an account</div>
            <ul className="mt-5 space-y-4">
              {[
                "Track orders and delivery in one place",
                "Faster checkout with saved addresses",
                "Invoices and receipts on demand",
                "Break-fix line tied to your installs",
              ].map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-steel">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
