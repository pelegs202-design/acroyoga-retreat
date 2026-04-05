"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { trackPurchase } from "@/lib/quiz/quiz-analytics";
import { nextMonday as getNextMonday } from "@/lib/date-utils";
import { ShareButton } from "@/components/social/ShareButton";

// Dynamic import for add-to-calendar (no SSR — uses browser APIs)
const AddToCalendarButton = dynamic(
  () => import("add-to-calendar-button-react").then((m) => m.AddToCalendarButton),
  { ssr: false }
);

// Google Maps links for training locations
const MAPS = {
  rokah: "https://maps.google.com/?q=Rokach+40+Tel+Aviv",
  clore: "https://maps.google.com/?q=Charles+Clore+Beach+Tel+Aviv",
};

interface SuccessContentProps {
  sessionId: string;
  locale: string;
}

export default function SuccessContent({ sessionId: _sessionId, locale }: SuccessContentProps) {
  const isHe = locale === "he";

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayConfirmed, setDayConfirmed] = useState(false);
  const [archetypeName, setArchetypeName] = useState("");
  const [enrollmentCount, setEnrollmentCount] = useState(0);

  useEffect(() => {
    trackPurchase(_sessionId);

    // Fetch archetype for personalization
    fetch(`/api/quiz/results/${_sessionId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.result?.name) {
          setArchetypeName(locale === "he" ? data.result.name.he : data.result.name.en);
        }
      })
      .catch(() => {});

    // Fetch enrollment count for social proof
    fetch("/api/challenge/count")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.count) setEnrollmentCount(data.count);
      })
      .catch(() => {});
  }, [_sessionId, locale]);

  const nextMondayDate = getNextMonday();

  // Countdown to first class
  const now = new Date();
  const diffMs = nextMondayDate.getTime() - now.getTime();
  const daysUntil = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  async function handleDaySelect(day: string) {
    setSelectedDay(day);
    setDayConfirmed(false);
    try {
      const res = await fetch("/api/challenge/first-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: _sessionId, day }),
      });
      if (res.ok) setDayConfirmed(true);
    } catch {
      // silent — selection is still shown
    }
  }

  const startDateFormatted = isHe
    ? nextMondayDate.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : nextMondayDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  // Format for add-to-calendar (YYYY-MM-DD)
  const calendarDate = nextMondayDate.toISOString().split("T")[0];

  // Onboarding info items with map links
  const onboardingItems = isHe
    ? [
        { title: "מתי מתאמנים", text: `שני 20:00 + רביעי 20:00`, link: { href: MAPS.rokah, label: "רוקח 40, צפון תל אביב" }, extra: `שישי 13:30 + שבת 13:30`, link2: { href: MAPS.clore, label: "חוף צ׳ארלס קלור" } },
        { title: "מה ללבוש", text: "בגדי ספורט נוחים, ללא רוכסנים וכפתורים. כדאי להביא גרביים." },
        { title: "מה להביא", text: "מזרן יוגה, בקבוק מים, מגבת קטנה." },
        { title: "ממ״ד", text: "בכל המיקומים יש ממ״ד בקרבת מקום." },
      ]
    : [
        { title: "When We Train", text: `Mon 20:00 + Wed 20:00`, link: { href: MAPS.rokah, label: "Rokah 40, North Tel Aviv" }, extra: `Fri 13:30 + Sat 13:30`, link2: { href: MAPS.clore, label: "Charles Clore Beach" } },
        { title: "What to Wear", text: "Comfortable athletic clothes, no zippers or buttons. Bring socks." },
        { title: "What to Bring", text: "Yoga mat, water bottle, small towel." },
        { title: "Shelter", text: "All locations have a shelter (mamad) nearby." },
      ];

  // Fear-addressing reassurances — based on actual quiz fears data
  const reassurances = isHe
    ? [
        { q: "אם אין לי ניסיון?", a: "80% מהתלמידים שלנו מתחילים מאפס. השיעור הראשון מותאם למתחילים לגמרי." },
        { q: "אם אני לא מספיק טוב/ה?", a: "אין דבר כזה. כולם מתחילים מאותו מקום. שי מתאים לכם תרגילים ברמה שלכם." },
        { q: "אם יהיה מביך עם אנשים זרים?", a: "הקבוצה מאוד מקבלת. כולם חדשים ביום הראשון. תרגישו בבית תוך 5 דקות." },
        { q: "אם אני לא גמיש/ה?", a: "אקרויוגה לא דורשת גמישות. היא בונה אותה. לא צריך לגעת באצבעות הרגליים." },
        { q: "אם נפגע?", a: "בטיחות זה הדבר הראשון שלומדים. שי מודרך מקצועית, וכל תרגיל מתורגל קודם על הרצפה." },
        { q: "צריך פרטנר?", a: "לא! אנחנו מזווגים את כולם בשיעור. תתרגלו עם אנשים שונים בכל פעם." },
        { q: "אם לא אתמיד?", a: "הקבוצה והמבנה של האתגר שומרים עליכם. תזכורות, תמיכה, ושי עוקב אחרי כל אחד." },
        { q: "כל רמת כושר מתאימה?", a: "כן. יש לנו תלמידים מגיל 18 עד 40, ומכל רמת כושר. אנחנו מתקדמים בהדרגה." },
      ]
    : [
        { q: "What if I have no experience?", a: "80% of our students start from zero. The first class is fully adapted for beginners." },
        { q: "What if I'm not good enough?", a: "There's no such thing. Everyone starts at the same place. Shai adapts exercises to your level." },
        { q: "What if it's awkward with strangers?", a: "The group is very welcoming. Everyone is new on day one. You'll feel at home within 5 minutes." },
        { q: "What if I'm not flexible?", a: "Acroyoga doesn't require flexibility. It builds it. You don't need to touch your toes." },
        { q: "What if I get hurt?", a: "Safety is the first thing we teach. Shai is professionally trained, and every move is practiced on the ground first." },
        { q: "Do I need a partner?", a: "No! We pair everyone up in class. You'll practice with different people each time." },
        { q: "What if I can't stick with it?", a: "The group and challenge structure keep you on track. Reminders, support, and Shai follows up with everyone." },
        { q: "Does any fitness level work?", a: "Yes. We have students aged 18-40, from all fitness levels. We progress gradually." },
      ];

  // Track completed activation steps
  const [stepsCompleted, setStepsCompleted] = useState({
    day: false,
    calendar: false,
    instagram: false,
  });

  const completedCount = Object.values(stepsCompleted).filter(Boolean).length;
  const totalSteps = 3;

  // Mark day as completed when selected
  useEffect(() => {
    if (dayConfirmed) setStepsCompleted((s) => ({ ...s, day: true }));
  }, [dayConfirmed]);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-6 pb-20 px-4 pt-8">
      {/* 1. Header — personalized with archetype */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-black text-brand mb-1">
          {archetypeName
            ? (isHe ? `${archetypeName}, ברוכים הבאים!` : `Welcome, ${archetypeName}!`)
            : (isHe ? "התשלום התקבל!" : "Payment Received!")}
        </h1>

        {/* Countdown */}
        {daysUntil > 0 && (
          <div className="flex items-center justify-center gap-2 my-3">
            <div className="border-2 border-brand px-4 py-2 text-center">
              <span className="text-3xl font-black text-brand">{daysUntil}</span>
              <p className="text-neutral-400 text-xs">{isHe ? "ימים" : "days"}</p>
            </div>
            <p className="text-neutral-300 text-sm font-bold">
              {isHe ? "עד השיעור הראשון" : "until first class"}
            </p>
          </div>
        )}

        {/* Social proof */}
        {enrollmentCount > 1 && (
          <p className="text-neutral-500 text-xs mb-3">
            {isHe
              ? `${enrollmentCount} אנשים כבר נרשמו לקבוצה הזו`
              : `${enrollmentCount} people already signed up for this cohort`}
          </p>
        )}

        {completedCount < totalSteps && (
          <div className="border-2 border-yellow-500/60 bg-yellow-500/10 px-4 py-3 mb-4">
            <p className="text-yellow-400 text-sm font-bold">
              {isHe
                ? "ההרשמה שלכם לא תאושר עד שתשלימו את כל השלבים למטה."
                : "Your booking is NOT confirmed until you complete all steps below."}
            </p>
          </div>
        )}

        {/* Progress bar */}
        <div className="flex items-center gap-3 justify-center mb-1">
          <div className="h-3 flex-1 max-w-52 bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-500"
              style={{ width: `${(completedCount / totalSteps) * 100}%` }}
            />
          </div>
          <span className="text-brand font-black text-sm">{completedCount}/{totalSteps}</span>
        </div>
        <p className="text-neutral-500 text-xs">
          {completedCount === totalSteps
            ? (isHe ? "מקומכם אושר!" : "Your spot is confirmed!")
            : (isHe ? `נותרו ${totalSteps - completedCount} שלבים לאישור` : `${totalSteps - completedCount} steps remaining`)}
        </p>
      </motion.section>

      {/* Step 1: Pick first class day */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="border-2 border-neutral-800 p-5"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 flex items-center justify-center border-2 font-black text-sm shrink-0 ${stepsCompleted.day ? "bg-brand border-brand text-black" : "border-neutral-600 text-neutral-500"}`}>
            {stepsCompleted.day ? "✓" : "1"}
          </div>
          <h2 className="text-lg font-bold text-white">
            {isHe ? "בחרו את יום השיעור הראשון" : "Pick your first class day"}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {([
            { id: "mon", he: "שני 20:00", en: "Mon 20:00", loc: isHe ? "רוקח 40" : "Rokah 40" },
            { id: "wed", he: "רביעי 20:00", en: "Wed 20:00", loc: isHe ? "רוקח 40" : "Rokah 40" },
            { id: "fri", he: "שישי 13:30", en: "Fri 13:30", loc: isHe ? "צ׳ארלס קלור" : "Charles Clore" },
            { id: "sat", he: "שבת 13:30", en: "Sat 13:30", loc: isHe ? "צ׳ארלס קלור" : "Charles Clore" },
          ] as const).map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => handleDaySelect(day.id)}
              className={`p-3 border-2 text-start transition-colors ${
                selectedDay === day.id
                  ? "border-brand bg-brand/10"
                  : "border-neutral-700 bg-neutral-900 hover:border-brand/50"
              }`}
            >
              <p className="font-black text-white text-sm">{isHe ? day.he : day.en}</p>
              <p className="text-neutral-400 text-xs mt-1">{day.loc}</p>
            </button>
          ))}
        </div>
      </motion.section>

      {/* Step 2: Add to calendar */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="border-2 border-neutral-800 p-5"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 flex items-center justify-center border-2 font-black text-sm shrink-0 ${stepsCompleted.calendar ? "bg-brand border-brand text-black" : "border-neutral-600 text-neutral-500"}`}>
            {stepsCompleted.calendar ? "✓" : "2"}
          </div>
          <h2 className="text-lg font-bold text-white">
            {isHe ? "הוסיפו ליומן" : "Add to calendar"}
          </h2>
        </div>
        <div className="flex items-center justify-center" onClick={() => setStepsCompleted((s) => ({ ...s, calendar: true }))}>
          <AddToCalendarButton
            name={isHe ? "אקרוחבורה — אתגר 30 הימים מתחיל!" : "AcroHavura — 30-Day Challenge Starts!"}
            startDate={calendarDate}
            startTime="10:00"
            endTime="12:00"
            timeZone="Asia/Jerusalem"
            options={["Apple", "Google", "iCal"]}
            location={isHe ? "ישראל" : "Israel"}
            buttonStyle="round"
            lightMode="dark"
          />
        </div>
      </motion.section>

      {/* Step 3: Follow on Instagram */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="border-2 border-neutral-800 p-5"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 flex items-center justify-center border-2 font-black text-sm shrink-0 ${stepsCompleted.instagram ? "bg-brand border-brand text-black" : "border-neutral-600 text-neutral-500"}`}>
            {stepsCompleted.instagram ? "✓" : "3"}
          </div>
          <h2 className="text-lg font-bold text-white">
            {isHe ? "עקבו אחרינו באינסטגרם" : "Follow us on Instagram"}
          </h2>
        </div>
        <p className="text-neutral-400 text-sm mb-3">
          {isHe
            ? "סרטונים, טיפים, ורגעים מהשיעורים"
            : "Videos, tips, and moments from class"}
        </p>
        <a
          href="https://www.instagram.com/acroshay/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setStepsCompleted((s) => ({ ...s, instagram: true }))}
          className="inline-flex items-center gap-2 border-2 border-brand text-brand px-6 py-3 font-bold hover:bg-brand hover:text-black transition-colors w-full justify-center"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          @acroshay
        </a>
      </motion.section>

      {/* Completion message */}
      {completedCount === totalSteps && (
        <motion.section
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center bg-brand/10 border-2 border-brand p-6"
        >
          <h2 className="text-2xl font-black text-brand mb-2">
            {isHe ? "מקומכם אושר!" : "Your spot is confirmed!"}
          </h2>
          <p className="text-neutral-300 text-sm">
            {isHe
              ? `נתראה בשיעור הראשון — ${startDateFormatted}`
              : `See you at your first class — ${startDateFormatted}`}
          </p>
        </motion.section>
      )}

      {/* Share CTA — bring a friend */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.28 }}
        className="border-2 border-brand/30 bg-brand/5 p-5 text-center"
      >
        <h2 className="text-lg font-bold text-white mb-1">
          {isHe ? "הביאו חבר/ה — יותר כיף לתרגל ביחד" : "Bring a friend — more fun to train together"}
        </h2>
        <p className="text-neutral-400 text-sm mb-3">
          {isHe ? "שלחו את הקישור לחבר/ה ותתרגלו ביחד" : "Share the link with a friend and train together"}
        </p>
      </motion.section>

      {/* What your first class looks like — timeline */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-lg font-bold text-white mb-3">
          {isHe ? "איך נראה השיעור הראשון" : "What Your First Class Looks Like"}
        </h2>
        <div className="flex flex-col gap-0">
          {(isHe
            ? [
                { time: "10 דק׳", title: "חימום ביחד", desc: "מגיעים, מתיידעים, מתחממים בקבוצה" },
                { time: "30 דק׳", title: "לומדים תרגיל חדש", desc: "שי מדגים ומלמד צעד אחר צעד" },
                { time: "40 דק׳", title: "מתרגלים בזוגות", desc: "מתחלפים, מתרגלים, צוחקים" },
                { time: "10 דק׳", title: "סיום וצילום קבוצתי", desc: "מתיחות, שיתוף רגעים, תמונה" },
              ]
            : [
                { time: "10 min", title: "Warm up together", desc: "Arrive, meet people, group warm-up" },
                { time: "30 min", title: "Learn a new move", desc: "Shai demos and teaches step by step" },
                { time: "40 min", title: "Practice in pairs", desc: "Rotate partners, practice, laugh" },
                { time: "10 min", title: "Cool down & group photo", desc: "Stretches, share moments, photo" },
              ]
          ).map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-brand flex items-center justify-center text-brand font-black text-xs shrink-0">{i + 1}</div>
                {i < 3 && <div className="w-0.5 h-full bg-neutral-800 min-h-6" />}
              </div>
              <div className="pb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">{step.title}</h3>
                  <span className="text-neutral-500 text-xs">{step.time}</span>
                </div>
                <p className="text-neutral-400 text-xs">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Onboarding info with map links */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.33 }}
      >
        <h2 className="text-lg font-bold text-white mb-3">
          {isHe ? "מה צריך לדעת" : "What to Know"}
        </h2>
        <div className="flex flex-col gap-2">
          {onboardingItems.map((item, i) => (
            <div key={i} className="border border-neutral-800 bg-neutral-900 p-3">
              <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
              <p className="text-neutral-400 text-xs leading-relaxed">
                {item.text}
                {item.link && (
                  <> — <a href={item.link.href} target="_blank" rel="noopener noreferrer" className="text-brand underline">{item.link.label}</a></>
                )}
              </p>
              {item.extra && (
                <p className="text-neutral-400 text-xs leading-relaxed mt-1">
                  {item.extra}
                  {item.link2 && (
                    <> — <a href={item.link2.href} target="_blank" rel="noopener noreferrer" className="text-brand underline">{item.link2.label}</a></>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      </motion.section>

      {/* Fear Q&A — addressing real fears from quiz data */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        <h2 className="text-lg font-bold text-white mb-3">
          {isHe ? "שאלות שכולם שואלים לפני השיעור הראשון" : "Questions Everyone Asks Before Their First Class"}
        </h2>
        <div className="flex flex-col gap-2">
          {reassurances.map((item, i) => (
            <div key={i} className="border border-neutral-800 bg-neutral-900 p-4">
              <p className="text-brand font-bold text-sm mb-1">{item.q}</p>
              <p className="text-neutral-400 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Floating share button */}
      <ShareButton
        url={typeof window !== "undefined" ? `${window.location.origin}/${locale}/quiz/challenge` : ""}
        title={isHe ? "הצטרפו לאתגר 30 יום של אקרוחבורה!" : "Join the AcroHavura 30-Day Challenge!"}
      />

      {/* Bottom — WhatsApp Shai */}
      <div className="text-center py-4 border-t border-neutral-800">
        <p className="text-neutral-500 text-sm mb-3">
          {isHe
            ? "שאלות? שלחו הודעה לשי בווטסאפ"
            : "Questions? Message Shai on WhatsApp"}
        </p>
        <a
          href="https://wa.me/972544280347"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-green-400 font-bold text-sm hover:text-green-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          {isHe ? "שלחו הודעה לשי" : "Message Shai"}
        </a>
      </div>
    </div>
  );
}
