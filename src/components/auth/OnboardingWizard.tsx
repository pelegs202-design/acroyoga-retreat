"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";

type Role = "base" | "flyer" | "both";
type Level = "beginner" | "intermediate" | "advanced";

type Props = {
  locale: string;
};

export default function OnboardingWizard({ locale }: Props) {
  const t = useTranslations("onboarding");
  const currentLocale = useLocale();

  const [step, setStep] = useState(1);
  const totalSteps = 2;

  // Step 1 fields
  const [city, setCity] = useState("");
  const [role, setRole] = useState<Role | null>(null);

  // Step 2 fields
  const [level, setLevel] = useState<Level | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveAndRedirect(override?: { city?: string; role?: Role | null; level?: Level | null }) {
    setIsSubmitting(true);
    setError(null);

    const payload: Record<string, string> = {
      preferredLocale: currentLocale,
    };

    const finalCity = override?.city !== undefined ? override.city : city;
    const finalRole = override?.role !== undefined ? override.role : role;
    const finalLevel = override?.level !== undefined ? override.level : level;

    if (finalCity) payload.city = finalCity;
    if (finalRole) payload.role = finalRole;
    if (finalLevel) payload.level = finalLevel;

    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to save profile");
      }

      window.location.href = `/${currentLocale}/dashboard`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  function handleSkip() {
    // Skip entire wizard — only save locale preference
    saveAndRedirect({ city: "", role: null, level: null });
  }

  function handleStep1Continue() {
    setStep(2);
  }

  function handleStep2Finish() {
    saveAndRedirect();
  }

  const roleOptions: { value: Role; label: string }[] = [
    { value: "base", label: t("roleBase") },
    { value: "flyer", label: t("roleFlyer") },
    { value: "both", label: t("roleBoth") },
  ];

  const levelOptions: { value: Level; label: string }[] = [
    { value: "beginner", label: t("levelBeginner") },
    { value: "intermediate", label: t("levelIntermediate") },
    { value: "advanced", label: t("levelAdvanced") },
  ];

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl">
      {/* Header */}
      <div className="mb-6">
        <p className="mb-1 text-sm text-neutral-500">
          {t("step", { current: step, total: totalSteps })}
        </p>
        <h1 className="text-2xl font-bold text-neutral-100">{t("title")}</h1>
        <p className="mt-1 text-sm text-neutral-400">{t("subtitle")}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
        <div
          className="h-full rounded-full bg-brand transition-all duration-300"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step 1: City + Role */}
      {step === 1 && (
        <div className="space-y-6">
          {/* City */}
          <div>
            <label
              htmlFor="city"
              className="mb-1.5 block text-sm font-medium text-neutral-300"
            >
              {t("city")}
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t("cityPlaceholder")}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
            />
          </div>

          {/* Role */}
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-300">{t("role")}</p>
            <div className="grid grid-cols-3 gap-2">
              {roleOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    role === opt.value
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-500 hover:text-neutral-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleStep1Continue}
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-muted"
            >
              {t("continue")}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-400 transition-colors hover:border-neutral-600 hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("skip")}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Level */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-300">{t("level")}</p>
            <div className="grid grid-cols-3 gap-2">
              {levelOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLevel(opt.value)}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    level === opt.value
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-500 hover:text-neutral-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleStep2Finish}
              disabled={isSubmitting}
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "..." : t("finish")}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-400 transition-colors hover:border-neutral-600 hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("skip")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
