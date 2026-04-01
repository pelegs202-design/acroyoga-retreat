"use client";

import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import QuizEngine from "@/components/quiz/QuizEngine";
import type { QuizState } from "@/components/quiz/QuizEngine";
import { workshopQuestions } from "@/lib/quiz/workshop-questions";

function WorkshopQuizFlow() {
  const router = useRouter();
  const locale = useLocale();

  const handleStepAnswer = (sessionId: string, questionId: string, answerId: string) => {
    // Fire-and-forget: do not await — never block the quiz UI
    fetch("/api/quiz/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        quizType: "workshop",
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

    // Parse group-details and workshop-details from answers
    // workshop-details answer is stored as JSON string of { preferredDates, specialRequests }
    const workshopDetailsRaw = state.answers["workshop-details"] ?? "{}";
    let preferredDates = "";
    let specialRequests = "";
    try {
      const parsed = JSON.parse(workshopDetailsRaw);
      preferredDates = parsed.preferredDates ?? "";
      specialRequests = parsed.specialRequests ?? "";
    } catch {
      // If it's not JSON, treat it as-is
      preferredDates = workshopDetailsRaw;
    }

    const answers: Record<string, string> = {
      "group-type": state.answers["group-type"] ?? "",
      "group-details": state.answers["group-details"] ?? "",
      "preferred-dates": preferredDates,
      "special-requests": specialRequests,
    };

    try {
      await fetch("/api/quiz/workshop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: state.sessionId,
          name: state.contactInfo.name,
          email: state.contactInfo.email,
          phone: state.contactInfo.phone,
          answers,
        }),
      });
    } catch {
      // Non-blocking — proceed to confirmation even if API fails
    }

    // Clear saved quiz progress from localStorage
    try {
      localStorage.removeItem("quiz_workshop_state");
    } catch {
      // Ignore
    }

    router.push("/quiz/workshop/confirmation");
  };

  return (
    <QuizEngine
      questions={workshopQuestions}
      quizType="workshop"
      onComplete={handleComplete}
      storageKey="quiz_workshop_state"
      locale={locale}
      onStepAnswer={handleStepAnswer}
    />
  );
}

export default function WorkshopQuizPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-16">
      <WorkshopQuizFlow />
    </main>
  );
}
