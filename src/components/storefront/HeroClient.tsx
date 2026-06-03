"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  imageString: string;
  createdAt: Date;
}

interface HeroClientProps {
  banners: Banner[];
}

const PACE_MS = 5200;

export function HeroClient({ banners }: HeroClientProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-advance
  useEffect(() => {
    if (paused || banners.length <= 1) return;
    const t = setInterval(() => {
      setCurrent((i) => (i + 1) % banners.length);
    }, PACE_MS);
    return () => clearInterval(t);
  }, [paused, banners.length]);

  // Preload all banner images
  useEffect(() => {
    banners.forEach((b) => {
      if (typeof window !== "undefined") {
        const img = new window.Image();
        img.src = b.imageString;
      }
    });
  }, [banners]);

  const goTo = useCallback(
    (idx: number) => {
      setCurrent(((idx % banners.length) + banners.length) % banners.length);
      setPaused(true);
      // resume after a beat
      window.setTimeout(() => setPaused(false), 9000);
    },
    [banners.length]
  );

  const active = banners[current];
  const total = banners.length;
  const indexLabel = `${String(current + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  return (
    <section
      className="relative isolate overflow-hidden bg-ink text-paper"
      style={{ minHeight: "min(92vh, 960px)" }}
      aria-roledescription="carousel"
    >
      {/* Image stack */}
      <div className="absolute inset-0">
        {banners.map((banner, idx) => (
          <div
            key={banner.id}
            className="absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{
              opacity: idx === current ? 1 : 0,
              zIndex: idx === current ? 2 : 1,
            }}
            aria-hidden={idx !== current}
          >
            <Image
              src={banner.imageString}
              alt={banner.title}
              fill
              sizes="100vw"
              quality={92}
              priority={idx === 0}
              className="object-cover"
            />
            {/* Dark editorial gradient */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, hsl(var(--ink) / 0.15) 0%, hsl(var(--ink) / 0.25) 50%, hsl(var(--ink) / 0.88) 100%), linear-gradient(90deg, hsl(var(--ink) / 0.55) 0%, hsl(var(--ink) / 0.05) 55%, transparent 100%)",
              }}
            />
          </div>
        ))}
        {/* Grain overlay */}
        <div
          aria-hidden
          className="bg-grain absolute inset-0 z-[3] opacity-60"
        />
      </div>

      {/* Content layer */}
      <div className="relative z-10 mx-auto grid min-h-[92vh] max-w-7xl grid-rows-[auto_1fr_auto] gap-10 px-6 py-10 md:px-10 lg:px-14">
        {/* Top meta rail */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-paper/80">
          <div className="flex items-center gap-5">
            <span className="eyebrow !text-copper/90">ArchCool · Est. 2012</span>
            <span className="hidden h-px w-10 bg-paper/30 md:block" />
            <span className="eyebrow hidden md:inline !text-paper/70">
              Commercial-grade kitchen equipment
            </span>
          </div>
          <span className="eyebrow !text-paper/70">{indexLabel}</span>
        </div>

        {/* Main stage */}
        <div className="grid grid-cols-12 items-end gap-y-10">
          <div className="col-span-12 lg:col-span-8 animate-hero-rise">
            <h1 className="display text-paper text-[clamp(2.75rem,8.5vw,7.5rem)] max-w-[18ch]">
              Kitchen equipment
              <br />
              <span className="italic text-copper/95">built for</span> the
              kitchens that
              <br />
              feed your city.
            </h1>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-paper/80 md:text-lg">
              Restaurant-grade ovens, grills, cold storage and prep gear —
              speced by chefs, installed by engineers who have actually worked
              a line.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="/products"
                className="group inline-flex items-center gap-3 border border-paper/70 bg-paper/5 px-7 py-4 text-sm font-medium uppercase tracking-[0.18em] text-paper backdrop-blur-sm transition-colors hover:bg-paper hover:text-ink"
              >
                Browse the catalogue
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/contact"
                className="link-sweep text-sm uppercase tracking-[0.18em] text-paper/90 hover:text-paper"
              >
                Talk to a specialist
              </Link>
            </div>
          </div>

          {/* Side rail: active banner title */}
          <div className="col-span-12 lg:col-span-4">
            <div className="ml-auto w-full max-w-sm border-l border-paper/25 pl-6 md:pl-8">
              <span className="eyebrow !text-paper/60">Now showing</span>
              <p className="mt-3 font-display text-2xl leading-tight text-paper md:text-3xl">
                {active?.title}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom pagination rail */}
        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-paper/20 pt-6">
          <div className="flex items-center gap-8 text-paper/70">
            {banners.map((b, idx) => (
              <button
                key={b.id}
                onClick={() => goTo(idx)}
                aria-label={`Show banner ${idx + 1}: ${b.title}`}
                aria-current={idx === current}
                className="group relative flex items-center gap-3 text-left"
              >
                <span
                  className={`eyebrow transition-colors ${idx === current ? "!text-copper" : "!text-paper/50 group-hover:!text-paper/80"}`}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span
                  aria-hidden
                  className={`h-px transition-all duration-500 ${idx === current ? "w-14 bg-copper" : "w-6 bg-paper/30 group-hover:w-10 group-hover:bg-paper/60"}`}
                />
              </button>
            ))}
          </div>
          <span className="eyebrow hidden !text-paper/60 md:inline">
            ↓ Scroll
          </span>
        </div>
      </div>
    </section>
  );
}
