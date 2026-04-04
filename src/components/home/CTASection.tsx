"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { MagneticWrapper } from "@/components/effects/MagneticWrapper";
import { ScrollReveal } from "@/components/effects/ScrollReveal";

/**
 * CTASection — Full-width pink CTA matching Stitch-generated design.
 *
 * Hot pink #F472B6 background, large bold black text heading,
 * black button with white text. Brutalist sharp edges.
 *
 * @see stitch-screens/homepage-cta.html
 * @see stitch-screens/city-page.html (Bottom CTA section)
 */
export function CTASection() {
  const t = useTranslations("home.cta");

  return (
    <section className="bg-brand py-20">
      <ScrollReveal>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-7xl font-black text-black mb-10 leading-tight">
            {t("title")}
          </h2>

          <MagneticWrapper strength={0.3}>
            <Link
              href="/quiz"
              className="btn-press inline-block bg-black text-white px-12 py-6 text-2xl font-black hover:translate-y-1 transition-transform border-4 border-black"
            >
              {t("ctaPrimary")}
            </Link>
          </MagneticWrapper>
        </div>
      </ScrollReveal>
    </section>
  );
}
