"use client";

import { trackLpCtaClick, type LpVariant } from "@/lib/quiz/quiz-analytics";

const WA_GROUP = "https://chat.whatsapp.com/ITDiLLnOQy0Aa9FsF6Bc50";
const INSTAGRAM = "https://www.instagram.com/acroshay/";

interface Props {
  variant: LpVariant;
  /** Optional heading override */
  title?: string;
  /** Sub-text under heading */
  subtitle?: string;
  /** Compact = no headings, just buttons */
  compact?: boolean;
}

/**
 * WhatsApp community group + Instagram CTAs.
 * Renders inline on the LP — separate from the primary "talk to Shay" CTA.
 * Frames as "want to feel the vibe first? join the group / see the people".
 */
export function CommunityLinks({
  variant,
  title = "רוצה לטעום קודם? תכיר/י את החבורה.",
  subtitle = "קבוצת הוואטסאפ שלנו ואינסטגרם — כאן רואים מי אנחנו לפני שנפגשים.",
  compact = false,
}: Props) {
  const handleWa = () => trackLpCtaClick(variant, "community_wa");
  const handleIg = () => trackLpCtaClick(variant, "community_ig");

  return (
    <section
      dir="rtl"
      className={
        compact
          ? "py-6"
          : "py-14 px-6 border-y-2 border-neutral-800 bg-neutral-950"
      }
    >
      <div className="max-w-4xl mx-auto">
        {!compact && (
          <div className="text-center mb-8">
            <p className="text-brand text-xs font-bold tracking-[0.3em] uppercase mb-3">
              החבורה
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
              {title}
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">{subtitle}</p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href={WA_GROUP}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWa}
            className="group relative border-2 border-[#25D366] bg-neutral-900 p-5 hover:bg-[#25D366]/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-12 h-12 bg-[#25D366] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-black" fill="currentColor" aria-hidden="true">
                  <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.7-1.7-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.2-.5.1-.2 0-.4 0-.5-.1-.1-.6-1.5-.9-2.1-.2-.5-.4-.5-.6-.5h-.6c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.5s1 2.9 1.2 3.1c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.2-.3-.2-.6-.4z"/>
                  <path d="M21.6 12c0 5.3-4.3 9.6-9.6 9.6-1.7 0-3.3-.4-4.7-1.2L2 22l1.6-5.2c-.9-1.5-1.4-3.2-1.4-5 0-5.3 4.3-9.6 9.6-9.6 5.4 0 9.8 4.3 9.8 9.8zM12 4c-4.4 0-8 3.6-8 8 0 1.7.5 3.3 1.4 4.6l-.9 3.4 3.5-.9c1.3.8 2.9 1.3 4.5 1.3 4.4 0 8-3.6 8-8s-3.6-8.4-8.5-8.4z"/>
                </svg>
              </div>
              <div className="text-start">
                <div className="font-black text-white text-base">
                  קבוצת הוואטסאפ של החבורה
                </div>
                <div className="text-sm text-gray-400">
                  שיתופים, ג׳אמים, סרטונים. הצטרפ/י לפני שנפגשים.
                </div>
              </div>
            </div>
          </a>

          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleIg}
            className="group relative border-2 border-pink-500 bg-neutral-900 p-5 hover:bg-pink-500/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </div>
              <div className="text-start">
                <div className="font-black text-white text-base">@acroshay באינסטגרם</div>
                <div className="text-sm text-gray-400">
                  סרטוני אקרו, רגעי חבורה, מה שקורה בקורסים.
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
