"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { ScrollReveal } from "@/components/effects/ScrollReveal";

const REELS = [
  { shortcode: "CmHKPTbDEl0" },
  { shortcode: "DR7tqiTDEM9" },
  { shortcode: "DR7t_PwjI-v" },
  { shortcode: "DMA3tUdM7-d" },
  { shortcode: "DLfwNausSfA" },
  { shortcode: "DLfxKKbsrfv" },
  { shortcode: "DK2mwjhMph6" },
] as const;

export function ReelsCarousel() {
  const t = useTranslations("home.reels");

  return (
    <section className="w-full bg-background border-y-2 border-neutral-800 py-16">
      <ScrollReveal>
        <div className="max-w-7xl mx-auto px-6 mb-8">
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
        className="flex gap-3 overflow-x-auto px-6 snap-x snap-mandatory scroll-px-6 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
            className="group relative shrink-0 w-[220px] sm:w-[260px] aspect-[9/16] snap-start overflow-hidden border-2 border-neutral-800 hover:border-brand transition-colors"
          >
            <Image
              src={`/reels/${reel.shortcode}.jpg`}
              alt={`${t("reelLabel")} ${i + 1}`}
              fill
              sizes="(max-width: 640px) 220px, 260px"
              className="object-cover transition-[filter] duration-200 group-hover:brightness-90"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="white"
                  className="h-6 w-6 ms-1"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
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
