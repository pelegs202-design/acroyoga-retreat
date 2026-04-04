"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ParallaxLayer } from "@/components/effects/ParallaxLayer";
import { MagneticWrapper } from "@/components/effects/MagneticWrapper";
import { ScrollReveal } from "@/components/effects/ScrollReveal";

/**
 * HeroSection — Brutalist hero matching Stitch-generated design.
 *
 * Asymmetric 2-column grid: RTL headline on the start side,
 * decorative brutalist image frame on the other. Pink diagonal
 * offset border behind the image. Grayscale contrast treatment.
 *
 * @see stitch-screens/header-footer.html (hero section)
 * @see stitch-screens/homepage-hero.png
 */
export function HeroSection() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-background border-b-2 border-neutral-800">
      {/* Parallax background layer */}
      <ParallaxLayer speed={0.35} className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0d0d0d]" />
      </ParallaxLayer>

      {/* Hero content — asymmetric grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text block */}
          <div className="order-2 lg:order-1 text-start">
            <ScrollReveal>
              <h1 className="text-6xl lg:text-8xl font-black leading-none mb-6">
                {t("title").split(" ").slice(0, -1).join(" ")}{" "}
                <br />
                <span className="text-brand">{t("title").split(" ").pop()}</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-gray-400 text-lg max-w-xl mb-10 leading-relaxed">
                {t("subtitle")}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="flex flex-wrap gap-4">
                <MagneticWrapper strength={0.25}>
                  <Link
                    href="/quiz"
                    className="btn-press bg-brand text-[#0a0a0a] px-10 py-4 text-xl font-black border-[3px] border-neutral-800 hover:translate-x-1 hover:translate-y-1 transition-transform"
                  >
                    {t("ctaQuiz")}
                  </Link>
                </MagneticWrapper>
                <MagneticWrapper strength={0.25}>
                  <Link
                    href="/members"
                    className="btn-press bg-transparent text-white px-10 py-4 text-xl font-black border-2 border-white hover:bg-white hover:text-[#0a0a0a] transition-colors"
                  >
                    {t("ctaPartners")}
                  </Link>
                </MagneticWrapper>
              </div>
            </ScrollReveal>
          </div>

          {/* Brutalist image frame */}
          <div className="order-1 lg:order-2 flex justify-center relative">
            <ScrollReveal delay={0.15}>
              <div className="relative z-10 border-[3px] border-neutral-800 p-4 bg-[#0a0a0a]">
                {/* Placeholder — grayscale acroyoga image area */}
                <div className="w-full aspect-square max-w-md bg-neutral-900 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-transparent opacity-50" />
                  <span className="text-8xl font-black text-brand/10 select-none">AH</span>
                </div>
                <div className="absolute bottom-4 start-4 bg-white text-[#0a0a0a] font-black px-2 py-1 text-[10px] tracking-widest uppercase">
                  EST. 2024
                </div>
              </div>
              {/* Decorative offset pink border */}
              <div className="absolute -z-10 top-8 end-8 w-full max-w-md aspect-square border-2 border-brand" />
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
