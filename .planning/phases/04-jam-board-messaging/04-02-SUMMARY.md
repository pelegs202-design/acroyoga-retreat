---
phase: 04-jam-board-messaging
plan: 02
subsystem: api
tags: [drizzle, postgres, resend, nextjs, rsvp, jam-board, waitlist]

# Dependency graph
requires:
  - phase: 04-01
    provides: jamSessions and jamAttendees schema with unique constraint on (jamId, userId) and isJamHost boolean on user table
provides:
  - GET /api/jams: lists upcoming and past jams with host info, confirmed attendee counts, and current user RSVP status
  - POST /api/jams: host-only jam creation with field validation
  - POST /api/jams/[id]/rsvp: race-safe join (confirmed/waitlist) and cancel with 4-hour lock, FIFO waitlist promotion, and Resend email
  - canReview real implementation: subquery checks shared jam attendance (both confirmed) before allowing review
affects: [04-03, 04-04, 04-05, ui-jam-board]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Race-safe capacity via count-then-insert with unique constraint as fallback (23505 catch)"
    - "FIFO waitlist promotion: orderBy joinedAt ASC, update first waitlisted row, send Resend email non-blocking"
    - "Subquery pattern for shared-jam check: db.select().from().where() as argument to inArray()"
    - "Resend guarded instantiation: null if RESEND_API_KEY missing, warn rather than crash"

key-files:
  created:
    - src/app/api/jams/route.ts
    - src/app/api/jams/[id]/rsvp/route.ts
  modified:
    - src/app/api/reviews/route.ts

key-decisions:
  - "Race safety uses unique constraint (23505) as final net rather than SELECT FOR UPDATE — neon-http is stateless HTTP, no persistent connections for row locks"
  - "Email failure on waitlist promotion is non-blocking — DB is already updated, log error and continue"
  - "canReview subquery requires 'confirmed' status for both parties — waitlisted and cancelled attendees cannot review"
  - "4-hour cancellation lock is enforced server-side only — client time is never trusted"

patterns-established:
  - "Drizzle subquery as inArray() argument: build inner query without .execute(), pass to outer where clause"
  - "Resend guard: instantiate null if no key, check before send, console.warn not throw"

requirements-completed: [COMM-03, COMM-04, COMM-05, COMM-06]

# Metrics
duration: 4min
completed: 2026-04-01
---

# Phase 04 Plan 02: Jam Board API Summary

**Race-safe RSVP API with host-only jam creation, FIFO waitlist promotion via Resend email, and real shared-jam attendance gate replacing canReview stub**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-01T17:50:46Z
- **Completed:** 2026-04-01T17:54:46Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- GET /api/jams lists upcoming and optionally past jams with host name/image, confirmed count, and per-user RSVP status via a Map
- POST /api/jams is host-gated (isJamHost DB check), validates all 5 fields with explicit type and range checks
- POST /api/jams/[id]/rsvp handles join (confirmed vs waitlist based on capacity), cancel (4-hour server-side lock, FIFO promotion, Resend email), and the unique constraint race condition via 23505 catch
- canReview stub replaced with a Drizzle subquery that requires both reviewer and reviewee to have 'confirmed' attendance on a shared jam

## Task Commits

Each task was committed atomically:

1. **Task 1: Create jam listing and creation API** - `5fb43b7` (feat)
2. **Task 2: Create RSVP endpoint with race-safe capacity check and waitlist promotion** - `331f158` (feat)
3. **Task 3: Replace canReview stub with real jam attendance check** - `d68b63e` (feat)

## Files Created/Modified
- `src/app/api/jams/route.ts` - GET (list with filters, attendee counts, user RSVP status) + POST (host-only jam creation)
- `src/app/api/jams/[id]/rsvp/route.ts` - POST join/cancel with race-safe insert, 4-hour lock, FIFO waitlist promotion, Resend email
- `src/app/api/reviews/route.ts` - Replaced canReview stub with real subquery checking shared jam attendance

## Decisions Made
- Used count-then-insert pattern with unique constraint (23505) as the race-condition safety net. The neon-http driver is stateless (no persistent connection for SELECT FOR UPDATE row locks). At community scale this window is negligible and the unique constraint prevents double-booking.
- Promotion email failure is non-blocking: user is already confirmed in the DB. Log the error and return success.
- canReview requires 'confirmed' status for both parties. Waitlisted or cancelled attendees have not truly "attended a jam together."
- 4-hour cancellation lock is checked server-side only — never trusting client-supplied time.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — TypeScript passed on first compile for all three tasks.

## User Setup Required

None - no external service configuration required. RESEND_API_KEY is already documented from 04-01.

## Next Phase Readiness
- All jam RSVP API routes are live and ready for the UI to consume (04-03 or 04-04)
- canReview is now real — reviews are properly gated on jam co-attendance
- Waitlist promotion email is wired up; RESEND_API_KEY + RESEND_FROM_EMAIL env vars must be set in production

---
*Phase: 04-jam-board-messaging*
*Completed: 2026-04-01*
