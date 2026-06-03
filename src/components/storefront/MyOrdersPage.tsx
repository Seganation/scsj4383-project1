"use client";

import { useState, useEffect } from "react";
import {
  CalendarIcon,
  MapPinIcon,
  PackageIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  SearchIcon,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PageShell } from "./PageShell";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string[];
  };
}

interface Order {
  id: string;
  referenceId: string;
  status: "pending" | "paid" | "cancelled" | "fulfilled";
  paymentStatus:
    | "pending"
    | "processing"
    | "succeeded"
    | "failed"
    | "cancelled"
    | "refunded";
  amount: number;
  createdAt: string;
  paidAt?: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState?: string;
  shippingPostalCode: string;
  shippingCountry: string;
  items: OrderItem[];
}

interface MyOrdersPageProps {
  userId: string;
}

export function MyOrdersPage({ userId }: MyOrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        if (response.ok) {
          const userOrders = await response.json();
          setOrders(userOrders);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const q = searchTerm.toLowerCase();
    return (
      order.referenceId.toLowerCase().includes(q) ||
      order.items.some((item) => item.product.name.toLowerCase().includes(q))
    );
  });

  const activeOrders = filteredOrders.filter(
    (o) => o.status === "pending" || o.status === "paid" || o.paymentStatus === "processing"
  );
  const completedOrders = filteredOrders.filter(
    (o) => o.status === "fulfilled" || o.status === "cancelled" || o.paymentStatus === "refunded"
  );

  const statusLabel = (o: Order) => {
    if (o.paymentStatus === "succeeded" || o.status === "paid") return "Paid";
    if (o.paymentStatus === "processing") return "Processing";
    if (o.paymentStatus === "pending" || o.status === "pending") return "Pending";
    if (o.paymentStatus === "failed") return "Failed";
    if (o.paymentStatus === "refunded") return "Refunded";
    if (o.status === "fulfilled") return "Fulfilled";
    if (o.status === "cancelled") return "Cancelled";
    return "Unknown";
  };

  const statusTone = (o: Order) => {
    const s = statusLabel(o);
    if (s === "Paid" || s === "Fulfilled") return "text-copper border-copper";
    if (s === "Processing" || s === "Pending") return "text-ink border-ink/40";
    if (s === "Failed" || s === "Cancelled") return "text-destructive border-destructive/40";
    if (s === "Refunded") return "text-steel border-ink/20";
    return "text-steel border-ink/20";
  };

  const statusIcon = (o: Order) => {
    const s = statusLabel(o);
    if (s === "Fulfilled") return <PackageIcon className="h-3.5 w-3.5" />;
    if (s === "Paid") return <CheckCircleIcon className="h-3.5 w-3.5" />;
    if (s === "Processing" || s === "Pending") return <ClockIcon className="h-3.5 w-3.5" />;
    if (s === "Failed" || s === "Cancelled") return <XCircleIcon className="h-3.5 w-3.5" />;
    if (s === "Refunded") return <CreditCardIcon className="h-3.5 w-3.5" />;
    return <CalendarIcon className="h-3.5 w-3.5" />;
  };

  if (isLoading) {
    return (
      <PageShell
        section="§ 09 — The logbook"
        title="Loading orders…"
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "My orders" }]}
      >
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse border border-ink/10 bg-paper-dim" />
          ))}
        </div>
      </PageShell>
    );
  }

  if (orders.length === 0) {
    return (
      <PageShell
        section="§ 09 — The logbook"
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "My orders" }]}
        title={
          <>
            No orders <span className="italic text-copper">on file yet.</span>
          </>
        }
        lede="Once you check out, everything lands here — invoices, tracking, status, reorder button."
      >
        <div className="border border-ink/15 bg-paper-dim p-10 text-center md:p-16">
          <PackageIcon className="mx-auto h-10 w-10 text-steel-light" />
          <h2 className="display mt-5 text-2xl text-ink">Nothing queued.</h2>
          <p className="mt-3 text-steel">Start speccing from the catalogue.</p>
          <Link href="/products/category/all" className="btn-ink mt-6 inline-flex">
            Browse catalogue
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </PageShell>
    );
  }

  const totalSpent = orders.reduce((t, o) => t + o.amount, 0);

  return (
    <PageShell
      section="§ 09 — The logbook"
      breadcrumbs={[{ name: "Home", href: "/" }, { name: "My orders" }]}
      title={
        <>
          Orders <span className="italic text-copper">on the record.</span>
        </>
      }
      lede={`${orders.length} order${orders.length === 1 ? "" : "s"} logged. Everything from dispatch to break-fix in one ledger.`}
      aside={
        <div className="grid gap-4">
          <StatCard n={String(activeOrders.length).padStart(2, "0")} label="Active" />
          <StatCard n={String(completedOrders.length).padStart(2, "0")} label="Completed" />
          <StatCard n={`£${totalSpent.toLocaleString("en-GB")}`} label="Total spent" />
        </div>
      }
    >
      {/* Toolbar */}
      <div className="mb-8 flex flex-col gap-4 border-b border-ink/10 pb-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-1 font-mono text-[0.72rem] uppercase tracking-[0.14em]">
          <TabBtn active={activeTab === "active"} onClick={() => setActiveTab("active")}>
            <ClockIcon className="h-3.5 w-3.5" />
            Active <span className="text-steel-light">[{String(activeOrders.length).padStart(2, "0")}]</span>
          </TabBtn>
          <TabBtn active={activeTab === "history"} onClick={() => setActiveTab("history")}>
            <PackageIcon className="h-3.5 w-3.5" />
            History <span className="text-steel-light">[{String(completedOrders.length).padStart(2, "0")}]</span>
          </TabBtn>
        </div>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-light" strokeWidth={1.5} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders or products…"
            className="field-input pl-10 md:w-96"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-5">
        {(activeTab === "active" ? activeOrders : completedOrders).length === 0 ? (
          <div className="border border-dashed border-ink/20 bg-paper-dim p-10 text-center text-steel">
            Nothing in this section.
          </div>
        ) : (
          (activeTab === "active" ? activeOrders : completedOrders).map((order) => (
            <article
              key={order.referenceId}
              className="border border-ink/15 bg-paper transition-colors hover:border-ink"
            >
              {/* Header */}
              <header className="grid grid-cols-12 items-start gap-4 border-b border-ink/10 bg-paper-dim px-5 py-4 md:px-6">
                <div className="col-span-12 md:col-span-7">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-copper">
                      № {order.referenceId}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] ${statusTone(order)}`}>
                      {statusIcon(order)} {statusLabel(order)}
                    </span>
                  </div>
                  <div className="mt-1.5 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-steel-light">
                    Placed {new Date(order.createdAt).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}
                    {order.paidAt && <> · Paid {new Date(order.paidAt).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}</>}
                  </div>
                </div>
                <div className="col-span-12 text-left md:col-span-5 md:text-right">
                  <div className="font-display text-2xl font-semibold tabular-nums text-ink md:text-3xl">
                    £{order.amount.toLocaleString("en-GB")}
                  </div>
                  <div className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-steel-light">
                    {order.items.length} unit{order.items.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </header>

              {/* Body */}
              <div className="grid grid-cols-12 gap-6 px-5 py-5 md:px-6 md:py-6">
                <div className="col-span-12 md:col-span-7">
                  <div className="eyebrow !text-steel">Line items</div>
                  <ul className="mt-3 space-y-2">
                    {order.items.slice(0, 3).map((item) => (
                      <li key={item.id} className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-ink/10 bg-paper-dim">
                          <Image
                            src={item.product.images?.[0] || "/placeholder.jpg"}
                            alt={item.product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-display text-[0.95rem] font-semibold text-ink">
                            {item.product.name}
                          </div>
                          <div className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-steel-light">
                            ×{item.quantity} · £{(item.price * item.quantity).toLocaleString("en-GB")}
                          </div>
                        </div>
                      </li>
                    ))}
                    {order.items.length > 3 && (
                      <li className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-steel-light">
                        + {order.items.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>
                <div className="col-span-12 md:col-span-5">
                  <div className="eyebrow !text-steel flex items-center gap-2">
                    <MapPinIcon className="h-3.5 w-3.5" /> Shipping
                  </div>
                  <address className="mt-3 font-mono text-[0.82rem] not-italic leading-relaxed text-ink">
                    {order.shippingName}
                    <br />
                    {order.shippingAddress}
                    <br />
                    {order.shippingCity}{order.shippingState ? `, ${order.shippingState}` : ""} {order.shippingPostalCode}
                    <br />
                    {order.shippingCountry}
                  </address>
                </div>
              </div>

              {/* Actions */}
              <footer className="flex flex-wrap gap-2 border-t border-ink/10 px-5 py-4 md:px-6">
                <Link
                  href={`/my-orders/${order.referenceId}`}
                  className="inline-flex h-10 items-center gap-2 border border-ink bg-ink px-4 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-paper hover:bg-copper hover:border-copper"
                >
                  View details
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                {(order.status === "paid" || order.paymentStatus === "succeeded") && (
                  <button className="inline-flex h-10 items-center gap-2 border border-ink/20 px-4 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink hover:border-ink">
                    <TruckIcon className="h-3.5 w-3.5" />
                    Track package
                  </button>
                )}
                <Link
                  href="/products/category/all"
                  className="inline-flex h-10 items-center gap-2 border border-ink/20 px-4 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink hover:border-ink"
                >
                  Reorder
                </Link>
              </footer>
            </article>
          ))
        )}
      </div>
    </PageShell>
  );
}

function StatCard({ n, label }: { n: string; label: string }) {
  return (
    <div className="border border-ink/15 bg-paper-dim p-4">
      <div className="eyebrow-copper">{label}</div>
      <div className="mt-2 font-display text-2xl font-semibold tabular-nums text-ink">
        {n}
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 border px-4 transition-colors ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-ink/20 text-ink hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}
