"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import QuizLoader from "@/components/quiz/QuizLoader";
import QuizResultsPage from "@/components/quiz/QuizResultsPage";
import type { ResultArchetype } from "@/lib/quiz/result-calculator";

interface ResultPayload {
  lead: { name: string; city: string | null; quizType: string };
  result: ResultArchetype;
  personalizedFears: Array<{ en: string; he: string }>;
}

interface ChallengeResultsFlowProps {
  sessionId: string;
  locale: string;
}

const STORAGE_KEY_PREFIX = "quiz-challenge-result-";

export default function ChallengeResultsFlow({
  sessionId,
  locale,
}: ChallengeResultsFlowProps) {
  const router = useRouter();
  const [payload, setPayload] = useState<ResultPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaderDone, setLoaderDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Try localStorage first (original quiz taker)
    const storageKey = `${STORAGE_KEY_PREFIX}${sessionId}`;
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached) as ResultPayload;
        setPayload(parsed);
        setLoading(false);
        return;
      }
    } catch {
      // Ignore parse errors
    }

    // 2. Fetch from API
    fetch(`/api/quiz/results/${sessionId}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? "Not found");
        }
        return res.json() as Promise<{ ok: boolean } & ResultPayload>;
      })
      .then((data) => {
        const resultPayload: ResultPayload = {
          lead: data.lead,
          result: data.result,
          personalizedFears: data.personalizedFears,
        };
        setPayload(resultPayload);
        // Cache for future visits
        try {
          localStorage.setItem(storageKey, JSON.stringify(resultPayload));
        } catch {
          // Quota exceeded — ignore
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Session not found");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sessionId]);

  // Not found
  if (!loading && error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <p className="text-neutral-400 text-base mb-6">
          {locale === "he"
            ? "לא נמצאו תוצאות עבור הסשן הזה."
            : "Results not found for this session."}
        </p>
        <button
          type="button"
          onClick={() => router.push("/quiz")}
          className="rounded-xl bg-brand text-white px-6 py-3 font-bold hover:opacity-90 transition-opacity"
        >
          {locale === "he" ? "חזרה לשאלון" : "Back to Quiz"}
        </button>
      </div>
    );
  }

  // Show loader while fetching OR while artificial loader hasn't finished
  const showLoader = loading || !loaderDone;
  const showResults = !loading && !error && payload && loaderDone;

  return (
    <>
      {showLoader && (
        <QuizLoader
          locale={locale}
          onComplete={() => setLoaderDone(true)}
        />
      )}
      {showResults && payload && (
        <QuizResultsPage
          result={payload.result}
          personalizedFears={payload.personalizedFears}
          leadName={payload.lead.name}
          locale={locale}
          sessionId={sessionId}
        />
      )}
    </>
  );
}
