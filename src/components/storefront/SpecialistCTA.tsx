import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Phone } from "lucide-react";

export function SpecialistCTA() {
  return (
    <section className="relative bg-paper text-ink">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 lg:px-14 lg:py-32">
        <div className="grid grid-cols-12 gap-0 overflow-hidden border border-ink/10 bg-ink/[0.02]">
          {/* Image plate */}
          <div className="relative col-span-12 aspect-[4/3] md:col-span-6 md:aspect-auto">
            <Image
              src="https://picsum.photos/seed/archcool-specialist-cta/1400/1000"
              alt="Line cook working at a commercial kitchen station"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover grayscale-[10%]"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--ink) / 0.1) 0%, hsl(var(--ink) / 0.45) 100%)",
              }}
            />
            <div className="absolute bottom-6 left-6 right-6 text-paper">
              <span className="eyebrow !text-paper/70">§ 04 — Talk to us</span>
            </div>
          </div>

          {/* Copy + actions */}
          <div className="col-span-12 flex flex-col justify-between gap-10 p-8 md:col-span-6 md:p-12 lg:p-16">
            <div>
              <h2 className="display text-[clamp(2.25rem,4vw,3.5rem)] text-ink">
                Need it sized,{" "}
                <span className="italic text-copper">specced,</span>
                <br />
                or installed?
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-steel md:text-lg">
                Our equipment specialists have built menus. They'll match the
                gear to your service, your ventilation and your square
                footage — not your cart total.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Link
                href="/contact"
                className="group flex items-center justify-between gap-4 border border-ink bg-ink px-6 py-5 text-paper transition-colors hover:bg-copper hover:border-copper hover:text-ink"
              >
                <div>
                  <span className="eyebrow !text-paper/70 group-hover:!text-ink/70">
                    Start a brief
                  </span>
                  <div className="mt-1 font-display text-xl leading-tight">
                    Book a consult
                  </div>
                </div>
                <ArrowUpRight className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>

              <a
                href="tel:+15555ARCHCOOL"
                className="group flex items-center justify-between gap-4 border border-ink/20 bg-paper px-6 py-5 text-ink transition-colors hover:border-ink"
              >
                <div>
                  <span className="eyebrow">Direct line</span>
                  <div className="mt-1 font-display text-xl leading-tight">
                    +1 (555) ARCH-COOL
                  </div>
                </div>
                <Phone className="h-5 w-5 text-copper" />
              </a>
            </div>

            <div className="rule-ink pt-6">
              <span className="eyebrow text-steel">
                Mon–Fri 08:00–18:00 · Sat 09:00–15:00 · Emergency support 24/7
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
