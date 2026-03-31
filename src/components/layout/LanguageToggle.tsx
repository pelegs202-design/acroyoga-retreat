"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react";

export default function LanguageToggle() {
  const locale = useLocale();
  const t = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSwitch(targetLocale: string) {
    startTransition(() => {
      router.replace(pathname, { locale: targetLocale });
    });
  }

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label={t("switchLanguage")}
    >
      <button
        onClick={() => handleSwitch("en")}
        disabled={isPending}
        aria-label="Switch to English"
        aria-pressed={locale === "en"}
        className={`flex h-8 w-8 items-center justify-center rounded text-lg transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
          locale === "en"
            ? "opacity-100 ring-2 ring-white ring-offset-1 ring-offset-neutral-900"
            : "opacity-50 hover:opacity-75"
        }`}
      >
        🇺🇸
      </button>
      <button
        onClick={() => handleSwitch("he")}
        disabled={isPending}
        aria-label="Switch to Hebrew"
        aria-pressed={locale === "he"}
        className={`flex h-8 w-8 items-center justify-center rounded text-lg transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
          locale === "he"
            ? "opacity-100 ring-2 ring-white ring-offset-1 ring-offset-neutral-900"
            : "opacity-50 hover:opacity-75"
        }`}
      >
        🇮🇱
      </button>
    </div>
  );
}
