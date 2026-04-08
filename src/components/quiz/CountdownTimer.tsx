"use client";

import { useState, useEffect } from "react";

// Promo expires Sunday April 12, 2026 23:59:59 Israel time
const PROMO_END = new Date("2026-04-12T23:59:59+03:00");

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    function calc() {
      const diff = PROMO_END.getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: false,
      };
    }
    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}

export function CountdownTimer({ locale }: { locale: string }) {
  const { days, hours, minutes, seconds, expired } = useCountdown();
  const he = locale === "he";

  if (expired) return null;

  const units = [
    { value: days, label: he ? "ימים" : "Days" },
    { value: hours, label: he ? "שעות" : "Hours" },
    { value: minutes, label: he ? "דקות" : "Min" },
    { value: seconds, label: he ? "שניות" : "Sec" },
  ];

  return (
    <div className="bg-red-950/40 border-2 border-red-500/50 p-4 text-center">
      <p className="text-red-400 font-black text-sm uppercase tracking-widest mb-3">
        {he ? "המחיר חוזר ל-₪299 בעוד:" : "Price goes back to ₪299 in:"}
      </p>
      <div className="flex justify-center gap-3">
        {units.map((u, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-black text-white tabular-nums">
              {String(u.value).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-red-400/70 uppercase tracking-widest mt-1">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
