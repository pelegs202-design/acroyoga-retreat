"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { trackCheckoutPaymentDetected, trackLpPurchase, type LpVariant, type LpPath } from "@/lib/quiz/quiz-analytics";

// add-to-calendar uses browser APIs only — must be client-only
const AddToCalendarButton = dynamic(
  () => import("add-to-calendar-button-react").then((m) => m.AddToCalendarButton),
  { ssr: false },
);

interface SuccessFlowProps {
  locale: string;
  paymentSessionId: string;
}

interface BookingInfo {
  slotDate: string;
  slotLabelHe: string;
  slotLabelEn: string;
  slotLocation: string;
  leadName: string;
  lpVariant: LpVariant | null;
  lpPath: LpPath;
  amountPaid: number;
}

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_DURATION_MS = 30_000;
const PRICE_ILS = 149;

export default function SuccessFlow({ locale, paymentSessionId }: SuccessFlowProps) {
  const isHe = locale === "he";
  const [phase, setPhase] = useState<"polling" | "paid" | "timeout">("polling");
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [purchaseFiredFor, setPurchaseFiredFor] = useState<string | null>(null);

  // ─── Poll until paid or timeout ──────────────────────────────
  useEffect(() => {
    if (phase !== "polling") return;
    let cancelled = false;
    const start = Date.now();

    const tick = async () => {
      if (cancelled) return;
      try {
        const res = await fetch(`/api/payments/intro-pack/status?session=${encodeURIComponent(paymentSessionId)}`);
        const data = await res.json().catch(() => ({}));
        if (data.paid) {
          if (!cancelled) setPhase("paid");
          return;
        }
      } catch { /* swallow */ }
      if (cancelled) return;
      if (Date.now() - start >= POLL_MAX_DURATION_MS) {
        if (!cancelled) setPhase("timeout");
        return;
      }
      setTimeout(tick, POLL_INTERVAL_MS);
    };

    tick();
    return () => {
      cancelled = true;
    };
  }, [phase, paymentSessionId]);

  // ─── Once paid, fetch booking details from admin endpoint? No — admin only.
  // Use a dedicated public endpoint or skip; we have what we need from polling.
  // For now we fire the client purchase event and show a static success block.
  useEffect(() => {
    if (phase !== "paid") return;
    if (purchaseFiredFor === paymentSessionId) return;

    // We don't have lpVariant/lpPath available client-side without an extra fetch.
    // CAPI Purchase is already fired server-side with those tags. Fire GA4 + Pixel +
    // PostHog Purchase with the variant we can derive from referrer/session storage
    // (best-effort; CAPI is the source of truth).
    let variant: LpVariant | null = null;
    let path: LpPath = "direct";
    try {
      const stored = sessionStorage.getItem("lp_test_meta");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.lpVariant) variant = parsed.lpVariant as LpVariant;
        if (parsed.lpPath) path = parsed.lpPath as LpPath;
      }
    } catch { /* ignore */ }

    trackCheckoutPaymentDetected(variant, path);
    trackLpPurchase(variant, path, PRICE_ILS, paymentSessionId);
    setPurchaseFiredFor(paymentSessionId);
  }, [phase, paymentSessionId, purchaseFiredFor]);

  // ─── Render ───────────────────────────────────────────────────
  if (phase === "polling") {
    return (
      <div className="mx-auto max-w-xl py-12 text-center" dir={isHe ? "rtl" : "ltr"}>
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-black" />
        <p className="mt-6 text-lg font-bold">
          {isHe ? "מאמתים את התשלום..." : "Confirming your payment..."}
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          {isHe ? "אל תסגור/י את החלון, זה ייקח כמה שניות." : "Don't close this window, it takes a few seconds."}
        </p>
      </div>
    );
  }

  if (phase === "timeout") {
    return (
      <div className="mx-auto max-w-xl py-12" dir={isHe ? "rtl" : "ltr"}>
        <h1 className="text-2xl font-black">
          {isHe ? "התשלום עוד לא אומת" : "Payment not yet confirmed"}
        </h1>
        <p className="mt-4 text-sm text-neutral-700">
          {isHe
            ? "אם התשלום עבר, נשלח לך אישור ב-WhatsApp תוך שעה. המקום שלך שמור."
            : "If your payment went through, we'll WhatsApp you confirmation within an hour. Your seat is held."}
        </p>
        <a
          href={`https://wa.me/972544280347?text=${encodeURIComponent("התשלום שלי לא אומת — payment session " + paymentSessionId)}`}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block rounded-xl bg-black px-6 py-3 font-black text-white"
        >
          {isHe ? "פנה אלינו ב-WhatsApp" : "Message us on WhatsApp"}
        </a>
      </div>
    );
  }

  // phase === "paid"
  return (
    <div className="mx-auto max-w-xl py-10" dir={isHe ? "rtl" : "ltr"}>
      <div className="rounded-2xl border-4 border-black bg-white p-6">
        <div className="text-5xl">🎉</div>
        <h1 className="mt-2 text-3xl font-black">
          {isHe ? "סגרת את המקום!" : "You're in!"}
        </h1>
        <p className="mt-2 text-neutral-700">
          {isHe
            ? "שלחנו לך את כל הפרטים ב-WhatsApp. נתראה בשיעור."
            : "We've sent you the full details on WhatsApp. See you in class."}
        </p>

        <ul className="mt-6 space-y-2 text-sm text-neutral-800">
          <li>{isHe ? "✓ הגיע/י 10 דקות לפני השיעור" : "✓ Arrive 10 minutes before class"}</li>
          <li>{isHe ? "✓ בגדים נוחים, בקבוק מים" : "✓ Comfortable clothes, water bottle"}</li>
          <li>{isHe ? "✓ אין צורך בניסיון או בפרטנר" : "✓ No experience or partner needed"}</li>
        </ul>

        <a
          href={`https://wa.me/972544280347?text=${encodeURIComponent(isHe ? "שלום, נרשמתי לשיעור ראשון" : "Hi, I just registered for my first class")}`}
          target="_blank"
          rel="noreferrer"
          className="mt-6 block w-full rounded-xl bg-emerald-600 px-6 py-3 text-center font-black text-white hover:opacity-90"
        >
          {isHe ? "שלח/י לנו WhatsApp" : "Message us on WhatsApp"}
        </a>

        {booking && (
          <div className="mt-4">
            <AddToCalendarButton
              name={isHe ? "אקרוחבורה — שיעור ראשון" : "AcroHavura — first class"}
              location={booking.slotLocation}
              startDate={booking.slotDate.split("T")[0]}
              startTime={booking.slotDate.slice(11, 16)}
              endTime="20:00"
              timeZone="Asia/Jerusalem"
              options={["Apple", "Google", "iCal"]}
            />
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-neutral-500">
        {isHe ? "שאלות? וואטסאפ ל-054-4280347" : "Questions? WhatsApp 054-4280347"}
      </p>
    </div>
  );
}
