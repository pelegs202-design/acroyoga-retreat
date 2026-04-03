---
phase: 07-notifications-automations
plan: "05"
subsystem: ui
tags: [notifications, preferences, settings, push, whatsapp, email, quiet-hours, i18n]

# Dependency graph
requires:
  - phase: 07-01-notifications-automations
    provides: notificationPreferences table schema, dripEnrollments table
  - phase: 07-02-notifications-automations
    provides: push subscription storage, push permission prompt hook
  - phase: 07-03-notifications-automations
    provides: WhatsApp drip cron, drip enrollment management
  - phase: 07-04-notifications-automations
    provides: email drip cron, unsubscribe endpoint pattern

provides:
  - "NotificationPreferences client component — 3 channel toggles (push, email, WhatsApp) + quiet hours inputs"
  - "GET /api/notifications/preferences — returns user prefs with safe defaults for new users"
  - "PATCH /api/notifications/preferences — upserts prefs; WhatsApp opt-out side-effect cancels active drip enrollments"
  - "Settings page at /[locale]/(app)/settings/page.tsx embedding NotificationPreferences section"
  - "i18n keys under settings.notifications in en.json and he.json"
  - "Phase 7 integration verified across all 3 notification channels (human checkpoint approved)"

affects:
  - "phase 08 (admin panel may surface notification stats)"
  - "phase 10 (design polish may restyle Settings section)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "onConflictDoUpdate on userId PK for upsert-based preferences persistence"
    - "Side-effect drip cancellation on channel opt-out — PATCH handler cancels dripEnrollments where channel='whatsapp' and cancelledAt IS NULL"
    - "Quiet hours toggle visibility tied to pushEnabled state — conditional section render"
    - "Per-field PATCH calls — each toggle fires immediately on change, no save button"

key-files:
  created:
    - "src/app/api/notifications/preferences/route.ts"
    - "src/components/settings/NotificationPreferences.tsx"
    - "src/app/[locale]/(app)/settings/page.tsx"
  modified:
    - "messages/en.json"
    - "messages/he.json"

key-decisions:
  - "07-05: Settings page created fresh at /[locale]/(app)/settings/page.tsx — no prior settings page existed in the project"
  - "07-05: i18n keys placed in messages/ directory (not src/i18n/locales/) — project uses top-level messages/ convention established in Phase 1"
  - "07-05: Per-field PATCH on change (no submit button) — immediate feedback UX, each toggle saves independently"
  - "07-05: WhatsApp opt-out cancels dripEnrollments with reason 'opted_out' via bulk UPDATE — all active WA sequences stopped atomically"

patterns-established:
  - "Notification preferences API: always return defaults (all ON, quietHoursStart:22, quietHoursEnd:8) for users with no prefs row"
  - "Settings UI: 'use client' component fetches own data on mount, fires PATCH on each toggle/value change"

requirements-completed: [NOTIF-01, NOTIF-02, NOTIF-03, NOTIF-04, NOTIF-05]

# Metrics
duration: 12min
completed: "2026-04-01"
---

# Phase 07 Plan 05: Notification Preferences UI + Phase 7 Integration Verification Summary

**Per-channel notification preference controls (push/email/WhatsApp toggles + quiet hours) in Settings, with WhatsApp opt-out side-effect cancelling active drip enrollments, completing Phase 7's full 3-channel notification system**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-04-03T19:49:04Z
- **Completed:** 2026-04-03T20:01:00Z
- **Tasks:** 2
- **Files modified:** 5 (3 created, 2 modified)

## Accomplishments

- Notification preferences API (GET/PATCH) with safe defaults for new users — no prefs row required, defaults all channels ON with quiet hours 22:00-08:00
- NotificationPreferences client component with 3 independent channel toggles + quiet hours section (only shown when push is enabled) + per-field immediate save
- WhatsApp opt-out PATCH side-effect: bulk-cancels all active dripEnrollments for the user with reason 'opted_out' — no orphaned drip sequences
- Settings page created and integrated with NotificationPreferences section
- i18n support in both en.json and he.json under settings.notifications namespace
- Phase 7 human verification checkpoint approved — all 3 notification channels (push, WhatsApp, email) confirmed functional

## Task Commits

1. **Task 1: Notification preferences API + Settings UI** - `2c276c2` (feat)
2. **Task 2: Phase 7 integration verification** - Human checkpoint approved

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `src/app/api/notifications/preferences/route.ts` — GET returns user prefs (defaults for new users); PATCH upserts with WhatsApp opt-out side-effect
- `src/components/settings/NotificationPreferences.tsx` — Client component: 3 channel toggles, quiet hours inputs, per-field PATCH on change, loading/success state
- `src/app/[locale]/(app)/settings/page.tsx` — New Settings page embedding NotificationPreferences section
- `messages/en.json` — Added settings.notifications keys (title, push, email, whatsapp, quietHours, saved)
- `messages/he.json` — Hebrew translations for all settings.notifications keys

## Decisions Made

- No prior settings page existed — created fresh at the (app) route group level consistent with existing page structure
- i18n key location is `messages/` (top-level), not `src/i18n/locales/` as the plan specified — project convention established in Phase 1 uses top-level messages/ directory
- Quiet hours section conditionally hidden when push is disabled — reduces cognitive load, quiet hours only relevant when push is on
- WhatsApp opt-out cancels all active drip enrollments atomically in the PATCH handler — single database UPDATE, no async side work

## Deviations from Plan

None — plan executed exactly as written. The only adjustment was the i18n file path (messages/ vs src/i18n/locales/) which matched the existing project convention rather than being a deviation from intent.

## Issues Encountered

None — TypeScript passed cleanly. The settings page was a new file (no prior settings page), so no integration conflicts arose.

## User Setup Required

None — no new external service configuration required beyond what was established in Plans 07-01 through 07-04. All environment variables (VAPID, Meta Cloud API, Resend) documented in prior plan summaries.

## Next Phase Readiness

- Phase 7 complete: all 5 NOTIF requirements satisfied across 3 channels (push NOTIF-01, email NOTIF-02 + NOTIF-05, WhatsApp NOTIF-03 + NOTIF-04)
- User preference controls fully operational — opt-out propagates to active drip sequences
- Cron infrastructure in place: push-batch (5 min), WhatsApp drip + email drip (16:00 UTC daily), jam reminders (05:00 + 15:00 UTC)
- No blockers for Phase 8 (Admin Panel)

---
*Phase: 07-notifications-automations*
*Completed: 2026-04-01*
