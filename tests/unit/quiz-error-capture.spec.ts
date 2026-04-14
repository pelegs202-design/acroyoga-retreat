import { test, expect } from "@playwright/test";

/**
 * Exception capture tests — ensure future silent failures reach our analytics.
 *
 * trackQuizError fires to PostHog, GA4 (gtag), and Meta (fbq). These tests
 * stub the Meta pixel (fbq) to a recording function before the page loads,
 * trigger failure modes, and assert a "QuizError" event was recorded with
 * the expected context tag.
 *
 * We stub fbq rather than PostHog because PostHog's outbound request is
 * cross-origin and batched; fbq is a same-origin global we can swap out
 * cleanly.
 */

type FbqCall = [string, string, Record<string, unknown>?];

declare global {
  interface Window {
    __fbqCalls?: FbqCall[];
  }
}

const START_QUIZ_BTN = "קבלו מקום בקבוצה הבאה";
const Q1_HE = "אם היית יכול/ה לבחור כוח-על אחד — מה זה היה?";

async function stubFbq(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    window.__fbqCalls = [];
    const recorder = (...args: unknown[]) => {
      window.__fbqCalls!.push(args as FbqCall);
    };
    (window as unknown as { fbq: unknown }).fbq = recorder;
    // also trap late replacement: redefine the property so the real pixel
    // snippet can't override our recorder
    try {
      Object.defineProperty(window, "fbq", {
        configurable: true,
        get: () => recorder,
        set: () => {},
      });
    } catch {
      // already defined — leave it
    }
  });
}

async function getFbqCalls(page: import("@playwright/test").Page): Promise<FbqCall[]> {
  return await page.evaluate(() => window.__fbqCalls ?? []);
}

test.describe("Quiz error capture", () => {
  test("window 'error' event fires a QuizError to fbq with context=window-error", async ({ page }) => {
    await stubFbq(page);
    await page.goto("/he/quiz/challenge");
    await page.waitForLoadState("domcontentloaded");
    await page.getByRole("button", { name: START_QUIZ_BTN }).first().click();
    await expect(page.getByText(Q1_HE, { exact: false })).toBeVisible({ timeout: 5000 });

    // Fire a synthetic ErrorEvent to simulate an uncaught runtime error.
    await page.evaluate(() => {
      window.dispatchEvent(
        new ErrorEvent("error", {
          message: "synthetic uncaught error",
          filename: "test.js",
          lineno: 1,
          colno: 1,
          error: new Error("synthetic uncaught error"),
        }),
      );
    });

    await page.waitForTimeout(200);

    const calls = await getFbqCalls(page);
    const quizError = calls.find(
      (c) => c[1] === "QuizError" && (c[2] as { context?: string } | undefined)?.context === "window-error",
    );
    expect(quizError, `fbq calls: ${JSON.stringify(calls)}`).toBeDefined();
    const meta = quizError?.[2] as { error_message?: string } | undefined;
    expect(meta?.error_message).toContain("synthetic uncaught error");
  });

  test("unhandledrejection fires a QuizError with context=unhandled-rejection", async ({ page }) => {
    await stubFbq(page);
    await page.goto("/he/quiz/challenge");
    await page.waitForLoadState("domcontentloaded");
    await page.getByRole("button", { name: START_QUIZ_BTN }).first().click();
    await expect(page.getByText(Q1_HE, { exact: false })).toBeVisible({ timeout: 5000 });

    await page.evaluate(() => {
      // Fire the event synchronously so it can't race the test.
      const event = new Event("unhandledrejection") as Event & {
        promise: Promise<unknown>;
        reason: unknown;
      };
      (event as unknown as { promise: Promise<unknown> }).promise = Promise.resolve();
      (event as unknown as { reason: unknown }).reason = new Error("synthetic promise reject");
      window.dispatchEvent(event);
    });

    await page.waitForTimeout(200);

    const calls = await getFbqCalls(page);
    const quizError = calls.find(
      (c) => c[1] === "QuizError" && (c[2] as { context?: string } | undefined)?.context === "unhandled-rejection",
    );
    expect(quizError, `fbq calls: ${JSON.stringify(calls)}`).toBeDefined();
  });
});
