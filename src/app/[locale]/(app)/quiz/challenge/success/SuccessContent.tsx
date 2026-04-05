"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { trackPurchase } from "@/lib/quiz/quiz-analytics";
import { nextMonday as getNextMonday } from "@/lib/date-utils";

// Dynamic import for add-to-calendar (no SSR — uses browser APIs)
const AddToCalendarButton = dynamic(
  () => import("add-to-calendar-button-react").then((m) => m.AddToCalendarButton),
  { ssr: false }
);

interface SuccessContentProps {
  sessionId: string;
  locale: string;
}

export default function SuccessContent({ sessionId: _sessionId, locale }: SuccessContentProps) {
  const isHe = locale === "he";

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayConfirmed, setDayConfirmed] = useState(false);

  useEffect(() => {
    trackPurchase(_sessionId);
  }, [_sessionId]);

  const nextMondayDate = getNextMonday();

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

  const waGroupUrl = process.env.NEXT_PUBLIC_CHALLENGE_WA_GROUP_URL;

  // Onboarding info items
  const onboardingItems = isHe
    ? [
        { marker: "01", title: "מתי מתאמנים", text: `שני 20:00 + רביעי 20:00 — רוקח 40, צפון תל אביב\nשישי 13:30 + שבת 13:30 — חוף צ׳ארלס קלור, מול מלון עם ממ״ד\nהשיעור הראשון: ${startDateFormatted}` },
        { marker: "02", title: "מה ללבוש", text: "בגדי ספורט נוחים, ללא רוכסנים וכפתורים. כדאי להביא גרביים." },
        { marker: "03", title: "מה להביא", text: "מזרן יוגה, בקבוק מים, מגבת קטנה." },
        { marker: "04", title: "ממ״ד", text: "בכל המיקומים יש ממ״ד בקרבת מקום." },
      ]
    : [
        { marker: "01", title: "When We Train", text: `Mon 20:00 + Wed 20:00 — Rokah 40, North Tel Aviv\nFri 13:30 + Sat 13:30 — Charles Clore Beach, near hotel with shelter\nYour first class: ${startDateFormatted}` },
        { marker: "02", title: "What to Wear", text: "Comfortable athletic clothes, no zippers or buttons. Bring socks." },
        { marker: "03", title: "What to Bring", text: "Yoga mat, water bottle, small towel." },
        { marker: "04", title: "Shelter", text: "All locations have a shelter (mamad) nearby." },
      ];

  // Fear-addressing reassurances
  const reassurances = isHe
    ? [
        "אל תדאגו אם אין לכם ניסיון — 80% מהתלמידים שלנו מתחילים כמתחילים מוחלטים.",
        "לא צריך פרטנר — אנחנו מזווגים את כולם בשיעור.",
        "כל רמת כושר מתאימה — אנחנו מתקדמים בהדרגה.",
        "שי ילווה אתכם אישית בכל שלב של הדרך.",
      ]
    : [
        "Don't worry if you have no experience — 80% of our students start as complete beginners.",
        "No partner needed — we pair everyone up in class.",
        "Any fitness level works — we progress gradually.",
        "Shai will guide you personally every step of the way.",
      ];

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-8 pb-20 px-4 pt-8">
      {/* 1. Celebration Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="text-5xl font-black text-brand mb-4">+</div>
        <h1 className="text-3xl font-black text-brand mb-2">
          {isHe ? "!אתם בפנים" : "You're In!"}
        </h1>
        <p className="text-neutral-300 text-base">
          {isHe
            ? "ההרשמה שלכם לאתגר 30 הימים אושרה. חשבונית נשלחה למייל."
            : "Your 30-day challenge enrollment is confirmed. Invoice sent to your email."}
        </p>
      </motion.section>

      {/* 2. What to Expect (reassurances) */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-xl font-bold text-white mb-3">
          {isHe ? "מה מחכה לכם" : "What to Expect"}
        </h2>
        <div className="flex flex-col gap-2">
          {reassurances.map((text, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3"
            >
              <span className="text-brand mt-0.5">✓</span>
              <p className="text-neutral-300 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* 3. Onboarding Info Cards */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <h2 className="text-xl font-bold text-white mb-3">
          {isHe ? "הכנה לשיעור הראשון" : "Preparing for Your First Class"}
        </h2>
        <div className="flex flex-col gap-3">
          {onboardingItems.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-4"
            >
              <div className="flex items-center gap-3 mb-1">
                <span className="text-brand font-black text-xs border border-brand/40 w-7 h-7 flex items-center justify-center shrink-0">{item.marker}</span>
                <h3 className="font-bold text-white text-sm">{item.title}</h3>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed whitespace-pre-line">{item.text}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* 4. First Class Day Picker */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18 }}
      >
        <h2 className="text-xl font-bold text-white mb-2">
          {isHe ? "באיזה יום מגיעים לשיעור הראשון?" : "Which day is your first class?"}
        </h2>
        <p className="text-neutral-400 text-sm mb-4">
          {isHe ? "בחרו יום ונשריין לכם מקום" : "Pick a day and we'll save your spot"}
        </p>
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
              className={`p-4 border-2 text-start transition-colors ${
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
        {dayConfirmed && (
          <p className="text-green-400 text-sm font-bold mt-3 text-center">
            {isHe ? "נשמר — נתראה שם" : "Saved — see you there"}
          </p>
        )}
      </motion.section>

      {/* 5. Add to Calendar */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col items-center gap-3"
      >
        <h2 className="text-lg font-bold text-white">
          {isHe ? "הוסיפו ליומן" : "Add to Calendar"}
        </h2>
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
      </motion.section>

      {/* 5. WhatsApp Group */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="text-center"
      >
        <h2 className="text-lg font-bold text-white mb-2">
          {isHe ? "הצטרפו לקבוצת הווטסאפ" : "Join the WhatsApp Group"}
        </h2>
        <p className="text-neutral-400 text-sm mb-4">
          {isHe
            ? "כאן נשלח עדכונים, מיקומים, ותזכורות לשיעורים."
            : "We'll send updates, locations, and class reminders here."}
        </p>
        {waGroupUrl ? (
          <a
            href={waGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 text-white px-6 py-3 font-bold hover:bg-green-700 transition-colors"
          >
            {isHe ? "כניסה לקבוצת וואטסאפ" : "Join WhatsApp Group"}
          </a>
        ) : (
          <p className="text-neutral-500 text-sm italic">
            {isHe ? "קישור לקבוצה ישלח בקרוב" : "Group link coming soon"}
          </p>
        )}
      </motion.section>

      {/* 6. Follow on Instagram */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.28 }}
        className="text-center"
      >
        <h2 className="text-lg font-bold text-white mb-2">
          {isHe ? "עקבו אחרינו באינסטגרם" : "Follow Us on Instagram"}
        </h2>
        <p className="text-neutral-400 text-sm mb-4">
          {isHe
            ? "סרטונים, טיפים, ורגעים מהשיעורים"
            : "Videos, tips, and moments from class"}
        </p>
        <a
          href="https://www.instagram.com/acroshay/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border-2 border-brand text-brand px-6 py-3 font-bold hover:bg-brand hover:text-black transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          @acroshay
        </a>
      </motion.section>

      {/* 7. Bottom encouragement */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center py-4 border-t border-neutral-800"
      >
        <p className="text-neutral-500 text-sm">
          {isHe
            ? "שאלות? שלחו הודעה בווטסאפ ושי יחזור אליכם."
            : "Questions? Send a WhatsApp message and Shai will get back to you."}
        </p>
      </motion.section>
    </div>
  );
}
