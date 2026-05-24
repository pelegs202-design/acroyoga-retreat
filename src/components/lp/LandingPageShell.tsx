"use client";

import { useEffect, useRef } from "react";
import { VideoHeroBackground } from "@/components/lp/VideoHeroBackground";
import { WarmLeadStrip } from "@/components/lp/WarmLeadStrip";
import { TalkToShayCTA } from "@/components/lp/TalkToShayCTA";
import { CommunityLinks } from "@/components/lp/CommunityLinks";
import { SyllabusBlock } from "@/components/lp/SyllabusBlock";
import { ReelsCarousel } from "@/components/home/ReelsCarousel";
import type { Syllabus } from "@/lib/lp/syllabi";
import {
  trackLpView,
  trackScrollDepth,
  trackTimeOnPage,
} from "@/lib/quiz/quiz-analytics";

interface Props {
  syllabus: Syllabus;
}

/**
 * Shared layout for the 5 warm-lead landing pages (fun / handstand / tribe / trust / control).
 * Content comes from the typed `syllabi.ts` map. Hebrew-only, RTL hardcoded.
 *
 * No prices — primary CTA is WhatsApp DM to Shay.
 * Meta Pixel + GA4 are already injected globally in [locale]/layout.tsx.
 */
export function LandingPageShell({ syllabus }: Props) {
  const { variant } = syllabus;
  const mountTime = useRef(Date.now());
  const scrollMilestones = useRef(new Set<number>());

  useEffect(() => {
    trackLpView(variant);

    try {
      sessionStorage.setItem(
        "lp_test_meta",
        JSON.stringify({ lpVariant: variant, lpPath: "direct" }),
      );
    } catch {
      /* ignore */
    }

    const fbclid =
      new URLSearchParams(window.location.search).get("fbclid") || undefined;
    const fbp = document.cookie.match(/_fbp=([^;]+)/)?.[1] || undefined;
    fetch("/api/tracking/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: window.location.href, fbclid, fbp }),
    }).catch(() => {});

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const denom = document.body.scrollHeight - window.innerHeight;
        const pct =
          denom > 0 ? Math.round((window.scrollY / denom) * 100) : 0;
        for (const m of [25, 50, 75, 100]) {
          if (pct >= m && !scrollMilestones.current.has(m)) {
            scrollMilestones.current.add(m);
            trackScrollDepth(m);
          }
        }
        ticking = false;
      });
    };
    const handleUnload = () => {
      trackTimeOnPage(
        `lp_${variant}`,
        Math.round((Date.now() - mountTime.current) / 1000),
      );
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [variant]);

  return (
    <div
      dir="rtl"
      className="w-[100vw] relative left-1/2 right-1/2 -mx-[50vw] -mt-28 -mb-8 overflow-x-hidden"
    >
      {/* ── 1. HERO (video background) ─────────────────────────── */}
      <VideoHeroBackground reel={syllabus.heroReel} className="min-h-[88vh] flex items-center">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 py-16 md:py-24 w-full">
          <div className="inline-block mb-5 border-2 border-brand bg-brand/15 backdrop-blur-sm px-3 py-1.5">
            <span className="text-brand font-black text-xs uppercase tracking-widest">
              {syllabus.eyebrow}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.02] mb-5 text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.7)]">
            {syllabus.headline}
          </h1>

          <p className="text-lg md:text-2xl text-brand font-bold max-w-3xl mb-6 leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            {syllabus.hookLine}
          </p>

          <p className="text-base md:text-lg text-gray-200 max-w-2xl mb-8 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            {syllabus.lossSub}
          </p>

          <div className="max-w-2xl">
            <TalkToShayCTA
              variant={variant}
              waMessage={syllabus.waMessage}
              ctaLocation="hero"
            />
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            {["527 בוגרים", "0 פציעות", "10-12 איש בקורס", "סטודיו בתל אביב"].map(
              (tag, i) => (
                <span
                  key={i}
                  className="text-xs font-bold text-white border border-white/40 bg-black/40 backdrop-blur-sm px-3 py-1.5"
                >
                  {tag}
                </span>
              ),
            )}
          </div>
        </div>
      </VideoHeroBackground>

      {/* ── 2. WARM LEAD RECOGNITION ──────────────────────────── */}
      <WarmLeadStrip />

      {/* ── 3. INSTAGRAM CAROUSEL (acroshay reels) ────────────── */}
      <ReelsCarousel />

      {/* ── 4. STATS STRIP ────────────────────────────────────── */}
      <section className="border-b-2 border-neutral-800 py-12 px-6 bg-[#0a0a0a]">
        <div
          dir="rtl"
          className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-0 text-center"
        >
          {[
            { value: "527", label: "בוגרים" },
            { value: "96%", label: "מסיימים" },
            { value: "4.9", label: "דירוג" },
            { value: "0", label: "פציעות" },
          ].map((stat, i) => (
            <div
              key={i}
              className={`py-6 md:py-0 ${i > 0 ? "border-e-2 border-neutral-800" : ""}`}
            >
              <div className="text-4xl md:text-5xl font-black text-brand mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-bold text-white uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. OUTCOME BULLETS ────────────────────────────────── */}
      <section dir="rtl" className="py-16 px-6 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-10 text-center text-white">
            {syllabus.outcomesTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {syllabus.outcomes.map((b, i) => (
              <div
                key={i}
                className="border-2 border-neutral-700 bg-neutral-900 p-6 hover:border-brand transition-colors"
              >
                <div className="text-brand text-2xl font-black mb-2">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="text-xl font-black mb-2 text-white">{b.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. SYLLABUS ───────────────────────────────────────── */}
      <SyllabusBlock syllabus={syllabus} />

      {/* ── 7. TESTIMONIALS ───────────────────────────────────── */}
      <section dir="rtl" className="py-16 px-6 bg-neutral-950 border-b-2 border-neutral-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-10 text-center text-white">
            אנשים שעברו את אותו דבר
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {syllabus.testimonials.map((t, i) => (
              <figure
                key={i}
                className="border-2 border-neutral-700 bg-neutral-900 p-6"
              >
                <blockquote className="text-sm text-gray-200 mb-3 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="text-xs text-brand font-bold uppercase tracking-widest">
                  {t.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. COMMUNITY LINKS (WA group + Instagram) ─────────── */}
      <CommunityLinks variant={variant} />

      {/* ── 9. MID-PAGE CTA ───────────────────────────────────── */}
      <section dir="rtl" className="py-16 px-6 bg-brand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black text-black mb-3 leading-tight">
            הקורס הקרוב — מקומות מוגבלים
          </h2>
          <p className="text-black/80 font-bold mb-8 text-base md:text-lg">
            10-12 אנשים בלבד בכל קורס. אם אחרי שקראת זה הרגיש לך נכון — בוא/י נדבר.
          </p>
          <div className="bg-black p-5 sm:p-6">
            <TalkToShayCTA
              variant={variant}
              waMessage={syllabus.waMessage}
              ctaLocation="offer_box"
            />
          </div>
        </div>
      </section>

      {/* ── 10. FAQ ───────────────────────────────────────────── */}
      <section dir="rtl" className="py-16 px-6 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-10 text-center text-white">
            שאלות שאנשים שואלים לפני שמתקשרים
          </h2>
          <div className="space-y-3">
            {syllabus.faqs.map((item, i) => (
              <details
                key={i}
                className="border-2 border-neutral-700 bg-neutral-900 p-4 group"
              >
                <summary className="font-black cursor-pointer text-base list-none flex items-center justify-between gap-3 text-white">
                  <span>{item.q}</span>
                  <span className="text-brand text-2xl group-open:rotate-45 transition-transform shrink-0">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. FINAL CTA ─────────────────────────────────────── */}
      <section dir="rtl" className="py-20 px-6 bg-[#0a0a0a] border-t-2 border-neutral-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-white leading-tight">
            {syllabus.finalTitle}
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            {syllabus.finalSub}
          </p>
          <div className="max-w-2xl mx-auto">
            <TalkToShayCTA
              variant={variant}
              waMessage={syllabus.waMessage}
              ctaLocation="final"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
