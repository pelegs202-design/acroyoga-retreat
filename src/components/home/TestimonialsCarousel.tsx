"use client";

import { useTranslations, useLocale } from "next-intl";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { TESTIMONIALS } from "@/lib/testimonials";

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 text-brand"
          aria-hidden="true"
        >
          <path d="M9.05 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.16c.969 0 1.371 1.24.588 1.81l-3.366 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118L10.588 15.4a1 1 0 00-1.176 0l-3.366 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.064 9.384c-.783-.57-.38-1.81.588-1.81h4.16a1 1 0 00.951-.69l1.287-3.957z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsCarousel() {
  const t = useTranslations("home.testimonials");
  const locale = useLocale();
  const isHe = locale === "he";

  return (
    <section className="w-full bg-neutral-950 py-20">
      <ScrollReveal>
        <div className="max-w-7xl mx-auto px-6 mb-10">
          <p className="text-brand text-sm font-bold tracking-[0.3em] uppercase mb-3">
            {t("label")}
          </p>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {t("title")}
          </h2>
        </div>
      </ScrollReveal>

      {/* Mobile: snap-x carousel · Desktop: 2-column grid */}
      <div
        className="
          flex gap-4 overflow-x-auto px-6 snap-x snap-mandatory scroll-px-6
          [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-6 md:max-w-7xl md:mx-auto
        "
        role="list"
      >
        {TESTIMONIALS.map((tst, i) => (
          <article
            key={i}
            role="listitem"
            className="
              shrink-0 w-[85%] sm:w-[400px] snap-start
              md:w-auto md:shrink
              bg-neutral-900 border-2 border-neutral-800 p-6 flex flex-col gap-4
            "
          >
            <div className="flex items-center justify-between">
              <Stars count={tst.rating ?? 5} />
              {tst.source === "google" && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  {t("googleReview")}
                </span>
              )}
            </div>
            <blockquote className="text-white/90 text-base leading-relaxed flex-1">
              &ldquo;{isHe ? tst.he : tst.en}&rdquo;
            </blockquote>
            <footer className="border-t border-neutral-800 pt-3">
              <p className="text-sm font-bold text-white">
                {isHe ? tst.author.he : tst.author.en}
              </p>
            </footer>
          </article>
        ))}
      </div>

      {/* All-reviews link */}
      <div className="max-w-7xl mx-auto px-6 mt-8 text-center">
        <a
          href="https://maps.app.goo.gl/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm font-bold text-brand hover:underline uppercase tracking-widest"
        >
          {t("seeAll")} →
        </a>
      </div>
    </section>
  );
}
