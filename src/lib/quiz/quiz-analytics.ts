/**
 * Quiz analytics event helpers.
 * GA4 measurement ID: G-BCPEPDR543
 * Meta Pixel ID: 1646755465782002
 *
 * Both gtag and fbq are loaded via script tags (added in a later plan).
 * Guards use typeof window to avoid SSR errors.
 */

declare global {
  function gtag(command: string, action: string, params?: Record<string, unknown>): void;
  function fbq(command: string, eventName: string, params?: Record<string, unknown>): void;
}

export function trackQuizStart(quizType: string, sessionId: string): void {
  if (typeof window === "undefined") return;

  if (typeof gtag === "function") {
    gtag("event", "quiz_start", {
      quiz_type: quizType,
      session_id: sessionId,
    });
  }

  if (typeof fbq === "function") {
    fbq("trackCustom", "QuizStart", {
      quiz_type: quizType,
      session_id: sessionId,
    });
  }
}

export function trackQuizStep(
  stepName: string,
  questionId: string,
  answer: string,
): void {
  if (typeof window === "undefined") return;

  if (typeof gtag === "function") {
    gtag("event", "quiz_step", {
      step_name: stepName,
      question_id: questionId,
      answer,
    });
  }

  if (typeof fbq === "function") {
    fbq("trackCustom", "QuizStep", {
      step_name: stepName,
      question_id: questionId,
      answer,
    });
  }
}

export function trackQuizComplete(quizType: string, resultType: string): void {
  if (typeof window === "undefined") return;

  if (typeof gtag === "function") {
    gtag("event", "quiz_complete", {
      quiz_type: quizType,
      result_type: resultType,
    });
  }

  if (typeof fbq === "function") {
    fbq("trackCustom", "QuizComplete", {
      quiz_type: quizType,
      result_type: resultType,
    });
    // Standard Lead event
    fbq("track", "Lead", {
      quiz_type: quizType,
    });
  }
}
