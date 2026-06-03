"use client";

import { useClientCart } from "@/hooks/use-client-cart";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { ShoppingBag, ArrowUpRight, Loader2, AlertTriangle, ShieldCheck, Lock } from "lucide-react";
import { PageShell } from "@/components/storefront/PageShell";

export function CheckoutClient() {
  const { cart } = useClientCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const cartItems = cart?.items || [];

  const isAdmin = session?.user && (session.user as any).role === "admin";

  const handleCheckout = async () => {
    if (isAdmin) {
      toast.error("Admins cannot make purchases.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) window.location.href = data.url;
      else throw new Error("No checkout URL received");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Checkout failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <PageShell
        section="§ 08 — Checkout"
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Bag", href: "/bag" }, { name: "Checkout" }]}
        title={
          <>
            Bag is <span className="italic text-copper">empty.</span>
          </>
        }
        lede="Add items to the bag before proceeding to checkout."
      >
        <Link href="/products/category/all" className="btn-ink">
          <ShoppingBag className="h-4 w-4" />
          Browse catalogue
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </PageShell>
    );
  }

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalUnits = cartItems.reduce((n, i) => n + i.quantity, 0);

  return (
    <PageShell
      section="§ 08 — Checkout"
      breadcrumbs={[
        { name: "Home", href: "/" },
        { name: "Bag", href: "/bag" },
        { name: "Checkout" },
      ]}
      title={
        <>
          Secure <span className="italic text-copper">handover.</span>
        </>
      }
      lede="Review the order and hand off to Stripe. Payment card, shipping address and VAT are all collected on their secure page."
    >
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {isAdmin && (
            <div className="flex items-start gap-4 border border-destructive/30 bg-destructive/5 p-5">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <div className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-destructive">
                  Admin account
                </div>
                <p className="mt-1 text-sm text-ink">
                  Admin accounts can't check out on their own store.
                </p>
              </div>
            </div>
          )}

          <div className="border border-copper/40 bg-copper/5 p-5">
            <div className="eyebrow-copper">§ VAT + shipping</div>
            <p className="mt-2 text-sm text-steel">
              All product prices include UK VAT.{" "}
              <strong className="text-ink">Shipping is not included</strong> —
              it's quoted and paid separately with the courier on delivery,
              priced by postcode and unit weight.
            </p>
          </div>

          <div className="border border-ink/15 bg-paper">
            <header className="flex items-center justify-between border-b border-ink/10 bg-paper-dim px-6 py-4">
              <div className="eyebrow-copper">§ Order summary / {String(totalUnits).padStart(2, "0")}</div>
              <Link href="/bag" className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-steel hover:text-copper">
                ← Edit bag
              </Link>
            </header>
            <ul className="divide-y divide-ink/10">
              {cartItems.map((item, idx) => (
                <li key={item.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-steel-light">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="font-display text-base font-semibold text-ink">{item.name}</div>
                      <div className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-steel-light">
                        ×{item.quantity} · £{item.price.toLocaleString("en-GB")} ea
                      </div>
                    </div>
                  </div>
                  <div className="font-display text-base font-semibold tabular-nums text-ink">
                    £{(item.price * item.quantity).toLocaleString("en-GB")}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-4">
          <div className="sticky top-28 border border-ink bg-ink text-paper">
            <header className="flex items-center justify-between border-b border-paper/15 px-6 py-4">
              <div className="eyebrow-copper">§ Totals</div>
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-paper/60">
                GBP
              </div>
            </header>
            <div className="space-y-3 px-6 py-5 font-mono text-sm">
              <Row label="Subtotal" value={`£${subtotal.toLocaleString("en-GB")}`} />
              <Row label="Shipping" value="Quoted on delivery" accent />
              <Row label="VAT" value="Included" />
            </div>
            <div className="border-t border-paper/15 px-6 py-5">
              <div className="flex items-end justify-between">
                <div>
                  <div className="eyebrow !text-paper/55">Order total</div>
                  <div className="mt-2 font-display text-3xl font-semibold tabular-nums md:text-4xl">
                    £{subtotal.toLocaleString("en-GB")}
                  </div>
                </div>
                <div className="text-right font-mono text-[0.7rem] uppercase tracking-[0.12em] text-paper/55">
                  + shipping
                </div>
              </div>
            </div>
            <div className="border-t border-paper/15 p-6">
              <button
                onClick={handleCheckout}
                disabled={loading || !!isAdmin}
                className="btn-copper w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting to Stripe…
                  </>
                ) : isAdmin ? (
                  "Admin — cannot checkout"
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Proceed to payment
                    <ArrowUpRight className="h-4 w-4" />
                  </>
                )}
              </button>
              <div className="mt-5 flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-paper/55">
                <ShieldCheck className="h-3.5 w-3.5 text-copper" />
                Secure handover · Stripe · UK
              </div>
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between text-paper/80">
      <span className="text-paper/60">{label}</span>
      <span className={`tabular-nums ${accent ? "text-copper" : ""}`}>{value}</span>
    </div>
  );
}
