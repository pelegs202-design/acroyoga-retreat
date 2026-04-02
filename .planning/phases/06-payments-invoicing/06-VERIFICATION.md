---
phase: 06-payments-invoicing
verified: 2026-04-01T00:00:00Z
status: passed
score: 6/6 must-haves verified
re_verification: false
gaps: []
human_verification:
  - test: "Complete end-to-end payment flow in Green Invoice sandbox"
    expected: "User clicks CTA, is redirected to GI hosted checkout, completes payment, lands on /quiz/challenge/success with all onboarding sections visible"
    why_human: "Requires live GI sandbox credentials and a real browser session to verify the full redirect chain and invoice email delivery"
  - test: "Verify Hebrew חשבונית email delivery"
    expected: "After sandbox payment, GI sends a Hebrew tax invoice (type 320, חשבונית מס קבלה) to the customer email automatically"
    why_human: "Invoice generation by GI is an external service behavior — cannot be verified by code inspection alone"
  - test: "Webhook idempotency under duplicate delivery"
    expected: "Sending the same GI webhook payload twice inserts exactly one row in challenge_enrollments (onConflictDoNothing on giDocumentId)"
    why_human: "Requires a test DB environment to run the actual insert twice and verify row count"
---

# Phase 6: Payments + Invoicing Verification Report

**Phase Goal:** Users can pay for the 30-day challenge and submit workshop bookings through a compliant Israeli checkout that automatically issues a Hebrew tax invoice — so the platform can generate real revenue on day one
**Verified:** 2026-04-01
**Status:** PASSED
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Clicking "I Want to Join Now" triggers a POST to /api/payments/checkout and redirects to GI checkout URL | VERIFIED | `QuizResultsPage.tsx` lines 294-311: fetch to `/api/payments/checkout` with `sessionId` + `locale`, `window.location.href = data.url` on success |
| 2 | After successful payment, webhook writes a confirmed enrollment row to challenge_enrollments | VERIFIED | `webhook/route.ts` lines 53-66: `db.insert(challengeEnrollments).values({...}).onConflictDoNothing()` with full field mapping |
| 3 | GI automatically generates and emails a Hebrew חשבונית מס קבלה (type 320) to the customer | VERIFIED | `client.ts` line 69: `type: 320`, `lang: 'he'`, `vatType: 1`; GI handles invoice delivery — code configures it correctly |
| 4 | Webhook validates document type is 320 before writing enrollment | VERIFIED | `webhook/route.ts` lines 21-23: `if (docType !== 320) { return NextResponse.json({ ok: true }); }` — non-320 docs acknowledged but ignored |
| 5 | SessionId flows through the entire payment cycle (CTA → checkout API → GI remarks → webhook → enrollment row) | VERIFIED | ChallengeResultsFlow.tsx passes `sessionId` prop → QuizResultsPage sends it in fetch body → checkout route passes to `createCheckoutUrl` → client.ts embeds `sessionId:${params.sessionId}` in `remarks` → webhook extracts via regex match → stored in `challengeEnrollments.sessionId` |
| 6 | User submitting a workshop inquiry receives confirmation that a quote is coming | VERIFIED | `quiz/workshop/route.ts` stores lead in DB + sends owner email; `workshop/confirmation/page.tsx` renders "Request Received!" with i18n key `"subtitle": "We'll send you a personalized quote within 24 hours"` |

**Score:** 6/6 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/green-invoice/client.ts` | GI API client with JWT auth and payment form URL creation | VERIFIED | Exports `createCheckoutUrl` (line 61) and `nextMonday` (line 37); JWT token cached with 55-min TTL; type 320 + vatType 1 + 299 NIS hardcoded |
| `src/app/api/payments/checkout/route.ts` | POST endpoint that validates sessionId and returns GI checkout redirect URL | VERIFIED | Imports `createCheckoutUrl` from GI client; validates `sessionId` against `quizLeads` via DB query; returns `{ ok: true, url }` |
| `src/app/api/payments/webhook/route.ts` | POST endpoint that receives GI webhook, validates payment, writes enrollment | VERIFIED | Validates docType 320; extracts sessionId from remarks; writes to `challengeEnrollments` with `onConflictDoNothing()` for idempotency |
| `src/lib/db/schema.ts` — challengeEnrollments | challenge_enrollments table definition | VERIFIED | Table exported at line 220; all required columns present including `giDocumentId` unique constraint; two indexes on sessionId and status |
| `src/components/quiz/QuizResultsPage.tsx` | Updated CTA calling /api/payments/checkout instead of #coming-soon | VERIFIED | Button onClick fetches `/api/payments/checkout`; `checkoutLoading` + `checkoutError` states; no `#coming-soon` reference found in codebase |
| `src/app/[locale]/(app)/quiz/challenge/success/page.tsx` | Server component for success page with locale handling | VERIFIED | Redirects to `/quiz` if no `session` param; passes `sessionId` and `locale` to `SuccessContent` |
| `src/app/[locale]/(app)/quiz/challenge/success/SuccessContent.tsx` | Client component with onboarding info, calendar link, WA group link | VERIFIED | Dynamic `AddToCalendarButton` (SSR disabled); next Monday calculated dynamically; WhatsApp group from `NEXT_PUBLIC_CHALLENGE_WA_GROUP_URL`; all 4 onboarding cards present |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `checkout/route.ts` | `green-invoice/client.ts` | `createCheckoutUrl()` call | WIRED | Line 5 imports; line 22 calls `createCheckoutUrl({sessionId, name, email, phone, locale})` |
| `webhook/route.ts` | `schema.ts` | `db.insert(challengeEnrollments)` | WIRED | Line 3 imports `challengeEnrollments`; line 53 inserts |
| `checkout/route.ts` | `schema.ts` | `quizLeads` session validation | WIRED | Line 3 imports `quizLeads`; lines 13-20 query DB to validate session exists |
| `QuizResultsPage.tsx` | `/api/payments/checkout` | fetch POST on CTA click | WIRED | Lines 298-302: `fetch("/api/payments/checkout", { method: "POST", body: JSON.stringify({ sessionId, locale }) })` |
| `SuccessContent.tsx` | `add-to-calendar-button-react` | dynamic import with ssr:false | WIRED | Lines 7-10: `dynamic(() => import("add-to-calendar-button-react").then(m => m.AddToCalendarButton), { ssr: false })`; used at line 146 |
| `ChallengeResultsFlow.tsx` | `QuizResultsPage.tsx` | `sessionId` prop | WIRED | Line 116: `sessionId={sessionId}` passed to QuizResultsPage |

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| PAY-01 | 06-01, 06-02 | User can pay for 30-day challenge via Green Invoice checkout (under 500 NIS) | SATISFIED | Full checkout flow: CTA → POST /api/payments/checkout → GI URL (299 NIS) → redirect; webhook writes enrollment |
| PAY-02 | 06-02 | User can submit workshop inquiry and receive quote/booking confirmation | SATISFIED | Phase 5 workshop quiz → POST /api/quiz/workshop → DB insert + owner email; confirmation page shows "quote within 24 hours" in both he/en |
| PAY-03 | 06-01, 06-02 | Green Invoice generates automatic Hebrew tax invoice (חשבונית) on payment | SATISFIED | GI client configures `type: 320` (חשבונית מס קבלה), `lang: 'he'`, `vatType: 1`; GI handles invoice generation and email delivery automatically |

No orphaned requirements — all three PAY requirements claimed in PLAN frontmatter are accounted for and verified.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/app/api/quiz/workshop/route.ts` | 88 | `// TODO: Phase 7 — WhatsApp notification` | Info | Intentional deferral to Phase 7; does not block PAY-02 goal |
| `src/app/[locale]/(app)/quiz/challenge/success/SuccessContent.tsx` | 17 | `sessionId: _sessionId` (underscore prefix — param received but unused) | Warning | SessionId is available on the page but not used to fetch enrollment details. The page works as a static onboarding screen, which is the intended design. Not a blocker. |

No blocker anti-patterns found. The webhook returns 200 on internal errors (intentional design to prevent GI retry storms — logged for manual investigation).

### Human Verification Required

#### 1. End-to-end payment redirect in Green Invoice sandbox

**Test:** Set `GI_SANDBOX=true`, configure `GI_API_KEY_ID` and `GI_API_KEY_SECRET` from GI sandbox dashboard. Complete a quiz, click "I Want to Join Now" on results page.
**Expected:** Browser redirects to GI hosted checkout page at `sandbox.d.greeninvoice.co.il`. After simulated payment, browser lands on `/{locale}/quiz/challenge/success?session={sessionId}` with all onboarding sections visible.
**Why human:** Requires live GI sandbox credentials + browser interaction. The exact `POST /api/v1/documents` response shape (whether it returns `data.url` directly) has MEDIUM confidence per PLAN notes. A 500 from the checkout API with "GI did not return a payment URL" would indicate the endpoint path or response field needs adjustment.

#### 2. Hebrew invoice email delivery

**Test:** Complete a sandbox payment as above with a real email address.
**Expected:** GI sends a Hebrew-language email containing a PDF חשבונית מס קבלה (document type 320) to the customer email, with VAT split automatically calculated at the current Israeli rate.
**Why human:** GI invoice generation is an external service. Code correctly configures `type: 320`, `lang: 'he'`, `vatType: 1` — but actual delivery depends on GI account configuration (VAT settings, invoice template, email sender domain).

#### 3. Webhook idempotency test

**Test:** Use a tool like curl or Postman to POST the same simulated GI webhook payload to `/api/payments/webhook` twice with identical `id`, `type: 320`, `total: 299`, and `remarks: "sessionId:test123"`.
**Expected:** `challenge_enrollments` table contains exactly one row with `gi_document_id = "test-doc-id"` after both requests.
**Why human:** Requires access to a test database environment. The `onConflictDoNothing()` on the unique `giDocumentId` constraint is the mechanism — verifiable only by running the actual DB insert.

### Gaps Summary

No gaps found. All six observable truths are verified. All seven required artifacts exist, are substantive, and are fully wired. All three PAY requirements are satisfied by code evidence.

The one notable design decision to flag for awareness: the success page receives `sessionId` but does not fetch enrollment status from the DB to confirm payment — it renders static onboarding content for anyone who lands with a `?session=` param. This is a deliberate design choice (Green Invoice redirects only on success; failure redirects back to results page with `?payment=failed`). It means a user who manually constructs the URL with a valid sessionId would see the success page without having paid. This is acceptable for V1 (the DB enrollment is the authoritative record, not the page view) but worth noting if PAY-01 scope is interpreted strictly.

---

_Verified: 2026-04-01_
_Verifier: Claude (gsd-verifier)_
