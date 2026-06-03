import { PageShell, CalloutBanner } from "@/components/storefront/PageShell";

export const metadata = {
  title: "Return & Refund Policy",
  description:
    "Archcool's 30-day return window, refund timings, and exemptions for commercial installs.",
  robots: "index, follow",
  alternates: { canonical: "/return-policy" },
};

export default function ReturnPolicyPage() {
  return (
    <>
      <PageShell
        section="§ — Fine print / Returns"
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Returns" }]}
        title={
          <>
            Thirty days to <span className="italic text-copper">change your mind.</span>
          </>
        }
        lede="Returns for commercial equipment need to be tight — here's the framework we work to, and the exemptions that exist because you're buying industrial gear."
      >
        <article className="prose-archcool max-w-3xl">
          <p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-steel-light">
            Last updated: {new Date().toLocaleDateString("en-GB")}
          </p>

          <h2>01 — Return window</h2>
          <p>
            You have <strong>30 days from delivery</strong> to return most
            catalogue items. To qualify, the unit must be:
          </p>
          <ul>
            <li>Unused and in the same condition you received it</li>
            <li>In its original packaging with all tags, manuals and accessories</li>
            <li>Backed by your original order number or receipt</li>
          </ul>

          <h2>02 — What can be returned</h2>
          <ul>
            <li>Kitchen appliances in original packaging</li>
            <li>Refrigeration units that have not been installed or run</li>
            <li>Grills and outdoor equipment with all parts included</li>
            <li>Commercial kitchen equipment in original packaging</li>
          </ul>

          <h2>03 — What can't</h2>
          <p>For safety, hygiene and commercial-install reasons, we can't accept:</p>
          <ul>
            <li>Items that have been installed, commissioned or used</li>
            <li>Units with missing accessories or manuals</li>
            <li>Damage from improper install or misuse</li>
            <li>Custom or specially-ordered equipment</li>
            <li>Final-sale items</li>
            <li>Gift cards</li>
          </ul>

          <h2>04 — How to start a return</h2>
          <ol>
            <li>Contact us inside 30 days of delivery</li>
            <li>Give us your order number and reason</li>
            <li>We issue a Return Merchandise Authorization (RMA) number</li>
            <li>Pack the unit and mark the RMA visibly on the outside</li>
            <li>Ship back using the prepaid label we send</li>
          </ol>

          <h2>05 — Return shipping</h2>
          <p>
            <strong>UK returns</strong> are prepaid by us. International
            returns are customer-paid unless the unit was defective or we
            shipped the wrong item.
          </p>

          <h2>06 — Refunds</h2>
          <ul>
            <li><strong>Processing:</strong> 3–5 business days after we receive and QC the unit</li>
            <li><strong>Refunded to:</strong> the original payment method</li>
            <li><strong>Amount:</strong> full purchase price, excluding the outbound shipping fee</li>
            <li><strong>Bank settlement:</strong> a further 5–10 business days</li>
          </ul>

          <h2>07 — Exchanges</h2>
          <p>
            We don't do direct exchanges — returning and re-ordering is
            faster and guarantees the spec you actually want, especially if
            stock is moving.
          </p>

          <h2>08 — Defective or incorrect units</h2>
          <p>
            If the unit landed broken or we shipped the wrong thing, priority
            processing kicks in: prepaid return, full refund including
            outbound shipping, and optional replacement if in stock.
          </p>
        </article>
      </PageShell>
      <CalloutBanner
        eyebrow="§ — Need an RMA?"
        title="Tell us the order number — we'll get you a label same-day."
        cta="Start a return"
        href="/contact"
      />
    </>
  );
}
