"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/effects/ScrollReveal";

/**
 * Feature item data type (matches i18n keys home.features.items.N)
 */
interface FeatureItem {
  number: string;
  title: string;
  description: string;
}

const FEATURE_NUMBERS = ["01", "02", "03", "04", "05"];
const STAGGER_DELAYS = [0, 0.15, 0.3, 0.45, 0.6];

/**
 * FeaturesShowcase — Staggered scroll-reveal feature sections.
 *
 * 5 feature blocks stacked vertically, each wrapped in ScrollReveal
 * with increasing stagger delays. Bold background number decoration
 * creates brutalist depth. card-hover class adds pink glow on hover.
 *
 * Features: community matching, jam sessions, quiz assessment,
 * WhatsApp integration, 30-day challenge.
 *
 * @see 10-02-PLAN.md Task 1B
 * @see src/components/effects/ScrollReveal.tsx
 * @see src/app/globals.css .card-hover
 */
export function FeaturesShowcase() {
  const t = useTranslations("home.features");

  const features: FeatureItem[] = FEATURE_NUMBERS.map((num, i) => ({
    number: num,
    title: t(`items.${i}.title`),
    description: t(`items.${i}.description`),
  }));

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

        {/* Feature list */}
        <div className="flex flex-col gap-8">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.number} delay={STAGGER_DELAYS[i]}>
              <article className="card-hover relative overflow-hidden border border-white/5 bg-white/[0.02] p-8 sm:p-10 group">
                {/* Brutalist background number decoration */}
                <span
                  className="absolute -top-4 -start-2 text-[8rem] sm:text-[10rem] font-black text-brand/[0.06] leading-none select-none pointer-events-none"
                  aria-hidden="true"
                >
                  {feature.number}
                </span>

                {/* Feature content */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 sm:gap-12 items-start">
                  {/* Number badge */}
                  <div className="text-brand text-sm font-bold tracking-widest uppercase">
                    {feature.number}
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-brand transition-colors duration-200">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Pink left border accent — grows on hover */}
                <div className="absolute top-0 start-0 w-[3px] h-0 bg-brand group-hover:h-full transition-all duration-300" />
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
