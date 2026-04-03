---
phase: 07-notifications-automations
plan: 03
subsystem: api
tags: [whatsapp, drip, cron, notifications, automation, resend, react-email]

# Dependency graph
requires:
  - phase: 07-01
    provides: drip-sequences.ts, notifications/index.ts (enrollInDrip, cancelDrip), schema dripEnrollments
  - phase: 07-04
    provides: SessionReminder React Email template for jam reminder emails
provides:
  - WhatsApp drip cron at /api/cron/whatsapp-drip (processes due WA enrollments)
  - Jam reminder cron at /api/cron/jam-reminders (day-before + morning-of reminders)
  - Drip enrollment in quiz lead capture (wa_challenge_prepay + email_nurture OR wa_workshop)
  - Drip transition in payment webhook (cancel prepay drips, start postpay drips)
affects: [08-challenge-delivery, 09-seo-landing, vercel.json cron schedule]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - cancel-first-then-enroll for drip transition on payment (prevents cron race)
    - non-blocking drip enrollment (try/catch, never fail primary response)
    - error code detection for Meta STOP opt-out (error code 131026)
    - 3-strike retry counter in enrollment metadata before auto-cancel

key-files:
  created:
    - src/app/api/cron/whatsapp-drip/route.ts
    - src/app/api/cron/jam-reminders/route.ts
  modified:
    - src/app/api/quiz/leads/route.ts
    - src/app/api/payments/webhook/route.ts

key-decisions:
  - "07-03: WA drip cron tracks consecutive failures in enrollment metadata; cancels after 3 strikes"
  - "07-03: Meta STOP opt-out detected by error code 131026 in WhatsApp API error response"
  - "07-03: wa_challenge_prepay expiry check uses cohortStartDate from metadata; sends last template (missed-it) before cancelling"
  - "07-03: cancel-first then enroll-new on payment; sequential awaits prevent race with drip cron (Pitfall 9)"
  - "07-03: jam-reminders sends both email and WhatsApp always — channel overlap intentional per locked decision"
  - "07-03: locale detection in quiz leads uses +972 phone prefix (Israeli = Hebrew, else English)"
  - "07-03: user.phone not in schema yet — WhatsApp jam reminders silently skip if phone absent; email always sends"

patterns-established:
  - "Non-blocking drip enrollment: wrap in try/catch after primary DB insert; log error, never fail caller"
  - "Cancel-then-enroll pattern: always cancelDrip BEFORE enrollInDrip to prevent double sends"

requirements-completed: [NOTIF-03, NOTIF-04]

# Metrics
duration: 3min
completed: 2026-04-03
---

# Phase 7 Plan 03: WhatsApp Drip Cron and Jam Reminders Summary

**WhatsApp outbound automation engine: drip cron fires due WA templates with personalization and expiry/opt-out handling; jam reminder cron covers confirmed attendees before each session; quiz leads and payment webhook auto-enroll and transition drip sequences**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-03T19:41:00Z
- **Completed:** 2026-04-03T19:44:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- WhatsApp drip cron (`/api/cron/whatsapp-drip`) processes up to 50 due WA enrollments per run: sends template with first-name personalization, handles `wa_challenge_prepay` expiry (missed-it message + cancel), detects Meta STOP opt-out via error code 131026, tracks consecutive failures in metadata and cancels after 3 strikes
- Jam reminder cron (`/api/cron/jam-reminders`) queries confirmed attendees for sessions on target date (today vs tomorrow determined by UTC hour), sends both WhatsApp and email (SessionReminder template) for each attendee per the "channel overlap intentional" locked decision
- Quiz lead capture auto-enrolls challenge leads in `wa_challenge_prepay` + `email_nurture`, workshop leads in `wa_workshop`; locale detected from +972 phone prefix; all enrollment is non-blocking
- Payment webhook transitions drip on success: cancels `wa_challenge_prepay` + `email_nurture` FIRST, then starts `wa_challenge_postpay` + `email_challenge_reminders`; sequential cancel-then-enroll mitigates race with drip cron

## Task Commits

Each task was committed atomically:

1. **Task 1: WhatsApp drip cron + jam reminder cron** - `b1a7104` (feat)
2. **Task 2: Drip enrollment hooks in quiz leads + payment webhook** - `e0c5dcc` (feat)

**Plan metadata:** (docs commit — see final_commit step)

## Files Created/Modified
- `src/app/api/cron/whatsapp-drip/route.ts` - Cron handler: queries due WA drip enrollments, sends templates, advances step, handles expiry/opt-out/retry
- `src/app/api/cron/jam-reminders/route.ts` - Cron handler: queries sessions by date, sends WA + email reminder to each confirmed attendee
- `src/app/api/quiz/leads/route.ts` - Added drip enrollment after lead insert (challenge: 2 drips; workshop: 1 drip)
- `src/app/api/payments/webhook/route.ts` - Added drip transition: cancel prepay drips, start postpay drips on payment confirmation

## Decisions Made
- WA drip cron tracks consecutive failures in enrollment metadata JSON; after 3 strikes cancels with reason `"error"` to prevent spam
- Meta STOP opt-out detected via error code `131026` in WhatsApp API error payload string
- Cancel-first before enroll-new on payment to prevent race condition with running drip cron
- Jam reminders silently skip WhatsApp send for users where `phone` column not yet in user schema (email always sends as fallback)
- Locale detected from `+972` prefix in quiz lead phone field; non-Israeli phones default to English

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required (WhatsApp and email env vars established in prior phases).

## Next Phase Readiness
- WhatsApp automation engine is complete: leads auto-enter drip on quiz submission, transition on payment, receive session reminders
- vercel.json cron schedule (set in 07-01) covers both new endpoints: whatsapp-drip at 16:00 UTC, jam-reminders at 05:00 + 15:00 UTC
- Phase 8 (challenge delivery) can use the WA postpay drip as-is; session reminder cron covers challenge session reminders

---
*Phase: 07-notifications-automations*
*Completed: 2026-04-03*
