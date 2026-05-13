# Paid Intro Pack Split Test — Implementation Plan

**Date:** 2026-05-14
**Status:** Ready for execution
**Spec:** `docs/superpowers/specs/2026-05-14-paid-intro-pack-split-test-design.md`
**Plan ETA:** 5–7 working days for an experienced engineer who knows the codebase. ~10–14 days with research overhead.

## Goal

Implement three pain-specific landing pages (`/lp/shape`, `/lp/flex`, `/lp/reset`) that share a self-serve ₪149 checkout, with a 10-min soft-hold slot system and a money-back guarantee anchored on attended-class-1, instrumented for an A/B/C ad test.

---

## Corrections to the spec found during codebase research

These do NOT change the design intent. They change vocabulary and implementation details to match reality:

1. **"Morning" = Green Invoice (GI).** The payment vendor in code is Green Invoice; "Morning" is its brand. All new files use `green-invoice` naming (`/api/payments/intro-pack/...` is fine because it sits alongside existing `/api/payments/*`, but internals reference GI).
2. **No iframe — redirect.** The existing flow does NOT embed an iframe. `createCheckoutUrl()` in `src/lib/green-invoice/client.ts` creates a GI document with `successUrl`/`failUrl`, and the user is **redirected** to GI's hosted checkout. Polling happens on the *checkout page before redirect*; the success page is reached via GI's success redirect. Plan uses this pattern.
3. **`leads` table is `quizLeads`.** The canonical lead table is `quizLeads` (keyed by `sessionId`). No new "leads" table; `class_bookings.lead_id` references `quizLeads.id`.
4. **IDs are `text` not `uuid`.** Existing schema uses `text("id").primaryKey()` + `crypto.randomUUID()`. New tables follow.
5. **CAPI helper lacks `content_category`.** `src/lib/facebook-capi.ts` only sends `value`/`currency` in `custom_data`. The plan extends it.

---

## File-by-file changes

### Phase A — Foundation

#### A1. Add `INTRO_PACK_PRICE_ILS` constant
**File to modify:** `C:\acroyoga-academy\src\lib\green-invoice\client.ts:5`
**Change:** Add `export const INTRO_PACK_PRICE_ILS = 149;` next to `CHALLENGE_PRICE_ILS`.
**Why:** Mirrors the existing constant pattern (commit `ff7435f`). All ₪149 references in code use this constant.

#### A2. Add `createIntroPackCheckoutUrl()` to green-invoice client
**File to modify:** `C:\acroyoga-academy\src\lib\green-invoice\client.ts:135` (add new function below `createCheckoutUrl`)
**Change:** New function with the same signature as `createCheckoutUrl` but tuned for ₪149 intro pack:
- `catalogNum: 'INTRO-PACK-3'`
- `description: 'אקרוחבורה — 3 שיעורי היכרות'`
- `price: INTRO_PACK_PRICE_ILS`
- `successUrl` → `/lp/checkout/success?session=${sessionId}`
- `failUrl` → `/lp/checkout?session=${sessionId}&payment=failed`
- `remarks: \`introPackSession:${sessionId}\`` (distinct prefix from `sessionId:` used by challenge)
**Why:** Reuses the existing GI document-creation pattern verbatim. Distinct `remarks` prefix lets the webhook tell which product type a payment is for. Distinct `catalogNum` lets accounting separate revenue.
**Risk:** None — additive, isolated function.

#### A3. Extend CAPI helper to accept `content_category` and custom `lp_variant`
**File to modify:** `C:\acroyoga-academy\src\lib\facebook-capi.ts:21`
**Change:**
- Add `contentCategory?: string` and `lpVariant?: string` to `CAPIEventParams` interface
- In `eventData.custom_data`, set `content_category: params.contentCategory` and `lp_variant: params.lpVariant` when provided
- Update `custom_data` block at `src/lib/facebook-capi.ts:67` so it isn't gated solely on `value`
**Why:** Spec §10.4 requires `content_category='intro_pack'` to disambiguate from legacy free-trial Purchases, and `lp_variant` is the test dimension.
**Risk:** Existing callers don't pass these params → no behavior change for them. Verify by grepping `sendFacebookEvent` callers.

#### A4. New Drizzle tables `classSlots` + `classBookings`
**File to modify:** `C:\acroyoga-academy\src\lib\db\schema.ts` (append at end of "Custom tables" section, before relations)
**Tables (Drizzle TypeScript, following project conventions — `text` ids, integer prices, status as `text`):**

```ts
export const classSlots = pgTable("class_slots", {
  id: text("id").primaryKey(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  capacity: integer("capacity").notNull().default(8),
  labelHe: text("label_he").notNull(),
  labelEn: text("label_en").notNull(),
  location: text("location").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("class_slots_date_idx").on(table.date),
  index("class_slots_active_idx").on(table.active),
]);

export const classBookings = pgTable("class_bookings", {
  id: text("id").primaryKey(),
  slotId: text("slot_id").notNull().references(() => classSlots.id, { onDelete: "restrict" }),
  leadId: text("lead_id").notNull().references(() => quizLeads.id, { onDelete: "cascade" }),
  giDocumentId: text("gi_document_id").unique(),                 // nullable until paid; unique once set
  paymentSessionId: text("payment_session_id").notNull().unique(),
  status: text("status").notNull().default("pending"),           // 'pending'|'paid'|'cancelled'|'refunded'|'completed'
  classesUsed: integer("classes_used").notNull().default(0),
  firstAttendedAt: timestamp("first_attended_at", { withTimezone: true }),
  lpVariant: text("lp_variant"),                                  // 'shape'|'flex'|'reset'  — for funnel reporting
  lpPath: text("lp_path"),                                        // 'direct'|'quiz'
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  refundedAt: timestamp("refunded_at", { withTimezone: true }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("class_bookings_slot_idx").on(table.slotId),
  index("class_bookings_lead_idx").on(table.leadId),
  index("class_bookings_status_idx").on(table.status),
  index("class_bookings_payment_session_idx").on(table.paymentSessionId),
]);
```
**Why:** Matches spec data model with conventions adjusted (text ids, `lpVariant`/`lpPath` carried on the booking itself so analytics survives PostHog ID resets).
**Risk:** Added `lpVariant`/`lpPath` on the booking (not on the spec). They're useful as the durable per-purchase tag; PostHog session data is ephemeral.

#### A5. Generate migration `0005_intro_pack.sql`
**Command:** `npx drizzle-kit generate`
**File to create:** `C:\acroyoga-academy\drizzle\0005_*.sql` (drizzle-kit names it)
**Why:** Existing migration workflow per `drizzle.config.ts`.
**Risk:** Drizzle-kit must match an installed drizzle-kit version that supports current schema syntax. Verify with `npx drizzle-kit --version` first.

#### A6. Seed script for class slots
**File to create:** `C:\acroyoga-academy\scripts\seed-class-slots.mjs`
**Behavior:** Seeds a rolling 4-week window of the 6 weekly slots (Mon 18:30, Mon 19:45, Wed 18:30, Wed 19:45, Fri 13:30, Sat 13:30). Idempotent — checks `(date, active)` before insert.
**Why:** Spec §6.1 calls for a rolling 4-week window seeded on a cron; the cron itself (A11) calls this same logic. Initial seed via script is fastest path.
**Risk:** Day-of-week math + Israel timezone. Use `Date` in UTC and document the offset; runtime is Vercel UTC.

#### A7. New `<MoneyBackBadge>` component
**File to create:** `C:\acroyoga-academy\src\components\lp\MoneyBackBadge.tsx`
**Behavior:** Renders "סיכון אפס · החזר כספי מלא אחרי שיעור 1" / "Zero Risk · Money back after class 1" based on locale prop. Two variants: `compact` (badge-style for hero) and `full` (one-liner for offer box). No state.
**Why:** Used in three places per spec §4.4. Single source of truth for the copy.
**Risk:** None.

#### A8. New `<SlotCapacityWidget>` component (server + client split)
**Files to create:**
- `C:\acroyoga-academy\src\components\lp\SlotCapacityWidget.tsx` — client component that takes a list of slots + capacities and renders the earliest available with "X מקומות נשארו"; crosses out full
- `C:\acroyoga-academy\src\app\api\lp\slots\route.ts` — `GET` returns `{ slots: [{ id, date, capacity, used, labelHe, labelEn, location }] }` for the next 7 active slots
**Behavior:** Capacity calc: `slot.capacity - count(class_bookings where slot_id=X and status in ('pending','paid'))`. Client mounts → fetches once → renders. Includes "Refresh" button for stale views.
**Why:** Spec §4.3 and §5.2.
**Risk:** Race between read and render — acceptable for an LP widget; the authoritative capacity check happens at booking create.

#### A9. New `<IntroPackOffer>` component
**File to create:** `C:\acroyoga-academy\src\components\lp\IntroPackOffer.tsx`
**Behavior:** Composes price "₪149", "3 classes," guarantee badge (`<MoneyBackBadge variant="full"/>`), primary CTA `<button>` that on click fires `lp_cta_click` analytics and links to `/lp/checkout?slot=<earliestSlotId>&source=<source>`. Takes `locale`, `source`, `earliestSlotId` props.
**Why:** Repeated in 3 spots per LP (hero, offer box, final CTA).
**Risk:** None.

#### A10. New API route `POST /api/payments/intro-pack/create`
**File to create:** `C:\acroyoga-academy\src\app\api\payments\intro-pack\create\route.ts`
**Inputs (JSON body):** `{ sessionId, name, phone, slotId, lpVariant, lpPath, locale }`
**Behavior:**
1. Validate slotId exists + active in `classSlots`
2. Capacity check (`status IN ('pending','paid')`) — reject if full
3. Upsert `quizLeads` row (name + phone + new sessionId if absent; existing if quiz path)
4. Insert `classBookings` row with `status='pending'`, `expiresAt=now()+10min`, the `lpVariant`/`lpPath`, fresh `paymentSessionId = crypto.randomUUID()`
5. Call `createIntroPackCheckoutUrl({...})` → returns GI hosted-checkout URL
6. Fire CAPI `InitiateCheckout` with `contentCategory='intro_pack'`, `lpVariant`
7. Return `{ ok: true, url, paymentSessionId, expiresAt }`
**Why:** Mirrors `src/app/api/payments/checkout/route.ts` shape; this is the dynamic GI version (not the fixed-URL legacy free-trial pattern).
**Risk:** GI API failures must NOT leave dangling `pending` rows — wrap in try/catch and roll back booking row on GI failure.

#### A11. New API route `GET /api/payments/intro-pack/status?session=<paymentSessionId>`
**File to create:** `C:\acroyoga-academy\src\app\api\payments\intro-pack\status\route.ts`
**Behavior:**
1. Look up booking by `paymentSessionId`
2. If `status='paid'` → return `{ paid: true }`
3. If `expiresAt < now` and `status='pending'`:
   - Check capacity. If still has room → renew hold (extend `expiresAt`) and continue. Else return `{ paid: false, expired: true }`.
4. Call `checkNewPaymentSince(booking.createdAt)` — same primitive as legacy
5. If detected: update booking `status='paid'`, `giDocumentId=<doc.id>`, `paidAt=<doc.createdAt>`, fire CAPI `Purchase` with `contentCategory='intro_pack'`, `lpVariant`, return `{ paid: true }`
6. Else `{ paid: false }`
**Why:** Mirrors `src/app/api/payments/status/route.ts:8` polling pattern. Hold-renewal at §6.2 of the spec.
**Risk:** GI's `documents/search` is the same one the legacy poller uses. If both poll at the same time, **both could match the same doc**. Mitigation: query GI for doc whose `remarks` starts with `introPackSession:<paymentSessionId>` — not by date alone. **REQUIRES extending `checkNewPaymentSince` to optionally filter by `remarks` substring, or matching on the client side after fetching.** New function: `checkPaymentByRemarks(remarks: string)` in `green-invoice/client.ts`. Add as A12.

#### A12. New helper `checkPaymentByRemarks()` in green-invoice client
**File to modify:** `C:\acroyoga-academy\src\lib\green-invoice\client.ts:118`
**Change:** New exported function that queries `/documents/search` (recent window, e.g. last 15 minutes) and filters items where `remarks` matches the provided string. Returns the matched doc or null.
**Why:** Decouples intro-pack matching from challenge matching; prevents cross-product attribution bugs.
**Risk:** Requires that GI returns `remarks` in the search response. Verify against GI sandbox before coding. If not returned, fallback: filter by `amount === 149 && createdAt > since`.

#### A13. New cron `GET /api/cron/intro-pack-holds` (soft-hold expiration)
**File to create:** `C:\acroyoga-academy\src\app\api\cron\intro-pack-holds\route.ts`
**Behavior:** Same Bearer-auth pattern as `jam-reminders` (`CRON_SECRET`). Updates all `classBookings` where `status='pending' AND expiresAt < now()` → `status='cancelled'`.
**Schedule:** Every 5 minutes — add to `vercel.json` as `{ "path": "/api/cron/intro-pack-holds", "schedule": "*/5 * * * *" }`
**Why:** Spec §6.2.
**Risk:** Vercel cron minimum on Hobby is daily; **on Pro is 1-minute granularity**. Confirm plan supports 5-min granularity before scheduling. Fallback: 15-min granularity.

#### A14. New cron `GET /api/cron/seed-class-slots` (rolling 4-week window)
**File to create:** `C:\acroyoga-academy\src\app\api\cron\seed-class-slots\route.ts`
**Behavior:** Reuses logic from A6 — adds slots for the upcoming 4 weeks if not present. Runs daily.
**Schedule:** `{ "path": "/api/cron/seed-class-slots", "schedule": "0 3 * * *" }` (3 AM UTC = 6 AM IL)
**Why:** Keeps the slot table fresh without manual reseeding.
**Risk:** Idempotency must be airtight (key on `date`).

#### A15. New admin endpoint `POST /api/admin/bookings/mark-attended`
**File to create:** `C:\acroyoga-academy\src\app\api\admin\bookings\mark-attended\route.ts`
**Behavior:** Use `getAdminSession()` from `src/lib/admin-guard.ts:13`. Inputs: `{ bookingId, attendedAt? }`. Sets `firstAttendedAt = attendedAt ?? now()` and increments `classesUsed`. Writes to `adminAuditLog`.
**Why:** Spec §8.5 launch blocker.
**Risk:** None.

#### A16. New admin endpoint `POST /api/admin/refunds/issue`
**File to create:** `C:\acroyoga-academy\src\app\api\admin\refunds\issue\route.ts`
**Behavior:**
1. Admin guard
2. Lookup booking by id
3. Validate booking is refund-eligible: `firstAttendedAt` set, `now() <= firstAttendedAt + 48h`, `status='paid'`
4. Set `status='refunded'`, `refundedAt=now()`
5. Send PostHog event `refund_issued` (server-side via `posthog-node` — TBD whether installed; if not, skip and let admin UI log it client-side)
6. Write `adminAuditLog`
7. Return result. The actual money refund stays manual in Morning's UI per spec §8.4 step 4 (TBD if GI API supports refunds — verify, future enhancement)
**Why:** Spec §8.4.
**Risk:** Doesn't actually refund money — requires manual GI/Morning action. The endpoint accurately captures the policy decision; ops handles the money. Acceptable per spec.

#### A17. New admin endpoint `GET /api/admin/bookings`
**File to create:** `C:\acroyoga-academy\src\app\api\admin\bookings\route.ts`
**Behavior:** Admin guard. Query params: `slotId`, `status`, `dateFrom`, `dateTo`, `refundEligible=true`. Returns list with joined `quizLeads` name/phone.
**Why:** Spec §9.1.
**Risk:** None.

#### A18. New admin page `/admin/bookings`
**Files to create:**
- `C:\acroyoga-academy\src\app\[locale]\(app)\admin\bookings\page.tsx` — Server component, calls A17
- `C:\acroyoga-academy\src\app\[locale]\(app)\admin\bookings\BookingsTable.tsx` — Client component with inline buttons for "mark attended" + "issue refund"
**Why:** Spec §9.2.
**Risk:** Confirm `(app)/admin/...` route group is admin-guarded at layout level — check `src/app/[locale]/(app)/admin/funnel/page.tsx` for the pattern.

#### A19. New admin page `/admin/funnel/lp` (skeleton)
**File to create:** `C:\acroyoga-academy\src\app\[locale]\(app)\admin\funnel\lp\page.tsx`
**Behavior:** Server component. Renders table from `GET /api/admin/funnel/lp` (created in D2). Skeleton in Phase A; populated in Phase D.
**Why:** Spec §10.2.

#### A20. New daily ops digest cron (extends existing `email-drip` pattern)
**File to create:** `C:\acroyoga-academy\src\app\api\cron\bookings-digest\route.ts`
**Behavior:** Lists yesterday's classes' bookings needing `firstAttendedAt`. Lists refund-eligible bookings (in 48h window). Sends one email to admin via existing Resend helper (see `src/lib/email/`).
**Schedule:** `{ "path": "/api/cron/bookings-digest", "schedule": "0 6 * * *" }`
**Why:** Spec §9.3 — prevents attendance-marking drift.
**Risk:** None.

### Phase B — Checkout flow

#### B1. New page `/lp/checkout`
**Files to create:**
- `C:\acroyoga-academy\src\app\[locale]\(public)\lp\checkout\page.tsx` (server component)
- `C:\acroyoga-academy\src\app\[locale]\(public)\lp\checkout\CheckoutFlow.tsx` (client component)
**Behavior:**
- Server `page.tsx` reads `searchParams: Promise<{ session?: string; slot?: string; source?: string; payment?: string }>` (note Next.js 16 Promise pattern). Looks up slot, hands client component the prefilled slot data.
- Client `CheckoutFlow.tsx`:
  1. Slot strip with "שנה" → opens `<SlotCapacityWidget>` modal for re-selection
  2. Name + WhatsApp phone form (pre-filled from `quizLeads` if `session` param exists)
  3. On submit → `POST /api/payments/intro-pack/create` → on success, `window.location = data.url` (GI hosted page)
  4. Below: Bit/PayBox affordance — for now, a placeholder block "תשלום ב-Bit? עדיין בפיתוח, אנא השתמש/י בכרטיס אשראי" until A2 verified to expose those options (see open items)
  5. Inline `<MoneyBackBadge variant="full"/>`
  6. Fires `checkout_start` analytics on mount with `lpVariant`/`lpPath` from URL params
- **Polling note:** Real-time polling is unnecessary on this page because users are redirected away. Polling logic lives on the success-page flow instead, in case the GI success redirect was missed (e.g., user closed tab).
**Why:** Spec §7.1.
**Risk:** RTL on phone input; verify `dir="rtl"` on Hebrew locale.

#### B2. New page `/lp/checkout/success`
**Files to create:**
- `C:\acroyoga-academy\src\app\[locale]\(public)\lp\checkout\success\page.tsx`
- `C:\acroyoga-academy\src\app\[locale]\(public)\lp\checkout\success\SuccessFlow.tsx`
**Behavior:**
- Server page reads `searchParams: Promise<{ session?: string }>` (the `paymentSessionId`)
- Client `SuccessFlow.tsx`:
  1. On mount, poll `GET /api/payments/intro-pack/status?session=<paymentSessionId>` every 3s for up to 30s (timeout shorter than checkout-page polling because we're post-GI-redirect; payment should already be detected)
  2. When paid: render confirmation, add-to-calendar (dynamic import of `add-to-calendar-button-react` — same pattern as `SuccessContent.tsx:11`), what-to-bring, click-to-WhatsApp, soft account creation
  3. Fire CAPI `Purchase` is fired SERVER-SIDE by the status endpoint; client only fires GA4 `purchase` + PostHog `purchase`
  4. If polling times out: show "We'll confirm by WhatsApp within 1 hour" + admin notification trigger (via existing `gmail-notify` lib)
**Why:** Spec §7.4.
**Risk:** Add-to-calendar SSR-disabled per existing pattern. Reuse, don't reinvent.

#### B3. Playwright E2E test for checkout
**File to create:** `C:\acroyoga-academy\tests\lp-checkout.spec.ts`
**Behavior:** Tests the happy-path: pick slot → submit name+phone → land on GI (mock or sandbox) → success page reachable with valid session.
**Why:** Existing `playwright.config.ts` indicates Playwright is the test framework.
**Risk:** Real GI integration test needs sandbox creds (`GI_SANDBOX=true` per `green-invoice/client.ts:1`).

### Phase C — Three landing pages (parallel)

For each pain, two locales × per-pain copy. Files mirror each other; only content differs.

#### C1. `/lp/shape` (B1 — weight/body composition)
**Files to create:**
- `C:\acroyoga-academy\src\app\[locale]\(public)\lp\shape\page.tsx` (server component — sets metadata, locale)
- `C:\acroyoga-academy\src\app\[locale]\(public)\lp\shape\ShapeLanding.tsx` (client component)
- Translation keys added to `messages/he.json` and `messages/en.json` under namespace `lp.shape.*`:
  - headline, subhead (loss-framed), 3 outcome bullets, FAQs (6 — 2 pain-specific), testimonial picks (3 ids referencing existing testimonials in `src/lib/testimonials.ts`)
**Behavior:**
- Hero cluster above the fold: hero photo, headline, loss-subhead, `<SlotCapacityWidget>`, first-person CTA "אני בפנים — 149 ₪", `<MoneyBackBadge variant="compact"/>`
- Then: 3 outcome bullets, `<ReelsCarousel>` (existing — uses hardcoded shortcodes for now; future: pain-tagged reels)
- 3 photo testimonials, "How it works" (3 steps), `<IntroPackOffer>`, collapsible quiz affordance, FAQ, final CTA + `<IntroPackOffer>`
- Layout breaks out of the `[locale]/(public)/layout.tsx` `max-w-7xl` wrapper for hero (per challenge page pattern from commit `5c1835e`)
- Fires `lp_view` on mount; tracks scroll depth + time on page via existing helpers from `quiz-analytics.ts`
**Why:** Spec §3.1 + §3.2 + §3.3.
**Risk:** RTL hero layout; verify Hebrew typography line-height matches the brand on mobile.

#### C2. `/lp/flex` (B2 — flexibility / desk pain)
Same structure as C1, content under `lp.flex.*`.

#### C3. `/lp/reset` (M1 — burnout / mental reset)
Same structure as C1, content under `lp.reset.*`.

**Shared component for C1–C3:** consider extracting `<PainLandingShell>` to deduplicate the skeleton. **Decision: skip extraction for now.** The spec explicitly chose Approach 1 (hand-tuned) over Approach 2 (templated). After the test ends and one LP wins, deduplicate then.

### Phase D — Instrumentation

#### D1. Extend `quiz-analytics.ts` with LP events
**File to modify:** `C:\acroyoga-academy\src\lib\quiz\quiz-analytics.ts`
**Add functions:**
- `trackLpView(variant: 'shape'|'flex'|'reset')`
- `trackLpCtaClick(variant, location: 'hero'|'offer_box'|'final')`
- `trackSlotSelect(variant, slotId, capacityRemaining, location: 'lp_hero'|'checkout')`
- `trackSlotCapacitySeen(variant, slotId, capacityRemaining)`
- `trackCheckoutStart(variant, path: 'direct'|'quiz')`
- `trackCheckoutPaymentDetected(variant, path)`
- `trackPurchase(variant, path, value)` — fires GA4 `purchase`, Pixel `Purchase` (custom payload), PostHog `purchase`. CAPI Purchase is server-side from A11.
- `trackRefundRequested(bookingId, variant)`
**Why:** Single source of truth for the LP funnel events; mirrors existing per-quiz helpers.
**Risk:** PostHog `lp_path` semantics — set at `trackCheckoutStart` only.

#### D2. New API route `GET /api/admin/funnel/lp`
**File to create:** `C:\acroyoga-academy\src\app\api\admin\funnel\lp\route.ts`
**Behavior:** Admin guard. Returns aggregated counts per `lpVariant` from `classBookings` (rows are durable; PostHog isn't needed for the SQL view): `views` (from PostHog API — need creds, defer to v2; for v1 leave as `null` placeholder), `purchase` count (status='paid' OR 'refunded' OR 'completed'), `refund` count (status='refunded'), `attendance` count (`firstAttendedAt IS NOT NULL`). CPL/CPA come from ad-spend-per-LP — manual input field on the admin page for v1.
**Why:** Spec §10.2.
**Risk:** PostHog query API needs an API key; defer to v2 enhancement. v1 uses DB-derived metrics + manual ad spend entry.

#### D3. Wire the admin funnel page (A19) to D2
**File to modify:** `C:\acroyoga-academy\src\app\[locale]\(app)\admin\funnel\lp\page.tsx`
**Change:** Fetch from D2 endpoint, render table with `recharts` bars per variant. Manual ad-spend input field per LP (saved to a new `ad_spend` table or env var — decision: env var for v1, table for v2).
**Why:** Spec §10.2.

#### D4. Audit legacy free-trial Purchase event
**File to modify:** `C:\acroyoga-academy\src\app\api\payments\status\route.ts:77`
**Change:** Add `contentCategory='free_trial'` to the existing legacy `sendFacebookEvent` Purchase call so Meta can separate the two product flows. The free-trial funnel still fires `Purchase` (the user pays 99₪ for the challenge; not "free" — re-reading the code, the legacy free trial is actually a paid challenge for 99₪ via Morning sale-page, and the spec's earlier "Purchase on free booking" interpretation was wrong. Confirm in §12.2.)
**Why:** Spec §12.2 risk. **Re-confirm during execution** because the spec assumed the legacy Purchase fired on a free trial. The code shows it fires on a real ₪99 payment — so the risk is "two paid products competing for the same Purchase event optimization." Mitigation via `content_category` stands.
**Risk:** Changing Meta event semantics mid-flight could disrupt running ad sets. Roll this out together with the new LPs, not before.

#### D5. Verify Meta Pixel dedupe with new events
**Manual step.** Test that `event_id` from CAPI matches `eventID` from Pixel for each LP purchase. Add to Phase E checklist.

### Phase E — Photos & go-live prep

#### E1. Add `public/lp-photos/{shape,flex,reset}/` folders
**Files to create:** placeholder photos initially; final photos sourced from Shay/photoshoot.
**Behavior:** Each pain has 4–6 photos referenced by LP code.
**Why:** Spec §3.3.
**Risk:** Generic photos == weak LP. Defer LP launch until real photos exist per pain.

#### E2. VAT verification in Morning/GI
**Manual step.** Confirm `vatType: 1` on the GI document (VAT-inclusive) — already set in `createCheckoutUrl` body; mirror in `createIntroPackCheckoutUrl`.
**Why:** Spec §12.2 risk.

#### E3. Operational dry-run script
**File to create:** `C:\acroyoga-academy\scripts\dry-run-intro-pack.mjs`
**Behavior:** Walks through book → pay (sandbox) → mark-attended → refund-issue. Validates DB state at each step.
**Why:** Spec §11 Phase E checklist.

#### E4. Meta Ads setup
**Manual step.** Three ad sets, one per LP, with UTM params per spec §10.4. Budget caps per spec §10.3.

### Phase F — Launch & monitor

Operational — daily check on `/admin/funnel/lp`. Apply early-cut rule per spec §10.3.

---

## Reuse — explicit list

- `createCheckoutUrl()` pattern → `createIntroPackCheckoutUrl()` (A2)
- `checkNewPaymentSince()` pattern → `checkPaymentByRemarks()` (A12)
- `sendFacebookEvent()` (extended in A3)
- `getAdminSession()` (used in A15, A16, A17, D2)
- Cron Bearer-auth pattern from `src/app/api/cron/jam-reminders/route.ts:32`
- PostHog client from `src/lib/posthog.ts`
- `quiz-analytics.ts` event helpers (extended in D1)
- `add-to-calendar-button-react` dynamic-import pattern from `SuccessContent.tsx:11`
- `quizLeads` table for the lead record
- `adminAuditLog` for audit trails
- `next-intl` translation message bundles
- Drizzle migration workflow per `drizzle.config.ts`

## New files summary

```
src/lib/green-invoice/client.ts                                   (modified — A1, A2, A12)
src/lib/facebook-capi.ts                                          (modified — A3)
src/lib/db/schema.ts                                              (modified — A4)
drizzle/0005_*.sql                                                (generated — A5)
scripts/seed-class-slots.mjs                                      (created — A6)
scripts/dry-run-intro-pack.mjs                                    (created — E3)

src/components/lp/MoneyBackBadge.tsx                              (A7)
src/components/lp/SlotCapacityWidget.tsx                          (A8)
src/components/lp/IntroPackOffer.tsx                              (A9)

src/app/api/lp/slots/route.ts                                     (A8)
src/app/api/payments/intro-pack/create/route.ts                   (A10)
src/app/api/payments/intro-pack/status/route.ts                   (A11)
src/app/api/cron/intro-pack-holds/route.ts                        (A13)
src/app/api/cron/seed-class-slots/route.ts                        (A14)
src/app/api/cron/bookings-digest/route.ts                         (A20)
src/app/api/admin/bookings/route.ts                               (A17)
src/app/api/admin/bookings/mark-attended/route.ts                 (A15)
src/app/api/admin/refunds/issue/route.ts                          (A16)
src/app/api/admin/funnel/lp/route.ts                              (D2)

src/app/[locale]/(public)/lp/shape/page.tsx                       (C1)
src/app/[locale]/(public)/lp/shape/ShapeLanding.tsx               (C1)
src/app/[locale]/(public)/lp/flex/page.tsx                        (C2)
src/app/[locale]/(public)/lp/flex/FlexLanding.tsx                 (C2)
src/app/[locale]/(public)/lp/reset/page.tsx                       (C3)
src/app/[locale]/(public)/lp/reset/ResetLanding.tsx               (C3)
src/app/[locale]/(public)/lp/checkout/page.tsx                    (B1)
src/app/[locale]/(public)/lp/checkout/CheckoutFlow.tsx            (B1)
src/app/[locale]/(public)/lp/checkout/success/page.tsx            (B2)
src/app/[locale]/(public)/lp/checkout/success/SuccessFlow.tsx     (B2)
src/app/[locale]/(app)/admin/bookings/page.tsx                    (A18)
src/app/[locale]/(app)/admin/bookings/BookingsTable.tsx           (A18)
src/app/[locale]/(app)/admin/funnel/lp/page.tsx                   (A19/D3)

src/lib/quiz/quiz-analytics.ts                                    (modified — D1)
messages/he.json, messages/en.json                                (modified — C1, C2, C3 — add lp.* namespaces)
vercel.json                                                       (modified — A13, A14, A20 cron entries)
public/lp-photos/{shape,flex,reset}/                              (E1 — assets)

tests/lp-checkout.spec.ts                                         (B3)
```

---

## Task breakdown — ordered

### Wave 1 (sequential — foundation)
1. **A1, A2, A3, A12** — extend `green-invoice/client.ts` + `facebook-capi.ts`. Type-only changes + new functions. Single PR. (1 hour)
2. **A4** — add `classSlots` + `classBookings` to schema. (30 min)
3. **A5** — run drizzle-kit generate; review the SQL. (15 min)
4. **A6** — write seed script + run against Neon dev branch. (45 min)

### Wave 2 (parallelizable — components, API, admin)
5. **A7** — `<MoneyBackBadge>`. (20 min)
6. **A8** — `<SlotCapacityWidget>` + `/api/lp/slots`. (1.5 hours)
7. **A9** — `<IntroPackOffer>`. (45 min)
8. **A10** — `/api/payments/intro-pack/create`. Depends on A2, A4. (1.5 hours)
9. **A11** — `/api/payments/intro-pack/status`. Depends on A12, A4. (1.5 hours)
10. **A13** — soft-hold cron. (30 min)
11. **A14** — slot-seeding cron (reuses A6 logic). (30 min)
12. **A15, A16, A17** — admin endpoints. Depends on A4. (1.5 hours combined)
13. **A18** — admin `/admin/bookings` page. Depends on A15, A16, A17. (2 hours)
14. **A19** — admin funnel page skeleton. (30 min)
15. **A20** — daily ops digest cron. (1 hour)

### Wave 3 (sequential — checkout + verification)
16. **B1** — `/lp/checkout` page. Depends on A8, A9, A10. (3 hours)
17. **B2** — `/lp/checkout/success` page. Depends on A11. (2 hours)
18. **B3** — Playwright E2E. Depends on B1, B2. (1.5 hours)

### Wave 4 (parallelizable — LPs + instrumentation)
19. **C1** — `/lp/shape`. Depends on A7, A8, A9. (3 hours including copy)
20. **C2** — `/lp/flex`. (3 hours)
21. **C3** — `/lp/reset`. (3 hours)
22. **D1** — extend `quiz-analytics.ts`. (1 hour)
23. **D2** — admin funnel API. (1.5 hours)
24. **D3** — wire admin funnel page. Depends on D2. (1 hour)
25. **D4** — audit legacy Purchase event. (30 min)
26. **D5** — Meta Pixel dedupe verification (manual). (30 min)

### Wave 5 (final — go-live)
27. **E1** — photos sourced & added. (depends on production work — gating)
28. **E2** — VAT verification. (15 min)
29. **E3** — dry-run script + run. (1.5 hours)
30. **E4** — Meta ad setup. (1 hour)

**Total engineering time:** ~38 hours hands-on for a single engineer. Add ~30% for Next.js 16 doc-reading discipline → **~50 hours = ~6–7 working days at high productivity.** Realistic with normal context switches, reviews: **10–14 calendar days.**

---

## Edge cases I'll handle in code

(All captured in the spec §6.3 and §12.2; here's the implementation reality.)

- **Slot fills mid-checkout:** A11 status route re-checks capacity at payment-detected time. If overflowed → set `status='refunded'` automatically, set a flag for the success page to surface "we'll WhatsApp you to reschedule."
- **Polling timeout (30s on success page):** Show "We'll confirm by WhatsApp within 1 hour." Booking stays `pending`. Admin gets `gmail-notify` alert.
- **Hold renewal on long sessions:** A11 detects expired-but-still-available, renews silently.
- **No matching GI doc (`checkPaymentByRemarks` returns null):** Normal during waiting; just return `{ paid: false }`. No error logged.
- **Race condition (two users last slot):** Capacity check inside transaction; loser gets auto-refund + reroute message.
- **Quiz user revisits LP and pays directly:** They'll have a `sessionId`; CheckoutFlow detects and pre-fills name/phone from `quizLeads`. `lpPath='quiz'` because the original session was quiz-driven? **Decision: `lpPath` reflects the immediate path on checkout, not lifetime path.** Pre-filled name/phone is just UX, `lpPath='direct'`.
- **No-show abuse attempt:** Refund endpoint validates `firstAttendedAt IS NOT NULL`. Rejects with 400 "Eligible only after attending class 1."
- **Refund after 48h:** Endpoint validates window; rejects with 400.
- **CAPI failing on Vercel cold start:** Already non-blocking `.catch()` — pattern preserved.

---

## Verification

Per phase:

- **Phase A:** `npx tsc --noEmit` after schema changes. `npx drizzle-kit generate` produces clean migration. `npx drizzle-kit push` to dev Neon branch succeeds. Manual curl of `/api/lp/slots` returns seeded slots.
- **Phase B:** Playwright `tests/lp-checkout.spec.ts` passes. Manual: book a slot in dev, redirect to GI sandbox, complete sandbox payment, verify DB row flips to `paid`, success page renders.
- **Phase C:** All three LPs render at `/he/lp/{shape,flex,reset}` and `/en/lp/...`. Lighthouse mobile ≥ 85 on each. Above-the-fold cluster visible without scroll on iPhone 12 viewport. RTL verified.
- **Phase D:** Open Network tab on each LP, verify GA4 + PostHog + Pixel events fire with `lp_variant`/`lp_path` properties. Admin funnel page renders non-empty data.
- **Phase E:** Dry-run script completes end-to-end. VAT shown on GI receipt.

**Commands to run during execution:**
```
npx tsc --noEmit                                    # type check
npm run lint                                        # eslint
npx drizzle-kit generate                            # schema diff → SQL
npx drizzle-kit push                                # apply to dev DB
npx playwright test tests/lp-checkout.spec.ts       # E2E
npm run build                                       # production build sanity
```

---

## Open items requiring decisions during execution (not blockers, but flag-worthy)

1. **GI sandbox creds for tests:** confirm `GI_SANDBOX=true` env var available in dev. Update `.env.example` if not.
2. **Vercel cron 5-min granularity:** confirm plan tier supports `*/5 * * * *`. Fallback `*/15`.
3. **`checkPaymentByRemarks` return shape from GI:** verify GI's `/documents/search` returns the `remarks` field. If not, fall back to amount+createdAt match.
4. **GI programmatic refund:** verify whether the API exposes a refund endpoint. If yes, `A16` automates it; if no, it stays manual.
5. **PostHog server-side events:** `posthog-node` not currently in `package.json` — defer to v2 or install + use for `refund_issued`.
6. **Reels per pain:** existing `ReelsCarousel` is hardcoded. v1 reuses the same reels on all 3 LPs; v2 (post-winner) hand-picks pain-matched reels.
7. **Testimonial structure:** `src/lib/testimonials.ts` exists but wasn't read in this session. Quick read needed before C1 to confirm shape supports per-LP filtering. **Action: first task of Wave 4 is to read this file.**

---

## STAGE 5 — Self-verify checklist

- [x] Read every file proposed to modify — yes (green-invoice/client.ts, facebook-capi.ts, schema.ts, payments/{checkout,status,webhook}, jam-reminders cron, success page+content, admin-guard, posthog, quiz-analytics, ReelsCarousel, public/layout, i18n routing, Next 16 docs for page+route conventions)
- [x] Grepped for existing utilities — yes (Morning URL refs, createCheckoutUrl, trackQuizComplete, withTimezone, first_class_day, iframe)
- [x] Plan matches conventions — yes (text IDs, integer prices, Bearer cron auth, admin-guard pattern, .catch on side effects, `@/` aliases, Promise params/searchParams)
- [x] Tests included — yes (Playwright E2E in B3, dry-run script in E3, type/lint/build commands)
- [x] Plan is simpler than alternatives — yes (Approach A chosen; no unneeded `bookings` rewrite)
- [x] Survives context reset — yes (this document is self-contained, file paths absolute, no reliance on session memory)
- [x] Verification commands provided — yes (see Verification section)
- [x] ETA provided — yes (~50 hours total, 10–14 calendar days)
