import { PageShell } from "@/components/storefront/PageShell";

export const metadata = {
  title: "Terms of Service",
  description: "Terms governing use of Archcool's online storefront and services.",
  robots: "index, follow",
  alternates: { canonical: "/terms-of-service" },
};

export default function TermsOfServicePage() {
  return (
    <PageShell
      section="§ — Fine print / Terms"
      breadcrumbs={[{ name: "Home", href: "/" }, { name: "Terms of service" }]}
      title={
        <>
          Terms of <span className="italic text-copper">service.</span>
        </>
      }
      lede="The rules of the road when you shop with us. Standard but worth skim-reading."
    >
      <article className="prose-archcool max-w-3xl">
        <p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-steel-light">
          Last updated: {new Date().toLocaleDateString("en-GB")}
        </p>

        <h2>01 — Acceptance</h2>
        <p>
          By using Archcool's website and services, you agree to these terms.
          If you don't, please don't use the service.
        </p>

        <h2>02 — Use license</h2>
        <p>
          You may view Archcool's materials for personal, non-commercial use.
          You may not modify or copy the materials, use them commercially,
          reverse-engineer our software, or strip copyright notices.
        </p>

        <h2>03 — Product information</h2>
        <p>
          We work hard on accurate descriptions and pricing, but can't
          warrant that every detail is perfect — colours and images are
          illustrative and may differ from the unit delivered.
        </p>

        <h2>04 — Pricing and payment</h2>
        <p>
          Prices may change without notice. We may modify or discontinue
          products. Payment is required before dispatch.
        </p>

        <h2>05 — User accounts</h2>
        <p>
          When you create an account, keep the information accurate and your
          password safe. You're responsible for activity under your account.
        </p>

        <h2>06 — Prohibited uses</h2>
        <ul>
          <li>Any unlawful purpose or soliciting others to perform unlawful acts</li>
          <li>Violating international, national or local regulations</li>
          <li>Infringing intellectual property rights</li>
          <li>Harassment, abuse, defamation or discrimination</li>
          <li>Submitting false or misleading information</li>
        </ul>

        <h2>07 — Limitation of liability</h2>
        <p>
          Archcool, its directors, officers, employees and suppliers are not
          liable for any direct, indirect, incidental, punitive, special or
          consequential damages arising from use of the service, to the
          maximum extent permitted by law.
        </p>

        <h2>08 — Governing law</h2>
        <p>
          These terms are governed by the laws of England & Wales. You
          irrevocably submit to the exclusive jurisdiction of the courts of
          England & Wales.
        </p>

        <h2>09 — Changes</h2>
        <p>
          We may modify these terms. Material changes will be flagged with at
          least 30 days' notice on this page.
        </p>

        <h2>10 — Contact</h2>
        <p>
          Questions? Use our <a href="/contact">contact page</a>.
        </p>
      </article>
    </PageShell>
  );
}
