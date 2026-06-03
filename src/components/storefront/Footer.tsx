import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const COLUMNS = [
  {
    label: "§ 01 — Catalogue",
    links: [
      { href: "/products/category/all", name: "All products", code: "00" },
      { href: "/products/category/cooking-equipment", name: "Cooking equipment", code: "01" },
      { href: "/products/category/refrigeration", name: "Refrigeration", code: "02" },
      { href: "/products/category/grills", name: "Grills & outdoor", code: "03" },
    ],
  },
  {
    label: "§ 02 — The House",
    links: [
      { href: "/about", name: "About Archcool", code: "00" },
      { href: "/contact", name: "Talk to a specialist", code: "01" },
      { href: "/faq", name: "Frequently asked", code: "02" },
      { href: "/my-orders", name: "Track an order", code: "03" },
    ],
  },
  {
    label: "§ 03 — The fine print",
    links: [
      { href: "/shipping-policy", name: "Shipping policy", code: "00" },
      { href: "/return-policy", name: "Returns & exchanges", code: "01" },
      { href: "/terms-of-service", name: "Terms of service", code: "02" },
      { href: "/privacy-policy", name: "Privacy policy", code: "03" },
      { href: "/cookie-policy", name: "Cookie policy", code: "04" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink text-paper">
      <div className="bg-grain">
        {/* Top strip: brand lockup + callout */}
        <div className="border-b border-paper/10">
          <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-8 px-6 py-16 md:px-10 lg:px-14 lg:py-20">
            <div className="col-span-12 md:col-span-7">
              <Image
                src="/logo.png"
                alt="ArchCool Equipment"
                width={220}
                height={88}
                className="h-14 w-auto md:h-16"
              />
              <span className="eyebrow-copper mt-6 inline-block">§ 00 — Archcool / Works</span>
              <h2 className="display mt-5 text-[clamp(2rem,4.2vw,3.75rem)] text-paper">
                Serious gear.{" "}
                <span className="italic text-copper">From the line,</span>
                <br />
                for the line.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-paper/75 md:text-lg">
                Restaurant-grade equipment speced by chefs and installed by
                engineers who have actually worked a kitchen. Based in
                Wolverhampton, shipped across the UK.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/contact" className="btn-copper">
                  Book a consult
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <a
                  href="tel:+15555ARCHCOOL"
                  className="btn-on-dark"
                >
                  +1 (555) ARCH-COOL
                </a>
              </div>
            </div>
            <div className="col-span-12 md:col-span-4 md:col-start-9">
              <div className="border border-paper/15 bg-ink-elev p-6 md:p-7">
                <div className="eyebrow-copper">The Workshop</div>
                <address className="mt-4 font-mono text-sm not-italic leading-relaxed text-paper/85">
                  24 Central Trading Estate
                  <br />
                  Wolverhampton
                  <br />
                  United Kingdom · WV2 2RL
                </address>
                <div className="mt-6 border-t border-paper/10 pt-5">
                  <div className="eyebrow !text-paper/60">Hours</div>
                  <div className="mt-2 font-mono text-[0.8rem] text-paper/75">
                    Mon–Fri · 08:00–18:00
                    <br />
                    Sat · 09:00–15:00
                    <br />
                    Emergency line · 24/7
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Link columns */}
        <div className="border-b border-paper/10">
          <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-x-8 gap-y-12 px-6 py-16 md:px-10 lg:px-14">
            {COLUMNS.map((col) => (
              <div key={col.label} className="col-span-12 sm:col-span-6 md:col-span-4">
                <div className="eyebrow-copper">{col.label}</div>
                <ul className="mt-6 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="group flex items-baseline gap-3 text-paper/85 hover:text-copper"
                      >
                        <span className="font-mono text-[0.65rem] text-paper/35 group-hover:text-copper/70">
                          {l.code}
                        </span>
                        <span className="font-display text-lg transition-transform group-hover:translate-x-1">
                          {l.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div>
          <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10 lg:px-14">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
              <div className="flex items-center gap-4">
                <Image
                  src="/logo.png"
                  alt="ArchCool Equipment"
                  width={90}
                  height={36}
                  className="h-7 w-auto opacity-80"
                />
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-paper/70">
                  © {year} Archcool Equipment. All rights reserved.
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="eyebrow !text-paper/55">Secure checkout</span>
              <div className="flex items-center gap-2">
                {["Visa", "Mastercard", "Amex", "Apple", "Stripe"].map((m) => (
                  <span
                    key={m}
                    className="border border-paper/20 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-paper/65"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
