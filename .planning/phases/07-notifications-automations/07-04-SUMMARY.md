---
phase: 07-notifications-automations
plan: "04"
subsystem: api
tags: [resend, react-email, email, drip, cron, unsubscribe, rfc8058]

# Dependency graph
requires:
  - phase: 07-01-notifications-automations
    provides: dripEnrollments table, notificationPreferences table, DRIP_SEQUENCES drip-sequences.ts

provides:
  - "ChallengeConfirmation React Email template (bilingual, brutalist dark brand)"
  - "SessionReminder React Email template (isEve day-before/morning-of variants)"
  - "NurtureStep React Email template (12 steps, archetype-personalized, cyclic)"
  - "CompletionCertificate React Email template (certificate-style with share CTA)"
  - "Email sending wrapper: sendTransactionalEmail, sendMarketingEmail, generateUnsubToken, verifyUnsubToken"
  - "GET /api/cron/email-drip: processes due email drip enrollments, sends templates"
  - "GET+POST /api/unsubscribe: RFC 8058 one-click + HTML page unsubscribe"

affects:
  - "07-05 (push-batch cron for full cron coverage)"
  - "phase 10 (any email-facing UI changes)"

# Tech tracking
tech-stack:
  added:
    - "@react-email/components@1.0.11"
  patterns:
    - "transactionalEmail vs marketingEmail distinction — marketing checks emailMarketing pref, transactional always sends"
    - "HMAC-SHA256 unsubscribe tokens with timingSafeEqual comparison"
    - "email_nurture cycle: step 12 wraps to step 6, completedAt never set"
    - "RFC 8058 List-Unsubscribe-Post header on all marketing emails"
    - "Cron always returns 200 — Resend errors schedule retry in 1h, never fail the cron"

key-files:
  created:
    - "src/lib/email/index.ts"
    - "src/lib/email/templates/ChallengeConfirmation.tsx"
    - "src/lib/email/templates/SessionReminder.tsx"
    - "src/lib/email/templates/NurtureStep.tsx"
    - "src/lib/email/templates/CompletionCertificate.tsx"
    - "src/app/api/cron/email-drip/route.ts"
    - "src/app/api/unsubscribe/route.ts"
  modified: []

key-decisions:
  - "07-04: @react-email/components installed (was missing from package.json) — required for JSX email templates"
  - "07-04: email_nurture wraps to step 6 (NURTURE_CYCLE_START=6) after completing 12 steps — matches locked decision from 07-01"
  - "07-04: Challenge reminders: even steps = day-before (18:00 IL), odd steps = morning-of (08:00 IL) — interleaved timing pattern"
  - "07-04: CompletionCertificate sent on final email_challenge_reminders step (transactional) — completion event triggers certificate"
  - "07-04: Unsubscribe POST returns JSON (RFC 8058); GET returns branded HTML page — different consumers"
  - "07-04: Unsub upserts notificationPreferences with emailMarketing=false — handles users with no prefs row"
  - "07-04: Lead email_nurture enrollments without userId use fallback token — leads may not have auth accounts yet"

patterns-established:
  - "sendMarketingEmail always includes List-Unsubscribe + List-Unsubscribe-Post headers"
  - "generateUnsubToken uses UNSUBSCRIBE_SECRET ?? CRON_SECRET ?? fallback — single secret hierarchy"
  - "Cron batch: LIMIT 50, always return 200, retry failures in 1h"
  - "Email templates: dark bg #0a0a0a, hot pink #F472B6, Heebo font via Google Fonts embed"

requirements-completed: [NOTIF-02, NOTIF-05]

# Metrics
duration: 7min
completed: "2026-04-01"
---

# Phase 07 Plan 04: Email Notification System Summary

**Branded React Email templates (confirmation, reminder, nurture, certificate) + Resend wrapper with RFC 8058 unsubscribe + cron-driven drip delivery cycling indefinitely through 12 nurture steps**

## Performance

- **Duration:** 7 min
- **Started:** 2026-04-01T13:10:51Z
- **Completed:** 2026-04-01T13:17:46Z
- **Tasks:** 2
- **Files modified:** 7 created + 2 modified (package.json, package-lock.json)

## Accomplishments

- 4 branded React Email templates with brutalist dark design (#0a0a0a bg, #F472B6 pink, Heebo font) — bilingual Hebrew/English with RTL support
- Email sending wrapper distinguishing transactional (no unsub headers) from marketing (RFC 8058 List-Unsubscribe + List-Unsubscribe-Post) with HMAC-SHA256 token security
- Email drip cron processing up to 50 due enrollments per run — nurture never completes (cycles step 6-12 forever), challenge reminders complete with certificate email on final step
- One-click unsubscribe via GET (HTML page) and POST (RFC 8058 JSON) — upserts notificationPreferences, cancels active nurture enrollments

## Task Commits

1. **Task 1: React Email templates + email sending wrapper** - `98c14ea` (feat)
2. **Task 2: Email drip cron + unsubscribe endpoint** - `4a22a35` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `src/lib/email/index.ts` — Resend wrapper: sendTransactionalEmail, sendMarketingEmail, generateUnsubToken, verifyUnsubToken, buildUnsubUrl
- `src/lib/email/templates/ChallengeConfirmation.tsx` — Signup confirmation with cohort date, WA group CTA, what-to-expect/bring lists
- `src/lib/email/templates/SessionReminder.tsx` — Day-before and morning-of reminder variants (isEve flag), color-coded accents
- `src/lib/email/templates/NurtureStep.tsx` — 12 distinct step templates with archetype personalization (Explorer/Artist/Connector/Athlete), step 5 discount offer
- `src/lib/email/templates/CompletionCertificate.tsx` — Certificate-style layout with gold decorations, share CTA to /certificate/[name]
- `src/app/api/cron/email-drip/route.ts` — GET cron handler: queries due email enrollments, dispatches correct template, advances/wraps step
- `src/app/api/unsubscribe/route.ts` — GET (link-click HTML page) + POST (RFC 8058 JSON) unsubscribe with token verification

## Decisions Made

- `@react-email/components` was not in package.json — installed v1.0.11 (Rule 3 blocking deviation)
- `email_nurture` wraps to step 6 after step 12 completion — matches 07-01 locked decision `email_nurture step 12 wraps to step 6`
- Challenge reminder pattern: even step index = day-before (18:00 IL time), odd = morning-of (08:00 IL time)
- `CompletionCertificate` sent as transactional on the final `email_challenge_reminders` step
- Unsubscribe `POST` returns JSON (RFC 8058 email client consumption), `GET` returns branded HTML page
- Leads without user accounts (`userId=null`) use `"no-user"` fallback in unsubscribe token — unsub by link still works for user-linked enrollments

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing @react-email/components**
- **Found during:** Task 1 (React Email templates)
- **Issue:** `@react-email/components` imported in all templates but not in package.json — imports would fail at build
- **Fix:** `npm install @react-email/components` — installed v1.0.11
- **Files modified:** package.json, package-lock.json
- **Verification:** `npx tsc --noEmit` passes cleanly
- **Committed in:** `98c14ea` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking — missing dependency)
**Impact on plan:** Essential for functionality. No scope creep.

## Issues Encountered

None — TypeScript passed cleanly on both tasks after adding the missing package.

## User Setup Required

The following environment variables must be set for email to work:

- `RESEND_API_KEY` — from resend.com dashboard
- `RESEND_FROM_EMAIL` — verified sender address (default: `AcroHavura <shai@acroretreat.co.il>`)
- `UNSUBSCRIBE_SECRET` — random secret for HMAC token (or falls back to `CRON_SECRET`)
- `NEXT_PUBLIC_CHALLENGE_WA_GROUP_URL` — WhatsApp group invite link for confirmation emails
- `NEXT_PUBLIC_APP_URL` — public app URL for unsubscribe links (default: `https://acrohavura.com`)

Add cron to vercel.json:
```json
{ "path": "/api/cron/email-drip", "schedule": "0 16 * * *" }
```
(16:00 UTC = 19:00 Israel time)

## Next Phase Readiness

- Email channel fully operational: confirmation, reminders, nurture (cycling), and completion certificate
- WhatsApp drip cron (07-05) can follow the same pattern established here
- Push notification cron already exists (07-01) — all three channels now independently operational
- No blockers for Phase 8

---
*Phase: 07-notifications-automations*
*Completed: 2026-04-01*
