import Link from "next/link";
import { PageShell, CalloutBanner } from "@/components/storefront/PageShell";

export const metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about Archcool ordering, delivery, payment, and support.",
  robots: "index, follow",
  alternates: { canonical: "/faq" },
};

const SECTIONS = [
  {
    code: "§ 01",
    title: "Orders & checkout",
    items: [
      {
        q: "How do I place an order?",
        a: "Browse the catalogue, add items to your bag, and go to checkout. Guest checkout is always on; you can create an account on the way if you want order history in one place.",
      },
      {
        q: "Can I modify or cancel my order?",
        a: "Inside 2 hours, yes — before it enters fulfillment. After that, it goes through the standard return process once delivered.",
      },
      {
        q: "Which payment methods do you accept?",
        a: "All major credit cards, Apple Pay, and Google Pay. Everything runs through Stripe — we don't touch your card details.",
      },
    ],
  },
  {
    code: "§ 02",
    title: "Delivery & tracking",
    items: [
      {
        q: "How much does shipping cost?",
        a: "All product prices include UK VAT. Shipping is quoted separately at checkout and varies by postcode, unit weight, and whether engineer install is required.",
      },
      {
        q: "How long will my order take?",
        a: "Orders typically process in 1–2 business days. Standard UK delivery lands in 5–7 working days; express 2–3; next-day available on in-stock items.",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes — across the EU and selected international routes. Customers cover any customs duties and local VAT.",
      },
      {
        q: "How do I track my order?",
        a: (
          <>
            Once shipped, you'll get a tracking link by email. If you're signed
            in, the same info is on{" "}
            <Link href="/my-orders">your orders page</Link>.
          </>
        ),
      },
    ],
  },
  {
    code: "§ 03",
    title: "Account & service",
    items: [
      {
        q: "Do I need an account to shop?",
        a: "No — guest checkout works fine. An account helps if you want order history, saved addresses, and one-click reorder.",
      },
      {
        q: "How do I reach customer service?",
        a: (
          <>
            Use our <Link href="/contact">contact page</Link> or call{" "}
            <a href="tel:+15555ARCHCOOL">+1 (555) ARCH-COOL</a>. We normally
            reply inside a working day — faster if it's break-fix.
          </>
        ),
      },
      {
        q: "How do I update my profile?",
        a: (
          <>
            Sign in and head to <Link href="/profile">your profile</Link> to
            change name, email preferences, or saved addresses.
          </>
        ),
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <PageShell
        section="§ — Frequently asked"
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "FAQ" }]}
        title={
          <>
            Answers <span className="italic text-copper">on the record.</span>
          </>
        }
        lede="Straight answers to the questions we get most. If your question isn't here, the contact form has a specialist on the other side."
      >
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12">
            {SECTIONS.map((section, sIdx) => (
              <section key={section.code} className={sIdx > 0 ? "mt-16" : ""}>
                <header className="mb-8 flex items-baseline gap-4 border-b border-ink/10 pb-4">
                  <span className="eyebrow-copper">{section.code}</span>
                  <h2 className="display text-2xl text-ink md:text-3xl">
                    {section.title}
                  </h2>
                </header>
                <dl className="divide-y divide-ink/10">
                  {section.items.map((item, i) => (
                    <details
                      key={i}
                      className="group py-6"
                    >
                      <summary className="flex cursor-pointer items-start justify-between gap-6 list-none">
                        <span className="flex-1 font-display text-lg font-semibold text-ink md:text-xl">
                          <span className="mr-3 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-steel-light">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {item.q}
                        </span>
                        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center border border-ink/25 font-mono text-sm text-ink transition-transform group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <div className="prose-archcool mt-4 pl-11 pr-14 text-[0.95rem]">
                        {typeof item.a === "string" ? <p>{item.a}</p> : item.a}
                      </div>
                    </details>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </div>
      </PageShell>

      <CalloutBanner
        eyebrow="§ — Couldn't find it?"
        title="Send us a brief. A specialist will answer — not a bot."
        cta="Contact us"
        href="/contact"
      />
    </>
  );
}
