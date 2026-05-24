"use client";

/**
 * The "we saw you left your details" recognition strip.
 * Sits below the hero — frames the page as a personal follow-up,
 * not a cold pitch.
 */
export function WarmLeadStrip() {
  return (
    <section
      dir="rtl"
      className="bg-brand text-black border-y-2 border-black/20"
      aria-label="הודעה אישית"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
        <span className="inline-flex items-center justify-center bg-black text-brand px-2.5 py-1 text-[10px] font-black uppercase tracking-widest shrink-0">
          הודעה אישית
        </span>
        <p className="font-bold text-sm sm:text-base leading-snug">
          ראינו שהשארת פרטים — הכנתי לך את הדף הזה בהתאמה אישית. תקרא/י את זה,
          ואחרי 30 שניות תדע/י בדיוק אם זה בשבילך. אם כן — שלח/י לי הודעה.
        </p>
      </div>
    </section>
  );
}
