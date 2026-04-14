import { setRequestLocale } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { InstagramGrid } from "@/components/social/InstagramGrid";
import { ScrollProgressBar } from "@/components/home/ScrollProgressBar";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesShowcase } from "@/components/home/FeaturesShowcase";
import { HorizontalShowcase } from "@/components/home/HorizontalShowcase";
import { ReelsCarousel } from "@/components/home/ReelsCarousel";
import { FounderCard } from "@/components/home/FounderCard";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { CTASection } from "@/components/home/CTASection";
import { ScrollReveal } from "@/components/effects/ScrollReveal";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: "seo.home", path: "" });
}

/**
 * HomePage — Server component that composes the brutalist homepage.
 *
 * All animation and interactivity delegated to "use client" children:
 * ScrollProgressBar, HeroSection, FeaturesShowcase, HorizontalShowcase,
 * CTASection. This page itself contains NO Framer Motion code.
 *
 * Page flow:
 * 1. ScrollProgressBar — fixed thin pink bar tracking scroll depth
 * 2. HeroSection — full-viewport parallax hero with magnetic CTAs
 * 3. FeaturesShowcase — staggered scroll-reveal feature sections
 * 4. HorizontalShowcase — horizontal scroll with draggable cards (desktop)
 * 5. CTASection — conversion section with magnetic buttons
 * 6. InstagramGrid — social proof grid (RSC, zero client JS)
 *
 * @see 10-02-PLAN.md Task 2
 */
export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  // Enable static rendering for this locale segment
  setRequestLocale(locale);

  return (
    <main>
      {/* Fixed scroll progress indicator — sits above header (z-[60]) */}
      <ScrollProgressBar />

      {/* Full-viewport parallax hero */}
      <HeroSection />

      {/* Staggered scroll-reveal feature sections */}
      <FeaturesShowcase />

      {/* Horizontal scroll showcase with draggable cards (DSGN-01) */}
      <HorizontalShowcase />

      {/* Instagram reels — mobile-first horizontal carousel */}
      <ReelsCarousel />

      {/* Founder trust anchor — mid-scroll */}
      <FounderCard />

      {/* Testimonials — App-Store-style cards on mobile, grid on desktop */}
      <TestimonialsCarousel />

      {/* Bottom CTA conversion section */}
      <CTASection />

      {/* Instagram social proof grid — server component, zero client JS */}
      <ScrollReveal>
        <InstagramGrid />
      </ScrollReveal>
    </main>
  );
}
