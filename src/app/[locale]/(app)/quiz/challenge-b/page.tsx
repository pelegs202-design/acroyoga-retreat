"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import QuizEngine from "@/components/quiz/QuizEngine";
import type { QuizState } from "@/components/quiz/QuizEngine";
import { challengeQuestions } from "@/lib/quiz/challenge-questions";
import { calculateResult } from "@/lib/quiz/result-calculator";
import { trackQuizComplete, trackLandingView, trackCTAClick, trackScrollDepth, trackTimeOnPage } from "@/lib/quiz/quiz-analytics";
// CountdownTimer removed — funnel is now free trial

// ─────────────────────────────────────────────────────────────────────────────
// Retro GeoCities Landing Page — A/B variant B
// Generated via Google Stitch, adapted to React
// ─────────────────────────────────────────────────────────────────────────────

function RetroLanding({ onStart }: { onStart: () => void }) {
  const mountTime = useRef(Date.now());
  const scrollMilestones = useRef(new Set<number>());

  useEffect(() => {
    trackLandingView();

    // Server-side PageView for Facebook CAPI
    const fbclid = new URLSearchParams(window.location.search).get("fbclid") || undefined;
    const fbp = document.cookie.match(/_fbp=([^;]+)/)?.[1] || undefined;
    fetch("/api/tracking/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: window.location.href, fbclid, fbp }),
    }).catch(() => {});

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        for (const milestone of [25, 50, 75, 100]) {
          if (pct >= milestone && !scrollMilestones.current.has(milestone)) {
            scrollMilestones.current.add(milestone);
            trackScrollDepth(milestone);
          }
        }
        ticking = false;
      });
    };

    const handleUnload = () => {
      trackTimeOnPage("challenge_landing_b", Math.round((Date.now() - mountTime.current) / 1000));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  const handleCTA = useCallback((location: string) => {
    trackCTAClick(`retro_${location}`);
    trackTimeOnPage("challenge_landing_b", Math.round((Date.now() - mountTime.current) / 1000));
    onStart();
  }, [onStart]);

  return (
    <div className="w-full overflow-x-hidden text-white" style={{
      fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive",
      backgroundImage: "radial-gradient(#39ff14 1px, transparent 1px), radial-gradient(#ff1493 1px, transparent 1px)",
      backgroundSize: "40px 40px, 80px 80px",
      backgroundPosition: "0 0, 20px 20px",
      backgroundColor: "#000",
    }}>

      {/* 1. Marquee */}
      <div className="bg-red-600 border-y-4 border-black py-1 overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-[marquee_12s_linear_infinite]">
          <span className="font-bold text-xl mx-4">!!!! אקרויוגה !!!! שיעור ניסיון במתנה !!!! שבועיים !!!! אקרויוגה !!!! שיעור ניסיון במתנה !!!! שבועיים !!!! אקרויוגה !!!! במתנה !!!!</span>
        </div>
      </div>

      {/* 2. Hero */}
      <section className="p-6 flex flex-col items-center text-center gap-4">
        <div className="relative">
          <h1 className="text-5xl md:text-7xl font-black uppercase leading-none mb-2" style={{
            fontFamily: "Impact, 'Arial Black', sans-serif",
            background: "linear-gradient(to right, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(2px 2px 0px #000)",
          }}>
            אקרוחבורה
          </h1>
          <div className="absolute -top-3 -right-3 bg-yellow-400 text-black font-bold px-2 py-1 rotate-12 text-sm" style={{ border: "4px solid", borderColor: "#555 #000 #000 #555" }}>
            שיעור ניסיון במתנה!
          </div>
        </div>

        <p className="text-[#39ff14] font-bold text-2xl [text-shadow:0_0_10px_#39ff14,0_0_20px_#39ff14]" style={{ fontFamily: "Impact, sans-serif" }}>
          שבועיים. מאפס. לטיסה ראשונה.
        </p>

        <p className="text-gray-300 text-base max-w-sm">
          בלי ניסיון, בלי פרטנר, בלי גמישות — לא צריך כלום. רק להגיע.
        </p>

        {/* Free Trial */}
        <div className="flex flex-col items-center">
          <span className="text-[#39ff14] text-7xl font-black [text-shadow:0_0_15px_rgba(57,255,20,0.8)]" style={{ fontFamily: "Impact, sans-serif" }}>
            במתנה!!!
          </span>
          <span className="text-[#ffff00] font-bold text-sm">שיעור ניסיון ראשון במתנה · בלי התחייבות · רק להגיע</span>
        </div>

        <button
          onClick={() => handleCTA("hero")}
          className="text-black font-bold text-2xl px-8 py-4 [text-shadow:0_0_10px_#ff1493,0_0_20px_#ff1493] active:scale-95 transition-all cursor-pointer w-full max-w-sm"
          style={{ backgroundColor: "#ff1493", border: "4px solid", borderColor: "#ff69b4 #8b0057 #8b0057 #ff69b4" }}
        >
          אני רוצה לעוף &larr;
        </button>

        <div className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 font-bold text-sm" style={{ border: "4px solid", borderColor: "#555 #000 #000 #555" }}>
          UNDER CONSTRUCTION
        </div>

        {/* Retro acroyoga Bird pose - pixel art */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full max-w-sm object-cover"
          style={{ border: "4px solid", borderColor: "#555 #000 #000 #555" }}
          alt="אקרויוגה Bird pose — pixel art"
          src="/images/retro-acro-bird.png"
        />
      </section>

      {/* Fire divider */}
      <div className="h-5 my-4 relative" style={{ background: "linear-gradient(90deg, #ff0000, #ff8c00, #ffff00, #ff8c00, #ff0000)" }}>
        <div className="absolute -top-1 w-full text-center text-sm">&#128293;&#128293;&#128293;&#128293;&#128293;&#128293;&#128293;&#128293;&#128293;&#128293;</div>
      </div>

      {/* 3. Stats */}
      <section className="px-4 grid grid-cols-1 gap-4">
        {[
          { value: "527 בוגרים", desc: "כבר טסים באוויר!", color: "#39ff14", rotate: "-rotate-1" },
          { value: "96% סיום", desc: "אף אחד לא נשאר על הרצפה", color: "#ff1493", rotate: "rotate-1" },
          { value: "4.9 דירוג", desc: "החבורה הכי חמה בישראל", color: "#ffff00", rotate: "-rotate-2" },
        ].map((stat, i) => (
          <div key={i} className={`bg-black p-4 text-center ${stat.rotate}`} style={{ border: `4px solid ${stat.color}`, borderStyle: "outset" }}>
            <h3 className="text-4xl font-black uppercase" style={{ fontFamily: "Impact, sans-serif", color: stat.color }}>{stat.value}</h3>
            <p>{stat.desc}</p>
          </div>
        ))}
      </section>

      {/* Group acroyoga image */}
      <div className="px-4 my-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full object-cover"
          style={{ border: "4px solid #ff1493", borderStyle: "outset" }}
          alt="קבוצת אקרויוגה"
          src="/images/retro-acro-group.png"
        />
        <p className="text-center text-[#ff1493] text-sm mt-1">&#9650; זה מהג&apos;אם האחרון שלנו &#9650;</p>
      </div>

      {/* Fire divider */}
      <div className="h-5 my-4" style={{ background: "linear-gradient(90deg, #ff0000, #ff8c00, #ffff00, #ff8c00, #ff0000)" }} />

      {/* 4. Benefits Table */}
      <section className="px-4">
        <div className="bg-black p-2" style={{ border: "4px solid #39ff14", borderStyle: "outset" }}>
          <table className="w-full text-right" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="bg-[#39ff14] text-black">
                <th className="p-2 border-2 border-[#39ff14] font-bold">למה אקרוחבורה?</th>
              </tr>
            </thead>
            <tbody>
              {[
                { text: "★ 2-3 מפגשים מודרכים בשבוע בתל אביב וכפר סבא", color: "#39ff14", bg: "bg-zinc-900" },
                { text: "★ קהילה תומכת + קבוצת וואטסאפ פעילה", color: "#ff1493", bg: "bg-black" },
                { text: "★ סרטוני הדרכה + מעקב התקדמות אישי", color: "#ffff00", bg: "bg-zinc-900" },
                { text: "★ תעודת סיום + כניסה לקבוצת בוגרים", color: "#00ffff", bg: "bg-black" },
                { text: "★ מדריך צמוד — 0 פציעות ב-527 בוגרים", color: "#39ff14", bg: "bg-zinc-900" },
              ].map((row, i) => (
                <tr key={i} className={row.bg}>
                  <td className="p-3 border-2 border-[#39ff14]" style={{ color: row.color }}>{row.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-red-500 text-center mt-4 text-xl font-black" style={{ fontFamily: "Impact, sans-serif" }}>
          !!! זהירות: מלאי המקומות אוזל במהירות !!!
        </p>
      </section>

      {/* Fire divider */}
      <div className="h-5 my-4" style={{ background: "linear-gradient(90deg, #ff0000, #ff8c00, #ffff00, #ff8c00, #ff0000)" }} />

      {/* 5. Testimonials */}
      <section className="px-4 space-y-4">
        <h3 className="text-[#ff1493] text-2xl underline text-center [text-shadow:0_0_10px_#ff1493]">&#11088; מה אנשים אומרים &#11088;</h3>
        {[
          { text: "הגעתי בלי שום ניסיון. אחרי שבוע כבר עשיתי Bird. אחרי שבועיים — Throne בלי פחד.", author: "דניאל, 28, תל אביב", color: "#39ff14" },
          { text: "הקבוצה היא מה שעשה את ההבדל. יום 1 הגעתי לבד. יום 14 יצאתי עם 15 חברים חדשים.", author: "מאיה, 32, כפר סבא", color: "#ff1493" },
          { text: "חשבתי שאני צריך להיות גמיש. ביום 1 לא הגעתי לאצבעות הרגליים. ביום 14 עפתי.", author: "עומר, 35, תל אביב", color: "#00ffff" },
          { text: "ב-45 חשבתי שזה לא בשבילי. טעיתי. הגוף מסתגל מהר יותר ממה שנדמה.", author: "אבי, 45, כפר סבא", color: "#ffff00" },
        ].map((t, i) => (
          <div key={i} className="bg-black p-4 relative" style={{ border: `4px solid ${t.color}`, borderStyle: "outset" }}>
            <p className="italic" style={{ color: t.color }}>&ldquo;{t.text}&rdquo;</p>
            <div className="text-yellow-400 mt-2">&#11088;&#11088;&#11088;&#11088;&#11088;</div>
            <p className="font-bold text-left text-sm" style={{ color: t.color }}>— {t.author}</p>
          </div>
        ))}
      </section>

      {/* Throne pose image */}
      <div className="px-4 my-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-48 h-48 object-cover mx-auto"
          style={{ border: "4px solid #00ffff", borderStyle: "outset" }}
          alt="Throne pose — neon art"
          src="/images/retro-acro-throne.png"
        />
      </div>

      {/* Fire divider */}
      <div className="h-5 my-4" style={{ background: "linear-gradient(90deg, #ff0000, #ff8c00, #ffff00, #ff8c00, #ff0000)" }} />

      {/* 6. Details Table */}
      <section className="px-4">
        <h2 className="text-[#ffff00] text-center text-3xl mb-4 font-black" style={{ fontFamily: "Impact, sans-serif" }}>&#128203; פרטי האתגר</h2>
        <div className="bg-black p-1 overflow-hidden" style={{ border: "4px solid #ffff00", borderStyle: "outset" }}>
          <table className="w-full text-right">
            <tbody>
              <tr className="bg-[#ffff00] text-black">
                <td className="p-2 font-bold border-b-2 border-black w-20">מה?</td>
                <td className="p-2 border-b-2 border-black">אתגר שבועיים — מאפס לטיסה ראשונה</td>
              </tr>
              <tr>
                <td className="p-2 font-bold text-[#ffff00]">איפה?</td>
                <td className="p-2">תל אביב + כפר סבא</td>
              </tr>
              <tr className="bg-zinc-800">
                <td className="p-2 font-bold text-[#ffff00]">מתי?</td>
                <td className="p-2">שני+רביעי 20:00 | שישי+שבת 13:30</td>
              </tr>
              <tr className="bg-[#39ff14] text-black">
                <td className="p-2 font-bold">כמה?</td>
                <td className="p-2 font-bold">במתנה!!! שיעור ניסיון ראשון עלינו!</td>
              </tr>
              <tr>
                <td className="p-2 font-bold text-[#ffff00]">צריך?</td>
                <td className="p-2 text-[#39ff14]">בלי ניסיון. בלי פרטנר. רק להגיע.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Fire divider */}
      <div className="h-5 my-8" style={{ background: "linear-gradient(90deg, #ff0000, #ff8c00, #ffff00, #ff8c00, #ff0000)" }} />

      {/* 7. Final CTA */}
      <section className="px-4 pb-12 flex flex-col items-center gap-6">
        <p className="text-[#ffff00] text-xl font-bold text-center">עוד שנה של אותו דבר</p>
        <p className="text-white text-lg text-center">או שבועיים שישנו הכל</p>
        <p className="text-[#39ff14] text-center">527 אנשים כבר בחרו. עכשיו תורכם.</p>

        <button
          onClick={() => handleCTA("final")}
          className="w-full text-black font-bold text-3xl py-6 [text-shadow:0_0_10px_#ff1493,0_0_20px_#ff1493] cursor-pointer"
          style={{ backgroundColor: "#ff1493", border: "4px solid", borderColor: "#ff69b4 #8b0057 #8b0057 #ff69b4" }}
        >
          בואו נבדוק אם אתם מתאימים &larr;
        </button>

        {/* Visitor counter */}
        <div className="flex flex-col items-center gap-2">
          <div className="bg-zinc-900 border-2 border-zinc-700 p-2 font-mono text-[#39ff14] text-xl flex gap-1">
            {["0", "0", "5", "2", "7"].map((d, i) => (
              <span key={i} className="bg-black px-1 border border-zinc-600">{d}</span>
            ))}
          </div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">visitor counter</p>
        </div>

        <p className="text-zinc-500 text-xs">Best viewed in Netscape Navigator 4.0</p>

        {/* Retro badges */}
        <div className="flex gap-3 flex-wrap justify-center text-xs">
          <span className="bg-zinc-800 border-2 border-zinc-600 px-2 py-1 text-[#39ff14]">&#127760; Best of Web &apos;96</span>
          <span className="bg-zinc-800 border-2 border-zinc-600 px-2 py-1 text-[#ffff00]">&#128221; Made with Notepad</span>
          <span className="bg-zinc-800 border-2 border-zinc-600 px-2 py-1 text-[#00ffff]">&#128187; IE 6 Optimized</span>
        </div>

        <p className="text-zinc-600 text-xs">&#169; 1996 אקרוחבורה — הכי טוב ברשת</p>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quiz flow (shared with version A)
// ─────────────────────────────────────────────────────────────────────────────

function ChallengeQuizFlow() {
  const router = useRouter();
  const locale = useLocale();

  const [fbclid] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("fbclid") || "";
  });

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
          fbclid,
        }),
      });
    } catch {}

    try { localStorage.removeItem("quiz_challenge_state"); } catch {}
    try { sessionStorage.setItem(`quiz_completed_${state.sessionId}`, "1"); } catch {}
    router.push(`/quiz/challenge/results?session=${state.sessionId}`);
  };

  return (
    <QuizEngine
      questions={challengeQuestions}
      quizType="challenge"
      onComplete={handleComplete}
      storageKey="quiz_challenge_state"
      locale="he"
      onStepAnswer={handleStepAnswer}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page wrapper
// ─────────────────────────────────────────────────────────────────────────────

export default function ChallengeRetroPage() {
  const [started, setStarted] = useState(false);

  if (started) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-16">
        <ChallengeQuizFlow />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black overflow-x-hidden">
      <RetroLanding onStart={() => setStarted(true)} />
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </main>
  );
}
