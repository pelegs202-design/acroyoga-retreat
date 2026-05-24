"use client";

import { useEffect, useState } from "react";
import { trackLpCtaClick, type LpVariant } from "@/lib/quiz/quiz-analytics";

const PHONE_INTL = "972544280347";

interface Props {
  variant: LpVariant;
  waMessage: string;
  buttonText: string;
}

/**
 * Click Coach Pattern 1 + 39 — sticky CTA on paid-traffic mobile.
 * Appears after first 400px of scroll so it doesn't compete with hero CTA.
 * Single button, full-width, brand color, fires sticky analytics.
 */
export function StickyMobileWaBar({ variant, waMessage, buttonText }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > 400);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    trackLpCtaClick(variant, "sticky");
    trackLpCtaClick(variant, "talk_wa");
  };

  if (!visible) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-x-0 bottom-0 z-40 sm:hidden border-t-2 border-brand bg-[#0a0a0a]/95 backdrop-blur-md px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
      role="region"
      aria-label="צור קשר"
    >
      <a
        href={`https://wa.me/${PHONE_INTL}?text=${encodeURIComponent(waMessage)}`}
        target="_blank"
        rel="noopener"
        onClick={handleClick}
        className="btn-press flex items-center justify-center gap-2 w-full bg-brand text-black font-black py-3 text-sm border-2 border-brand active:translate-y-0.5 transition-transform"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true" fill="currentColor">
          <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.7-1.7-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.2-.5.1-.2 0-.4 0-.5-.1-.1-.6-1.5-.9-2.1-.2-.5-.4-.5-.6-.5h-.6c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.5s1 2.9 1.2 3.1c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.2-.3-.2-.6-.4z" />
          <path d="M21.6 12c0 5.3-4.3 9.6-9.6 9.6-1.7 0-3.3-.4-4.7-1.2L2 22l1.6-5.2c-.9-1.5-1.4-3.2-1.4-5 0-5.3 4.3-9.6 9.6-9.6 5.4 0 9.8 4.3 9.8 9.8zM12 4c-4.4 0-8 3.6-8 8 0 1.7.5 3.3 1.4 4.6l-.9 3.4 3.5-.9c1.3.8 2.9 1.3 4.5 1.3 4.4 0 8-3.6 8-8s-3.6-8.4-8.5-8.4z" />
        </svg>
        <span>{buttonText}</span>
      </a>
    </div>
  );
}
