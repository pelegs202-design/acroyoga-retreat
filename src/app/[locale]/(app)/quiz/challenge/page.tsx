"use client";

import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import QuizEngine from "@/components/quiz/QuizEngine";
import type { QuizState } from "@/components/quiz/QuizEngine";
import { challengeQuestions } from "@/lib/quiz/challenge-questions";
import { calculateResult } from "@/lib/quiz/result-calculator";

function ChallengeQuizFlow() {
  const router = useRouter();
  const locale = useLocale();

  const handleStepAnswer = (sessionId: string, questionId: string, answerId: string) => {
    // Fire-and-forget: do not await — never block the quiz UI
    fetch("/api/quiz/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        quizType: "challenge",
        questionId,
        answer: answerId,
        eventType: "answer",
      }),
    }).catch(() => {
      // Ignore tracking errors silently
    });
  };

  const handleComplete = async (state: QuizState) => {
    if (!state.contactInfo) return;

    const resultType = calculateResult(state.answers).id;
    const city = state.answers["city"] ?? "";

    try {
      await fetch("/api/quiz/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: state.sessionId,
          quizType: "challenge",
          name: state.contactInfo.name,
          email: state.contactInfo.email,
          phone: state.contactInfo.phone,
          answers: JSON.stringify(state.answers),
          resultType,
          city,
        }),
      });
    } catch {
      // Non-blocking — proceed to results even if lead save fails
    }

    // Clear saved quiz progress from localStorage
    try {
      localStorage.removeItem("quiz_challenge_state");
    } catch {
      // Ignore
    }

    router.push(`/quiz/challenge/results?session=${state.sessionId}`);
  };

  return (
    <QuizEngine
      questions={challengeQuestions}
      quizType="challenge"
      onComplete={handleComplete}
      storageKey="quiz_challenge_state"
      locale={locale}
      onStepAnswer={handleStepAnswer}
    />
  );
}

export default function ChallengeQuizPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-16">
      <ChallengeQuizFlow />
    </main>
  );
}
