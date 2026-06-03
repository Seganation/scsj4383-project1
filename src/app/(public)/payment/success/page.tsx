"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { toast } from "react-hot-toast";
import { CheckCircle, Package, Mail, User, ArrowUpRight, Loader2 } from "lucide-react";
import { CartStorage } from "@/lib/cart-client";

function PaymentSuccessContent() {
  const { data: session } = useSession();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAccountCreation, setShowAccountCreation] = useState(false);
  const [createAccountEmail, setCreateAccountEmail] = useState("");
  const [linkedOrders, setLinkedOrders] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      try {
        const response = await fetch(`/api/orders/verify-payment?session_id=${sessionId}`);
        const data = await response.json();
        if (response.ok) {
          setOrderDetails(data.order);
          setCreateAccountEmail(data.order.shippingEmail);
          if (!session?.user && !data.order.userId && data.metadata?.createAccount === "true") {
            setShowAccountCreation(true);
          }
        } else {
          toast.error("Could not verify payment");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading order details");
      } finally {
        setIsLoading(false);
      }
    })();
    CartStorage.clearCart();
  }, [sessionId, session]);

  const handleCreateAccount = () => {
    if (!createAccountEmail) return toast.error("Email is required");
    const returnUrl = `/payment/success?session_id=${sessionId}&account_created=true`;
    router.push(
      `/auth/email-auth?email=${encodeURIComponent(createAccountEmail)}&return_url=${encodeURIComponent(returnUrl)}`
    );
  };

  const handleLinkOrders = async () => {
    try {
      const res = await fetch("/api/orders/link-guest-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: session?.user?.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setLinkedOrders(data.linked);
        toast.success(`Linked ${data.linked} previous orders.`);
      } else {
        toast.error(data.error || "Failed to link orders");
      }
    } catch (err) {
      toast.error("Error linking orders");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-paper">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-copper" />
          <p className="font-mono text-[0.8rem] uppercase tracking-[0.16em] text-steel-light">
            Verifying payment…
          </p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-lg border border-destructive/30 bg-paper p-10 text-center">
          <h1 className="display text-3xl text-destructive">Payment verification failed</h1>
          <p className="mt-4 text-steel">We couldn't verify your payment. Please contact support.</p>
          <Link href="/" className="btn-ink mt-8 inline-flex">Return home</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-paper">
      {/* Hero confirm */}
      <div className="relative border-b border-ink/10 bg-ink text-paper">
        <div className="bg-grain absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-[1440px] px-6 py-16 md:px-10 lg:px-14 lg:py-20">
          <div className="grid grid-cols-12 items-end gap-8">
            <div className="col-span-12 md:col-span-8">
              <div className="flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-copper">
                <span className="flex h-2 w-2 rounded-full bg-copper" />
                § 07 — Payment cleared
              </div>
              <h1 className="display mt-5 text-[clamp(2.25rem,5vw,4.5rem)]">
                Paid.{" "}
                <span className="italic text-copper">On the line.</span>
              </h1>
              <p className="mt-6 max-w-xl text-paper/80">
                Confirmation is already in your inbox. Your order is queued
                for the next dispatch window — you'll get a tracking number
                when it's on the road.
              </p>
            </div>
            <div className="col-span-12 md:col-span-4 md:justify-self-end">
              <div className="inline-flex h-20 w-20 items-center justify-center border border-copper bg-copper text-paper">
                <CheckCircle className="h-10 w-10" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-10 px-6 py-16 md:px-10 lg:px-14">
        {/* Order summary */}
        <article className="col-span-12 lg:col-span-8">
          <div className="border border-ink/15">
            <header className="flex items-center justify-between border-b border-ink/10 bg-paper-dim px-6 py-4">
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-copper" />
                <span className="eyebrow-copper">§ Order / {orderDetails.referenceId}</span>
              </div>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-copper">
                {orderDetails.status}
              </span>
            </header>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 px-6 py-8 md:grid-cols-4">
              <InfoCell label="Reference" value={orderDetails.referenceId} mono />
              <InfoCell label="Total" value={`£${orderDetails.amount}`} />
              <InfoCell label="Email" value={orderDetails.shippingEmail} />
              <InfoCell label="Status" value={orderDetails.status} accent />
            </div>

            <div className="border-t border-ink/10 px-6 py-6">
              <div className="eyebrow-copper">§ Line items</div>
              <ul className="mt-4 divide-y divide-ink/10">
                {orderDetails.items?.map((item: any) => (
                  <li key={item.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-display text-base font-semibold text-ink">
                        {item.product?.name}
                      </div>
                      <div className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-steel-light">
                        × {item.quantity} · £{item.price} ea
                      </div>
                    </div>
                    <div className="font-display tabular-nums text-ink">
                      £{item.price * item.quantity}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {orderDetails.invoiceUrl && (
              <div className="border-t border-ink/10 px-6 py-5">
                <a
                  href={orderDetails.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  View receipt / download invoice
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </article>

        <aside className="col-span-12 lg:col-span-4 space-y-5">
          <div className="border border-ink/15 bg-paper-dim p-6">
            <div className="flex items-center gap-2 text-copper">
              <Mail className="h-4 w-4" />
              <span className="eyebrow-copper">What's next</span>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-steel">
              <li><span className="text-copper">01</span> · Confirmation email sent</li>
              <li><span className="text-copper">02</span> · Order processed in 1 business day</li>
              <li><span className="text-copper">03</span> · Dispatch within 2–4 working days</li>
              <li><span className="text-copper">04</span> · Tracking link by email on dispatch</li>
            </ul>
          </div>

          {showAccountCreation && !session?.user && (
            <div className="border border-copper bg-ink p-6 text-paper">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-copper" />
                <span className="eyebrow-copper">§ Create an account</span>
              </div>
              <p className="mt-3 text-sm text-paper/80">
                Track this order, save addresses, and speed up future
                checkouts. Same email — it'll auto-link.
              </p>
              <label className="field-label mt-5 !text-paper/80">Email</label>
              <input
                type="email"
                value={createAccountEmail}
                onChange={(e) => setCreateAccountEmail(e.target.value)}
                className="field-input !border-paper/30 !bg-ink !text-paper placeholder:!text-paper/50"
                placeholder="you@kitchen.co.uk"
              />
              <div className="mt-5 flex flex-col gap-3">
                <button onClick={handleCreateAccount} className="btn-copper w-full">
                  Create account
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowAccountCreation(false)}
                  className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-paper/70 hover:text-copper"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {session?.user && orderDetails.shippingEmail === session.user.email && (
            <div className="border border-ink/15 bg-paper-dim p-6">
              <div className="eyebrow-copper">§ Link guest orders</div>
              <p className="mt-3 text-sm text-steel">
                We found guest orders under this email — merge them into your
                account?
              </p>
              {linkedOrders > 0 ? (
                <p className="mt-4 flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-copper">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {linkedOrders} orders linked
                </p>
              ) : (
                <button onClick={handleLinkOrders} className="btn-ghost mt-4 w-full">
                  Link previous orders
                </button>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link
              href={session?.user ? "/my-orders" : "/products/category/all"}
              className="btn-ink"
            >
              {session?.user ? "View my orders" : "Continue browsing"}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="btn-ghost">
              Contact support
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}

function InfoCell({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="eyebrow !text-steel-light">{label}</div>
      <div
        className={`mt-1.5 ${mono ? "font-mono text-sm" : "font-display text-lg font-semibold"} ${
          accent ? "capitalize text-copper" : "text-ink"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center bg-paper">
          <Loader2 className="h-10 w-10 animate-spin text-copper" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
