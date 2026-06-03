/**
 * Editorial proof strip — stat numbers + pull quote. B2B credibility cue
 * that doesn't look like a generic SaaS logo wall.
 */
const STATS = [
  { n: "12 yrs", label: "Speccing commercial kitchens" },
  { n: "4,500+", label: "Installs across the UK" },
  { n: "48 hr", label: "Typical delivery, most regions" },
  { n: "24 / 7", label: "Break-fix support for line kitchens" },
];

export function CredibilityStats() {
  return (
    <section className="relative bg-ink text-paper">
      <div className="bg-grain">
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 lg:px-14 lg:py-32">
          <div className="grid grid-cols-12 gap-10">
            {/* Pull quote */}
            <div className="col-span-12 lg:col-span-6">
              <span className="eyebrow !text-copper/90">§ 03 — The receipts</span>
              <blockquote className="mt-6">
                <p className="display text-[clamp(1.75rem,3vw,2.75rem)] text-paper">
                  <span className="text-copper">“</span>
                  When the grill went down on a Saturday night, ArchCool had
                  an engineer in my kitchen before service the following
                  Tuesday. That's the whole difference.
                  <span className="text-copper">”</span>
                </p>
                <footer className="mt-8 flex items-center gap-4 text-paper/70">
                  <span
                    aria-hidden
                    className="h-px w-12 bg-copper/70"
                  />
                  <span className="eyebrow !text-paper/70">
                    Ayo T. · Head chef · Lagos Room, Shoreditch
                  </span>
                </footer>
              </blockquote>
            </div>

            {/* Stats grid */}
            <div className="col-span-12 lg:col-span-5 lg:col-start-8">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-10">
                {STATS.map((s, i) => (
                  <div key={s.label} className="border-t border-paper/25 pt-4">
                    <dt className="eyebrow !text-paper/60">
                      {String(i + 1).padStart(2, "0")}
                    </dt>
                    <dd className="mt-3">
                      <span className="display block text-4xl text-paper md:text-5xl">
                        {s.n}
                      </span>
                      <span className="mt-2 block text-sm leading-snug text-paper/70">
                        {s.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
