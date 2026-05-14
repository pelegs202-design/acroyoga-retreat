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

const VARIANT = "reset" as const;
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

export default function ResetLanding({ locale }: { locale: string }) {
  const isHe = locale === "he";
  const mountTime = useRef(Date.now());
  const scrollMilestones = useRef(new Set<number>());

  useEffect(() => {
    trackLpView(VARIANT);

    try {
      sessionStorage.setItem(
        "lp_test_meta",
        JSON.stringify({ lpVariant: VARIANT, lpPath: "direct" }),
      );
    } catch { /* ignore */ }

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
      trackTimeOnPage("lp_reset", Math.round((Date.now() - mountTime.current) / 1000));
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

  // ─── Pain-specific content (burnout / mental reset) ───
  const headline = isHe
    ? "שעה וחצי שבהן הראש נכבה — והעולם מחכה בחוץ"
    : "90 Minutes Where Your Head Shuts Off — and the World Waits Outside";

  const lossSub = isHe
    ? "כמה זמן עבר מאז שהיה לך שעה וחצי שבהן באמת לא חשבת על כלום?"
    : "How long since you had 90 minutes where you really didn't think about anything?";

  const outcomeBullets = isHe
    ? [
        { title: "הראש נכבה — בעל-כורחו", desc: "אי-אפשר לחשוב על האימייל כשאת/ה הפוך/ה באוויר. נוכחות בכפיה." },
        { title: "מערכת עצבים שמתאזנת", desc: "מגע + אמון של בן אדם אחר מרגיע את העצבים יותר מכל שיעור יוגה רגיל." },
        { title: "48 שעות אחרי, אתה אחר/ת", desc: "הכתפיים לא בגובה האוזניים. השינה עמוקה יותר. החיוך חוזר." },
      ]
    : [
        { title: "Your head shuts off — by force", desc: "You can't think about email when you're upside down in the air. Forced presence." },
        { title: "Nervous system regulates", desc: "Touch + trust with another person calms the nerves more than any regular yoga class." },
        { title: "48 hours later, you're different", desc: "Shoulders aren't at your ears. Sleep is deeper. The smile is back." },
      ];

  const testimonials = isHe
    ? [
        { quote: "בתקופה הזו הייתי צריכה משהו שיחזיר לי שפיות. שעה וחצי שאני לא חושבת על כלום חוץ מלעוף.", name: "נועה, 29, ת״א" },
        { quote: "אני באה מהיי-טק, 12 שעות מסך ביום. אקרו זה הדבר היחיד שמשבית לי את הראש. תרפיה אמיתית.", name: "שירה, 33, רמת גן" },
        { quote: "אחרי שיעור אני ישן עמוק כמו שלא ישנתי שנים. כתפיים פתוחות, ראש שקט.", name: "אורי, 36, ת״א" },
      ]
    : [
        { quote: "I needed something to keep me sane. 90 minutes where I think about nothing except flying.", name: "Noa, 29, Tel Aviv" },
        { quote: "I'm in tech, 12 hours of screens a day. Acro is the only thing that shuts my head off. Real therapy.", name: "Shira, 33, Ramat Gan" },
        { quote: "After a class I sleep deep like I haven't in years. Open shoulders, quiet head.", name: "Uri, 36, Tel Aviv" },
      ];

  const faqs = isHe
    ? [
        { q: "זה כמו טיפול?", a: "לא. זה לא תרפיה ואין דיבור על רגשות. אבל ההשפעה הרגשית — לצאת קליל, להירדם טוב יותר — מורגשת מהשיעור הראשון." },
        { q: "אני מותש/ת אחרי העבודה. יהיה לי כוח?", a: "כן. זה לא חדר כושר. זה משחק עם אנשים. רוב האנשים מגיעים מותשים ויוצאים עם יותר אנרגיה ממה שנכנסו." },
        { q: "אני לא גמיש/ה ואין לי ניסיון. זה לא בשבילי, נכון?", a: "להפך. השיעור הראשון בנוי בדיוק לך. 80% מתחילים מאפס." },
        { q: "האם זה רומנטי / זוגי?", a: "לא בכלל. זה אקטיביות פלטונית עם פרטנרים מתחלפים. רוב האנשים מגיעים לבד ויוצרים חברויות חדשות." },
        { q: "מה אם אני לא רוצה לגעת באנשים זרים?", a: "המגע באקרו הוא מבני ומכוון — לא חיבוקים. המורים מסבירים בדיוק איפה ולמה. רוב האנשים מתרגלים בשיעור הראשון." },
        { q: "מה אם זה לא בשבילי?", a: "אחרי השיעור הראשון, אם זה לא מתחבר — החזר כספי מלא תוך 48 שעות. סיכון אפס." },
      ]
    : [
        { q: "Is this like therapy?", a: "No. Not therapy and no talking about feelings. But the emotional effect — leaving light, sleeping better — is felt from class 1." },
        { q: "I'm wiped after work. Will I have energy?", a: "Yes. This isn't the gym. It's play with people. Most arrive exhausted and leave with more energy than they came with." },
        { q: "I'm not flexible and have no experience. This isn't for me, right?", a: "Opposite. Class 1 is built for exactly you. 80% start from zero." },
        { q: "Is this romantic / couples?", a: "Not at all. It's a platonic activity with rotating partners. Most people come alone and make new friends." },
        { q: "What if I don't want to touch strangers?", a: "The touch in acro is structural and intentional — not hugs. Teachers explain exactly where and why. Most people get used to it in class 1." },
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

              <div className="mb-4">
                <SlotCapacityWidget locale={locale} onSelect={handleHeroSlotSelect} />
              </div>

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

              <div className="flex flex-wrap gap-3 mt-5">
                {(isHe
                  ? ["בלי טלפון 90 דקות", "בלי ניסיון", "0 פציעות ב-527 בוגרים"]
                  : ["No phone for 90 min", "No experience needed", "0 injuries in 527 grads"]
                ).map((tag, i) => (
                  <span key={i} className="text-xs text-neutral-400 border border-neutral-700 px-2 py-1">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="hidden lg:flex justify-center relative">
              <div className="relative z-10 w-full max-w-md aspect-[9/16] border-[3px] border-brand bg-black overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-900/50 via-black to-violet-700/30 flex items-center justify-center">
                  <span className="text-neutral-500 text-sm">
                    [hero photo: /lp-photos/reset/hero.jpg]
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
            {isHe ? "מה תקבל/י תוך 3 שיעורים" : "What you'll get in 3 classes"}
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
            {isHe ? "אנשים אמיתיים, ראש שקט" : "Real people, quiet minds"}
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
                  { t: "03. מגיעים, מתנתקים", d: "90 דקות. בלי טלפון. בלי לחשוב. רק לעוף." },
                ]
              : [
                  { t: "01. Pay ₪149", d: "One-time. No commitment. Zero risk." },
                  { t: "02. Pick your first class", d: "6 weekly slots. WhatsApp confirmation." },
                  { t: "03. Show up, disconnect", d: "90 minutes. No phone. No thinking. Just fly." },
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
              {isHe ? "השבוע הזה עבר. גם הבא יעבור." : "This week passed. So will next."}
            </h2>
            <p className="text-black/80 font-bold">
              {isHe ? "תן/י לעצמך 90 דקות שלקחים שלך." : "Give yourself 90 minutes that belong to you."}
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
            {isHe ? "סיכון אפס. ראש שקט." : "Zero risk. A quiet mind."}
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
