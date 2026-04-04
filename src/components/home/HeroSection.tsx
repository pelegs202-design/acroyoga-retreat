"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ParallaxLayer } from "@/components/effects/ParallaxLayer";
import { MagneticWrapper } from "@/components/effects/MagneticWrapper";
import { ScrollReveal } from "@/components/effects/ScrollReveal";

/**
 * HeroSection — Full-viewport brutalist hero with parallax background.
 *
 * Layout: Asymmetric grid — headline pushed to the start side,
 * creating raw, off-balance brutalist tension. No text animations
 * (locked decision: no text animation). Subtitle + buttons block
 * reveals on scroll via ScrollReveal.
 *
 * Background: ParallaxLayer with dark gradient and hot-pink accent shapes.
 * CTAs: MagneticWrapper + btn-press class for tactile desktop interaction.
 *
 * @see 10-02-PLAN.md Task 1A
 * @see src/components/effects/ParallaxLayer.tsx
 * @see src/components/effects/MagneticWrapper.tsx
 */
export function HeroSection() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      {/* Parallax background layer */}
      <ParallaxLayer speed={0.35} className="absolute inset-0">
        {/* Dark-to-dark gradient with pink accent shapes */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0d0d0d]" />
        {/* Abstract pink accent — top-right corner blob */}
        <div
          className="absolute -top-32 -end-32 w-[500px] h-[500px] rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, #F472B6 0%, transparent 70%)",
          }}
        />
        {/* Smaller accent — bottom-start area */}
        <div
          className="absolute bottom-0 start-0 w-[300px] h-[300px] opacity-6"
          style={{
            background:
              "radial-gradient(circle, #DB2777 0%, transparent 60%)",
          }}
        />
        {/* Brutalist horizontal rule accent */}
        <div className="absolute top-1/2 start-0 w-full h-px bg-brand/10" />
      </ParallaxLayer>

      {/* Hero content — asymmetric layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-24">
        {/* Asymmetric grid: headline dominates start side */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 items-center">
          {/* Headline block — static (locked: no text animation) */}
          <div>
            {/* Brutalist overline label */}
            <p className="mb-4 text-brand text-sm font-bold tracking-[0.3em] uppercase">
              AcroHavura
            </p>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight text-foreground">
              {t("title")}
            </h1>
          </div>

          {/* Subtitle + CTA block — reveals on scroll */}
          <ScrollReveal delay={0.1}>
            <div className="flex flex-col gap-6">
              <p className="text-xl text-neutral-400 leading-relaxed">
                {t("subtitle")}
              </p>

              {/* CTA buttons with magnetic effect on desktop */}
              <div className="flex flex-col sm:flex-row gap-4">
                <MagneticWrapper strength={0.25}>
                  <Link
                    href="/quiz"
                    className="btn-press inline-flex items-center justify-center px-8 py-4 bg-brand text-brand-foreground font-bold text-base rounded-none border-2 border-brand hover:bg-brand-muted hover:border-brand-muted transition-colors"
                  >
                    {t("ctaQuiz")}
                  </Link>
                </MagneticWrapper>
                <MagneticWrapper strength={0.25}>
                  <Link
                    href="/members"
                    className="btn-press inline-flex items-center justify-center px-8 py-4 bg-transparent text-foreground font-bold text-base rounded-none border-2 border-foreground/30 hover:border-brand hover:text-brand transition-colors"
                  >
                    {t("ctaPartners")}
                  </Link>
                </MagneticWrapper>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Brutalist bottom edge indicator */}
        <div className="absolute bottom-10 start-6 sm:start-10 flex items-center gap-3">
          <div className="w-8 h-px bg-brand" />
          <span className="text-xs text-neutral-500 tracking-widest uppercase">
            {t("scrollHint")}
          </span>
        </div>
      </div>
    </section>
  );
}
