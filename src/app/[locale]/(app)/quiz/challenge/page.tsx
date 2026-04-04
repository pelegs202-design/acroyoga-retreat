"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import QuizEngine from "@/components/quiz/QuizEngine";
import type { QuizState } from "@/components/quiz/QuizEngine";
import { challengeQuestions } from "@/lib/quiz/challenge-questions";
import { calculateResult } from "@/lib/quiz/result-calculator";
import { trackQuizComplete } from "@/lib/quiz/quiz-analytics";

// ─────────────────────────────────────────────────────────────────────────────
// Landing page data — no emojis, SVG icons used instead
// ─────────────────────────────────────────────────────────────────────────────

function getNextMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + diff);
  return d.toLocaleDateString("he-IL", { day: "numeric", month: "long" });
}

const BENEFITS = [
  {
    he: { title: "תכנית מובנית ל-30 יום", desc: "כל יום מתוכנן מראש — לא צריך לחשוב, רק לעשות. מתחילים מהבסיס ומתקדמים בהדרגה." },
    en: { title: "Structured 30-Day Plan", desc: "Every day is planned — just show up and do. Start from basics and progress gradually." },
    icon: (
      <svg className="w-8 h-8 stroke-brand" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 0 0 2.25 2.25h.75" /></svg>
    ),
  },
  {
    he: { title: "קבוצה תומכת", desc: "קבוצת וואטסאפ פעילה, שאלות, תמיכה ומוטיבציה — אף אחד לא לבד." },
    en: { title: "Supportive Group", desc: "Active WhatsApp group, questions, support and motivation — no one is alone." },
    icon: (
      <svg className="w-8 h-8 stroke-brand" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
    ),
  },
  {
    he: { title: "ג׳אמים מודרכים שבועיים", desc: "2-3 מפגשים מודרכים בשבוע בתל אביב וכפר סבא. מדריך מקצועי מלווה." },
    en: { title: "Weekly Guided Jams", desc: "2-3 guided sessions per week in Tel Aviv and Kfar Saba. Professional instructor." },
    icon: (
      <svg className="w-8 h-8 stroke-brand" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
    ),
  },
  {
    he: { title: "תעודת סיום", desc: "מי שמשלים 30 יום מקבל תעודה דיגיטלית + כניסה לקבוצת הבוגרים." },
    en: { title: "Completion Certificate", desc: "Complete 30 days and get a digital certificate + alumni group access." },
    icon: (
      <svg className="w-8 h-8 stroke-brand" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.996.078-1.927.228-2.25.375v2.139A2.625 2.625 0 0 0 5.25 9.375h.006M18.75 4.236c.996.078 1.927.228 2.25.375v2.139A2.625 2.625 0 0 1 18.75 9.375h-.006" /></svg>
    ),
  },
  {
    he: { title: "מעקב התקדמות", desc: "מעקב יומי, צ׳קליסט מיומנויות ותזכורות — תראו כמה התקדמתם." },
    en: { title: "Progress Tracking", desc: "Daily tracking, skills checklist and reminders — see how far you've come." },
    icon: (
      <svg className="w-8 h-8 stroke-brand" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
    ),
  },
  {
    he: { title: "סרטוני הדרכה", desc: "ספריית וידאו עם כל התרגילים — לחזור על החומר בזמנכם, בקצב שלכם." },
    en: { title: "Tutorial Videos", desc: "Video library with all exercises — review at your own pace." },
    icon: (
      <svg className="w-8 h-8 stroke-brand" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" /></svg>
    ),
  },
];

const TESTIMONIALS = [
  { he: "הגעתי בלי שום ניסיון. אחרי שבוע אחד כבר עשיתי Bird. אחרי 30 יום — Throne בלי פחד.", en: "Came with zero experience. After one week I did Bird. After 30 days — Throne fearlessly.", name: "דניאל, 28, תל אביב" },
  { he: "הקבוצה היא מה שעשה את ההבדל. יום 1 הגעתי לבד. יום 30 יצאתי עם 15 חברים חדשים.", en: "The group made all the difference. Day 1 I came alone. Day 30 I left with 15 new friends.", name: "מאיה, 32, כפר סבא" },
  { he: "חשבתי שאני צריך להיות גמיש. ביום 1 לא הגעתי לאצבעות הרגליים. ביום 30 עפתי.", en: "Thought I needed to be flexible. Day 1 I couldn't touch my toes. Day 30 I flew.", name: "עומר, 35, תל אביב" },
  { he: "בתקופה הזו הייתי צריכה משהו שיחזיר לי שפיות. האקרו והקבוצה הצילו אותי.", en: "During these times I needed something to keep me sane. The acro and the group saved me.", name: "נועה, 29, תל אביב" },
  { he: "ב-45 חשבתי שזה לא בשבילי. טעיתי. הגוף מסתגל מהר יותר ממה שנדמה.", en: "At 45 I thought this wasn't for me. I was wrong. The body adapts faster than you think.", name: "אבי, 45, כפר סבא" },
];

const FAQ = [
  { he: { q: "אני מתחיל/ה לגמרי — זה בשבילי?", a: "בהחלט. 80% מהמשתתפים מתחילים מאפס מוחלט. התכנית בנויה בדיוק בשביל מתחילים." }, en: { q: "I'm a complete beginner — is this for me?", a: "Absolutely. 80% of participants start from zero. The program is built for beginners." } },
  { he: { q: "צריך להגיע עם פרטנר?", a: "לא. 60% מגיעים לבד. בכל מפגש מסתובבים ועובדים עם כולם." }, en: { q: "Do I need to bring a partner?", a: "No. 60% come alone. In each session you rotate and work with everyone." } },
  { he: { q: "כמה זמן כל אימון?", a: "מפגשים מודרכים: 90 דקות. תרגול יומי עצמאי: 15-20 דקות." }, en: { q: "How long is each session?", a: "Guided sessions: 90 minutes. Daily independent practice: 15-20 minutes." } },
  { he: { q: "מה אם אני מפספס/ת יום?", a: "קורה. גמישות מובנית — אפשר להשלים ימים. 96% מסיימים." }, en: { q: "What if I miss a day?", a: "It happens. Built-in flexibility — you can make up days. 96% complete." } },
  { he: { q: "זה בטוח?", a: "0 פציעות ב-527 בוגרים. ספוטרים מקצועיים בכל תרגיל. מתחילים נמוך ועולים רק כשמוכנים." }, en: { q: "Is it safe?", a: "Zero injuries in 527 graduates. Professional spotters at every exercise. Start low, go higher only when ready." } },
  { he: { q: "למה ₪1?", a: "בזמן מלחמה, אנחנו מאמינים שתנועה וקהילה חשובים יותר מתמיד. מחיר סמלי כדי שכולם יוכלו להשתתף." }, en: { q: "Why ₪1?", a: "During wartime, we believe movement and community matter more than ever. Symbolic price so everyone can participate." } },
];

// ─────────────────────────────────────────────────────────────────────────────
// Landing Page Component
// ─────────────────────────────────────────────────────────────────────────────

function ChallengeLanding({ onStart, locale }: { onStart: () => void; locale: string }) {
  const he = locale === "he";
  const nextMonday = getNextMonday();

  return (
    <div className="w-full">
      {/* ── 1. HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden border-b-2 border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-block mb-6 border-2 border-brand bg-brand/10 px-4 py-2">
                <span className="text-brand font-black text-sm uppercase tracking-widest">
                  {he ? "IL — מבצע מיוחד לזמן מלחמה" : "IL — Special Wartime Offer"}
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black leading-[0.95] mb-6">
                {he ? "30 יום." : "30 Days."} <br />
                {he ? "מאפס." : "Zero."} <br />
                <span className="text-brand">{he ? "לטיסה ראשונה." : "To First Flight."}</span>
              </h1>

              <p className="text-xl text-gray-400 max-w-lg mb-8 leading-relaxed">
                {he
                  ? "תכנית מובנית עם 2-3 ג׳אמים שבועיים, קבוצת וואטסאפ פעילה, ומדריך שמלווה אותך אישית. 527 בוגרים כבר עפו."
                  : "Structured program with 2-3 weekly jams, active WhatsApp group, and a personal instructor. 527 graduates already flew."}
              </p>

              <div className="flex items-end gap-4 mb-8">
                <span className="text-gray-500 line-through text-2xl font-bold">₪299</span>
                <span className="text-6xl font-black text-brand">₪1</span>
                <span className="text-sm text-gray-400 pb-1">{he ? "מחיר מלחמה" : "Wartime price"}</span>
              </div>

              <button
                onClick={onStart}
                className="btn-press bg-brand text-black px-12 py-5 text-xl font-black border-[3px] border-neutral-800 hover:translate-x-1 hover:translate-y-1 transition-transform shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
              >
                {he ? "גלו את הטיפוס האקרו שלכם" : "Discover Your Acro Type"}
              </button>

              <p className="mt-4 text-sm text-gray-500">
                {he ? "שאלון אישיות קצר — לא מתאים לכל אחד" : "Short personality quiz — not for everyone"}
              </p>
            </div>

            <div className="order-1 lg:order-2 flex justify-center relative">
              <div className="relative z-10 border-[3px] border-neutral-800 p-4 bg-[#0a0a0a] w-full max-w-md">
                <div className="aspect-square bg-neutral-900 flex flex-col items-center justify-center gap-4 overflow-hidden">
                  <p className="text-[120px] font-black text-brand/20 leading-none select-none">30</p>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.3em]">
                    {he ? "ימים לטיסה" : "Days to Flight"}
                  </p>
                </div>
                <div className="absolute bottom-4 start-4 bg-white text-black font-black px-2 py-1 text-[10px] tracking-widest uppercase">
                  {he ? "מהדורה 2026" : "Edition 2026"}
                </div>
              </div>
              <div className="absolute -z-10 top-8 end-8 w-full max-w-md aspect-square border-2 border-brand" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. SOCIAL PROOF BAR ──────────────────────────────────────── */}
      <section className="border-b-2 border-neutral-800 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-0 text-center">
          {[
            { value: "527", label: he ? "בוגרים" : "Graduates" },
            { value: "96%", label: he ? "שיעור סיום" : "Completion" },
            { value: "4.9", label: he ? "דירוג" : "Rating" },
            { value: nextMonday, label: he ? "קבוצה הבאה" : "Next Cohort" },
          ].map((stat, i) => (
            <div key={i} className={`py-6 md:py-0 ${i > 0 ? "border-s-2 border-neutral-800" : ""}`}>
              <div className="text-4xl md:text-5xl font-black text-brand mb-2">{stat.value}</div>
              <div className="text-sm font-bold text-white uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. DISQUALIFICATION ──────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black mb-16 text-center">
            {he ? "האתגר הזה לא לכולם" : "This Challenge Isn't for Everyone"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* IS for you */}
            <div className="border-2 border-green-800 bg-green-950/20 p-8">
              <h3 className="text-xl font-black text-green-400 mb-6 uppercase tracking-widest">
                {he ? "זה בשבילכם אם..." : "This IS for you if..."}
              </h3>
              <ul className="space-y-4">
                {(he
                  ? ["מוכנים להתחייב ל-30 יום", "פתוחים להכיר אנשים חדשים", "מוכנים להשקיע 15 דקות ביום", "גרים באזור תל אביב או כפר סבא"]
                  : ["Ready to commit for 30 days", "Open to meeting new people", "Willing to invest 15 min/day", "Live near Tel Aviv or Kfar Saba"]
                ).map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* NOT for you */}
            <div className="border-2 border-red-800 bg-red-950/20 p-8">
              <h3 className="text-xl font-black text-red-400 mb-6 uppercase tracking-widest">
                {he ? "זה לא בשבילכם אם..." : "This is NOT for you if..."}
              </h3>
              <ul className="space-y-4">
                {(he
                  ? ["מחפשים פתרון קסם בלי מאמץ", "לא יכולים להגיע 2-3 פעמים בשבוע", "מצפים להיות מקצועים אחרי חודש", "לא מוכנים לצאת מאזור הנוחות"]
                  : ["Looking for a magic fix without effort", "Can't attend 2-3 times per week", "Expect to be a pro after one month", "Not willing to leave your comfort zone"]
                ).map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. BENEFITS ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-y-2 border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center">
            {he ? "מה כולל האתגר?" : "What's Included?"}
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            {he ? "30 ימים של תכנית מובנית שלוקחת אתכם מאפס לטיסה ראשונה." : "30 days taking you from zero to first flight."}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b, i) => (
              <div key={i} className="bg-neutral-900 border-2 border-neutral-700 p-8 group hover:border-brand transition-colors">
                <div className="w-14 h-14 border-2 border-brand/40 flex items-center justify-center mb-4">
                  {b.icon}
                </div>
                <h3 className="text-xl font-black mb-3 group-hover:text-brand transition-colors">
                  {he ? b.he.title : b.en.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {he ? b.he.desc : b.en.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. SCHEDULE ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black mb-16 text-center">
            {he ? "מתי ואיפה" : "When & Where"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekdays */}
            <div className="border-2 border-neutral-700 bg-neutral-900 p-8">
              <div className="text-brand font-black text-sm uppercase tracking-widest mb-4">
                {he ? "אמצע שבוע" : "Weekdays"}
              </div>
              <h3 className="text-2xl font-black mb-2">
                {he ? "שני + רביעי · 20:00" : "Mon + Wed · 20:00"}
              </h3>
              <p className="text-gray-400 mb-4">
                {he ? "רוקח 40, צפון תל אביב" : "Rokah 40, North Tel Aviv"}
              </p>
              <p className="text-xs text-gray-500 border-t border-neutral-800 pt-3">
                {he ? "ממ״ד בקרבת מקום" : "Shelter (mamad) nearby"}
              </p>
            </div>
            {/* Weekend */}
            <div className="border-2 border-neutral-700 bg-neutral-900 p-8">
              <div className="text-brand font-black text-sm uppercase tracking-widest mb-4">
                {he ? "סוף שבוע" : "Weekend"}
              </div>
              <h3 className="text-2xl font-black mb-2">
                {he ? "שישי + שבת · 13:30" : "Fri + Sat · 13:30"}
              </h3>
              <p className="text-gray-400 mb-4">
                {he ? "חוף צ׳ארלס קלור, מול מלון עם ממ״ד" : "Charles Clore Beach, near hotel with shelter"}
              </p>
              <p className="text-xs text-gray-500 border-t border-neutral-800 pt-3">
                {he ? "ממ״ד בקרבת מקום" : "Shelter (mamad) nearby"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. TIMELINE ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t-2 border-neutral-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black mb-16 text-center">
            {he ? "המסלול שלכם" : "Your Journey"}
          </h2>
          <div className="space-y-0">
            {[
              { week: he ? "שבוע 1" : "Week 1", title: he ? "בסיס ואמון" : "Foundation & Trust", desc: he ? "עמדות בסיסיות, בניית אמון, Bird ראשון. מתחילים 10 ס״מ מהרצפה." : "Basic positions, trust building, first Bird. Starting 10cm off the ground." },
              { week: he ? "שבוע 2" : "Week 2", title: he ? "כוח ויציבות" : "Strength & Stability", desc: he ? "Throne, Shoulderstand, מעברים ראשונים. מתחילים להרגיש בטוחים למעלה." : "Throne, Shoulderstand, first transitions. Starting to feel confident up high." },
              { week: he ? "שבוע 3" : "Week 3", title: he ? "זרימה ויצירתיות" : "Flow & Creativity", desc: he ? "רצפים, מעברים חלקים, עבודה עם פרטנרים שונים. מגלים את הסגנון שלכם." : "Sequences, smooth transitions, different partners. Finding your style." },
              { week: he ? "שבוע 4" : "Week 4", title: he ? "שליטה וחגיגה" : "Mastery & Celebration", desc: he ? "שילוב הכל, ג׳אם חגיגי, תעודת סיום, כניסה לקבוצת הבוגרים." : "Putting it together, celebratory jam, certificate, alumni access." },
            ].map((step, i) => (
              <div key={i} className="flex gap-6 pb-12 relative">
                {i < 3 && <div className="absolute start-5 top-12 bottom-0 w-[2px] bg-neutral-800" />}
                <div className="shrink-0 w-10 h-10 bg-brand text-black font-black flex items-center justify-center text-sm z-10">
                  {i + 1}
                </div>
                <div>
                  <p className="text-brand text-xs font-bold uppercase tracking-widest mb-1">{step.week}</p>
                  <h3 className="text-xl font-black mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. OBJECTION HANDLING ────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#0a0a0a] border-y-2 border-neutral-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black mb-16 text-center">
            {he ? "שאלות שכולם שואלים" : "Questions Everyone Asks"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { q: he ? "אני לא גמיש/ה" : "I'm not flexible", a: he ? "80% מהמשתתפים שלנו לא יכלו לגעת באצבעות הרגליים ביום 1. ביום 30 — Bird מלא." : "80% couldn't touch their toes on day 1. By day 30 — full Bird." },
              { q: he ? "אין לי פרטנר" : "I don't have a partner", a: he ? "60% מגיעים לבד. בכל מפגש מסתובבים ועובדים עם כולם. תמצאו פרטנרים ביום 1." : "60% come alone. Everyone rotates. You'll find partners on day 1." },
              { q: he ? "אני פוחד/ת מגובה" : "I'm scared of heights", a: he ? "מתחילים 10 ס״מ מהרצפה. עולים רק כשאתם מרגישים מוכנים. 0 פציעות ב-527 בוגרים." : "Start 10cm off the ground. Go higher only when ready. 0 injuries in 527 grads." },
              { q: he ? "אין לי זמן" : "I don't have time", a: he ? "15 דקות ביום + 2-3 מפגשים של 90 דקות. אנשים עם לוח זמנים מלא מסיימים. 96% שיעור סיום." : "15 min/day + 2-3 sessions of 90 min. Busy people finish. 96% completion." },
            ].map((item, i) => (
              <div key={i} className="bg-neutral-900 border-2 border-neutral-700 p-8">
                <h3 className="text-lg font-black text-brand mb-3">{item.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. TESTIMONIALS ──────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black mb-16 text-center">
            {he ? "מה אומרים המשתתפים" : "What Participants Say"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-neutral-900 border-2 border-neutral-700 p-8">
                <div className="text-brand text-4xl font-black mb-4">&ldquo;</div>
                <p className="text-white text-lg leading-relaxed mb-6">{he ? t.he : t.en}</p>
                <p className="text-brand font-bold text-sm">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. PRICING (VALUE STACK) ─────────────────────────────────── */}
      <section className="py-24 px-6 border-y-2 border-neutral-800">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block mb-6 border-2 border-brand bg-brand/10 px-4 py-2">
            <span className="text-brand font-black text-sm uppercase tracking-widest">
              {he ? "IL — תנועה מרפאת. ביחד חזקים." : "IL — Movement Heals. Together Strong."}
            </span>
          </div>

          <h2 className="text-4xl font-black mb-8">
            {he ? "הערך שמקבלים" : "The Value You Get"}
          </h2>

          {/* Value stack */}
          <div className="text-start mb-10 space-y-3 max-w-md mx-auto">
            {(he
              ? [
                  ["תכנית 30 יום מובנית", "₪299"],
                  ["2-3 ג׳אמים מודרכים בשבוע", "₪600+"],
                  ["קבוצת וואטסאפ תומכת", "₪—"],
                  ["ספריית סרטוני הדרכה", "₪150"],
                  ["מעקב התקדמות אישי", "₪—"],
                  ["תעודת סיום + קבוצת בוגרים", "₪—"],
                ]
              : [
                  ["30-day structured program", "₪299"],
                  ["2-3 guided jams per week", "₪600+"],
                  ["Supportive WhatsApp group", "₪—"],
                  ["Tutorial video library", "₪150"],
                  ["Personal progress tracking", "₪—"],
                  ["Certificate + alumni group", "₪—"],
                ]
            ).map(([item, value], i) => (
              <div key={i} className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <span className="text-gray-300 text-sm">{item}</span>
                <span className="text-gray-500 text-sm">{value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <span className="text-white font-black">{he ? "שווי כולל" : "Total value"}</span>
              <span className="text-white font-black">₪1,200+</span>
            </div>
          </div>

          {/* Price card */}
          <div className="border-2 border-brand bg-neutral-900 p-10 inline-block shadow-[8px_8px_0px_0px_rgba(244,114,182,0.2)]">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-gray-500 line-through text-3xl">₪299</span>
              <span className="text-7xl font-black text-brand">₪1</span>
            </div>
            <p className="text-gray-400 text-sm mb-8">
              {he ? "שקל אחד. זה הכל. ערבות החזר מלא." : "One shekel. That's it. Full refund guarantee."}
            </p>
            <button
              onClick={onStart}
              className="btn-press w-full bg-brand text-black py-5 text-xl font-black uppercase tracking-widest hover:bg-white transition-colors"
            >
              {he ? "גלו את הטיפוס שלכם ב-₪1" : "Discover Your Type for ₪1"}
            </button>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            {he ? "ללא התחייבות · ביטול בכל עת · שקל חזרה אם לא מתאים" : "No commitment · Cancel anytime · ₪1 back if not a fit"}
          </p>
        </div>
      </section>

      {/* ── 9. FAQ ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#0a0a0a]/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black mb-12 text-center">
            {he ? "שאלות נפוצות" : "FAQ"}
          </h2>
          <div className="space-y-4">
            {FAQ.map((item, i) => (
              <details key={i} className="group border-2 border-white bg-neutral-900">
                <summary className="w-full p-6 flex items-center justify-between text-start cursor-pointer list-none">
                  <span className="text-xl font-bold">{he ? item.he.q : item.en.q}</span>
                  <span className="text-brand text-3xl font-black transition-transform group-open:rotate-45 shrink-0 ms-4">+</span>
                </summary>
                <div className="p-6 pt-0 text-gray-400 border-t border-white/5">
                  {he ? item.he.a : item.en.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. URGENCY BAND ─────────────────────────────────────────── */}
      <section className="bg-brand/10 border-y-2 border-brand py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-start">
            <p className="text-white font-black text-lg">
              {he ? `הקבוצה הבאה מתחילה ${nextMonday}` : `Next cohort starts ${nextMonday}`}
            </p>
            <p className="text-brand font-bold text-sm">
              {he ? "8 מקומות נותרו" : "8 spots remaining"}
            </p>
          </div>
          <button
            onClick={onStart}
            className="btn-press bg-brand text-black px-8 py-3 font-black uppercase tracking-widest hover:bg-white transition-colors"
          >
            {he ? "תפסו מקום" : "Grab Your Spot"}
          </button>
        </div>
      </section>

      {/* ── 11. FINAL CTA ────────────────────────────────────────────── */}
      <section className="bg-brand py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-7xl font-black text-black mb-4 leading-tight">
            {he ? "הגוף שלכם מחכה לעוף." : "Your body is waiting to fly."}
          </h2>
          <p className="text-black/70 text-xl mb-10">
            {he ? "השאלה היחידה — אם תיתנו לו." : "The only question is whether you'll let it."}
          </p>
          <button
            onClick={onStart}
            className="btn-press bg-black text-white px-12 py-6 text-2xl font-black hover:translate-y-1 transition-transform border-4 border-black"
          >
            {he ? "בואו נבדוק אם אתם מתאימים" : "Let's See If You Qualify"}
          </button>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quiz flow
// ─────────────────────────────────────────────────────────────────────────────

function ChallengeQuizFlow() {
  const router = useRouter();
  const locale = useLocale();

  const handleStepAnswer = (sessionId: string, questionId: string, answerId: string) => {
    fetch("/api/quiz/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, quizType: "challenge", questionId, answer: answerId, eventType: "answer" }),
    }).catch(() => {});
  };

  const handleComplete = async (state: QuizState) => {
    if (!state.contactInfo) return;
    const resultType = calculateResult(state.answers).id;
    const city = state.answers["city"] ?? "";
    trackQuizComplete("challenge", resultType);

    try {
      await fetch("/api/quiz/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: state.sessionId, quizType: "challenge",
          name: state.contactInfo.name, email: state.contactInfo.email, phone: state.contactInfo.phone,
          answers: JSON.stringify(state.answers), resultType, city,
        }),
      });
    } catch {}

    try { localStorage.removeItem("quiz_challenge_state"); } catch {}
    router.push(`/quiz/challenge/results?session=${state.sessionId}`);
  };

  return (
    <QuizEngine
      questions={challengeQuestions}
      quizType="challenge"
      onComplete={handleComplete}
      storageKey="quiz_challenge_state"
      locale={locale}
      onStepAnswer={handleStepAnswer}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page wrapper
// ─────────────────────────────────────────────────────────────────────────────

export default function ChallengeQuizPage() {
  const [started, setStarted] = useState(false);
  const locale = useLocale();

  if (started) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-16">
        <ChallengeQuizFlow />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <ChallengeLanding onStart={() => setStarted(true)} locale={locale} />
    </main>
  );
}
