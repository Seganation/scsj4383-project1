import { PageShell, CalloutBanner } from "@/components/storefront/PageShell";

export const metadata = {
  title: "Shipping Policy",
  description:
    "How Archcool ships commercial kitchen equipment across the UK and internationally — processing, transit, tracking and delivery.",
  robots: "index, follow",
  alternates: { canonical: "/shipping-policy" },
};

export default function ShippingPolicyPage() {
  return (
    <>
      <PageShell
        section="§ — Fine print / Shipping"
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Shipping policy" }]}
        title={
          <>
            How the gear <span className="italic text-copper">lands.</span>
          </>
        }
        lede="Commercial kitchen equipment isn't a parcel. Here's how we move it from the workshop to your loading dock."
      >
        <div className="grid grid-cols-12 gap-10">
          <aside className="col-span-12 md:col-span-3">
            <div className="sticky top-28 border border-ink/15 bg-paper-dim p-5">
              <div className="eyebrow-copper">On this page</div>
              <ul className="mt-4 space-y-2 font-mono text-[0.78rem] uppercase tracking-[0.12em]">
                {["Processing", "Domestic (UK)", "International", "Tracking", "Restrictions", "Delivery issues", "Address changes"].map((s, i) => (
                  <li key={s} className="text-steel-light hover:text-copper">
                    <a href={`#s-${i}`}>{String(i + 1).padStart(2, "0")} · {s}</a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          <article className="col-span-12 md:col-span-9 prose-archcool">
            <p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-steel-light">
              Last updated: {new Date().toLocaleDateString("en-GB")}
            </p>

            <h2 id="s-0">01 — Processing</h2>
            <p>
              Orders are processed in <strong>1–2 business days</strong>
              (Mon–Fri, excluding UK public holidays). Orders placed after
              16:00 on Friday enter the queue on Monday.
            </p>
            <ol>
              <li>Order confirmation email — instant</li>
              <li>Payment verification</li>
              <li>Inventory allocation and QC</li>
              <li>Packaging and labelling</li>
              <li>Dispatch confirmation with tracking</li>
            </ol>

            <h2 id="s-1">02 — Domestic shipping (United Kingdom)</h2>
            <p>
              All product prices <strong>include UK VAT</strong>. Shipping is{" "}
              <strong>quoted at checkout</strong> based on postcode, unit
              weight and whether engineer install is required.
            </p>
            <ul>
              <li>Standard UK delivery — 5–7 working days</li>
              <li>Express — 2–3 working days</li>
              <li>Next-day — available on in-stock items, cut-off 14:00</li>
              <li>White-glove / engineer install — scheduled direct</li>
            </ul>

            <h2 id="s-2">03 — International</h2>
            <p>
              We ship across the EU and selected international routes.
              Customers cover any customs duties and local VAT. Transit times
              vary (7–35 working days).
            </p>

            <h2 id="s-3">04 — Tracking</h2>
            <p>
              You'll receive a tracking link by email on dispatch — carrier,
              waybill and estimated delivery date. Signed-in customers can
              track orders from <a href="/my-orders">their orders page</a>.
            </p>

            <h2 id="s-4">05 — Restrictions</h2>
            <p>We can't ship to PO Boxes, military APO/FPO addresses, or countries under active trade restrictions. Some heavy units require a commercial delivery address.</p>

            <h2 id="s-5">06 — Delivery issues</h2>
            <p>
              <strong>Missing or stolen:</strong> check with neighbours, site
              reception, and the carrier first. If unresolved inside 48 hours,
              contact us.
            </p>
            <p>
              <strong>Damaged:</strong> photograph the packaging and contents,
              keep all materials, and contact us within 48 hours — we'll
              arrange replacement or refund.
            </p>

            <h2 id="s-6">07 — Address changes</h2>
            <p>
              <strong>Before dispatch:</strong> contact us immediately — we
              can update at no cost.
              <br />
              <strong>After dispatch:</strong> route via the carrier directly;
              additional fees may apply.
            </p>
          </article>
        </div>
      </PageShell>
      <CalloutBanner
        eyebrow="§ — Shipping question?"
        title="We'll check your postcode and send a real number back."
        cta="Contact shipping"
        href="/contact"
      />
    </>
  );
}
