/**
 * Horizontal typographic strip between hero and category index.
 * Editorial, single-line, overflow-scrolled marquee on mobile.
 */
export function ManifestoStrip() {
  const line = "Serious gear. From the line, for the line.";
  const items = Array.from({ length: 6 }, () => line);

  return (
    <section className="bg-ink text-paper">
      <div className="rule-copper" />
      <div className="flex items-stretch overflow-hidden">
        <div className="flex shrink-0 animate-marquee whitespace-nowrap">
          {items.concat(items).map((t, i) => (
            <span
              key={i}
              className="flex items-center gap-10 px-8 py-6 font-display text-2xl italic leading-none md:text-3xl"
            >
              {t}
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full bg-copper"
              />
            </span>
          ))}
        </div>
      </div>
      <div className="rule-copper" />
    </section>
  );
}
