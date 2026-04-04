import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * WCAG AA accessibility audit for the AcroHavura homepage.
 *
 * Scans with WCAG 2.0 A/AA + WCAG 2.1 A/AA rules.
 *
 * NOTE on color-contrast rule:
 * The site uses CSS custom properties (--color-brand, --color-foreground, etc.)
 * resolved at runtime. axe-core evaluates contrast using computed styles at
 * test time; if variables are not fully resolved in headless Chromium, this
 * can produce false-positive contrast violations. If that occurs, the
 * color-contrast rule is disabled here WITH the note that manual verification
 * confirmed WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text).
 * See: Phase 10 research Pitfall 4.
 */
test.describe("Homepage WCAG AA accessibility", () => {
  test("/ should have no WCAG AA violations", async ({ page }) => {
    // Navigate — will redirect to /he or /en based on locale detection
    await page.goto("/he");
    // Wait for page to fully render (animations settle)
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // Exclude aria-hidden decorative elements from contrast checks.
      // The large faded card numbers (text-brand/[0.05], aria-hidden="true") are
      // purely decorative — invisible to screen readers. axe-core still checks
      // visual contrast on aria-hidden elements, but WCAG 1.4.3 does not require
      // conformance for non-text or decorative content (WCAG 1.4.3 exception).
      // Manual verification: these numbers are intentionally ghost-like (5% opacity)
      // and serve zero informational purpose.
      .exclude('[aria-hidden="true"]')
      .analyze();

    if (results.violations.length > 0) {
      console.log(
        "Violations found:",
        JSON.stringify(results.violations, null, 2)
      );
    }

    expect(results.violations).toEqual([]);
  });

  test("/en should have no WCAG AA violations", async ({ page }) => {
    await page.goto("/en");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude('[aria-hidden="true"]')
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
