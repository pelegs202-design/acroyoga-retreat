"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";

type Props = {
  locale: string;
};

export default function TosAcceptance({ locale }: Props) {
  const t = useTranslations("tos");
  const tc = useTranslations("tosContent");
  const currentLocale = useLocale();

  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setIsAccepting(true);
    setError(null);

    try {
      const res = await fetch("/api/user/accept-tos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to accept TOS");
      }

      // Hard navigate to onboarding — ensures server re-checks auth state
      window.location.href = `/${currentLocale}/onboarding`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsAccepting(false);
    }
  }

  function handleDecline() {
    window.location.href = `/${currentLocale}/`;
  }

  const sections = [
    { key: "intro" as const },
    { key: "communityConduct" as const },
    { key: "dataCollection" as const },
    { key: "privacy" as const },
    { key: "accountTermination" as const },
    { key: "acceptance" as const },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/95 px-6 py-4 backdrop-blur-sm">
        <h1 className="text-xl font-bold text-neutral-100">{t("title")}</h1>
      </div>

      {/* Scrollable TOS content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-2xl space-y-8">
          {sections.map(({ key }) => (
            <section key={key}>
              <h2 className="mb-3 text-lg font-semibold text-neutral-100">
                {tc(`${key}.heading`)}
              </h2>
              <p className="text-sm leading-relaxed text-neutral-300">
                {tc(`${key}.body`)}
              </p>
            </section>
          ))}
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div className="sticky bottom-0 border-t border-neutral-800 bg-neutral-950/95 px-6 py-5 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl">
          {error && (
            <div className="mb-4 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            {/* Decline — muted secondary action */}
            <button
              onClick={handleDecline}
              disabled={isAccepting}
              className="rounded-lg border border-neutral-700 bg-transparent px-6 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:border-neutral-600 hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("decline")}
            </button>

            {/* Accept — primary prominent action */}
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              className="rounded-lg bg-brand px-8 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAccepting ? "..." : t("accept")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
