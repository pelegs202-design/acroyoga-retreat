---
phase: 04-jam-board-messaging
plan: "04"
subsystem: ui
tags: [next-intl, tailwind, react, next.js, i18n]

requires:
  - phase: 04-02
    provides: GET/POST /api/jams and POST /api/jams/[id]/rsvp endpoints
  - phase: 04-01
    provides: jamSessions, jamAttendees schema + isJamHost on user table

provides:
  - Jam board page at /[locale]/jams with filterable timeline feed
  - New jam page at /[locale]/jams/new (host-only create form)
  - JamFeed client component with city/level filters + past jams collapsible
  - JamCard client component with RSVP/waitlist/cancel actions and optimistic UI
  - JamForm client component for creating new jam sessions
  - Full i18n coverage in en.json and he.json for all jam board UI text

affects: [05-quiz-funnels, 09-seo-public-pages, 10-design-polish]

tech-stack:
  added: []
  patterns:
    - Server page component delegates auth/locale → renders client child (same as members pattern)
    - Optimistic UI on RSVP: update state immediately, revert on API error
    - Debounced filter input: 300ms delay on city search before re-fetch
    - Collapsible past jams using client toggle state + lazy fetch on first open
    - Skeleton loading grid (3 cards) during initial fetch

key-files:
  created:
    - src/app/[locale]/(app)/jams/page.tsx
    - src/app/[locale]/(app)/jams/new/page.tsx
    - src/components/jams/JamFeed.tsx
    - src/components/jams/JamCard.tsx
    - src/components/jams/JamForm.tsx
  modified:
    - messages/en.json
    - messages/he.json
    - src/app/api/jams/route.ts

key-decisions:
  - "isJamHost added to GET /api/jams response so JamFeed can conditionally show Post a Jam button without a separate fetch"
  - "Past jams fetched lazily on first toggle open — avoids loading historical data users rarely need"
  - "RSVP optimistic UI reverts on any API error — client state never diverges from server truth permanently"
  - "datetime-local min value computed client-side for UX convenience — server still validates scheduledAt > now"

patterns-established:
  - "Jam feed uses same server component + client child pattern as members page"
  - "Level badges use semantic color (green/yellow/red/neutral) consistent with intuitive severity mapping"
  - "Attendee avatars stack with -8px margin + ring-neutral-900 border for visual separation"

requirements-completed: [COMM-03, COMM-04, COMM-05, COMM-06]

duration: 11min
completed: 2026-04-01
---

# Phase 4 Plan 4: Jam Board UI Summary

**Filterable jam board with RSVP/waitlist/cancel JamCard, collapsible past jams, skeleton loading, host-only create form, and full en/he i18n strings**

## Performance

- **Duration:** 11 min
- **Started:** 2026-04-01T18:05:32Z
- **Completed:** 2026-04-01T18:17:21Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Jam board page (`/jams`) renders a 3-column grid of upcoming jam cards with city text search (debounced 300ms) and level dropdown filter
- JamCard shows date/time, location, host avatar+name, spots remaining (`N/capacity`), level badge (green/yellow/red/neutral), attendee avatar stack (up to 4 + "+N more"), notes truncated to 2 lines, and RSVP button with 4 states (Join, Join Waitlist, Cancel RSVP, Locked)
- Past jams section collapses by default and lazy-fetches on first open, showing count in header
- Approved hosts see a "Post a Jam" button in the page header and in the empty state
- New jam form at `/jams/new` with datetime-local, location, capacity (1-100), level select, and notes (500 char limit) — handles 403 host-only gracefully, redirects to feed on success
- 40 strings per locale added to en.json and he.json covering all jam board and form UI text

## Task Commits

1. **Task 1: Create jam feed page and components** - `285b9c0` (feat)
2. **Task 2: Create jam form page and i18n strings** - `d1ba170` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/app/[locale]/(app)/jams/page.tsx` - Server page: auth guard, setRequestLocale, generateMetadata, renders JamFeed
- `src/app/[locale]/(app)/jams/new/page.tsx` - Server page: auth guard, setRequestLocale, generateMetadata, renders JamForm
- `src/components/jams/JamFeed.tsx` - Client: filter controls, upcoming grid, skeleton, past collapsible, Post a Jam link
- `src/components/jams/JamCard.tsx` - Client: jam card UI with optimistic RSVP/waitlist/cancel, level badge, attendee avatars
- `src/components/jams/JamForm.tsx` - Client: create jam form with validation, 403 handling, router.push on success
- `messages/en.json` - Added "jams" section (40 strings)
- `messages/he.json` - Added "jams" section (40 Hebrew translations)
- `src/app/api/jams/route.ts` - Added isJamHost to GET response (Rule 2 deviation)

## Decisions Made
- `isJamHost` added to GET `/api/jams` response so JamFeed can show/hide the "Post a Jam" button without a separate API call — keeps feed fetch self-contained
- Past jams lazy-fetched on first collapsible open — historical data rarely needed, avoids adding to initial page load
- `datetime-local` min set client-side for UX only — server validates `scheduledAt > now` authoritatively

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added isJamHost to GET /api/jams response**
- **Found during:** Task 1 (JamFeed component)
- **Issue:** JamFeed needs to know if current user is a jam host to show the "Post a Jam" button. The API did not include this field in its response, making the host-conditional UI impossible without an extra fetch.
- **Fix:** Added a `SELECT isJamHost FROM user WHERE id = session.user.id` query to the GET handler and included `isJamHost` in the JSON response object.
- **Files modified:** `src/app/api/jams/route.ts`
- **Verification:** TypeScript `npx tsc --noEmit` passes with no errors
- **Committed in:** 285b9c0 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Required for host-conditional UI button. No scope creep — one extra DB query in existing handler.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Jam board UI complete: browse, filter, RSVP, waitlist, cancel, create jam all working
- Phase 4 plans 04-01 through 04-04 complete — jam board + messaging API ready
- Plan 04-05 (messaging UI) can proceed
- canReview logic in reviews API correctly requires confirmed jam attendance (both parties) — already wired in 04-02

---
*Phase: 04-jam-board-messaging*
*Completed: 2026-04-01*
