"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/effects/ScrollReveal";

/**
 * FeaturesShowcase — 4 brutalist feature cards in a grid.
 *
 * Matches Stitch-generated design: dark cards with thick 2px borders,
 * pink accent icons, bold white titles, gray descriptions.
 * card-hover class adds scale + pink glow on hover.
 *
 * @see stitch-screens/homepage-features prompt
 * @see stitch-screens/header-footer.html (feature pattern)
 */

const FEATURE_ICONS = [
  // Partner matching — people icon
  <svg key="0" className="w-8 h-8 stroke-brand" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>,
  // Jam board — calendar icon
  <svg key="1" className="w-8 h-8 stroke-brand" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>,
  // 30-day challenge — trophy icon
  <svg key="2" className="w-8 h-8 stroke-brand" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.996.078-1.927.228-2.25.375v2.139A2.625 2.625 0 0 0 5.25 9.375h.006M18.75 4.236c.996.078 1.927.228 2.25.375v2.139A2.625 2.625 0 0 1 18.75 9.375h-.006" /></svg>,
  // Community — users icon
  <svg key="3" className="w-8 h-8 stroke-brand" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>,
];

const STAGGER_DELAYS = [0, 0.1, 0.2, 0.3];

export function FeaturesShowcase() {
  const t = useTranslations("home.features");

  return (
    <section className="w-full py-24 px-6 sm:px-10 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <ScrollReveal>
          <div className="mb-16">
            <p className="text-brand text-sm font-bold tracking-[0.3em] uppercase mb-3">
              {t("label")}
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
              {t("title")}
            </h2>
          </div>
        </ScrollReveal>

        {/* 4-card feature grid — matching Stitch brutalist design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <ScrollReveal key={i} delay={STAGGER_DELAYS[i]}>
              <article className="card-hover bg-neutral-900 border-2 border-neutral-700 p-8 flex flex-col gap-6 group h-full">
                {/* Pink icon */}
                <div className="w-14 h-14 border-2 border-brand/40 flex items-center justify-center">
                  {FEATURE_ICONS[i]}
                </div>

                {/* Title */}
                <h3 className="text-xl font-black text-foreground group-hover:text-brand transition-colors">
                  {t(`items.${i}.title`)}
                </h3>

                {/* Description */}
                <p className="text-neutral-400 text-sm leading-relaxed">
                  {t(`items.${i}.description`)}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
