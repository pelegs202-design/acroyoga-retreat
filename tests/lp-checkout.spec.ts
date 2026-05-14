import { test, expect } from "@playwright/test";

/**
 * Smoke + flow tests for the paid intro-pack split test (`/lp/*`).
 *
 * Covers:
 *  - All three LPs render with their pain-specific Hebrew headlines
 *  - The slot widget on each LP fetches /api/lp/slots and links to checkout
 *  - The /lp/checkout page accepts ?slot= and shows the chosen slot
 *  - The MoneyBackBadge appears (risk-reversal placement)
 *  - The free-trial sticky CTA is suppressed on /lp/* (regression guard)
 *
 * Out of scope (manual / sandbox-creds-only):
 *  - Submitting the form (would hit GI API and redirect away)
 *  - Polling the success page (requires real payment)
 */

const LP_VARIANTS = [
  {
    slug: "shape",
    heHeadline: "להיכנס לכושר",
    enHeadline: "Get In Shape",
  },
  {
    slug: "flex",
    heHeadline: "תפסיק/י לכאוב מהמחשב",
    enHeadline: "Stop Hurting From Your Desk",
  },
  {
    slug: "reset",
    heHeadline: "שעה וחצי שבהן הראש נכבה",
    enHeadline: "90 Minutes Where Your Head Shuts Off",
  },
] as const;

test.describe("LP — landing pages render", () => {
  for (const variant of LP_VARIANTS) {
    test(`/he/lp/${variant.slug} renders pain-specific headline + 149 ₪ CTA`, async ({ page }) => {
      await page.goto(`/he/lp/${variant.slug}`);
      await page.waitForLoadState("networkidle");

      // Pain-specific headline (h1 starts with the variant's Hebrew copy)
      await expect(page.locator("h1").first()).toContainText(variant.heHeadline);

      // Price + first-person CTA appear (CTA is repeated in multiple places — getByText returns all)
      await expect(page.getByText("אני בפנים").first()).toBeVisible();
      await expect(page.getByText("149 ₪").first()).toBeVisible();

      // Risk-reversal badge ("zero risk")
      await expect(page.getByText("סיכון אפס").first()).toBeVisible();

      // 3-class intro pack eyebrow above the headline
      await expect(page.getByText("מסלול היכרות").first()).toBeVisible();
    });

    test(`/en/lp/${variant.slug} renders English headline + ₪149 CTA`, async ({ page }) => {
      await page.goto(`/en/lp/${variant.slug}`);
      await page.waitForLoadState("networkidle");

      await expect(page.locator("h1").first()).toContainText(variant.enHeadline);
      await expect(page.getByText("I'm In").first()).toBeVisible();
      await expect(page.getByText("Zero Risk").first()).toBeVisible();
    });
  }
});

test.describe("LP — slot widget", () => {
  test("/api/lp/slots returns a list with capacity remaining", async ({ request }) => {
    const res = await request.get("/api/lp/slots");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.slots)).toBe(true);
    if (body.slots.length > 0) {
      const slot = body.slots[0];
      expect(typeof slot.id).toBe("string");
      expect(typeof slot.date).toBe("string");
      expect(typeof slot.capacity).toBe("number");
      expect(typeof slot.remaining).toBe("number");
      expect(slot.capacity).toBeGreaterThan(0);
      expect(slot.remaining).toBeLessThanOrEqual(slot.capacity);
    }
  });

  test("/he/lp/shape renders the slot widget and clicking it builds a checkout link", async ({ page }) => {
    await page.goto("/he/lp/shape");
    await page.waitForLoadState("networkidle");

    // Wait for the slot widget to finish loading (its text is "X מקומות נשארו")
    const slotButton = page.getByRole("button", { name: /מקומות נשארו/ }).first();
    await expect(slotButton).toBeVisible({ timeout: 10000 });

    // Verify clicking the slot navigates to /lp/checkout with the slot id
    await Promise.all([
      page.waitForURL(/\/lp\/checkout\?.*slot=.+/, { timeout: 10000 }),
      slotButton.click(),
    ]);

    // The checkout page should show the selected slot + the name+phone form
    await expect(page.getByText("השיעור הראשון", { exact: false }).first()).toBeVisible();
  });
});

test.describe("LP — checkout page accepts a slot", () => {
  test("/he/lp/checkout?source=lp_shape shows the form + slot strip", async ({ page, request }) => {
    // Pick an actually-available slot from the API so the test is deterministic
    const res = await request.get("/api/lp/slots");
    const body = await res.json();
    const slot = body.slots.find((s: { remaining: number }) => s.remaining > 0);
    test.skip(!slot, "No available slots seeded — skipping flow test");

    await page.goto(`/he/lp/checkout?source=lp_shape&slot=${slot.id}`);
    await page.waitForLoadState("networkidle");

    // Form fields visible
    await expect(page.getByLabel(/שם מלא/)).toBeVisible();
    await expect(page.getByLabel(/טלפון/)).toBeVisible();

    // Total price + guarantee
    await expect(page.getByText("₪149").first()).toBeVisible();
    await expect(page.getByText("סיכון אפס", { exact: false }).first()).toBeVisible();

    // Submit button (disabled when name/phone empty, but should be present)
    await expect(page.getByRole("button", { name: /המשך לתשלום/ })).toBeVisible();
  });
});

test.describe("LP — regression guards", () => {
  test("Free-trial sticky CTA is hidden on /lp/* (no link to /quiz from sticky)", async ({ page }) => {
    await page.goto("/he/lp/shape");
    await page.waitForLoadState("networkidle");

    // The sticky CTA points at /quiz with "שיעור ניסיון" text. Confirm it's not present.
    const stickyCta = page.locator('[aria-label*="Quick"]');
    // Either the sticky element doesn't exist at all (the component returns null on /lp/*),
    // or it's not visible. Both are acceptable.
    const count = await stickyCta.count();
    if (count > 0) {
      await expect(stickyCta).toBeHidden();
    }

    // Stronger guard: there should be no link to /quiz from a fixed-position bottom element.
    const quizLinksInFixedFooter = await page.locator('div.fixed >> a[href*="/quiz"]').count();
    expect(quizLinksInFixedFooter).toBe(0);
  });

  test("RTL is set on Hebrew LPs", async ({ page }) => {
    await page.goto("/he/lp/shape");
    await page.waitForLoadState("networkidle");
    // The html element should be dir=rtl on /he/* routes (set by next-intl).
    const dir = await page.locator("html").getAttribute("dir");
    expect(dir).toBe("rtl");
  });
});
