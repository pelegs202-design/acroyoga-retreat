"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

const LEVELS = ["all", "beginner", "intermediate", "advanced"] as const;

function getMinDateTime(): string {
  const now = new Date();
  // datetime-local input requires format: YYYY-MM-DDTHH:MM
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export default function JamForm() {
  const t = useTranslations("jams");
  const router = useRouter();

  const [scheduledAt, setScheduledAt] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState(8);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("all");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/jams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledAt,
          location: location.trim(),
          capacity: Number(capacity),
          level,
          notes: notes.trim() || undefined,
        }),
      });

      if (res.status === 403) {
        setError(t("hostOnly"));
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? t("createError"));
        return;
      }

      // Success — redirect to jam feed
      router.push("/jams");
    } catch {
      setError(t("createError"));
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:border-brand focus:outline-none";
  const labelClass = "block text-sm font-medium text-neutral-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold text-neutral-100">{t("createTitle")}</h1>
      </div>

      {/* Date & Time */}
      <div>
        <label htmlFor="scheduledAt" className={labelClass}>
          {t("date")}
          <span className="ml-1 text-red-400">*</span>
        </label>
        <input
          id="scheduledAt"
          type="datetime-local"
          required
          min={getMinDateTime()}
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className={labelClass}>
          {t("location")}
          <span className="ml-1 text-red-400">*</span>
        </label>
        <input
          id="location"
          type="text"
          required
          maxLength={200}
          placeholder={t("locationPlaceholder")}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Capacity */}
      <div>
        <label htmlFor="capacity" className={labelClass}>
          {t("capacity")}
          <span className="ml-1 text-red-400">*</span>
        </label>
        <input
          id="capacity"
          type="number"
          required
          min={1}
          max={100}
          value={capacity}
          onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
          className={inputClass}
        />
      </div>

      {/* Level */}
      <div>
        <label htmlFor="level" className={labelClass}>
          {t("level")}
          <span className="ml-1 text-red-400">*</span>
        </label>
        <select
          id="level"
          required
          value={level}
          onChange={(e) => setLevel(e.target.value as (typeof LEVELS)[number])}
          className={inputClass}
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l === "all"
                ? t("levelAll")
                : l === "beginner"
                  ? t("levelBeginner")
                  : l === "intermediate"
                    ? t("levelIntermediate")
                    : t("levelAdvanced")}
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className={labelClass}>
          {t("notes")}
        </label>
        <textarea
          id="notes"
          maxLength={500}
          rows={4}
          placeholder={t("notesPlaceholder")}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`${inputClass} resize-none`}
        />
        <p className="mt-1 text-right text-xs text-neutral-500">{notes.length}/500</p>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-red-950 px-4 py-3 text-sm text-red-400">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "..." : t("submit")}
      </button>
    </form>
  );
}
