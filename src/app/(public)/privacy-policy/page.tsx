import { PageShell } from "@/components/storefront/PageShell";

export const metadata = {
  title: "Privacy Policy",
  description: "How Archcool collects, uses and protects your personal data — UK GDPR compliant.",
  robots: "index, follow",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <PageShell
      section="§ — Fine print / Privacy"
      breadcrumbs={[{ name: "Home", href: "/" }, { name: "Privacy policy" }]}
      title={
        <>
          Your data, <span className="italic text-copper">our duty.</span>
        </>
      }
      lede="The short version: we only collect what we need to run your order and the service. Here's the long version."
    >
      <article className="prose-archcool max-w-3xl">
        <p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-steel-light">
          Last updated: {new Date().toLocaleDateString("en-GB")}
        </p>

        <h2>01 — What we collect</h2>
        <p>
          Information you provide (name, email, phone, delivery address,
          account credentials, payment details, order history, preferences),
          and information collected automatically (device info, IP, usage
          data, cookies).
        </p>

        <h2>02 — How we use it</h2>
        <ul>
          <li>Process and fulfil your orders</li>
          <li>Provide customer service and break-fix support</li>
          <li>Send order confirmations and tracking</li>
          <li>Improve the site and the catalogue</li>
          <li>Marketing — only with your consent</li>
          <li>Prevent fraud and comply with legal obligations</li>
        </ul>

        <h2>03 — Sharing</h2>
        <p>
          We don't sell your data. We share only with:
        </p>
        <ul>
          <li><strong>Service providers</strong> — payment processors, carriers, email providers</li>
          <li><strong>Legal</strong> — when compelled by law</li>
          <li><strong>Business transfers</strong> — in the event of a merger or acquisition</li>
          <li><strong>Consent</strong> — with your explicit permission</li>
        </ul>

        <h2>04 — Cookies</h2>
        <p>
          We use cookies for essential functionality, analytics and
          preferences. See our <a href="/cookie-policy">cookie policy</a> for
          details.
        </p>

        <h2>05 — Security</h2>
        <p>
          TLS encryption in transit, secure payment processing via Stripe,
          access controls, regular security assessments, and staff training.
        </p>

        <h2>06 — Your rights (UK GDPR)</h2>
        <ul>
          <li><strong>Access</strong> — request a copy of your data</li>
          <li><strong>Rectification</strong> — correct inaccurate data</li>
          <li><strong>Erasure</strong> — request deletion</li>
          <li><strong>Portability</strong> — receive your data in a portable format</li>
          <li><strong>Restriction</strong> — limit our processing</li>
          <li><strong>Objection</strong> — opt out of specific processing</li>
          <li><strong>Withdraw consent</strong> — for marketing or similar</li>
        </ul>

        <h2>07 — Retention</h2>
        <p>
          We retain personal data only as long as needed for the purposes
          above, or as required by tax and accounting law.
        </p>

        <h2>08 — Children</h2>
        <p>
          Archcool is not directed at children under 13. We do not knowingly
          collect data from minors — if discovered, we delete.
        </p>

        <h2>09 — Updates</h2>
        <p>
          Material changes will be posted here and the "last updated" date
          revised.
        </p>

        <h2>10 — Contact</h2>
        <p>
          Exercise your rights or ask questions via our{" "}
          <a href="/contact">contact page</a>.
        </p>
      </article>
    </PageShell>
  );
}
