"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Loader2, Mail, Phone, MapPin } from "lucide-react";
import { PageShell } from "@/components/storefront/PageShell";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      section="§ 05 — Talk to a specialist"
      breadcrumbs={[{ name: "Home", href: "/" }, { name: "Contact" }]}
      title={
        <>
          Send us <span className="italic text-copper">a brief,</span>
          <br />
          not a ticket.
        </>
      }
      lede="Tell us the service, the square footage, the ventilation you've got, and the gear you're weighing up. One of the specialists who speced your kind of kitchen before will write back — usually inside a working day."
    >
      <div className="grid grid-cols-12 gap-10">
        {/* Left: Form */}
        <div className="col-span-12 lg:col-span-7">
          <div className="border border-ink/15 bg-paper-dim">
            <header className="flex items-center justify-between border-b border-ink/10 px-6 py-4 md:px-8">
              <div className="eyebrow-copper">§ Brief / 01</div>
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-steel-light">
                Response within 1 business day
              </div>
            </header>

            <div className="px-6 py-8 md:px-8 md:py-10">
              {submitted ? (
                <div className="flex flex-col items-start gap-5 border border-copper/40 bg-copper/5 p-8">
                  <div className="flex h-11 w-11 items-center justify-center border border-copper bg-copper text-paper">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="display text-2xl text-ink">Brief received.</h3>
                    <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-steel">
                      Thanks — we've logged your message. A specialist will
                      read it, look up the catalogue, and write back with
                      options. If it's urgent, our line is{" "}
                      <a
                        href="tel:+15555ARCHCOOL"
                        className="text-copper underline underline-offset-2"
                      >
                        +1 (555) ARCH-COOL
                      </a>
                      .
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="contact-name" className="field-label">
                      <span className="text-copper">01 —</span> Your name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      className="field-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Head chef, GM, buyer…"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="contact-email" className="field-label">
                      <span className="text-copper">02 —</span> Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      className="field-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="you@restaurant.co.uk"
                    />
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="contact-message" className="field-label">
                      <span className="text-copper">03 —</span> The brief
                    </label>
                    <textarea
                      id="contact-message"
                      className="field-input h-auto py-3 leading-relaxed"
                      rows={7}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Service style, cover count, site address, what gear you're currently weighing up…"
                    />
                  </div>
                  {error && (
                    <div className="col-span-2 border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}
                  <div className="col-span-2 flex flex-col gap-3 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-steel-light">
                      We never share briefs. Stored under UK GDPR.
                    </p>
                    <button
                      type="submit"
                      className="btn-ink"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          Send brief
                          <ArrowUpRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right: Direct lines */}
        <aside className="col-span-12 lg:col-span-5">
          <div className="grid gap-5">
            <DirectLine
              icon={<Phone className="h-5 w-5" />}
              label="Direct line"
              title="+1 (555) ARCH-COOL"
              sub="Mon–Fri 08:00–18:00 · Sat 09:00–15:00 · 24/7 break-fix"
              href="tel:+15555ARCHCOOL"
            />
            <DirectLine
              icon={<Mail className="h-5 w-5" />}
              label="Email"
              title="studio@archcoolstore.com"
              sub="For specs, plans, and trade accounts"
              href="mailto:studio@archcoolstore.com"
            />
            <DirectLine
              icon={<MapPin className="h-5 w-5" />}
              label="Workshop"
              title="24 Central Trading Estate"
              sub="Wolverhampton · WV2 2RL · Visits by appointment"
            />
          </div>

          <div className="mt-8 border border-ink/15 bg-ink p-6 text-paper">
            <div className="eyebrow-copper">§ Trade buyers</div>
            <h3 className="display mt-3 text-2xl">Got a multi-site rollout?</h3>
            <p className="mt-3 text-sm leading-relaxed text-paper/80">
              We handle trade accounts with net terms, consolidated delivery
              and one named engineer across all sites. Drop us a line and
              we'll set you up.
            </p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

function DirectLine({
  icon,
  label,
  title,
  sub,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  sub: string;
  href?: string;
}) {
  const inner = (
    <div className="group flex items-start gap-4 border border-ink/15 bg-paper-dim p-6 transition-colors hover:border-ink">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-copper bg-copper text-paper">
        {icon}
      </div>
      <div className="flex-1">
        <div className="eyebrow !text-copper">{label}</div>
        <div className="mt-2 font-display text-lg font-semibold text-ink">
          {title}
        </div>
        <div className="mt-1 font-mono text-[0.75rem] uppercase tracking-[0.08em] text-steel-light">
          {sub}
        </div>
      </div>
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}
