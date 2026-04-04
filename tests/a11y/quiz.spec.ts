import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * WCAG AA accessibility audit for AcroHavura quiz pages.
 *
 * Tests the quiz entry page which includes:
 * - QuizEngine with QuizCard options
 * - QuizProgressBar
 * - ScrollReveal animations (should not affect a11y tree)
 * - RTL layout for Hebrew locale
 */
test.describe("Quiz pages WCAG AA accessibility", () => {
  test("/he/quiz should have no WCAG AA violations", async ({ page }) => {
    await page.goto("/he/quiz");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // Exclude aria-hidden decorative elements (see homepage.spec.ts for explanation)
      .exclude('[aria-hidden="true"]')
      .analyze();

    if (results.violations.length > 0) {
      console.log(
        "Quiz violations:",
        JSON.stringify(results.violations, null, 2)
      );
    }

    expect(results.violations).toEqual([]);
  });

  test("/en/quiz should have no WCAG AA violations", async ({ page }) => {
    await page.goto("/en/quiz");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude('[aria-hidden="true"]')
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
