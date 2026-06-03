import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ReactNode } from "react";

interface PageShellProps {
  section: string; // e.g. "§ 04 — About the house"
  title: ReactNode;
  lede?: ReactNode;
  aside?: ReactNode;
  breadcrumbs?: { name: string; href?: string }[];
  children: ReactNode;
  tone?: "paper" | "ink";
}

export function PageShell({
  section,
  title,
  lede,
  aside,
  breadcrumbs,
  children,
  tone = "paper",
}: PageShellProps) {
  const isInk = tone === "ink";
  return (
    <div
      className={
        isInk ? "bg-ink text-paper" : "bg-paper text-ink"
      }
    >
      {/* Header */}
      <section
        className={
          isInk
            ? "relative border-b border-paper/10 bg-grain"
            : "relative border-b border-ink/10 bg-blueprint"
        }
      >
        <div className="mx-auto max-w-[1440px] px-6 py-14 md:px-10 lg:px-14 lg:py-20">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav
              aria-label="Breadcrumb"
              className={`mb-8 flex flex-wrap items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] ${
                isInk ? "text-paper/55" : "text-steel-light"
              }`}
            >
              {breadcrumbs.map((b, i) => (
                <span key={`${b.name}-${i}`} className="flex items-center gap-2">
                  {b.href ? (
                    <Link href={b.href} className="hover:text-copper">
                      {b.name}
                    </Link>
                  ) : (
                    <span className={isInk ? "text-paper" : "text-ink"}>
                      {b.name}
                    </span>
                  )}
                  {i < breadcrumbs.length - 1 && (
                    <span className="text-copper/60">/</span>
                  )}
                </span>
              ))}
            </nav>
          )}

          <div className="grid grid-cols-12 items-end gap-8">
            <div className="col-span-12 md:col-span-8">
              <div
                className={
                  isInk ? "eyebrow-copper" : "eyebrow-copper"
                }
              >
                {section}
              </div>
              <h1
                className={`display mt-5 text-[clamp(2.25rem,5.5vw,4.75rem)] ${
                  isInk ? "text-paper" : "text-ink"
                }`}
              >
                {title}
              </h1>
              {lede && (
                <p
                  className={`mt-7 max-w-2xl text-base leading-relaxed md:text-lg ${
                    isInk ? "text-paper/80" : "text-steel"
                  }`}
                >
                  {lede}
                </p>
              )}
            </div>
            {aside && (
              <div className="col-span-12 md:col-span-4">{aside}</div>
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="mx-auto max-w-[1440px] px-6 py-14 md:px-10 lg:px-14 lg:py-20">
        {children}
      </div>
    </div>
  );
}

export function CalloutBanner({
  eyebrow,
  title,
  cta,
  href,
}: {
  eyebrow: string;
  title: string;
  cta: string;
  href: string;
}) {
  return (
    <section className="border-t border-ink/10 bg-paper">
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 items-center gap-8 px-6 py-16 md:px-10 lg:px-14">
        <div className="col-span-12 md:col-span-8">
          <div className="eyebrow-copper">{eyebrow}</div>
          <h3 className="display mt-4 text-[clamp(1.75rem,3.5vw,3rem)] text-ink">
            {title}
          </h3>
        </div>
        <div className="col-span-12 md:col-span-4 md:flex md:justify-end">
          <Link href={href} className="btn-ink">
            {cta}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
