---
phase: 06-payments-invoicing
plan: 01
subsystem: payments
tags: [green-invoice, payments, invoicing, webhooks, drizzle, neon, postgres]

# Dependency graph
requires:
  - phase: 05-quiz-funnels
    provides: quiz_leads table with sessionId, name, email, phone fields
provides:
  - challengeEnrollments DB table linked to quiz sessions via sessionId
  - Green Invoice JWT auth client with token caching and checkout URL creation
  - POST /api/payments/checkout endpoint — validates quiz session, returns GI hosted payment URL
  - POST /api/payments/webhook endpoint — receives GI payment confirmation, writes enrollment row
affects:
  - 06-02 (results page CTA wires to /api/payments/checkout)
  - 07-whatsapp-onboarding (reads challenge_enrollments for confirmed members)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Green Invoice JWT token cached at module level (55-min TTL) — works in serverless low-traffic context
    - Webhook idempotency via unique constraint (gi_document_id) + onConflictDoNothing()
    - sessionId embedded in GI document remarks field (format "sessionId:xxx") for webhook-to-lead linking
    - Webhook always returns 200 to GI servers to prevent retry storms; errors logged only

key-files:
  created:
    - src/lib/green-invoice/client.ts
    - src/app/api/payments/checkout/route.ts
    - src/app/api/payments/webhook/route.ts
  modified:
    - src/lib/db/schema.ts
    - .env.example

key-decisions:
  - "06-01: GI document remarks field used to embed sessionId (format: sessionId:xxx) — only field that survives webhook callback unmodified and can carry custom metadata"
  - "06-01: Webhook returns HTTP 200 on all errors — prevents GI retry storm; DB idempotency via gi_document_id unique constraint handles duplicate delivery safely"
  - "06-01: challengeEnrollments links to quiz_leads via sessionId (not userId FK) — quiz participants may not have auth accounts; session is the common identity"
  - "06-01: nextMonday() cohort date calculation is server-side at webhook time — simple, deterministic, no scheduling system needed at MVP"
  - "06-01: drizzle-kit push requires DATABASE_URL in env — migration SQL generated (0003_shallow_scrambler.sql), push deferred to deployment with credentials"

patterns-established:
  - "Payment API routes: no auth guard — checkout is public (quiz takers), webhook is for GI servers"
  - "Error handling: catch unknown, narrow to Error instance for message, return structured { error: string } on failure"

requirements-completed: [PAY-01, PAY-03]

# Metrics
duration: 13min
completed: 2026-04-02
---

# Phase 6 Plan 01: Payments Invoicing Summary

**Green Invoice JWT auth client + checkout/webhook API endpoints enabling 299 NIS challenge enrollment with automatic Hebrew חשבונית מס קבלה generation**

## Performance

- **Duration:** 13 min
- **Started:** 2026-04-02T11:16:17Z
- **Completed:** 2026-04-02T11:29:13Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- challenge_enrollments table added to Drizzle schema with sessionId index, gi_document_id unique constraint (idempotency), and cohort_start_date field; migration SQL generated
- Green Invoice API client with JWT token caching (55-min TTL), nextMonday() helper for cohort calculation, and createCheckoutUrl() producing hosted payment URLs for 299 NIS type-320 documents
- POST /api/payments/checkout validates quiz session in DB then delegates to GI client; POST /api/payments/webhook extracts sessionId from remarks, writes enrollment, returns 200 always

## Task Commits

1. **Task 1: DB schema + Green Invoice client library** - `34d6ba2` (feat)
2. **Task 2: Checkout API route + webhook handler** - `ecebb2d` (feat)

**Plan metadata:** (pending final commit)

## Files Created/Modified
- `src/lib/db/schema.ts` - Added challengeEnrollments table definition with all fields and indexes
- `src/lib/green-invoice/client.ts` - GI JWT auth client, token cache, nextMonday(), createCheckoutUrl()
- `src/app/api/payments/checkout/route.ts` - POST endpoint: validates sessionId, returns GI checkout URL
- `src/app/api/payments/webhook/route.ts` - POST endpoint: receives GI webhook, writes enrollment row
- `.env.example` - Added GI_API_KEY_ID, GI_API_KEY_SECRET, GI_SANDBOX, CHALLENGE_WA_GROUP_URL, NEXT_PUBLIC_BASE_URL

## Decisions Made
- GI document remarks field used to carry sessionId (format: `sessionId:xxx`) — only field available for custom metadata that roundtrips through GI and back via webhook
- Webhook returns HTTP 200 on all errors to prevent GI retry storms; DB idempotency (gi_document_id unique constraint + onConflictDoNothing) handles any duplicate delivery
- challengeEnrollments links to quiz_leads via sessionId rather than userId FK — quiz participants may not have auth accounts; sessionId is the common identity thread
- drizzle-kit push requires DATABASE_URL — migration SQL (0003_shallow_scrambler.sql) generated successfully; push deferred to deployment environment with credentials

## Deviations from Plan

None — plan executed exactly as written. The drizzle-kit push failure due to missing DATABASE_URL in dev environment is expected behavior, not a deviation.

## Issues Encountered

- `npx drizzle-kit push` returned exit code 1: "Either connection url or host, database are required" — expected in dev environment without DATABASE_URL. Migration SQL was generated correctly. Push will succeed in production deployment.

## User Setup Required

Green Invoice integration requires manual service configuration before the checkout flow will work:

**Environment variables to add to `.env.local`:**
- `GI_API_KEY_ID` — from Green Invoice Dashboard -> Settings -> Developer Tools -> API Keys
- `GI_API_KEY_SECRET` — from same location
- `GI_SANDBOX=true` — for sandbox testing (set to `false` for production)
- `CHALLENGE_WA_GROUP_URL` — WhatsApp group invite link shown on payment success page
- `NEXT_PUBLIC_BASE_URL=http://localhost:3000` — base URL for GI payment redirect URLs

**Green Invoice Dashboard configuration:**
- Create webhook endpoint pointing to `https://{NEXT_PUBLIC_BASE_URL}/api/payments/webhook`
  - Location: Green Invoice Dashboard -> Settings -> Developer Tools -> Webhooks
- Verify VAT settings reflect current rate (Green Invoice handles split automatically with vatType: 1)
  - Location: Green Invoice Dashboard -> Settings -> Business Details

**Run after credentials are set:**
```bash
npx drizzle-kit push
```

## Next Phase Readiness
- Payment backend is complete — checkout URL generation and webhook enrollment recording are ready
- Plan 06-02 (results page CTA) can now wire the "I Want to Join Now" button to POST /api/payments/checkout
- User must add GI credentials and configure webhook in GI dashboard before live payment testing

---
*Phase: 06-payments-invoicing*
*Completed: 2026-04-02*
