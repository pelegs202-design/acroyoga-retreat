"use client";

import { useState } from "react";
import { ResultArchetype } from "@/lib/quiz/result-calculator";
import QuizRadarChart from "./QuizRadarChart";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { MagneticWrapper } from "@/components/effects/MagneticWrapper";

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    he: "הגעתי בלי שום ניסיון, חשבתי שלא אצליח. אחרי השיעור הראשון עם שי הבנתי שזה בדיוק בשבילי. היום אני יכולה לעוף.",
    en: "I came with zero experience, thought I'd never manage. After my first class with Shai I knew this was for me. Today I can fly.",
    author: { he: "מיטל, תל אביב", en: "Mital, Tel Aviv" },
    emoji: "✈️",
  },
  {
    he: "חיפשתי ספורט שהוא גם חברתי. מצאתי קהילה שלמה. שי יצר מרחב שבו כולם מרגישים שייכים.",
    en: "I was looking for a sport that's also social. Found a whole community. Shai created a space where everyone feels they belong.",
    author: { he: "דניאל, כפר סבא", en: "Daniel, Kfar Saba" },
    emoji: "🤝",
  },
  {
    he: "תוך חודש ראיתי שינוי בכוח וביציבה שלי. לא ידעתי שיש ספורט כזה — מאתגר, כייפי, וחברתי.",
    en: "Within a month I saw changes in my strength and posture. Didn't know a sport like this existed — challenging, fun, and social.",
    author: { he: "אלה, תל אביב", en: "Ella, Tel Aviv" },
    emoji: "💪",
  },
  {
    he: "תרגלתי יוגה שנים, אבל אקרויוגה פתח לי עולם חדש של אמון ושיתוף פעולה. שי מלמד בסבלנות ובדיוק.",
    en: "I practiced yoga for years, but acroyoga opened a new world of trust and collaboration. Shai teaches with patience and precision.",
    author: { he: "יואב, תל אביב", en: "Yoav, Tel Aviv" },
    emoji: "🧘",
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuizResultsPageProps {
  result: ResultArchetype;
  personalizedFears: Array<{ en: string; he: string }>;
  leadName: string;
  locale: string;
  sessionId: string;
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────

const FAQ_EN = [
  { q: "Do I need experience?", a: "Not at all! 80% of our students start as complete beginners. Our classes are designed to welcome everyone." },
  { q: "Do I need to bring a partner?", a: "No partner needed! We pair everyone up in class. Many students come alone and meet their regular practice partners here." },
  { q: "What should I wear?", a: "Comfortable athletic clothes that you can move in. Avoid zippers and buttons that could scratch your partner." },
  { q: "How fit do I need to be?", a: "Any fitness level works. AcroYoga builds strength and flexibility progressively — you'll surprise yourself by week 2." },
  { q: "What if I'm afraid of heights?", a: "We start low to the ground and build up gradually. You'll always feel safe and supported by your base and spotter." },
];

const FAQ_HE = [
  { q: "צריך ניסיון?", a: "בכלל לא! 80% מהתלמידים שלנו מתחילים כמתחילים מוחלטים. השיעורים מתוכננים לקבל את כולם." },
  { q: "צריך להגיע עם פרטנר?", a: "לא צריך! אנחנו מזווגים את כולם בשיעור. הרבה תלמידים מגיעים לבד ומוצאים פרטנרים קבועים כאן." },
  { q: "מה ללבוש?", a: "בגדי ספורט נוחים שאפשר לזוז בהם. הימנעו מרוכסנים וכפתורים שעלולים לשרוט את הפרטנר." },
  { q: "כמה צריך להיות בכושר?", a: "כל רמת כושר מתאימה. אקרויוגה בונה כוח וגמישות בהדרגה — תפתיעו את עצמכם כבר בשבוע השני." },
  { q: "מה אם אני פוחד מגובה?", a: "מתחילים נמוך ומתקדמים בהדרגה. תמיד תרגישו בטוחים ונתמכים על ידי הבייס והספוטר." },
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
}: QuizResultsPageProps) {
  const [copied, setCopied] = useState(false);

  const isHe = locale === "he";

  // Calculate next Monday for cohort start date
  const nextMondayDate = (() => {
    const d = new Date();
    const day = d.getDay();
    const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7 || 7;
    d.setDate(d.getDate() + daysUntilMonday);
    return d;
  })();

  const formattedStartDate = isHe
    ? nextMondayDate.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })
    : nextMondayDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const name = isHe ? result.name.he : result.name.en;
  const tagline = isHe ? result.tagline.he : result.tagline.en;
  const description = isHe ? result.description.he : result.description.en;

  const allFears = [...result.fears, ...personalizedFears];

  function handleShare() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {});
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-10 pb-20 px-4">
      {/* 1. Archetype Header */}
      <ScrollReveal>
        <section className="text-center pt-8">
          <p className="text-neutral-400 text-sm mb-1">
            {leadName ? `${leadName}, ` : ""}
            {isHe ? "אתם" : "You are"}
          </p>
          <h1 className="text-4xl font-black text-brand mb-2">{name}</h1>
          {/* Pink accent bar */}
          <div className="mx-auto mb-4 h-1 w-16 bg-brand" />
          <p className="text-neutral-300 italic text-base mb-4">{tagline}</p>
          <p className="text-neutral-400 text-sm leading-relaxed">{description}</p>
        </section>
      </ScrollReveal>

      {/* 2. Radar Chart */}
      <ScrollReveal delay={0.05}>
        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-xl font-black text-white mb-2 text-center">
            {isHe ? "איפה אתם → איפה אתם יכולים להיות" : "Where You Are → Where You Could Be"}
          </h2>
          <div className="mx-auto mb-4 h-1 w-12 bg-brand" />
          <QuizRadarChart radarData={result.radarData} locale={locale} />
        </section>
      </ScrollReveal>

      {/* 3. Strengths */}
      <ScrollReveal delay={0.1}>
        <section>
          <h2 className="text-3xl font-black text-white mb-2">
            {isHe ? "החוזקות שלכם" : "Your Strengths"}
          </h2>
          {/* Pink accent bar */}
          <div className="mb-4 h-1 w-16 bg-brand" />
          <ul className="flex flex-col gap-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-center gap-2 text-green-400 font-medium">
                <span className="text-green-400">✓</span>
                <span>{isHe ? s.he : s.en}</span>
              </li>
            ))}
          </ul>
        </section>
      </ScrollReveal>

      {/* 4. Fear Addressing */}
      {allFears.length > 0 && (
        <ScrollReveal delay={0.1}>
          <section>
            <h2 className="text-3xl font-black text-white mb-2">
              {isHe ? "אנחנו כאן בשבילכם" : "We've Got You"}
            </h2>
            {/* Pink accent bar */}
            <div className="mb-4 h-1 w-16 bg-brand" />
            <div className="flex flex-col gap-3">
              {allFears.map((fear, i) => (
                <div
                  key={i}
                  className="card-hover flex items-start gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3"
                >
                  <span className="text-lg mt-0.5">✅</span>
                  <p className="text-neutral-300 text-sm leading-relaxed">
                    {isHe ? fear.he : fear.en}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* 5. Testimonials */}
      <ScrollReveal delay={0.1}>
        <section>
          <h2 className="text-3xl font-black text-white mb-2">
            {isHe ? "מה התלמידים שלנו אומרים" : "What Our Students Say"}
          </h2>
          {/* Pink accent bar */}
          <div className="mb-4 h-1 w-16 bg-brand" />
          <div className="flex flex-col gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="card-hover rounded-xl border border-neutral-800 bg-neutral-900 p-4"
              >
                <p className="text-neutral-300 text-sm leading-relaxed mb-3">
                  &ldquo;{isHe ? t.he : t.en}&rdquo;
                </p>
                <p className="text-neutral-500 text-xs font-medium">
                  {t.emoji} {isHe ? t.author.he : t.author.en}
                </p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* 6. Price CTA */}
      <ScrollReveal delay={0.1}>
        <section className="card-hover rounded-2xl border border-brand/30 bg-neutral-900 p-6 text-center">
          <h2 className="text-3xl font-black text-white mb-1">
            {isHe ? "הצטרפו לאתגר 30 יום" : "Join the 30-Day Challenge"}
          </h2>
          {/* Pink accent bar */}
          <div className="mx-auto mb-4 h-1 w-16 bg-brand" />
          <p className="text-neutral-500 text-xs mb-5">
            {isHe ? "מחיר Early Bird" : "Early Bird Price"}
          </p>

          {/* Price */}
          <div className="flex items-baseline justify-center gap-4 mb-2">
            <span className="text-5xl font-black text-brand">299</span>
            <span className="text-2xl font-bold text-brand">₪</span>
            <span className="text-xl text-neutral-600 line-through">499 ₪</span>
          </div>
          <p className="text-neutral-500 text-xs mb-5">
            {isHe ? "מחיר רגיל: 499 ₪" : "Regular price: 499 ₪"}
          </p>

          {/* Urgency */}
          <p className="text-amber-400 text-sm font-semibold mb-1">
            {isHe ? "נותרו רק 4 מקומות בקבוצה הבאה" : "Only 4 spots left in the next group"}
          </p>
          <p className="text-neutral-500 text-xs mb-6">
            {isHe ? `הקבוצה הבאה מתחילה ב-${formattedStartDate}` : `Next group starts ${formattedStartDate}`}
          </p>

          {/* CTA Button — MagneticWrapper on desktop, btn-press on all */}
          <MagneticWrapper>
            <button
              type="button"
              onClick={() => {
                window.location.href = `/${locale}/quiz/challenge/checkout?session=${sessionId}`;
              }}
              className="btn-press block w-full rounded-xl bg-brand text-white text-center py-4 text-base font-black hover:opacity-90 transition-opacity"
            >
              {isHe ? "אני רוצה להצטרף עכשיו" : "I Want to Join Now"}
            </button>
          </MagneticWrapper>
        </section>
      </ScrollReveal>

      {/* 7. FAQ */}
      <ScrollReveal delay={0.1}>
        <FaqAccordion locale={locale} />
      </ScrollReveal>

      {/* 8. Share Button */}
      <ScrollReveal delay={0.1}>
        <div className="flex flex-col items-center gap-2 pb-4">
          <button
            type="button"
            onClick={handleShare}
            className="btn-press rounded-xl border border-neutral-700 bg-neutral-900 px-6 py-3 text-sm text-neutral-300 hover:border-brand hover:text-white transition-colors"
          >
            {copied
              ? isHe
                ? "הועתק! ✓"
                : "Copied! ✓"
              : isHe
              ? "שתפו את התוצאות שלכם"
              : "Share Your Results"}
          </button>
        </div>
      </ScrollReveal>
    </div>
  );
}
