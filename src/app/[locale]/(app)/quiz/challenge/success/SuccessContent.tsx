"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { trackSuccessPageView, trackCalendarAdded, trackInstagramFollowed, trackTimeOnPage } from "@/lib/quiz/quiz-analytics";
import { nextMonday as getNextMonday, nextOccurrence, formatShortDate, relativeDayLabel } from "@/lib/date-utils";
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

// Day metadata for calendar + display
const DAY_INFO: Record<string, { he: string; en: string; time: string; endTime: string; dow: number; hour: number; minute: number; location: { he: string; en: string }; mapKey: keyof typeof MAPS }> = {
  "mon-early": { he: "שני", en: "Monday", time: "18:30", endTime: "20:00", dow: 1, hour: 18, minute: 30, location: { he: "רוקח 40, ת״א", en: "Rokah 40, Tel Aviv" }, mapKey: "rokah" },
  "mon-late": { he: "שני", en: "Monday", time: "19:45", endTime: "21:15", dow: 1, hour: 19, minute: 45, location: { he: "רוקח 40, ת״א", en: "Rokah 40, Tel Aviv" }, mapKey: "rokah" },
  "wed-early": { he: "רביעי", en: "Wednesday", time: "18:30", endTime: "20:00", dow: 3, hour: 18, minute: 30, location: { he: "רוקח 40, ת״א", en: "Rokah 40, Tel Aviv" }, mapKey: "rokah" },
  "wed-late": { he: "רביעי", en: "Wednesday", time: "19:45", endTime: "21:15", dow: 3, hour: 19, minute: 45, location: { he: "רוקח 40, ת״א", en: "Rokah 40, Tel Aviv" }, mapKey: "rokah" },
  fri: { he: "שישי", en: "Friday", time: "13:30", endTime: "15:00", dow: 5, hour: 13, minute: 30, location: { he: "חוף צ׳ארלס קלור", en: "Charles Clore Beach" }, mapKey: "clore" },
  sat: { he: "שבת", en: "Saturday", time: "13:30", endTime: "15:00", dow: 6, hour: 13, minute: 30, location: { he: "חוף צ׳ארלס קלור", en: "Charles Clore Beach" }, mapKey: "clore" },
};

interface SuccessContentProps {
  sessionId: string;
  locale: string;
  initialDay?: string;
}

export default function SuccessContent({ sessionId, locale, initialDay }: SuccessContentProps) {
  const isHe = locale === "he";
  const mountTime = useState(() => Date.now())[0];

  const [selectedDay, setSelectedDay] = useState<string | null>(initialDay ?? null);
  const [dayConfirmed, setDayConfirmed] = useState(!!initialDay);
  const [archetypeName, setArchetypeName] = useState("");
  const [archetypeTagline, setArchetypeTagline] = useState("");
  const [archetypeDescription, setArchetypeDescription] = useState("");
  const [leadName, setLeadName] = useState("");
  const [leadCount, setLeadCount] = useState(0);
  const [calendarDone, setCalendarDone] = useState(false);
  const [instagramDone, setInstagramDone] = useState(false);

  useEffect(() => {
    trackSuccessPageView(sessionId);

    // Fetch archetype for personalization (full card — shown at top of success page)
    fetch(`/api/quiz/results/${sessionId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.result?.name) {
          setArchetypeName(locale === "he" ? data.result.name.he : data.result.name.en);
        }
        if (data?.result?.tagline) {
          setArchetypeTagline(locale === "he" ? data.result.tagline.he : data.result.tagline.en);
        }
        if (data?.result?.description) {
          setArchetypeDescription(locale === "he" ? data.result.description.he : data.result.description.en);
        }
        if (data?.lead?.name) setLeadName(data.lead.name);
      })
      .catch(() => {});

    // Fetch booked lead count for social proof
    fetch("/api/challenge/count")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.count) setLeadCount(data.count);
      })
      .catch(() => {});

    // Track time on page
    const handleUnload = () => {
      trackTimeOnPage("success", Math.round((Date.now() - mountTime) / 1000));
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [sessionId, locale, mountTime]);

  const nextMondayDate = getNextMonday();

  // Calendar info from selected day — compute the actual NEXT occurrence
  const dayInfo = selectedDay ? DAY_INFO[selectedDay] : null;
  const classDate = dayInfo ? nextOccurrence(dayInfo.dow, dayInfo.hour, dayInfo.minute) : nextMondayDate;
  const calendarDate = classDate.toISOString().split("T")[0];

  async function handleDaySelect(day: string) {
    setSelectedDay(day);
    setDayConfirmed(false);
    try {
      const res = await fetch("/api/challenge/first-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, day }),
      });
      if (res.ok) setDayConfirmed(true);
    } catch {
      // silent — selection is still shown
    }
  }

  // Mark day as completed when confirmed
  useEffect(() => {
    // no-op — dayConfirmed used for UI
  }, [dayConfirmed]);

  // ─── Reassurances — addressing real quiz fears ─────────────────────────────
  const reassurances = isHe
    ? [
        { q: "אם אין לי ניסיון?", a: "80% מהתלמידים שלנו מתחילים מאפס. השיעור הראשון מותאם למתחילים לגמרי." },
        { q: "אם יהיה מביך?", a: "הקבוצה מאוד מקבלת. כולם חדשים ביום הראשון. תרגישו בבית תוך 5 דקות." },
        { q: "אם אני לא גמיש/ה?", a: "אקרויוגה לא דורשת גמישות — היא בונה אותה. לא צריך לגעת באצבעות הרגליים." },
        { q: "צריך פרטנר?", a: "לא! נזווג אתכם בשיעור. תתרגלו עם אנשים שונים בכל פעם." },
      ]
    : [
        { q: "What if I have no experience?", a: "80% of our students start from zero. The first class is fully adapted for beginners." },
        { q: "What if it's awkward?", a: "The group is super welcoming. Everyone's new on day one. You'll feel at home in 5 minutes." },
        { q: "What if I'm not flexible?", a: "Acroyoga doesn't require flexibility — it builds it. No toe-touching required." },
        { q: "Do I need a partner?", a: "Nope! We pair everyone up. You'll practice with different people each time." },
      ];

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-6 pb-20 px-4 pt-8">

      {/* ── 0. ARCHETYPE HEADER — duplicate of results page so user keeps context */}
      {archetypeName && (
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-neutral-500 text-xs mb-2 uppercase tracking-widest">
            {leadName ? `${leadName}, ` : ""}
            {isHe ? "אתם" : "You are"}
          </p>
          <div className="inline-block border-2 border-brand px-6 py-4 shadow-[6px_6px_0px_0px_rgba(244,114,182,0.15)] mb-4">
            <h2 className="text-3xl sm:text-5xl font-black text-brand leading-none">
              {archetypeName}
            </h2>
          </div>
          {archetypeTagline && (
            <p className="text-neutral-300 italic text-base mb-3 px-2">{archetypeTagline}</p>
          )}
          {archetypeDescription && (
            <p className="text-neutral-400 text-sm leading-relaxed max-w-md mx-auto px-2">
              {archetypeDescription}
            </p>
          )}
          <div className="mx-auto my-6 h-px w-24 bg-neutral-800" />
        </motion.section>
      )}

      {/* ── 1. CELEBRATION HEADER (Brunson: reinforce the decision) ──────── */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="inline-block border-2 border-brand p-3 mb-4">
          <svg className="w-12 h-12 text-brand mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
        </div>
        <h1 className="text-3xl font-black text-brand mb-2">
          {archetypeName
            ? (isHe ? `${archetypeName}, נתראה בשיעור!` : `${archetypeName}, See You in Class!`)
            : (isHe ? "נתראה בשיעור!" : "See You in Class!")}
        </h1>
        <p className="text-neutral-400 text-sm mb-3">
          {isHe
            ? "המקום שלכם שמור. עשיתם את הצעד הראשון — עכשיו רק להגיע."
            : "Your spot is saved. You took the first step — now just show up."}
        </p>

        {/* Social proof (Cialdini) */}
        {leadCount > 1 && (
          <p className="text-brand/70 text-xs font-bold">
            {isHe
              ? `${leadCount} אנשים כבר שריינו מקום השבוע`
              : `${leadCount} people already booked this week`}
          </p>
        )}
      </motion.section>

      {/* ── 2. YOUR CLASS DETAILS (specificity = confidence) ─────────────── */}
      {dayInfo && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="border-2 border-brand bg-brand/5 p-5"
        >
          <h2 className="text-sm font-black text-brand uppercase tracking-widest mb-3">
            {isHe ? "השיעור שלכם" : "Your Class"}
          </h2>
          <div className="flex items-center gap-4 mb-3">
            <div className="border-2 border-brand px-4 py-2 text-center shrink-0">
              <span className="text-2xl font-black text-brand">{isHe ? dayInfo.he : dayInfo.en.slice(0, 3)}</span>
              <p className="text-brand/70 text-xs font-bold">{dayInfo.time}</p>
            </div>
            <div>
              <p className="text-white font-bold text-sm">
                {isHe
                  ? `יום ${dayInfo.he}, ${formatShortDate(classDate, "he")} · ${dayInfo.time}`
                  : `${dayInfo.en}, ${formatShortDate(classDate, "en")} · ${dayInfo.time}`}
              </p>
              <a href={MAPS[dayInfo.mapKey]} target="_blank" rel="noopener noreferrer" className="text-brand text-xs underline">
                {isHe ? dayInfo.location.he : dayInfo.location.en}
              </a>
              {(selectedDay?.startsWith("mon") || selectedDay?.startsWith("wed")) && (
                <p className="text-green-400 text-xs mt-0.5">{isHe ? "🅿️ חניה חינם" : "🅿️ Free parking"}</p>
              )}
            </div>
          </div>

          {/* Countdown — specific per-class */}
          <div className="inline-block bg-brand/20 border border-brand/40 px-3 py-1 text-brand text-xs font-black uppercase tracking-widest">
            {isHe ? `מתחילים ${relativeDayLabel(classDate, "he")}` : `Starts ${relativeDayLabel(classDate, "en")}`}
          </div>
        </motion.section>
      )}

      {/* ── 3. ADD TO CALENDAR (reduce no-show) ─────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
        className="border-2 border-neutral-800 p-5"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 flex items-center justify-center border-2 font-black text-sm shrink-0 ${calendarDone ? "bg-brand border-brand text-black" : "border-neutral-600 text-neutral-500"}`}>
            {calendarDone ? "✓" : "1"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {isHe ? "הוסיפו ליומן" : "Add to Calendar"}
            </h2>
            <p className="text-neutral-500 text-xs">
              {isHe ? "ככה לא שוכחים" : "So you don't forget"}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center" onClick={() => { setCalendarDone(true); trackCalendarAdded(sessionId); }}>
          <AddToCalendarButton
            name={isHe ? "אקרוחבורה — שיעור ניסיון" : "AcroHavura — Trial Class"}
            startDate={calendarDate}
            startTime={dayInfo?.time ?? "18:30"}
            endTime={dayInfo?.endTime ?? "20:00"}
            timeZone="Asia/Jerusalem"
            options={["Apple", "Google", "iCal"]}
            location={dayInfo ? (isHe ? dayInfo.location.he : dayInfo.location.en) : ""}
            buttonStyle="round"
            lightMode="dark"
          />
        </div>
      </motion.section>

      {/* ── 4. WHAT YOUR FIRST CLASS LOOKS LIKE (Hormozi: reduce time delay perception) */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.16 }}
      >
        <h2 className="text-lg font-bold text-white mb-3">
          {isHe ? "מה קורה בשיעור הראשון" : "What Happens in Your First Class"}
        </h2>
        <div className="flex flex-col gap-0">
          {(isHe
            ? [
                { time: "10 דק׳", title: "חימום ביחד", desc: "מגיעים, מתיידעים, מתחממים" },
                { time: "30 דק׳", title: "לומדים תנוחה ראשונה", desc: "שי מדגים צעד אחר צעד — כולם מצליחים" },
                { time: "40 דק׳", title: "מתרגלים בזוגות", desc: "מתחלפים, מתרגלים, צוחקים — פה הקסם קורה" },
                { time: "10 דק׳", title: "סיום + צילום קבוצתי", desc: "מתיחות, שיתוף רגעים, תמונה ראשונה" },
              ]
            : [
                { time: "10 min", title: "Warm up together", desc: "Arrive, meet people, group warm-up" },
                { time: "30 min", title: "Learn your first pose", desc: "Shai demos step by step — everyone gets it" },
                { time: "40 min", title: "Practice in pairs", desc: "Rotate partners, practice, laugh — this is where the magic happens" },
                { time: "10 min", title: "Cool down + group photo", desc: "Stretches, share moments, your first photo" },
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

      {/* ── 5. JUST SHOW UP (Hormozi: minimize effort/sacrifice) ─────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="border-2 border-neutral-800 bg-neutral-900 p-5"
      >
        <h2 className="text-lg font-bold text-white mb-3">
          {isHe ? "מה להביא" : "What to Bring"}
        </h2>
        <div className="space-y-2">
          {(isHe
            ? [
                { icon: "👕", text: "בגדי ספורט נוחים (בלי רוכסנים/כפתורים)" },
                { icon: "💧", text: "בקבוק מים" },
                { icon: "😊", text: "מצב רוח טוב — זה הכל!" },
              ]
            : [
                { icon: "👕", text: "Comfortable athletic clothes (no zippers/buttons)" },
                { icon: "💧", text: "Water bottle" },
                { icon: "😊", text: "Good vibes — that's it!" },
              ]
          ).map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className="text-neutral-300 text-sm">{item.text}</span>
            </div>
          ))}
        </div>
        <p className="text-neutral-500 text-xs mt-3 border-t border-neutral-800 pt-3">
          {isHe
            ? "לא צריך מזרן, לא צריך פרטנר — יש לנו הכל."
            : "No mat needed, no partner needed — we've got everything."}
        </p>
      </motion.section>

      {/* ── 6. FEARS Q&A (Cialdini: reduce post-decision anxiety) ──────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.24 }}
      >
        <h2 className="text-lg font-bold text-white mb-3">
          {isHe ? "שאלות שכולם שואלים" : "Questions Everyone Asks"}
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

      {/* ── 7. BRING A FRIEND (viral loop + social commitment) ──────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.28 }}
        className="border-2 border-brand/30 bg-brand/5 p-5 text-center"
      >
        <h2 className="text-lg font-bold text-white mb-1">
          {isHe ? "הביאו חבר/ה — יותר כיף לתרגל ביחד" : "Bring a Friend — More Fun Together"}
        </h2>
        <p className="text-neutral-400 text-sm mb-3">
          {isHe
            ? "גם הם מקבלים שיעור ניסיון במתנה"
            : "They also get a free trial class"}
        </p>
        <ShareButton
          url={typeof window !== "undefined" ? `${window.location.origin}/${locale}/quiz/challenge` : ""}
          title={isHe ? "שיעור אקרויוגה במתנה — בואו תנסו!" : "Free acroyoga trial class — come try it!"}
        />
      </motion.section>

      {/* ── 8. FOLLOW INSTAGRAM (step 2) ────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.32 }}
        className="border-2 border-neutral-800 p-5"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 flex items-center justify-center border-2 font-black text-sm shrink-0 ${instagramDone ? "bg-brand border-brand text-black" : "border-neutral-600 text-neutral-500"}`}>
            {instagramDone ? "✓" : "2"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {isHe ? "עקבו באינסטגרם" : "Follow on Instagram"}
            </h2>
            <p className="text-neutral-500 text-xs">
              {isHe ? "תראו מה מחכה לכם" : "See what's waiting for you"}
            </p>
          </div>
        </div>
        <a
          href="https://www.instagram.com/acroshay/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { setInstagramDone(true); trackInstagramFollowed(sessionId); }}
          className="inline-flex items-center gap-2 border-2 border-brand text-brand px-6 py-3 font-bold hover:bg-brand hover:text-black transition-colors w-full justify-center"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          @acroshay
        </a>
      </motion.section>

      {/* ── 9. OR CHANGE YOUR DAY (if they want to switch) ──────────────── */}
      {!initialDay && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.36 }}
          className="border-2 border-neutral-800 p-5"
        >
          <h2 className="text-lg font-bold text-white mb-3">
            {isHe ? "בחרו את יום השיעור הראשון" : "Pick Your First Class Day"}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(DAY_INFO) as [string, typeof DAY_INFO[string]][]).map(([id, info]) => (
              <button
                key={id}
                type="button"
                onClick={() => handleDaySelect(id)}
                className={`p-3 border-2 text-start transition-colors ${
                  selectedDay === id
                    ? "border-brand bg-brand/10"
                    : "border-neutral-700 bg-neutral-900 hover:border-brand/50"
                }`}
              >
                <p className="font-black text-white text-sm">
                  {isHe ? `${info.he} ${info.time}` : `${info.en.slice(0, 3)} ${info.time}`}
                </p>
                <p className="text-neutral-400 text-xs mt-1">
                  {isHe ? info.location.he : info.location.en}
                </p>
              </button>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── 10. WHATSAPP CONTACT ────────────────────────────────────────── */}
      <div className="text-center py-4 border-t border-neutral-800">
        <a
          href="https://wa.me/972544280347"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-green-400 font-bold text-sm hover:text-green-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          {isHe ? "שאלות? שלחו לשי בוואטסאפ" : "Questions? Message Shai on WhatsApp"}
        </a>
      </div>
    </div>
  );
}
