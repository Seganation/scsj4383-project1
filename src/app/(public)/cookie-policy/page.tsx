import { PageShell } from "@/components/storefront/PageShell";

export const metadata = {
  title: "Cookie Policy",
  description: "How Archcool uses cookies and tracking technologies.",
  robots: "index, follow",
  alternates: { canonical: "/cookie-policy" },
};

const TYPES = [
  {
    code: "01",
    name: "Essential",
    purpose: "Required for the site to function — authentication, cart state, security.",
    retention: "Session or up to 1 year",
  },
  {
    code: "02",
    name: "Analytics",
    purpose: "Anonymous usage analytics so we can improve pages and flows.",
    retention: "Up to 2 years",
  },
  {
    code: "03",
    name: "Functional",
    purpose: "Remembers preferences — language, recently viewed, display settings.",
    retention: "Up to 1 year",
  },
  {
    code: "04",
    name: "Marketing",
    purpose: "Measures ad effectiveness and delivers relevant advertising — only with consent.",
    retention: "Up to 2 years",
  },
];

export default function CookiePolicyPage() {
  return (
    <PageShell
      section="§ — Fine print / Cookies"
      breadcrumbs={[{ name: "Home", href: "/" }, { name: "Cookie policy" }]}
      title={
        <>
          Cookie <span className="italic text-copper">policy.</span>
        </>
      }
      lede="The biscuits on the site. What we set, why, and how to manage them."
    >
      <article className="prose-archcool max-w-3xl">
        <p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-steel-light">
          Last updated: {new Date().toLocaleDateString("en-GB")}
        </p>

        <h2>01 — What cookies are</h2>
        <p>
          Small text files stored on your device when you visit a site. They
          let a site remember things — logged-in state, cart contents,
          preferences — and help us understand how the site is used.
        </p>

        <h2>02 — Types we use</h2>
      </article>

      <div className="mt-8 max-w-4xl">
        <table className="w-full border-collapse border border-ink/15">
          <thead>
            <tr className="bg-ink text-paper">
              <th className="border-b border-paper/20 p-4 text-left font-mono text-[0.7rem] uppercase tracking-[0.16em]">Code</th>
              <th className="border-b border-paper/20 p-4 text-left font-mono text-[0.7rem] uppercase tracking-[0.16em]">Type</th>
              <th className="border-b border-paper/20 p-4 text-left font-mono text-[0.7rem] uppercase tracking-[0.16em]">Purpose</th>
              <th className="border-b border-paper/20 p-4 text-left font-mono text-[0.7rem] uppercase tracking-[0.16em]">Retention</th>
            </tr>
          </thead>
          <tbody className="bg-paper">
            {TYPES.map((t) => (
              <tr key={t.code} className="border-b border-ink/10 last:border-b-0">
                <td className="p-4 font-mono text-sm text-copper">§ {t.code}</td>
                <td className="p-4 font-display text-base font-semibold text-ink">{t.name}</td>
                <td className="p-4 text-sm text-steel">{t.purpose}</td>
                <td className="p-4 font-mono text-[0.75rem] uppercase tracking-[0.1em] text-steel-light">
                  {t.retention}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <article className="prose-archcool mt-10 max-w-3xl">
        <h2>03 — Third-party services</h2>
        <p>
          Some cookies come from third parties we rely on — notably{" "}
          <strong>Stripe</strong> (payments),{" "}
          <strong>Google Analytics</strong> (usage), and{" "}
          <strong>Google Fonts</strong> (type delivery). Each has its own
          privacy policy.
        </p>

        <h2>04 — Managing cookies</h2>
        <p>
          Every modern browser lets you view, delete and block cookies.
          Disabling essential cookies will break parts of the site —
          authentication and cart flow in particular. Browser-specific
          instructions are in the help docs for Chrome, Firefox, Safari and
          Edge.
        </p>

        <h2>05 — Consent</h2>
        <p>
          On first visit you'll see a cookie banner. You can accept all,
          reject non-essential, or customise. Your choices are stored locally
          and remembered.
        </p>

        <h2>06 — Your rights</h2>
        <p>
          Under UK GDPR you have rights of access, rectification, erasure,
          restriction, and objection. Exercise them via our{" "}
          <a href="/contact">contact page</a>.
        </p>
      </article>
    </PageShell>
  );
}
