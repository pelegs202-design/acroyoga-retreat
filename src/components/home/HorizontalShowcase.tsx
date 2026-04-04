"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/effects/ScrollReveal";

/**
 * StatsSection — Brutalist stats row matching Stitch-generated design.
 *
 * Three large stat numbers in pink with white labels, separated by
 * thick border dividers. Full-width section with border-y-2.
 *
 * Kept as HorizontalShowcase export for backward compatibility with
 * the homepage page.tsx import.
 *
 * @see stitch-screens/homepage-stats.html
 * @see stitch-screens/header-footer.html (StatsSection)
 */

const STATS = [
  { key: "members", value: "500+" },
  { key: "jams", value: "200+" },
  { key: "cities", value: "15" },
];

export function HorizontalShowcase() {
  const t = useTranslations("home.showcase");

  return (
    <section className="border-y-2 border-neutral-800 bg-background py-20 px-6">
      <ScrollReveal>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-0 text-center items-center">
          {STATS.map((stat, i) => (
            <div
              key={stat.key}
              className={`py-12 md:py-0 ${
                i < STATS.length - 1
                  ? "border-b-2 md:border-b-0 md:border-s-2 border-neutral-800"
                  : ""
              }`}
            >
              <div className="text-7xl md:text-8xl font-black text-brand mb-4 tracking-tighter leading-none">
                {stat.value}
              </div>
              <div className="text-xl md:text-2xl font-bold text-white uppercase tracking-widest">
                {t(`stats.${stat.key}`)}
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
