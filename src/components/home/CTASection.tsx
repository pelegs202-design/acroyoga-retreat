"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { MagneticWrapper } from "@/components/effects/MagneticWrapper";
import { ScrollReveal } from "@/components/effects/ScrollReveal";

/**
 * CTASection — Bottom conversion section with magnetic CTA buttons.
 *
 * Bold heading drives urgency. Two magnetic buttons:
 * - Primary: quiz link (solid pink, most prominent)
 * - Secondary: members link (outline)
 *
 * Both buttons use btn-press class for tactile press feedback.
 * Dark background with subtle pink top accent gradient creates
 * visual separation from the section above.
 *
 * @see 10-02-PLAN.md Task 1D
 * @see src/components/effects/MagneticWrapper.tsx
 * @see src/app/globals.css .btn-press
 */
export function CTASection() {
  const t = useTranslations("home.cta");

  return (
    <section className="relative w-full py-32 px-6 sm:px-10 overflow-hidden bg-[#080808]">
      {/* Pink gradient accent at top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, #F472B6 40%, #F472B6 60%, transparent)",
        }}
      />

      {/* Background pink glow blob — center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-5 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, #F472B6 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <ScrollReveal>
          {/* Section label */}
          <p className="text-brand text-sm font-bold tracking-[0.3em] uppercase mb-6">
            {t("label")}
          </p>

          {/* Bold headline */}
          <h2 className="text-5xl sm:text-7xl font-black text-foreground tracking-tight leading-[0.9] mb-8">
            {t("title")}
          </h2>

          {/* Supporting text */}
          <p className="text-xl text-neutral-400 mb-12 max-w-xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <MagneticWrapper strength={0.3}>
              <Link
                href="/quiz"
                className="btn-press inline-flex items-center justify-center px-10 py-5 bg-brand text-brand-foreground font-black text-lg rounded-none border-2 border-brand hover:bg-brand-muted hover:border-brand-muted transition-colors"
              >
                {t("ctaPrimary")}
              </Link>
            </MagneticWrapper>

            <MagneticWrapper strength={0.3}>
              <Link
                href="/members"
                className="btn-press inline-flex items-center justify-center px-10 py-5 bg-transparent text-foreground font-bold text-lg rounded-none border-2 border-foreground/30 hover:border-brand hover:text-brand transition-colors"
              >
                {t("ctaSecondary")}
              </Link>
            </MagneticWrapper>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
