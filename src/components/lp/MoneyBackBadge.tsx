"use client";

interface MoneyBackBadgeProps {
  locale: string;
  variant?: "compact" | "full";
  className?: string;
}

/**
 * Risk-reversal badge used on the LP hero, offer box, and final CTA.
 * Per spec §4.4: "סיכון אפס" / "Zero Risk" outperforms "money-back guarantee" alone.
 */
export function MoneyBackBadge({ locale, variant = "compact", className = "" }: MoneyBackBadgeProps) {
  const isHe = locale === "he";

  if (variant === "compact") {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-900 ring-1 ring-emerald-200 ${className}`}
        dir={isHe ? "rtl" : "ltr"}
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <span>{isHe ? "סיכון אפס · החזר כספי אחרי שיעור 1" : "Zero Risk · Money back after class 1"}</span>
      </div>
    );
  }

  return (
    <p
      className={`text-sm font-semibold text-emerald-900 ${className}`}
      dir={isHe ? "rtl" : "ltr"}
    >
      {isHe
        ? "לא התאהבת אחרי השיעור הראשון? החזר כספי מלא, בלי שאלות. סיכון אפס."
        : "Didn't fall in love after class 1? Full money back, no questions asked. Zero risk."}
    </p>
  );
}
