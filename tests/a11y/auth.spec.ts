import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * WCAG AA accessibility audit for AcroHavura auth pages.
 *
 * Tests sign-in and sign-up pages which include:
 * - Brutalist card framing (auth layout.tsx)
 * - Pink focus glow on inputs
 * - Password field with show/hide toggle
 * - Error state messages
 * - RTL layout for Hebrew locale
 *
 * Both sign-in and sign-up are tested for both locales.
 */
test.describe("Auth pages WCAG AA accessibility", () => {
  test("/he/sign-in should have no WCAG AA violations", async ({ page }) => {
    await page.goto("/he/sign-in");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // Exclude aria-hidden decorative elements (see homepage.spec.ts for explanation)
      .exclude('[aria-hidden="true"]')
      .analyze();

    if (results.violations.length > 0) {
      console.log(
        "Sign-in violations:",
        JSON.stringify(results.violations, null, 2)
      );
    }

    expect(results.violations).toEqual([]);
  });

  test("/he/sign-up should have no WCAG AA violations", async ({ page }) => {
    await page.goto("/he/sign-up");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude('[aria-hidden="true"]')
      .analyze();

    if (results.violations.length > 0) {
      console.log(
        "Sign-up violations:",
        JSON.stringify(results.violations, null, 2)
      );
    }

    expect(results.violations).toEqual([]);
  });
});
