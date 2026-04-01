"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

const ROLES = ["base", "flyer", "both"] as const;
const LEVELS = ["beginner", "intermediate", "advanced"] as const;

type Props = {
  city?: string;
  role?: string;
  level?: string;
};

export default function MemberFilters({ city, role, level }: Props) {
  const t = useTranslations("members");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* City text filter */}
          <div className="flex-1">
            <label className="sr-only">{t("filterCity")}</label>
            <input
              type="text"
              defaultValue={city ?? ""}
              placeholder={t("searchPlaceholder")}
              onChange={(e) => {
                const v = e.target.value.trim();
                updateFilter("city", v || undefined);
              }}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          {/* Role segmented buttons */}
          <div className="flex items-center gap-1">
            <span className="me-1 text-xs text-neutral-500">{t("filterRole")}</span>
            <button
              onClick={() => updateFilter("role", undefined)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                !role
                  ? "bg-brand text-brand-foreground"
                  : "border border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
              }`}
            >
              {t("filterAll")}
            </button>
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => updateFilter("role", r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  role === r
                    ? "bg-brand text-brand-foreground"
                    : "border border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Level segmented buttons */}
          <div className="flex items-center gap-1">
            <span className="me-1 text-xs text-neutral-500">{t("filterLevel")}</span>
            <button
              onClick={() => updateFilter("level", undefined)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                !level
                  ? "bg-brand text-brand-foreground"
                  : "border border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
              }`}
            >
              {t("filterAll")}
            </button>
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => updateFilter("level", l)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  level === l
                    ? "bg-brand text-brand-foreground"
                    : "border border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
