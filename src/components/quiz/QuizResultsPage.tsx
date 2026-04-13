"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ResultArchetype } from "@/lib/quiz/result-calculator";
import QuizRadarChart from "./QuizRadarChart";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { MagneticWrapper } from "@/components/effects/MagneticWrapper";
import { ShareButton } from "@/components/social/ShareButton";
import { trackResultsView, trackSoftDQ, trackCTAClick, trackCompleteRegistration, trackTimeOnPage, SOFT_DQ_THRESHOLD } from "@/lib/quiz/quiz-analytics";
import { nextMonday } from "@/lib/date-utils";

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    he: "הגעתי בלי שום ניסיון, חשבתי שלא אצליח. אחרי השיעור הראשון עם שי הבנתי שזה בדיוק בשבילי. היום אני יכולה לעוף.",
    en: "I came with zero experience, thought I'd never manage. After my first class with Shai I knew this was for me. Today I can fly.",
    author: { he: "מיטל, תל אביב", en: "Mital, Tel Aviv" },
  },
  {
    he: "חיפשתי ספורט שהוא גם חברתי. מצאתי קהילה שלמה. שי יצר מרחב שבו כולם מרגישים שייכים.",
    en: "I was looking for a sport that's also social. Found a whole community. Shai created a space where everyone feels they belong.",
    author: { he: "דניאל, כפר סבא", en: "Daniel, Kfar Saba" },
  },
  {
    he: "תוך חודש ראיתי שינוי בכוח וביציבה שלי. לא ידעתי שיש ספורט כזה — מאתגר, כייפי, וחברתי.",
    en: "Within a month I saw changes in my strength and posture. Didn't know a sport like this existed — challenging, fun, and social.",
    author: { he: "אלה, תל אביב", en: "Ella, Tel Aviv" },
  },
  {
    he: "תרגלתי יוגה שנים, אבל אקרויוגה פתח לי עולם חדש של אמון ושיתוף פעולה. שי מלמד בסבלנות ובדיוק.",
    en: "I practiced yoga for years, but acroyoga opened a new world of trust and collaboration. Shai teaches with patience and precision.",
    author: { he: "יואב, תל אביב", en: "Yoav, Tel Aviv" },
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuizResultsPageProps {
  result: ResultArchetype;
  personalizedFears: Array<{ en: string; he: string }>;
  leadName: string;
  locale: string;
  sessionId: string;
  fitScore?: number;
  isSharedView?: boolean;
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────

const FAQ_EN = [
  { q: "Do I need experience?", a: "Not at all! 80% of our students start as complete beginners. Our classes are designed to welcome everyone." },
  { q: "Do I need to bring a partner?", a: "No partner needed! We pair everyone up in class. Many students come alone and meet their regular practice partners here." },
  { q: "What should I wear?", a: "Comfortable athletic clothes that you can move in. Avoid zippers and buttons that could scratch your partner." },
  { q: "What if I miss a day?", a: "It happens. Built-in flexibility — you can make up days. 96% complete the challenge." },
  { q: "How long is each session?", a: "Guided sessions: 90 minutes. Daily independent practice: 15-20 minutes." },
];

const FAQ_HE = [
  { q: "צריך ניסיון?", a: "בכלל לא! 80% מהתלמידים שלנו מתחילים כמתחילים מוחלטים. השיעורים מתוכננים לקבל את כולם." },
  { q: "צריך להגיע עם פרטנר?", a: "לא צריך! אנחנו מזווגים את כולם בשיעור. הרבה תלמידים מגיעים לבד ומוצאים פרטנרים קבועים כאן." },
  { q: "מה ללבוש?", a: "בגדי ספורט נוחים שאפשר לזוז בהם. הימנעו מרוכסנים וכפתורים שעלולים לשרוט את הפרטנר." },
  { q: "מה אם אני מפספס/ת יום?", a: "קורה. גמישות מובנית — אפשר להשלים ימים. 96% מסיימים את האתגר." },
  { q: "כמה זמן כל אימון?", a: "מפגשים מודרכים: 90 דקות. תרגול יומי עצמאי: 15-20 דקות." },
];

function FaqAccordion({ locale }: { locale: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = locale === "he" ? FAQ_HE : FAQ_EN;
  const title = locale === "he" ? "שאלות נפוצות" : "Frequently Asked Questions";

  return (
    <section className="w-full">
      <h2 className="text-3xl font-black text-white mb-2">{title}</h2>
      {/* Pink accent bar */}
      <div className="mb-4 h-1 w-16 bg-brand" />
      <div className="flex flex-col gap-0">
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="border-s-4 border-brand bg-neutral-950 open:bg-neutral-900 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-neutral-900 transition-colors"
                aria-expanded={isOpen}
              >
                <span className={`font-bold text-base ${isOpen ? "text-brand" : "text-white"} transition-colors`}>
                  {item.q}
                </span>
                <span className="text-brand ms-3 text-lg leading-none">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {/* CSS grid-rows accordion — no height animation (layout trigger).
                  grid-template-rows: 0fr/1fr collapses/expands overflow:hidden inner div.
                  opacity via transform-safe scale is not needed — grid handles clipping. */}
              <div
                style={{
                  display: "grid",
                  gridTemplateRows: isOpen ? "1fr" : "0fr",
                  transition: "grid-template-rows 0.25s ease-in-out, opacity 0.25s ease-in-out",
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <div className="overflow-hidden">
                  <p className="px-4 pb-4 text-neutral-400 text-sm leading-relaxed border-t border-neutral-800 pt-2">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function QuizResultsPage({
  result,
  personalizedFears,
  leadName,
  locale,
  sessionId,
  fitScore = 100,
  isSharedView = false,
}: QuizResultsPageProps) {
  const mountTime = useRef(Date.now());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayConfirmed, setDayConfirmed] = useState(false);

  const isHe = locale === "he";

  // Track results view + soft DQ + time on page
  useEffect(() => {
    trackResultsView(result.id, fitScore);
    if (fitScore < SOFT_DQ_THRESHOLD) trackSoftDQ("low_fit_score", fitScore);

    const handleUnload = () => {
      trackTimeOnPage("results", Math.round((Date.now() - mountTime.current) / 1000));
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [result.id, fitScore]);

  const nextMondayDate = nextMonday();
  const formattedStartDate = isHe
    ? nextMondayDate.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })
    : nextMondayDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const name = isHe ? result.name.he : result.name.en;
  const tagline = isHe ? result.tagline.he : result.tagline.en;
  const description = isHe ? result.description.he : result.description.en;

  const allFears = [...result.fears, ...personalizedFears];


  const resultsUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = isHe
    ? `אני ${name}! גלו את הטיפוס האקרו שלכם`
    : `I'm ${name}! Discover your acro type`;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-12 pb-20 px-4">
      {/* Shared view: recipient CTA at top — only if URL was explicitly shared (has no sessionStorage marker) */}
      {isSharedView && typeof window !== "undefined" && !sessionStorage.getItem(`quiz_completed_${sessionId}`) && (
        <div className="bg-brand/10 border-2 border-brand p-6 text-center mt-8">
          <p className="text-brand font-black text-lg mb-3">
            {isHe ? "רוצה לגלות את הטיפוס שלך?" : "Want to discover your type?"}
          </p>
          <Link
            href={`/${locale}/quiz/challenge`}
            className="btn-press inline-block bg-brand text-black px-8 py-3 font-black hover:bg-white transition-colors"
          >
            {isHe ? "התחילו את השאלון" : "Take the Quiz"}
          </Link>
        </div>
      )}

      {/* 1. Archetype Header — large brutalist frame */}
      <ScrollReveal>
        <section className="text-center pt-8">
          <p className="text-neutral-500 text-sm mb-2 uppercase tracking-widest">
            {leadName ? `${leadName}, ` : ""}
            {isHe ? "אתם" : "You are"}
          </p>
          <div className="inline-block border-2 border-brand p-6 shadow-[8px_8px_0px_0px_rgba(244,114,182,0.15)] mb-6">
            <h1 className="text-5xl md:text-7xl font-black text-brand leading-none">{name}</h1>
          </div>
          <div className="mx-auto mb-4 h-1 w-20 bg-brand" />
          <p className="text-neutral-300 italic text-lg mb-4">{tagline}</p>
          <p className="text-neutral-400 text-base leading-relaxed max-w-lg mx-auto">{description}</p>
        </section>
      </ScrollReveal>

      {/* 2. Radar Chart — brutalist border */}
      <ScrollReveal delay={0.05}>
        <section className="border-2 border-neutral-700 bg-neutral-900 p-6">
          <h2 className="text-xl font-black text-white mb-2 text-center">
            {isHe ? "איפה אתם → איפה אתם יכולים להיות" : "Where You Are → Where You Could Be"}
          </h2>
          <div className="mx-auto mb-4 h-1 w-12 bg-brand" />
          <QuizRadarChart radarData={result.radarData} locale={locale} />
        </section>
      </ScrollReveal>

      {/* 3. Strengths — bordered cards with SVG checks */}
      <ScrollReveal delay={0.1}>
        <section>
          <h2 className="text-3xl font-black text-white mb-2">
            {isHe ? "החוזקות שלכם" : "Your Strengths"}
          </h2>
          <div className="mb-6 h-1 w-16 bg-brand" />
          <div className="flex flex-col gap-3">
            {result.strengths.map((s, i) => (
              <div key={i} className="flex items-center gap-3 border-2 border-neutral-700 bg-neutral-900 px-5 py-4">
                <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                <span className="text-white font-bold">{isHe ? s.he : s.en}</span>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* 4. Fear Addressing — each fear as a bold card */}
      {allFears.length > 0 && (
        <ScrollReveal delay={0.1}>
          <section>
            <h2 className="text-3xl font-black text-white mb-2">
              {isHe ? "אנחנו כאן בשבילכם" : "We've Got You"}
            </h2>
            <div className="mb-6 h-1 w-16 bg-brand" />
            <div className="flex flex-col gap-4">
              {allFears.map((fear, i) => (
                <div key={i} className="border-2 border-neutral-700 bg-neutral-900 p-6 hover:border-brand transition-colors">
                  <span className="text-brand font-black text-xl">+</span>
                  <p className="text-white text-base leading-relaxed mt-2">
                    {isHe ? fear.he : fear.en}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* 5. Testimonials — brutalist cards with pink quote */}
      <ScrollReveal delay={0.1}>
        <section>
          <h2 className="text-3xl font-black text-white mb-2">
            {isHe ? "מה התלמידים שלנו אומרים" : "What Our Students Say"}
          </h2>
          <div className="mb-6 h-1 w-16 bg-brand" />
          <div className="flex flex-col gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="border-2 border-neutral-700 bg-neutral-900 p-6">
                <div className="text-brand text-3xl font-black mb-3">&ldquo;</div>
                <p className="text-white text-base leading-relaxed mb-4">
                  {isHe ? t.he : t.en}
                </p>
                <p className="text-brand text-sm font-bold">
                  {isHe ? t.author.he : t.author.en}
                </p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* 6. Book Free Trial or Soft Disqualification */}
      <ScrollReveal delay={0.1}>
        {fitScore < SOFT_DQ_THRESHOLD ? (
          <section className="border-2 border-neutral-700 bg-neutral-900 p-8 text-center">
            <h2 className="text-2xl font-black text-white mb-2">
              {isHe ? "האתגר אולי לא מתאים כרגע" : "The Challenge May Not Be Right for Now"}
            </h2>
            <div className="mx-auto mb-4 h-1 w-16 bg-neutral-700" />
            <p className="text-neutral-400 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              {isHe
                ? "האתגר דורש 2-3 מפגשים בשבוע באזור תל אביב או כפר סבא למשך 30 יום. אפשר להתחיל עם ג׳אם פתוח."
                : "The challenge requires 2-3 sessions per week in Tel Aviv or Kfar Saba for 30 days. Try a drop-in jam first."}
            </p>
            <a href={`/${locale}/jams`} className="btn-press inline-block bg-neutral-700 text-white px-8 py-3 font-black hover:bg-neutral-600 transition-colors">
              {isHe ? "ג׳אמים פתוחים" : "Open Jams"}
            </a>
          </section>
        ) : dayConfirmed ? (
          /* ── Confirmed state ── */
          <section className="bg-brand py-16 -mx-4 px-4">
            <div className="max-w-lg mx-auto text-center">
              <div className="inline-block border-2 border-black p-4 mb-4">
                <svg className="w-16 h-16 text-black mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              </div>
              <h2 className="text-3xl font-black text-black mb-2">
                {isHe ? "נתראה בשיעור!" : "See You in Class!"}
              </h2>
              <p className="text-black/70 text-sm mb-4">
                {isHe
                  ? "המקום שלכם שמור. הקבוצה הבאה מתחילה "
                  : "Your spot is saved. Next cohort starts "}
                {formattedStartDate}
              </p>
              <p className="text-black/60 text-xs">
                {isHe ? "בלי התחייבות · רק להגיע ולנסות" : "No commitment · Just come and try"}
              </p>
            </div>
          </section>
        ) : (
          /* ── Day picker ── */
          <section className="bg-brand py-16 -mx-4 px-4">
            <div className="max-w-lg mx-auto text-center">
              <h2 className="text-4xl font-black text-black mb-2">
                {isHe ? "בחרו את השיעור הראשון" : "Pick Your Trial Class"}
              </h2>
              <p className="text-black/60 text-sm mb-6">
                {isHe ? "שיעור ניסיון במתנה · בלי התחייבות · מתחילים " : "Free trial class · No commitment · Starting "}
                {formattedStartDate}
              </p>

              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-6">
                {([
                  { id: "mon", he: "שני 20:00", en: "Mon 20:00", loc: isHe ? "רוקח 40, ת״א" : "Rokah 40, TLV" },
                  { id: "wed", he: "רביעי 20:00", en: "Wed 20:00", loc: isHe ? "רוקח 40, ת״א" : "Rokah 40, TLV" },
                  { id: "fri", he: "שישי 13:30", en: "Fri 13:30", loc: isHe ? "חוף צ׳ארלס קלור" : "Charles Clore Beach" },
                  { id: "sat", he: "שבת 13:30", en: "Sat 13:30", loc: isHe ? "חוף צ׳ארלס קלור" : "Charles Clore Beach" },
                ] as const).map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => {
                      setSelectedDay(day.id);
                      trackCTAClick("results_day_pick");
                    }}
                    className={`p-4 border-2 text-start transition-all ${
                      selectedDay === day.id
                        ? "border-black bg-black/10 scale-[1.02]"
                        : "border-black/30 bg-white/10 hover:border-black/60"
                    }`}
                  >
                    <p className="font-black text-black text-sm">{isHe ? day.he : day.en}</p>
                    <p className="text-black/60 text-xs mt-1">{day.loc}</p>
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={!selectedDay}
                onClick={async () => {
                  if (!selectedDay) return;
                  trackCompleteRegistration(sessionId, selectedDay);
                  trackTimeOnPage("results", Math.round((Date.now() - mountTime.current) / 1000));
                  try {
                    await fetch("/api/challenge/first-class", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ sessionId, day: selectedDay }),
                    });
                  } catch {}
                  setDayConfirmed(true);
                }}
                className={`btn-press w-full max-w-md px-8 py-6 text-2xl font-black border-4 border-black transition-all ${
                  selectedDay
                    ? "bg-black text-white hover:translate-y-1 animate-pulse"
                    : "bg-black/30 text-black/40 cursor-not-allowed"
                }`}
                style={selectedDay ? { animationDuration: "2s" } : undefined}
              >
                {isHe ? "שריינו לי מקום!" : "Reserve My Spot!"}
              </button>

              <p className="text-black/50 text-xs mt-4">
                {isHe ? "במתנה · בלי התחייבות · ביטול בכל עת" : "On us · No commitment · Cancel anytime"}
              </p>
            </div>
          </section>
        )}
      </ScrollReveal>

      {/* 7. FAQ */}
      <ScrollReveal delay={0.1}>
        <FaqAccordion locale={locale} />
      </ScrollReveal>

      {/* 8. Share — using existing ShareButton + ShareBottomSheet */}
      <ShareButton url={resultsUrl} title={shareTitle} />
    </div>
  );
}
