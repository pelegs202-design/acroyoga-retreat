/**
 * Funnel analytics event helpers.
 * GA4 measurement ID: G-BCPEPDR543
 * Meta Pixel ID: 1646755465782002
 *
 * Covers the full funnel: Landing → Quiz → Results → Checkout → Payment
 * All events fire to both GA4 (gtag) and Meta Pixel (fbq).
 */

declare global {
  function gtag(command: string, action: string, params?: Record<string, unknown>): void;
  function fbq(command: string, eventName: string, params?: Record<string, unknown>): void;
}

function g(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (typeof gtag === "function") gtag("event", event, params);
}

function f(event: string, params?: Record<string, unknown>, standard = false) {
  if (typeof window === "undefined") return;
  if (typeof fbq === "function") fbq(standard ? "track" : "trackCustom", event, params);
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export function trackLandingView(): void {
  g("landing_view", { page: "challenge" });
  f("LandingView", { page: "challenge" });
}

export function trackCTAClick(location: string): void {
  g("cta_click", { location, page: "challenge" });
  f("CTAClick", { location, page: "challenge" });
}

export function trackScrollDepth(percent: number): void {
  g("scroll_depth", { percent, page: "challenge" });
  f("ScrollDepth", { percent, page: "challenge" });
}

// ─── Quiz Flow ────────────────────────────────────────────────────────────────

export function trackQuizStart(quizType: string, sessionId: string): void {
  g("quiz_start", { quiz_type: quizType, session_id: sessionId });
  f("QuizStart", { quiz_type: quizType, session_id: sessionId });
}

export function trackQuizStep(stepName: string, questionId: string, answer: string): void {
  g("quiz_step", { step_name: stepName, question_id: questionId, answer });
  f("QuizStep", { step_name: stepName, question_id: questionId, answer });
}

export function trackQuizComplete(quizType: string, resultType: string): void {
  g("quiz_complete", { quiz_type: quizType, result_type: resultType });
  f("QuizComplete", { quiz_type: quizType, result_type: resultType });
  f("Lead", { quiz_type: quizType }, true); // Standard Lead event
}

export function trackQuizAbandoned(quizType: string, lastQuestion: string, sessionId: string): void {
  g("quiz_abandoned", { quiz_type: quizType, last_question: lastQuestion, session_id: sessionId });
  f("QuizAbandoned", { quiz_type: quizType, last_question: lastQuestion });
}

// ─── Results Page ─────────────────────────────────────────────────────────────

export function trackResultsView(archetype: string, fitScore: number): void {
  g("results_view", { archetype, fit_score: fitScore });
  f("ResultsView", { archetype, fit_score: fitScore });
}

export function trackSoftDQ(reason: string, fitScore: number): void {
  g("soft_disqualification", { reason, fit_score: fitScore });
  f("SoftDQ", { reason, fit_score: fitScore });
}

// ─── Free Trial Booking ──────────────────────────────────────────────────────

export function trackCompleteRegistration(sessionId: string, day: string): void {
  g("complete_registration", { session_id: sessionId, day });
  f("CompleteRegistration", { session_id: sessionId, day }, true);
}

// ─── Checkout (legacy — kept for future online payments) ─────────────────────

export function trackCheckoutStarted(sessionId: string): void {
  g("begin_checkout", { session_id: sessionId, value: 1, currency: "ILS" });
  f("InitiateCheckout", { session_id: sessionId, value: 1, currency: "ILS" }, true);
}

export function trackCheckoutAbandoned(sessionId: string, timeSpentSeconds: number): void {
  g("checkout_abandoned", { session_id: sessionId, time_spent: timeSpentSeconds });
  f("CheckoutAbandoned", { session_id: sessionId, time_spent: timeSpentSeconds });
}

// ─── Purchase ─────────────────────────────────────────────────────────────────

export function trackPurchase(sessionId: string): void {
  if (typeof window === "undefined") return;
  const key = `purchase_tracked_${sessionId}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");
  g("purchase", { value: 1, currency: "ILS", transaction_id: sessionId });
  f("Purchase", { value: 1, currency: "ILS" }, true);
}

// ─── Time Tracking ────────────────────────────────────────────────────────────

export function trackTimeOnPage(page: string, seconds: number): void {
  if (seconds < 2) return;
  g("time_on_page", { page, seconds });
  f("TimeOnPage", { page, seconds });
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const SOFT_DQ_THRESHOLD = 40;
