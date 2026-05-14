"use client";

import { useEffect, useState } from "react";

interface Slot {
  id: string;
  date: string;
  capacity: number;
  remaining: number;
  labelHe: string;
  labelEn: string;
  location: string;
}

interface SlotCapacityWidgetProps {
  locale: string;
  /** When true, show all upcoming slots; when false (default) show only the earliest available. */
  showAll?: boolean;
  /** Called when user picks a slot. */
  onSelect?: (slot: Slot) => void;
  /** ID of the currently selected slot, when used as a picker. */
  selectedId?: string;
  className?: string;
}

/**
 * Slot capacity widget — fetches live availability from /api/lp/slots.
 *
 * Hero usage (`showAll=false`): shows the earliest available slot with
 * "X מקומות נשארו". Tap → onSelect fires and the parent navigates to
 * checkout with the slot id.
 *
 * Picker usage (`showAll=true`): shows all upcoming slots as buttons,
 * full slots are crossed out and not clickable.
 */
export function SlotCapacityWidget({
  locale,
  showAll = false,
  onSelect,
  selectedId,
  className = "",
}: SlotCapacityWidgetProps) {
  const isHe = locale === "he";
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/lp/slots")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`status ${r.status}`))))
      .then((data: { slots: Slot[] }) => {
        if (alive) setSlots(data.slots);
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : "load failed");
      });
    return () => {
      alive = false;
    };
  }, []);

  if (error) {
    return (
      <p className={`text-sm text-neutral-500 ${className}`} dir={isHe ? "rtl" : "ltr"}>
        {isHe ? "טעינת מקומות נכשלה" : "Failed to load slots"}
      </p>
    );
  }
  if (!slots) {
    return (
      <p className={`text-sm text-neutral-500 ${className}`} dir={isHe ? "rtl" : "ltr"}>
        {isHe ? "טוען מקומות פנויים…" : "Loading slots…"}
      </p>
    );
  }
  if (slots.length === 0) {
    return (
      <p className={`text-sm text-neutral-500 ${className}`} dir={isHe ? "rtl" : "ltr"}>
        {isHe ? "אין מקומות פנויים השבוע" : "No slots available this week"}
      </p>
    );
  }

  // Hero mode: render only the earliest available slot (skip full ones)
  if (!showAll) {
    const earliest = slots.find((s) => s.remaining > 0);
    if (!earliest) {
      return (
        <p className={`text-sm text-neutral-500 ${className}`} dir={isHe ? "rtl" : "ltr"}>
          {isHe ? "השבועיים הקרובים מלאים — מקומות חדשים בכל יום" : "Next two weeks full — new slots open daily"}
        </p>
      );
    }
    return (
      <button
        type="button"
        onClick={() => onSelect?.(earliest)}
        className={`group inline-flex w-full max-w-md items-center justify-between gap-3 rounded-xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-900 transition hover:border-emerald-500 hover:bg-emerald-100 ${className}`}
        dir={isHe ? "rtl" : "ltr"}
      >
        <span className="text-base font-bold">
          {isHe ? earliest.labelHe : earliest.labelEn}
        </span>
        <span className="text-sm font-semibold text-emerald-700">
          {isHe
            ? `${earliest.remaining} מקומות נשארו`
            : `${earliest.remaining} spots left`}
        </span>
      </button>
    );
  }

  // Picker mode: render all upcoming slots
  return (
    <ul className={`space-y-2 ${className}`} dir={isHe ? "rtl" : "ltr"}>
      {slots.map((s) => {
        const full = s.remaining <= 0;
        const isSelected = s.id === selectedId;
        return (
          <li key={s.id}>
            <button
              type="button"
              disabled={full}
              onClick={() => onSelect?.(s)}
              className={
                full
                  ? "w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-left text-neutral-400 line-through"
                  : isSelected
                    ? "w-full rounded-lg border-2 border-emerald-500 bg-emerald-100 px-4 py-3 text-left font-semibold text-emerald-900"
                    : "w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-left hover:border-emerald-400 hover:bg-emerald-50"
              }
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold">{isHe ? s.labelHe : s.labelEn}</span>
                <span className="text-sm text-neutral-600">
                  {full
                    ? isHe ? "מלא" : "Full"
                    : isHe ? `${s.remaining} מקומות` : `${s.remaining} spots`}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-neutral-500">{s.location}</div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
