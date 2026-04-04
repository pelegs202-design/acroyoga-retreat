"use client";

import { useTranslations } from "next-intl";
import { HorizontalScrollSection } from "@/components/effects/HorizontalScrollSection";
import { DraggableCard } from "@/components/effects/DraggableCard";

/**
 * Showcase card data type (matches i18n keys home.showcase.cards.N)
 */
interface ShowcaseCard {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  accent: string;
}

/**
 * HorizontalShowcase — Horizontal scroll section with draggable cards.
 *
 * Desktop: HorizontalScrollSection maps vertical scroll to horizontal pan.
 * Each card is wrapped in DraggableCard (DSGN-01 requirement satisfied here).
 * dragConstraints: ±60px in all directions. dragElastic: 0.3.
 *
 * Mobile: HorizontalScrollSection renders children as vertical stack.
 * DraggableCard renders static fallback on mobile (md:hidden sibling).
 *
 * Cards represent platform value propositions: 5 brutalist cards
 * with thick pink borders, bold headlines, supporting text, and
 * abstract decorative elements.
 *
 * @see 10-02-PLAN.md Task 1C
 * @see src/components/effects/HorizontalScrollSection.tsx
 * @see src/components/effects/DraggableCard.tsx
 * @see DSGN-01 "at least one draggable UI element on key pages"
 */

// Accent colors cycle for visual variety
const CARD_ACCENTS = [
  "border-brand",
  "border-brand/60",
  "border-brand",
  "border-brand/80",
  "border-brand/60",
];

const CARD_INDICES = [0, 1, 2, 3, 4];

export function HorizontalShowcase() {
  const t = useTranslations("home.showcase");

  const cards: ShowcaseCard[] = CARD_INDICES.map((i) => ({
    id: String(i),
    title: t(`cards.${i}.title`),
    subtitle: t(`cards.${i}.subtitle`),
    tag: t(`cards.${i}.tag`),
    accent: CARD_ACCENTS[i],
  }));

  return (
    <section>
      {/* Section header — visible above the horizontal scroll track */}
      <div className="w-full px-6 sm:px-10 pt-20 pb-6 max-w-7xl mx-auto">
        <p className="text-brand text-sm font-bold tracking-[0.3em] uppercase mb-3">
          {t("label")}
        </p>
        <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
          {t("title")}
        </h2>
      </div>

      <HorizontalScrollSection>
        {cards.map((card, i) => (
          <DraggableCard
            key={card.id}
            dragConstraints={{ top: -60, left: -60, right: 60, bottom: 60 }}
            dragElastic={0.3}
            className={`shrink-0 w-[80vw] md:w-[45vw] lg:w-[38vw] min-h-[420px] border-2 ${card.accent} bg-[#0d0d0d] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden`}
          >
            {/* Abstract decorative — large faded number in background */}
            <span
              className="absolute -bottom-6 -end-4 text-[9rem] font-black text-brand/[0.05] leading-none select-none pointer-events-none"
              aria-hidden="true"
            >
              {String(i + 1).padStart(2, "0")}
            </span>

            {/* Card content */}
            <div className="relative z-10 flex flex-col gap-6 h-full">
              {/* Tag pill */}
              <div className="inline-flex self-start">
                <span className="text-xs font-bold tracking-widest uppercase text-brand border border-brand/40 px-3 py-1">
                  {card.tag}
                </span>
              </div>

              {/* Spacer pushes headline toward center */}
              <div className="flex-1" />

              {/* Headline */}
              <h3 className="text-3xl sm:text-4xl font-black text-foreground leading-tight">
                {card.title}
              </h3>

              {/* Supporting text */}
              <p className="text-neutral-400 text-base leading-relaxed">
                {card.subtitle}
              </p>

              {/* Bottom pink rule accent */}
              <div className="w-12 h-[3px] bg-brand" />
            </div>
          </DraggableCard>
        ))}
      </HorizontalScrollSection>
    </section>
  );
}
