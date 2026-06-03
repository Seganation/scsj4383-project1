'use client';

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { OrderDetailsPage } from "@/components/storefront/OrderDetailsPage";
import { useSession } from "@/app/lib/auth-client";

function HybridOrderDetailsContent({ referenceId }: { referenceId: string }) {
  const searchParams = useSearchParams();
  const verify = searchParams.get("verify"); // Changed from "token" to "verify"
  const { data: session, isPending } = useSession();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(!!verify || false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If verify token is present, use magic link API
    if (verify) {
      setLoading(true);
      fetch(`/api/orders/${referenceId}/magic-link?verify=${encodeURIComponent(verify)}`)
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Invalid or expired link");
          }
          return res.json();
        })
        .then((data) => {
          setOrder(data);
          setError("");
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => setLoading(false));
      return;
    }
    // If no verify token, but user is authenticated, fetch via session
    if (session?.user) {
      setLoading(true);
      fetch(`/api/orders/${referenceId}`)
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Order not found or access denied");
          }
          return res.json();
        })
        .then((data) => {
          setOrder(data);
          setError("");
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => setLoading(false));
      return;
    }
    // If neither, show error
    if (!isPending && !verify && !session?.user) {
      setError("You must be signed in or use a valid magic link to view this order.");
    }
  }, [verify, referenceId, session, isPending]);

  if (isPending)
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-paper font-mono text-[0.78rem] uppercase tracking-[0.16em] text-steel">
        Checking session…
      </div>
    );
  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-paper font-mono text-[0.78rem] uppercase tracking-[0.16em] text-steel">
        Loading order…
      </div>
    );
  if (error)
    return (
      <div className="mx-auto max-w-lg border border-destructive/30 bg-destructive/5 p-8 my-20 text-center">
        <div className="eyebrow-copper !text-destructive">Access denied</div>
        <p className="mt-3 text-ink">{error}</p>
      </div>
    );
  if (!order)
    return (
      <div className="mx-auto max-w-lg border border-ink/15 bg-paper-dim p-8 my-20 text-center">
        <div className="eyebrow-copper">404</div>
        <p className="mt-3 text-ink">Order not found.</p>
      </div>
    );
  return <OrderDetailsPage order={order} />;
}

export default function HybridOrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId: referenceId } = use(params);
  return (
    <Suspense fallback={<div>Loading order...</div>}>
      <HybridOrderDetailsContent referenceId={referenceId} />
    </Suspense>
  );
}
