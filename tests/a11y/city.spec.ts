import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * WCAG AA accessibility audit for AcroHavura city landing pages.
 *
 * Tests Tel Aviv and Kfar Saba city pages which include:
 * - Brutalist hero section with ScrollReveal
 * - CityJamList with jam session cards
 * - CityFAQ (details/summary accordion — semantic HTML)
 * - JSON-LD FAQPage schema
 */
test.describe("City pages WCAG AA accessibility", () => {
  test("/he/cities/tel-aviv should have no WCAG AA violations", async ({
    page,
  }) => {
    await page.goto("/he/cities/tel-aviv");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // Exclude aria-hidden decorative elements (see homepage.spec.ts for explanation)
      .exclude('[aria-hidden="true"]')
      .analyze();

    if (results.violations.length > 0) {
      console.log(
        "Tel Aviv violations:",
        JSON.stringify(results.violations, null, 2)
      );
    }

    expect(results.violations).toEqual([]);
  });

  test("/he/cities/kfar-saba should have no WCAG AA violations", async ({
    page,
  }) => {
    await page.goto("/he/cities/kfar-saba");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude('[aria-hidden="true"]')
      .analyze();

    if (results.violations.length > 0) {
      console.log(
        "Kfar Saba violations:",
        JSON.stringify(results.violations, null, 2)
      );
    }

    expect(results.violations).toEqual([]);
  });
});
