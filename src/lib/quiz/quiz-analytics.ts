/**
 * Funnel analytics event helpers.
 * GA4 measurement ID: G-BCPEPDR543
 * Meta Pixel ID: 1646755465782002
 *
 * Covers the full funnel: Landing → Quiz → Results → Checkout → Payment
 * All events fire to both GA4 (gtag) and Meta Pixel (fbq).
 */

import { posthog } from "@/lib/posthog";

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

function ph(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    if (posthog && posthog.__loaded) posthog.capture(event, params);
  } catch {
    // swallow — never let analytics kill the caller
  }
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

// ─── Time Tracking ────────────────────────────────────────────────────────────

export function trackTimeOnPage(page: string, seconds: number): void {
  if (seconds < 2) return;
  g("time_on_page", { page, seconds });
  f("TimeOnPage", { page, seconds });
}

// ─── Success Page ────────────────────────────────────────────────────────────

export function trackSuccessPageView(sessionId: string): void {
  g("success_page_view", { session_id: sessionId });
  f("SuccessPageView", { session_id: sessionId });
}

export function trackCalendarAdded(sessionId: string): void {
  g("calendar_added", { session_id: sessionId });
  f("CalendarAdded", { session_id: sessionId });
}

export function trackInstagramFollowed(sessionId: string): void {
  g("instagram_followed", { session_id: sessionId });
  f("InstagramFollowed", { session_id: sessionId });
}

// ─── Error Capture ────────────────────────────────────────────────────────────
// Surfaces silent failures in the quiz that would otherwise leave users on a
// blank screen. Context is a short tag (e.g. "mount", "view-fetch", "boundary").

export function trackQuizError(
  context: string,
  err: unknown,
  meta?: Record<string, unknown>,
): void {
  const e = err as { message?: unknown; name?: unknown; stack?: unknown };
  const payload = {
    context,
    error_name: typeof e?.name === "string" ? e.name : undefined,
    error_message: typeof e?.message === "string" ? e.message : String(err),
    error_stack: typeof e?.stack === "string" ? e.stack.slice(0, 2000) : undefined,
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    ...meta,
  };
  ph("quiz_error", payload);
  g("quiz_error", payload);
  f("QuizError", payload);
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const SOFT_DQ_THRESHOLD = 40;

// ─── LP Split Test (paid intro pack) ──────────────────────────────────────────
// All events carry lp_variant (shape|flex|reset) and, post-checkout-start, lp_path
// (direct|quiz) so the funnel readout at /admin/funnel/lp can isolate per-LP CPA.

export type LpVariant =
  | "shape"
  | "flex"
  | "reset"
  | "fun"
  | "handstand"
  | "tribe"
  | "trust"
  | "control";
export type LpPath = "direct" | "quiz";

export function trackLpView(variant: LpVariant): void {
  const params = { lp_variant: variant };
  g("lp_view", params);
  f("LpView", params);
  ph("lp_view", params);
}

export function trackLpCtaClick(
  variant: LpVariant,
  location:
    | "hero"
    | "offer_box"
    | "final"
    | "sticky"
    | "talk_wa"
    | "talk_tel"
    | "community_wa"
    | "community_ig",
): void {
  const params = { lp_variant: variant, location };
  g("lp_cta_click", params);
  f("LpCtaClick", params);
  ph("lp_cta_click", params);
}

export function trackSlotSelect(
  variant: LpVariant | null,
  slotId: string,
  capacityRemaining: number,
  location: "lp_hero" | "checkout",
): void {
  const params = {
    lp_variant: variant ?? "unknown",
    slot_id: slotId,
    capacity_remaining: capacityRemaining,
    slot_select_location: location,
  };
  g("slot_select", params);
  f("SlotSelect", params);
  ph("slot_select", params);
}

export function trackSlotCapacitySeen(
  variant: LpVariant | null,
  slotId: string,
  capacityRemaining: number,
): void {
  const params = {
    lp_variant: variant ?? "unknown",
    slot_id: slotId,
    capacity_remaining: capacityRemaining,
  };
  ph("slot_capacity_seen", params);
}

export function trackCheckoutStart(variant: LpVariant | null, path: LpPath): void {
  const params = { lp_variant: variant ?? "unknown", lp_path: path };
  g("checkout_start", params);
  f("CheckoutStart", params);
  ph("checkout_start", params);
}

export function trackCheckoutPaymentDetected(variant: LpVariant | null, path: LpPath): void {
  const params = { lp_variant: variant ?? "unknown", lp_path: path };
  ph("checkout_payment_detected", params);
}

/**
 * Client-side purchase signal. CAPI Purchase is fired server-side in
 * /api/payments/intro-pack/status; this fires GA4 + Pixel + PostHog
 * for client-only attribution (e.g. cookie consent, in-app browsers).
 */
export function trackLpPurchase(
  variant: LpVariant | null,
  path: LpPath,
  value: number,
  paymentSessionId: string,
): void {
  const params = {
    lp_variant: variant ?? "unknown",
    lp_path: path,
    value,
    currency: "ILS",
    content_category: "intro_pack",
    transaction_id: paymentSessionId,
  };
  g("purchase", params);
  f("Purchase", params, true); // Pixel standard event
  ph("purchase", params);
}

export function trackRefundRequested(bookingId: string, variant: LpVariant | null): void {
  const params = { booking_id: bookingId, lp_variant: variant ?? "unknown" };
  ph("refund_requested", params);
}
