"use client";

import { trackLpCtaClick, type LpVariant } from "@/lib/quiz/quiz-analytics";

const PHONE_INTL = "972544280347";
const PHONE_DISPLAY = "054-4280347";

interface Props {
  variant: LpVariant;
  /** Pre-filled message body — let Shay know which LP they came from */
  waMessage: string;
  /** Location label fed into trackLpCtaClick — defaults to "hero" */
  ctaLocation?: "hero" | "offer_box" | "final" | "sticky";
  /** Compact mode for sticky / inline placements */
  size?: "lg" | "md";
}

function waHref(message: string) {
  return `https://wa.me/${PHONE_INTL}?text=${encodeURIComponent(message)}`;
}

/**
 * Primary CTA block — WhatsApp DM to Shay + tel: fallback.
 * No prices. The conversation closes on the call.
 */
export function TalkToShayCTA({
  variant,
  waMessage,
  ctaLocation = "hero",
  size = "lg",
}: Props) {
  const padding = size === "lg" ? "px-8 py-5 md:px-10 md:py-6" : "px-6 py-4";
  const textSize = size === "lg" ? "text-lg md:text-2xl" : "text-base md:text-lg";

  const handleWa = () => {
    trackLpCtaClick(variant, "talk_wa");
    trackLpCtaClick(variant, ctaLocation);
  };

  const handleTel = () => {
    trackLpCtaClick(variant, "talk_tel");
    trackLpCtaClick(variant, ctaLocation);
  };

  return (
    <div dir="rtl" className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <a
          href={waHref(waMessage)}
          target="_blank"
          rel="noopener"
          onClick={handleWa}
          className={`btn-press group inline-flex flex-1 items-center justify-center gap-3 bg-brand text-black ${padding} ${textSize} font-black uppercase tracking-wide border-[4px] border-neutral-800 hover:translate-x-1 hover:translate-y-1 transition-transform shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]`}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true" fill="currentColor">
            <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.7-1.7-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.2-.5.1-.2 0-.4 0-.5-.1-.1-.6-1.5-.9-2.1-.2-.5-.4-.5-.6-.5h-.6c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.5s1 2.9 1.2 3.1c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.2-.3-.2-.6-.4z"/>
            <path d="M21.6 12c0 5.3-4.3 9.6-9.6 9.6-1.7 0-3.3-.4-4.7-1.2L2 22l1.6-5.2c-.9-1.5-1.4-3.2-1.4-5 0-5.3 4.3-9.6 9.6-9.6 5.4 0 9.8 4.3 9.8 9.8zM12 4c-4.4 0-8 3.6-8 8 0 1.7.5 3.3 1.4 4.6l-.9 3.4 3.5-.9c1.3.8 2.9 1.3 4.5 1.3 4.4 0 8-3.6 8-8s-3.6-8.4-8.5-8.4z"/>
          </svg>
          <span>שלח/י לי הודעה ב-WhatsApp</span>
        </a>
        <a
          href={`tel:+${PHONE_INTL}`}
          onClick={handleTel}
          className={`inline-flex items-center justify-center gap-3 bg-transparent text-white ${padding} ${textSize} font-black uppercase tracking-wide border-[4px] border-brand hover:bg-brand hover:text-black transition-colors`}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.71 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.71A2 2 0 0 1 22 16.92z"/>
          </svg>
          <span>או חייג/י {PHONE_DISPLAY}</span>
        </a>
      </div>
      <p className="mt-3 text-xs text-neutral-400 text-center">
        אענה תוך כמה שעות. בטלפון נדבר על מתי הקורס הקרוב ואם זה מתאים לך.
      </p>
    </div>
  );
}
