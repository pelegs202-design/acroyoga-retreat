"use client";

import { useEffect, useMemo, useState } from "react";
import { SlotCapacityWidget } from "@/components/lp/SlotCapacityWidget";
import { MoneyBackBadge } from "@/components/lp/MoneyBackBadge";
import {
  trackCheckoutStart,
  trackSlotSelect,
  type LpVariant,
  type LpPath,
} from "@/lib/quiz/quiz-analytics";

interface Slot {
  id: string;
  date: string;
  capacity: number;
  remaining: number;
  labelHe: string;
  labelEn: string;
  location: string;
}

interface CheckoutFlowProps {
  locale: string;
  initialSlotId?: string;
  source?: string;       // e.g. "lp_shape" or "lp_shape_quiz"
  sessionId?: string;    // quiz-path lead's existing session
  paymentFailed?: boolean;
}

const PRICE_ILS = 149;

function parseSource(source?: string): { lpVariant: LpVariant | null; lpPath: LpPath } {
  if (!source) return { lpVariant: null, lpPath: "direct" };
  const m = source.match(/^lp_(shape|flex|reset)(_quiz)?$/);
  if (!m) return { lpVariant: null, lpPath: "direct" };
  return {
    lpVariant: m[1] as LpVariant,
    lpPath: m[2] ? "quiz" : "direct",
  };
}

export default function CheckoutFlow({
  locale,
  initialSlotId,
  source,
  sessionId,
  paymentFailed,
}: CheckoutFlowProps) {
  const isHe = locale === "he";
  const { lpVariant, lpPath } = useMemo(() => parseSource(source), [source]);

  // Fetch all slots once; pick the chosen one or fall back to picker
  const [allSlots, setAllSlots] = useState<Slot[] | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [picking, setPicking] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackCheckoutStart(lpVariant, lpPath);
  }, [lpVariant, lpPath]);

  useEffect(() => {
    let alive = true;
    fetch("/api/lp/slots")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`status ${r.status}`))))
      .then((data: { slots: Slot[] }) => {
        if (!alive) return;
        setAllSlots(data.slots);
        // Try the slot from URL, else earliest available
        if (initialSlotId) {
          const found = data.slots.find((s) => s.id === initialSlotId && s.remaining > 0);
          if (found) {
            setSelectedSlot(found);
            return;
          }
        }
        const earliest = data.slots.find((s) => s.remaining > 0);
        if (earliest) setSelectedSlot(earliest);
        else setPicking(true);
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : "load failed");
      });
    return () => {
      alive = false;
    };
  }, [initialSlotId]);

  // Try to pre-fill name/phone from a quiz session if provided
  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/quiz/results/${sessionId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.lead?.name) setName(data.lead.name);
        // phone isn't in the public results endpoint — kept blank intentionally
      })
      .catch(() => { /* ignore */ });
  }, [sessionId]);

  const onPickSlot = (s: Slot) => {
    setSelectedSlot(s);
    setPicking(false);
    trackSlotSelect(lpVariant, s.id, s.remaining, "checkout");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (!selectedSlot) {
      setError(isHe ? "בחר/י מקום ראשון" : "Pick a class slot first");
      return;
    }
    if (!name.trim() || !phone.trim()) {
      setError(isHe ? "שם וטלפון נדרשים" : "Name and phone are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/payments/intro-pack/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          name: name.trim(),
          phone: phone.trim(),
          slotId: selectedSlot.id,
          lpVariant,
          lpPath,
          locale,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        setError(data?.error ?? (isHe ? "שגיאה בעיבוד" : "Something went wrong"));
        setSubmitting(false);
        return;
      }
      // Redirect to GI hosted checkout. On success they'll come back to /lp/checkout/success.
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "submit failed");
      setSubmitting(false);
    }
  }

  const slotDate = selectedSlot
    ? new Date(selectedSlot.date).toLocaleString(isHe ? "he-IL" : "en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="mx-auto max-w-xl py-8" dir={isHe ? "rtl" : "ltr"}>
      <h1 className="text-3xl font-black text-black">
        {isHe ? "כמעט שם — השלמת הזמנה" : "Almost there — complete your booking"}
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        {isHe
          ? "תשלום חד-פעמי · 3 שיעורי היכרות · ללא התחייבות"
          : "One-time payment · 3 intro classes · no commitment"}
      </p>

      {paymentFailed && (
        <div className="mt-4 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-sm text-red-900">
          {isHe ? "התשלום הקודם לא הושלם. נסה/י שוב." : "Previous payment didn't complete. Try again."}
        </div>
      )}

      {/* ── Step 1: Slot strip ─────────────────────────────────── */}
      <section className="mt-6 rounded-2xl border-2 border-black bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wide text-neutral-600">
            {isHe ? "שיעור ראשון" : "First class"}
          </p>
          {selectedSlot && (
            <button
              type="button"
              onClick={() => setPicking((p) => !p)}
              className="text-sm font-bold text-blue-700 underline"
            >
              {isHe ? (picking ? "סגור" : "שנה") : (picking ? "Close" : "Change")}
            </button>
          )}
        </div>

        {selectedSlot && !picking && (
          <div className="mt-2">
            <div className="text-lg font-black">
              {isHe ? selectedSlot.labelHe : selectedSlot.labelEn}
            </div>
            <div className="text-sm text-neutral-600">{slotDate}</div>
            <div className="text-sm text-neutral-600">{selectedSlot.location}</div>
            {selectedSlot.remaining <= 3 && (
              <div className="mt-1 text-xs font-semibold text-emerald-700">
                {isHe
                  ? `נשארו רק ${selectedSlot.remaining} מקומות`
                  : `Only ${selectedSlot.remaining} spots left`}
              </div>
            )}
          </div>
        )}

        {(picking || !selectedSlot) && allSlots && (
          <div className="mt-3">
            <SlotCapacityWidget
              locale={locale}
              showAll
              onSelect={onPickSlot}
              selectedId={selectedSlot?.id}
            />
          </div>
        )}
      </section>

      {/* ── Step 2: Name + phone form ─────────────────────────── */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border-2 border-black bg-white p-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-neutral-700">
            {isHe ? "שם מלא" : "Full name"}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className="mt-1 w-full rounded-lg border-2 border-neutral-300 px-3 py-3 text-base focus:border-black focus:outline-none"
            dir={isHe ? "rtl" : "ltr"}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-neutral-700">
            {isHe ? "טלפון (וואטסאפ)" : "Phone (WhatsApp)"}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            autoComplete="tel"
            inputMode="tel"
            placeholder={isHe ? "05X-XXXXXXX" : "+972 5X-XXXXXXX"}
            className="mt-1 w-full rounded-lg border-2 border-neutral-300 px-3 py-3 text-base focus:border-black focus:outline-none"
            dir="ltr"
          />
        </div>

        {error && <p className="text-sm font-semibold text-red-700">{error}</p>}

        <div className="border-t border-neutral-200 pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold uppercase tracking-wide text-neutral-700">
              {isHe ? "סך הכל" : "Total"}
            </span>
            <span className="text-3xl font-black">₪{PRICE_ILS}</span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            {isHe ? "כולל מע״מ · תשלום מאובטח דרך Green Invoice / Morning" : "VAT included · secure payment via Green Invoice / Morning"}
          </p>
          <MoneyBackBadge locale={locale} variant="full" className="mt-3" />
        </div>

        <button
          type="submit"
          disabled={submitting || !selectedSlot}
          className="w-full rounded-xl bg-black px-6 py-4 text-lg font-black text-white transition hover:translate-y-0.5 disabled:opacity-50"
        >
          {submitting
            ? isHe ? "ממתין לתשלום..." : "Loading payment..."
            : isHe ? `המשך לתשלום — ${PRICE_ILS} ₪` : `Continue to payment — ₪${PRICE_ILS}`}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-neutral-500">
        {isHe
          ? "שאלות? וואטסאפ ל-054-4280347"
          : "Questions? WhatsApp 054-4280347"}
      </p>
    </div>
  );
}
