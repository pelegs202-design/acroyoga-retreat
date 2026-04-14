"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { ScrollReveal } from "@/components/effects/ScrollReveal";

const REELS = [
  { shortcode: "DMA3tUdM7-d" },
  { shortcode: "CmHKPTbDEl0" },
  { shortcode: "DR7tqiTDEM9" },
  { shortcode: "DR7t_PwjI-v" },
  { shortcode: "DLfwNausSfA" },
  { shortcode: "DLfxKKbsrfv" },
  { shortcode: "DK2mwjhMph6" },
] as const;

const AUTO_SCROLL_PX_PER_SEC = 18;
const RESUME_IDLE_MS = 3500;

export function ReelsCarousel() {
  const t = useTranslations("home.reels");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const videosRef = useRef<HTMLVideoElement[]>([]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const videos = videosRef.current.filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const v = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        });
      },
      { root: el, threshold: 0.4 }
    );
    videos.forEach((v) => io.observe(v));

    let rafId = 0;
    let lastTs = 0;
    let paused = false;
    let resumeTimer: number | undefined;
    let reduceMotion = false;
    try {
      reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {}

    const tick = (ts: number) => {
      if (!lastTs) lastTs = ts;
      const dt = ts - lastTs;
      lastTs = ts;
      if (!paused && !reduceMotion) {
        const max = el.scrollWidth - el.clientWidth;
        if (max > 1) {
          const rtl = getComputedStyle(el).direction === "rtl";
          const delta = (AUTO_SCROLL_PX_PER_SEC * dt) / 1000;
          const next = el.scrollLeft + (rtl ? -delta : delta);
          if (rtl) {
            if (next <= -max + 1) el.scrollLeft = 0;
            else el.scrollLeft = next;
          } else {
            if (next >= max - 1) el.scrollLeft = 0;
            else el.scrollLeft = next;
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const pauseAuto = () => {
      paused = true;
      if (resumeTimer) window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        paused = false;
      }, RESUME_IDLE_MS);
    };
    el.addEventListener("pointerdown", pauseAuto, { passive: true });
    el.addEventListener("wheel", pauseAuto, { passive: true });
    el.addEventListener("touchstart", pauseAuto, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
      if (resumeTimer) window.clearTimeout(resumeTimer);
      el.removeEventListener("pointerdown", pauseAuto);
      el.removeEventListener("wheel", pauseAuto);
      el.removeEventListener("touchstart", pauseAuto);
    };
  }, []);

  return (
    <section className="w-full bg-background border-y-2 border-neutral-800 py-8 md:py-12">
      <ScrollReveal>
        <div className="max-w-7xl mx-auto px-6 mb-5">
          <p className="text-brand text-sm font-bold tracking-[0.3em] uppercase mb-3">
            {t("label")}
          </p>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {t("title")}
            </h2>
            <a
              href="https://www.instagram.com/acroshay/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline text-sm font-bold text-brand hover:underline whitespace-nowrap"
            >
              @acroshay →
            </a>
          </div>
        </div>
      </ScrollReveal>

      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto px-6 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="list"
        aria-label={t("title")}
      >
        {REELS.map((reel, i) => (
          <a
            key={reel.shortcode}
            href={`https://www.instagram.com/p/${reel.shortcode}/`}
            target="_blank"
            rel="noopener noreferrer"
            role="listitem"
            aria-label={`${t("reelLabel")} ${i + 1}`}
            className="group relative shrink-0 w-[220px] sm:w-[260px] aspect-[9/16] overflow-hidden border-2 border-neutral-800 hover:border-brand transition-colors bg-black"
          >
            <video
              ref={(el) => {
                if (el) videosRef.current[i] = el;
              }}
              src={`/reels/${reel.shortcode}.mp4`}
              poster={`/reels/${reel.shortcode}.jpg`}
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-0 inset-x-0 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white bg-gradient-to-t from-black/80 to-transparent"
            >
              @acroshay
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
