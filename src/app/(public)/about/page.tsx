import Link from "next/link";
import { ArrowUpRight, Phone, MapPin } from "lucide-react";
import { PageShell, CalloutBanner } from "@/components/storefront/PageShell";

export const metadata = {
  title: "About Us",
  description:
    "Archcool is a specialist supplier of industrial kitchen equipment. Chef-speced, engineer-installed, UK-based.",
  robots: "index, follow",
  alternates: { canonical: "/about" },
};

const PILLARS = [
  {
    code: "01",
    title: "Built by operators",
    body: "Every catalogue decision is reviewed by chefs and service engineers. We don't stock gear we haven't cooked on, calibrated, or broken.",
  },
  {
    code: "02",
    title: "Spec over SKUs",
    body: "We'd rather lose a sale than sell you the wrong oven. If you send us your floor plan and service volume, you'll get a real recommendation — not a cart.",
  },
  {
    code: "03",
    title: "Installed, not shipped",
    body: "Our engineers install, commission, and sign off every major unit. Gas, ventilation, drainage — we handle the paperwork so your GP sign-off clears.",
  },
  {
    code: "04",
    title: "Break-fix that answers",
    body: "Saturday night, service is on. The line calls. Someone picks up. Most UK regions see an engineer inside 48 hours — often sooner.",
  },
];

const TIMELINE = [
  { year: "2012", title: "Founded in Wolverhampton", body: "Three founders — one chef, two engineers — frustrated by suppliers who couldn't read a floor plan." },
  { year: "2016", title: "First 1,000 installs", body: "A thousand commercial kitchens fitted across the Midlands and the North. Everything else followed the same playbook." },
  { year: "2019", title: "Regional break-fix rolls out", body: "Dedicated 24/7 service engineers put on retainer across five regions. SLAs go from 'when we can' to 'before your next service.'" },
  { year: "2022", title: "Online catalogue launches", body: "The whole inventory moved onto one surface. Prices visible, specs downloadable, lead times honest." },
  { year: "2026", title: "4,500+ installs", body: "From bistros in Shoreditch to production kitchens in Glasgow. Same playbook, same engineers answering the phone." },
];

export default function AboutPage() {
  return (
    <>
      <PageShell
        section="§ 04 — About the House"
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "About" }]}
        title={
          <>
            Kitchen equipment
            <br />
            <span className="italic text-copper">speced by chefs,</span>
            <br />
            installed by engineers.
          </>
        }
        lede="We started Archcool in 2012 because the suppliers we dealt with as cooks and engineers were selling us the wrong oven, the wrong compressor, and the wrong promise. We built the house we wanted to buy from — and twelve years on, 4,500+ UK kitchens are still running on it."
        aside={
          <div className="border border-ink/15 bg-paper-dim p-6">
            <div className="eyebrow-copper">The House</div>
            <dl className="mt-5 space-y-4 font-mono text-sm text-ink">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-steel-light">Founded</dt>
                <dd>2012</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-steel-light">Installs</dt>
                <dd>4,500+</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-steel-light">HQ</dt>
                <dd>Wolverhampton, UK</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-steel-light">Service</dt>
                <dd>24/7 UK-wide</dd>
              </div>
            </dl>
          </div>
        }
      >
        {/* Mission strip */}
        <section className="grid grid-cols-12 gap-8 pb-20">
          <div className="col-span-12 md:col-span-5">
            <div className="eyebrow-copper">§ 01 — The mission</div>
            <h2 className="display mt-4 text-[clamp(1.75rem,3vw,2.75rem)] text-ink">
              One job: match the gear to the service.
            </h2>
          </div>
          <div className="col-span-12 md:col-span-6 md:col-start-7">
            <p className="lede">
              Commercial kitchens don't fail because someone bought the wrong
              brand. They fail because the oven was rated for a 60-cover
              bistro and the kitchen grew into a 180-cover weekender. Our
              entire catalogue exists to stop that mismatch.
            </p>
            <p className="mt-4 lede">
              If the right answer isn't in our catalogue, we'll tell you. If
              the right answer is second-hand, we'll tell you that too.
            </p>
          </div>
        </section>

        {/* Pillars grid — asymmetric spec-sheet feel */}
        <section className="border-t border-ink/10 py-20">
          <div className="mb-12 grid grid-cols-12 items-end gap-6">
            <div className="col-span-12 md:col-span-6">
              <div className="eyebrow-copper">§ 02 — What we're about</div>
              <h2 className="display mt-4 text-[clamp(1.75rem,3vw,2.75rem)] text-ink">
                Four lines we hold.
              </h2>
            </div>
            <div className="col-span-12 md:col-span-4 md:col-start-9">
              <p className="text-sm leading-relaxed text-steel-light">
                The things every team member agreed on the wall of the
                workshop, back in 2012. Still on that wall.
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
            {PILLARS.map((p, i) => (
              <div
                key={p.code}
                className={`group grid grid-cols-[auto_1fr] gap-5 border-t border-ink/10 py-8 md:py-10 ${
                  i >= 2 ? "md:border-t" : ""
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center border border-ink bg-ink font-mono text-sm font-medium text-paper">
                  {p.code}
                </div>
                <div>
                  <dt className="display text-2xl text-ink">{p.title}</dt>
                  <dd className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-steel">
                    {p.body}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        {/* Timeline */}
        <section className="border-t border-ink/10 py-20">
          <div className="mb-10 grid grid-cols-12 items-end gap-6">
            <div className="col-span-12 md:col-span-6">
              <div className="eyebrow-copper">§ 03 — The log</div>
              <h2 className="display mt-4 text-[clamp(1.75rem,3vw,2.75rem)] text-ink">
                Twelve years, on paper.
              </h2>
            </div>
          </div>

          <ol className="relative grid grid-cols-12 gap-x-8">
            {TIMELINE.map((t, i) => (
              <li
                key={t.year}
                className="col-span-12 grid grid-cols-[auto_1fr] gap-5 border-t border-ink/10 py-8 md:grid-cols-[120px_1fr]"
              >
                <div className="font-mono text-[0.95rem] uppercase tracking-[0.14em] text-copper">
                  {t.year}
                </div>
                <div>
                  <h3 className="display text-xl text-ink md:text-2xl">
                    {t.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-steel">
                    {t.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Workshop location card */}
        <section className="border-t border-ink/10 py-20">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-5">
              <div className="eyebrow-copper">§ 04 — The workshop</div>
              <h2 className="display mt-4 text-[clamp(1.75rem,3vw,2.75rem)] text-ink">
                Find us on the estate.
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-steel">
                Most of the catalogue passes through our workshop before it
                goes out. If you're in the Midlands and you want to see a
                piece of gear in person, give us a call first.
              </p>
            </div>
            <div className="col-span-12 md:col-span-6 md:col-start-7">
              <div className="border border-ink/15 bg-paper-dim p-8">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-copper" />
                  <address className="font-mono text-sm not-italic leading-relaxed text-ink">
                    24 Central Trading Estate
                    <br />
                    Wolverhampton
                    <br />
                    United Kingdom · WV2 2RL
                  </address>
                </div>
                <div className="mt-6 flex items-start gap-3 border-t border-ink/10 pt-5">
                  <Phone className="mt-1 h-5 w-5 shrink-0 text-copper" />
                  <a
                    href="tel:+15555ARCHCOOL"
                    className="font-mono text-sm text-ink hover:text-copper"
                  >
                    +1 (555) ARCH-COOL
                  </a>
                </div>
                <Link
                  href="/contact"
                  className="btn-ink mt-8"
                >
                  Start a brief
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </PageShell>

      <CalloutBanner
        eyebrow="§ — Speccing a kitchen?"
        title="Send us your floor plan. We'll send back a catalogue that matches."
        cta="Book a consult"
        href="/contact"
      />
    </>
  );
}
