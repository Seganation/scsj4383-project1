"use client";

import { useClientCart } from "@/hooks/use-client-cart";
import { useSession } from "@/lib/auth-client";
import { ShoppingBag, Trash2, Plus, Minus, ArrowUpRight, AlertTriangle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { PageShell } from "./PageShell";

interface BagPageProps {
  userId: string | null;
}

export function BagPage({ userId }: BagPageProps) {
  const { cart, isLoading, updateItemQuantity, removeItem } = useClientCart();
  const { data: session } = useSession();
  const router = useRouter();

  const isAdmin = session?.user && (session.user as any).role === "admin";

  if (isLoading) {
    return (
      <PageShell
        section="§ 06 — The bag"
        title="Loading your bag…"
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Bag" }]}
      >
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse border border-ink/10 bg-paper-dim" />
          ))}
        </div>
      </PageShell>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <PageShell
        section="§ 06 — The bag"
        title={
          <>
            Your bag is <span className="italic text-copper">empty.</span>
          </>
        }
        lede="Nothing speced yet. Head back to the catalogue, or give us a call if you need to talk through a build."
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Bag" }]}
      >
        <div className="border border-ink/15 bg-paper-dim p-10 text-center md:p-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-ink bg-ink text-paper">
            <ShoppingBag className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <h2 className="display mt-6 text-3xl text-ink">Nothing in the bag.</h2>
          <p className="mt-3 text-steel">
            Start from the catalogue or contact a specialist.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/products/category/all" className="btn-ink">
              Browse catalogue
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="btn-ghost">
              Talk to a specialist
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalUnits = cart.items.reduce((n, item) => n + item.quantity, 0);

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    updateItemQuantity(productId, quantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };

  const handleCheckout = () => {
    if (isAdmin) {
      toast.error("Admins cannot purchase from their own store.");
      return;
    }
    router.push("/checkout");
  };

  return (
    <PageShell
      section="§ 06 — The bag"
      title={
        <>
          Ready to <span className="italic text-copper">go to service.</span>
        </>
      }
      lede={`${totalUnits} ${totalUnits === 1 ? "unit" : "units"} ready to spec. Shipping added at checkout.`}
      breadcrumbs={[{ name: "Home", href: "/" }, { name: "Bag" }]}
    >
      {isAdmin && (
        <div className="mb-8 flex items-start gap-4 border border-destructive/30 bg-destructive/5 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <div className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-destructive">
              Admin account
            </div>
            <p className="mt-1 text-sm text-ink">
              You're signed in as an admin — checkout is disabled on your own
              store. Sign out or use a customer account to purchase.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-8">
        {/* Line items */}
        <section className="col-span-12 lg:col-span-8">
          <header className="flex items-center justify-between border-b border-ink/15 pb-4">
            <div className="eyebrow-copper">§ Line items / {String(totalUnits).padStart(2, "0")}</div>
            <div className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-steel-light">
              Spec
            </div>
          </header>

          <ul className="divide-y divide-ink/10">
            {cart.items.map((item, idx) => (
              <li key={item.id} className="grid grid-cols-12 items-center gap-4 py-6">
                <div className="col-span-2 md:col-span-2">
                  <div className="relative aspect-square w-full overflow-hidden border border-ink/10 bg-paper-dim">
                    <Image
                      src={item.imageString}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 25vw, 15vw"
                      className="object-cover"
                    />
                    <span className="absolute left-1.5 top-1.5 bg-ink/90 px-1.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-paper">
                      № {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <div className="col-span-10 md:col-span-5">
                  <h3 className="font-display text-lg font-semibold leading-snug text-ink md:text-xl">
                    <Link
                      href={`/products/${encodeURIComponent(item.name)}`}
                      className="link-sweep hover:text-copper"
                    >
                      {item.name}
                    </Link>
                  </h3>
                  <div className="mt-1 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-steel-light">
                    £{item.price.toLocaleString("en-GB")} ea
                  </div>
                </div>

                <div className="col-span-6 md:col-span-3">
                  <div className="inline-flex items-stretch border border-ink/25">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                      className="flex h-10 w-10 items-center justify-center text-ink hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="flex h-10 w-12 items-center justify-center border-x border-ink/25 font-mono text-sm tabular-nums">
                      {String(item.quantity).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="flex h-10 w-10 items-center justify-center text-ink hover:bg-ink hover:text-paper"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="col-span-6 flex items-center justify-end gap-4 md:col-span-2">
                  <div className="text-right">
                    <div className="font-display text-lg font-semibold tabular-nums text-ink">
                      £{(item.price * item.quantity).toLocaleString("en-GB")}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="flex h-9 w-9 items-center justify-center text-steel-light hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href="/products/category/all"
            className="mt-8 inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-steel hover:text-copper"
          >
            ← Continue browsing the catalogue
          </Link>
        </section>

        {/* Summary */}
        <aside className="col-span-12 lg:col-span-4">
          <div className="sticky top-28 border border-ink bg-ink text-paper">
            <header className="flex items-center justify-between border-b border-paper/15 px-6 py-4">
              <div className="eyebrow-copper">§ Totals</div>
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-paper/60">
                GBP
              </div>
            </header>
            <div className="space-y-4 px-6 py-6 font-mono text-sm">
              <div className="flex items-center justify-between text-paper/80">
                <span className="text-paper/60">Subtotal</span>
                <span className="tabular-nums">£{subtotal.toLocaleString("en-GB")}</span>
              </div>
              <div className="flex items-center justify-between text-paper/80">
                <span className="text-paper/60">Shipping</span>
                <span className="tabular-nums text-copper">Quoted at checkout</span>
              </div>
              <div className="flex items-center justify-between text-paper/80">
                <span className="text-paper/60">VAT</span>
                <span className="tabular-nums">Included</span>
              </div>
            </div>
            <div className="border-t border-paper/15 px-6 py-5">
              <div className="flex items-end justify-between">
                <div>
                  <div className="eyebrow !text-paper/50">Order total</div>
                  <div className="mt-2 font-display text-3xl font-semibold tabular-nums md:text-4xl">
                    £{subtotal.toLocaleString("en-GB")}
                  </div>
                </div>
                <div className="text-right font-mono text-[0.7rem] uppercase tracking-[0.14em] text-paper/55">
                  + shipping
                </div>
              </div>
            </div>
            <div className="border-t border-paper/15 p-6">
              <button
                onClick={handleCheckout}
                disabled={!!isAdmin}
                className="btn-copper w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAdmin ? "Admin — cannot checkout" : "Proceed to checkout"}
                {!isAdmin && <ArrowUpRight className="h-4 w-4" />}
              </button>
              <p className="mt-4 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-paper/50">
                Secure checkout via Stripe · All prices include UK VAT
              </p>
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
