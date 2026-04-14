import { test, expect } from "@playwright/test";

/**
 * Regression test for the blank-quiz bug that caused an 83% Q1 drop-off rate.
 *
 * Root cause: `crypto.randomUUID()` throws in Facebook/Instagram in-app
 * browsers and older iOS Safari. Unhandled throw aborted the mount effect in
 * QuizEngine.tsx; `sessionId` stayed empty; `currentQuestionId` stayed empty;
 * the engine rendered `null` (blank screen).
 *
 * Fix: `generateSessionId()` with a Math.random fallback.
 * These tests load the real challenge page with crypto.randomUUID stubbed to
 * throw *before* the page's JS runs, then verify Q1 actually renders.
 */

const Q1_HE = "אם היית יכול/ה לבחור כוח-על אחד — מה זה היה?";
// Hero CTA text on the /he/quiz/challenge landing page (visible on desktop viewport)
const START_QUIZ_BTN = "קבלו מקום בקבוצה הבאה";

test.describe("Quiz engine — sessionId robustness", () => {
  test("Q1 renders even when crypto.randomUUID throws (simulates FB in-app / old iOS)", async ({ page }) => {
    // Kill randomUUID before any script on the page runs.
    await page.addInitScript(() => {
      // @ts-expect-error — deliberately sabotage the API
      Object.defineProperty(globalThis.crypto, "randomUUID", {
        configurable: true,
        value: () => {
          throw new Error("Simulated: randomUUID unavailable in this WebView");
        },
      });
    });

    await page.goto("/he/quiz/challenge");
    await page.waitForLoadState("domcontentloaded");

    // Click "Start the quiz" CTA on the landing page
    await page.getByRole("button", { name: START_QUIZ_BTN }).first().click();

    // Assert Q1 text is visible — this is the key assertion.
    // Before the fix: blank screen (Q1 never rendered).
    // After the fix: Q1 renders via fallback sessionId.
    await expect(page.getByText(Q1_HE, { exact: false })).toBeVisible({
      timeout: 5000,
    });
  });

  test("Q1 renders normally when crypto.randomUUID works (baseline)", async ({ page }) => {
    await page.goto("/he/quiz/challenge");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: START_QUIZ_BTN }).first().click();

    await expect(page.getByText(Q1_HE, { exact: false })).toBeVisible({
      timeout: 5000,
    });
  });

  test("a POST /api/quiz/events view event fires for Q1", async ({ page }) => {
    const viewEvents: Array<{ questionId: string; eventType: string }> = [];

    await page.route("**/api/quiz/events", async (route) => {
      try {
        const body = route.request().postDataJSON() as {
          questionId: string;
          eventType: string;
        };
        if (body?.eventType === "view") {
          viewEvents.push({ questionId: body.questionId, eventType: body.eventType });
        }
      } catch {}
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto("/he/quiz/challenge");
    await page.waitForLoadState("domcontentloaded");
    await page.getByRole("button", { name: START_QUIZ_BTN }).first().click();

    // Wait for Q1 to render — view event is fired via useEffect after mount.
    await expect(page.getByText(Q1_HE, { exact: false })).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(500); // allow useEffect fetch to fire

    expect(viewEvents.length).toBeGreaterThan(0);
    expect(viewEvents[0]?.questionId).toBe("superpower");
  });
});
