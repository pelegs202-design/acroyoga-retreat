"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { SlotCapacityWidget } from "@/components/lp/SlotCapacityWidget";
import { IntroPackOffer } from "@/components/lp/IntroPackOffer";
import { MoneyBackBadge } from "@/components/lp/MoneyBackBadge";
import { ReelsCarousel } from "@/components/home/ReelsCarousel";
import {
  trackLpView,
  trackLpCtaClick,
  trackScrollDepth,
  trackTimeOnPage,
  trackSlotSelect,
} from "@/lib/quiz/quiz-analytics";

const VARIANT = "shape" as const;
const PRICE_ILS = 149;

interface Slot {
  id: string;
  date: string;
  capacity: number;
  remaining: number;
  labelHe: string;
  labelEn: string;
  location: string;
}

export default function ShapeLanding({ locale }: { locale: string }) {
  const isHe = locale === "he";
  const mountTime = useRef(Date.now());
  const scrollMilestones = useRef(new Set<number>());

  // ── Mount: track view + scroll depth + unload time ────────────
  useEffect(() => {
    trackLpView(VARIANT);

    // Persist test meta for the success page to read after the GI round-trip
    try {
      sessionStorage.setItem(
        "lp_test_meta",
        JSON.stringify({ lpVariant: VARIANT, lpPath: "direct" }),
      );
    } catch { /* ignore */ }

    // Server-side PageView for CAPI
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
        const denom = document.body.scrollHeight - window.innerHeight;
        const pct = denom > 0 ? Math.round((window.scrollY / denom) * 100) : 0;
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
      trackTimeOnPage("lp_shape", Math.round((Date.now() - mountTime.current) / 1000));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  const ctaHref = `/${locale}/lp/checkout?source=lp_${VARIANT}`;

  const handleHeroSlotSelect = (slot: Slot) => {
    trackSlotSelect(VARIANT, slot.id, slot.remaining, "lp_hero");
    window.location.href = `/${locale}/lp/checkout?source=lp_${VARIANT}&slot=${slot.id}`;
  };

  // ─── Pain-specific content (Hebrew + English) ───────────────────
  const headline = isHe
    ? "להיכנס לכושר ולהתחטב — בלי חדר כושר, בלי דיאטה, בלי לשנוא את זה"
    : "Get In Shape — Without the Gym, Without a Diet, Without Hating It";

  const lossSub = isHe
    ? "כל שבוע שעובר בלי שינוי — זה עוד שבוע שתסתכל/י על התמונה הזו ותגיד/י 'אולי בחודש הבא'."
    : "Every week without change is another week you'll look at that photo and say 'maybe next month.'";

  const outcomeBullets = isHe
    ? [
        { title: "שורפים ~500 קלוריות לשיעור", desc: "פעמיים בשבוע = שריפה אמיתית, בלי הצורך לסבול במכשיר ריצה." },
        { title: "שריר מוגדר תוך 4 שבועות", desc: "כתפיים, זרועות, ליבה. הגוף שלך נושא אדם אחר — זה הופך אותך לחזק/ה." },
        { title: "באמת באים לשיעור הבא", desc: "כי זה כיף. וכשבא לך — אתה מצליח. זה למה זה עובד כשחדר הכושר לא עבד." },
      ]
    : [
        { title: "~500 calories per session", desc: "Twice a week = real fat-loss pace. No treadmill suffering required." },
        { title: "Lean muscle in 4 weeks", desc: "Shoulders, arms, core. Your body lifts another human — that makes you strong." },
        { title: "You actually keep coming", desc: "Because it's fun. And when you want to come, you stick with it. That's why this works when the gym didn't." },
      ];

  const testimonials = isHe
    ? [
        { quote: "הגעתי בשביל לרזות. ירדתי 6 ק״ג ב-3 חודשים בלי לעשות דיאטה אחת. הגוף שלי נראה אחרת לגמרי.", name: "מאיה, 32, ת״א" },
        { quote: "בן 38, ניסיתי את כל סוגי האימונים. רק כאן הצלחתי להחזיק יותר מחודש. הכתפיים והגב חזקים כמו שלא היו.", name: "אסף, 38, רמת גן" },
        { quote: "החברות שלי לא מאמינות לתמונות. תוך 5 שבועות. בלי דיאטה.", name: "ענת, 29, ת״א" },
      ]
    : [
        { quote: "Came to lose weight. Lost 6kg in 3 months without a single diet. My body looks completely different.", name: "Maya, 32, Tel Aviv" },
        { quote: "38, tried every workout style. This is the only one I stuck with past month one. Shoulders + back stronger than ever.", name: "Asaf, 38, Ramat Gan" },
        { quote: "My friends don't believe the photos. Within 5 weeks. No diet.", name: "Anat, 29, Tel Aviv" },
      ];

  const faqs = isHe
    ? [
        { q: "ניסיתי חדר כושר וזה לא עבד — איך זה שונה?", a: "כי אקרו זה לא מכשיר ולא חזרות. זה משחק עם בן אדם אחר, וזה למה אנשים חוזרים שוב ושוב. 96% מסיימים את המסלול." },
        { q: "כמה ק״ג אפשר באמת לרדת?", a: "אנשים שלנו יורדים 3-7 ק״ג ב-3 חודשים בממוצע — בלי דיאטה, רק מהאימונים. תוצאות תלויות אדם." },
        { q: "אני מתחיל/ה לגמרי. זה בשבילי?", a: "כן. 80% מהמשתתפים מתחילים מאפס מוחלט. השיעור הראשון נבנה למתחילים." },
        { q: "צריך פרטנר?", a: "לא. 60% מגיעים לבד. מסתובבים ועובדים עם כולם." },
        { q: "מה אם אני מפספס/ת שיעור?", a: "אפשר להשלים בשיעור אחר באותו שבוע. גמישות מובנית." },
        { q: "מה אם זה לא בשבילי?", a: "אחרי השיעור הראשון, אם זה לא מתחבר — החזר כספי מלא תוך 48 שעות. סיכון אפס." },
      ]
    : [
        { q: "I tried the gym and quit. Why is this different?", a: "Because acro isn't reps or machines. It's play with another human — that's why people keep coming. 96% complete the pack." },
        { q: "How much weight can I actually lose?", a: "Our people drop 3-7 kg in 3 months on average — no diet, just the workouts. Results vary." },
        { q: "I'm a complete beginner. Is this for me?", a: "Yes. 80% start from zero. Class 1 is built for total beginners." },
        { q: "Do I need a partner?", a: "No. 60% come alone. You rotate and work with everyone." },
        { q: "What if I miss a class?", a: "Make it up in another class that week. Flexible by design." },
        { q: "What if it's not for me?", a: "After class 1, if it doesn't click — full refund within 48 hours. Zero risk." },
      ];

  return (
    <div className="w-[100vw] relative left-1/2 right-1/2 -mx-[50vw] -mt-8 -mb-8 overflow-x-hidden">
      {/* ── 1. HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b-2 border-neutral-800 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div dir={isHe ? "rtl" : "ltr"}>
              <div className="inline-block mb-4 border-2 border-brand bg-brand/10 px-3 py-1.5">
                <span className="text-brand font-black text-xs uppercase tracking-widest">
                  {isHe ? "מסלול היכרות · 3 שיעורים · 149 ₪" : "Intro Pack · 3 Classes · ₪149"}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.05] mb-4">
                {headline}
              </h1>

              <p className="text-base md:text-lg text-gray-400 max-w-lg mb-6 leading-relaxed">
                {lossSub}
              </p>

              {/* Earliest slot widget */}
              <div className="mb-4">
                <SlotCapacityWidget locale={locale} onSelect={handleHeroSlotSelect} />
              </div>

              {/* Primary CTA */}
              <Link
                href={ctaHref}
                onClick={() => trackLpCtaClick(VARIANT, "hero")}
                className="btn-press group inline-flex items-center justify-center gap-3 bg-brand text-black px-8 py-5 md:px-12 md:py-6 text-xl md:text-2xl font-black uppercase tracking-wide border-[4px] border-neutral-800 hover:translate-x-1 hover:translate-y-1 transition-transform shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
              >
                <span>{isHe ? `אני בפנים — ${PRICE_ILS} ₪` : `I'm In — Claim My Spot ₪${PRICE_ILS}`}</span>
                <svg viewBox="0 0 24 24" className="h-6 w-6 rtl:rotate-180" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </Link>

              <div className="mt-3">
                <MoneyBackBadge locale={locale} variant="compact" />
              </div>

              {/* Objection killers */}
              <div className="flex flex-wrap gap-3 mt-5">
                {(isHe
                  ? ["לא גמישים? לא צריך", "בלי פרטנר? נזווג אתכם", "0 פציעות ב-527 בוגרים"]
                  : ["Not flexible? No need", "No partner? We pair you", "0 injuries in 527 grads"]
                ).map((tag, i) => (
                  <span key={i} className="text-xs text-neutral-400 border border-neutral-700 px-2 py-1">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero photo placeholder — pain-tagged photo goes here */}
            <div className="hidden lg:flex justify-center relative">
              <div className="relative z-10 w-full max-w-md aspect-[9/16] border-[3px] border-brand bg-black overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-900/50 via-black to-pink-700/30 flex items-center justify-center">
                  <span className="text-neutral-500 text-sm">
                    [hero photo: /lp-photos/shape/hero.jpg]
                  </span>
                </div>
                <span className="absolute top-4 start-4 bg-white text-black font-black px-2 py-1 text-[10px] tracking-widest uppercase">
                  {isHe ? "מהדורה 2026" : "Edition 2026"}
                </span>
              </div>
              <div className="absolute -z-10 top-8 end-8 w-full max-w-md aspect-[9/16] border-2 border-brand" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 1b. REELS ───────────────────────────────────────────── */}
      <ReelsCarousel />

      {/* ── 2. SOCIAL PROOF BAR ──────────────────────────────────── */}
      <section className="border-b-2 border-neutral-800 py-12 px-6 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-0 text-center" dir={isHe ? "rtl" : "ltr"}>
          {[
            { value: "527", label: isHe ? "בוגרים" : "Graduates" },
            { value: "96%", label: isHe ? "מסיימים" : "Completion" },
            { value: "4.9", label: isHe ? "דירוג" : "Rating" },
            { value: "0", label: isHe ? "פציעות" : "Injuries" },
          ].map((stat, i) => (
            <div key={i} className={`py-6 md:py-0 ${i > 0 ? (isHe ? "border-e-2 border-neutral-800" : "border-s-2 border-neutral-800") : ""}`}>
              <div className="text-4xl md:text-5xl font-black text-brand mb-2">{stat.value}</div>
              <div className="text-sm font-bold text-white uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. OUTCOME BULLETS ──────────────────────────────────── */}
      <section className="py-16 px-6 bg-[#0a0a0a]" dir={isHe ? "rtl" : "ltr"}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-10 text-center">
            {isHe ? "מה תקבל/י תוך 4 שבועות" : "What you'll get in 4 weeks"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {outcomeBullets.map((b, i) => (
              <div key={i} className="border-2 border-neutral-700 bg-neutral-900 p-6">
                <div className="text-brand text-2xl font-black mb-2">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="text-xl font-black mb-2">{b.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. TESTIMONIALS ────────────────────────────────────── */}
      <section className="py-16 px-6 bg-neutral-950 border-y-2 border-neutral-800" dir={isHe ? "rtl" : "ltr"}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-10 text-center">
            {isHe ? "אנשים אמיתיים, תוצאות אמיתיות" : "Real people, real results"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <figure key={i} className="border-2 border-neutral-700 bg-neutral-900 p-6">
                <blockquote className="text-sm text-gray-200 mb-3 leading-relaxed">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="text-xs text-brand font-bold uppercase tracking-widest">{t.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. HOW IT WORKS ────────────────────────────────────── */}
      <section className="py-16 px-6 bg-[#0a0a0a]" dir={isHe ? "rtl" : "ltr"}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-10 text-center">
            {isHe ? "איך זה עובד" : "How it works"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(isHe
              ? [
                  { t: "01. משלמים 149 ₪", d: "תשלום חד-פעמי. ללא התחייבות. סיכון אפס." },
                  { t: "02. בוחרים שיעור ראשון", d: "מבין 6 מועדים שבועיים. מקבלים אישור ב-WhatsApp." },
                  { t: "03. מגיעים, טסים", d: "90 דקות. בלי ניסיון. בלי פרטנר. בלי לחץ." },
                ]
              : [
                  { t: "01. Pay ₪149", d: "One-time. No commitment. Zero risk." },
                  { t: "02. Pick your first class", d: "6 weekly slots. WhatsApp confirmation." },
                  { t: "03. Show up, fly", d: "90 minutes. No experience. No partner. No pressure." },
                ]
            ).map((s, i) => (
              <div key={i} className="border-2 border-neutral-700 bg-neutral-900 p-6">
                <div className="text-xl font-black mb-2">{s.t}</div>
                <p className="text-sm text-gray-400 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. OFFER BOX ──────────────────────────────────────── */}
      <section className="py-16 px-6 bg-brand" dir={isHe ? "rtl" : "ltr"}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-5xl font-black text-black mb-3">
              {isHe ? "אז למה לחכות חודש נוסף?" : "Why wait another month?"}
            </h2>
            <p className="text-black/80 font-bold">
              {isHe ? "התחילו השבוע. ראו את התוצאות בעצמכם." : "Start this week. See for yourself."}
            </p>
          </div>
          <IntroPackOffer locale={locale} source={`lp_${VARIANT}`} ctaLocation="offer_box" />
        </div>
      </section>

      {/* ── 7. FAQ ────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-[#0a0a0a]" dir={isHe ? "rtl" : "ltr"}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-10 text-center">
            {isHe ? "שאלות נפוצות" : "Common questions"}
          </h2>
          <div className="space-y-3">
            {faqs.map((item, i) => (
              <details key={i} className="border-2 border-neutral-700 bg-neutral-900 p-4 group">
                <summary className="font-black cursor-pointer text-base list-none flex items-center justify-between gap-3">
                  <span>{item.q}</span>
                  <span className="text-brand text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-gray-400 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. FINAL CTA ──────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#0a0a0a] border-t-2 border-neutral-800" dir={isHe ? "rtl" : "ltr"}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            {isHe ? "סיכון אפס. תוצאות אמיתיות." : "Zero risk. Real results."}
          </h2>
          <p className="text-gray-400 mb-8">
            {isHe
              ? "אחרי השיעור הראשון, אם זה לא בשבילך — החזר כספי מלא תוך 48 שעות."
              : "After class 1, if it's not for you — full refund within 48 hours."}
          </p>
          <Link
            href={ctaHref}
            onClick={() => trackLpCtaClick(VARIANT, "final")}
            className="btn-press inline-flex items-center justify-center gap-3 bg-brand text-black px-10 py-5 text-xl font-black uppercase tracking-wide border-[4px] border-neutral-800 hover:translate-x-1 hover:translate-y-1 transition-transform shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
          >
            {isHe ? `אני בפנים — ${PRICE_ILS} ₪` : `I'm In — Claim My Spot ₪${PRICE_ILS}`}
            <svg viewBox="0 0 24 24" className="h-6 w-6 rtl:rotate-180" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </Link>
          <p className="mt-6 text-xs text-neutral-500">
            {isHe ? "שאלות? וואטסאפ ל-054-4280347" : "Questions? WhatsApp 054-4280347"}
          </p>
        </div>
      </section>
    </div>
  );
}
