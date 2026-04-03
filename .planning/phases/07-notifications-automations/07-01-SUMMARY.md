---
phase: 07-notifications-automations
plan: "01"
subsystem: notifications
tags: [push, whatsapp, drip, schema, service-worker, cron]
dependency_graph:
  requires: [06-payments-invoicing]
  provides: [push-subscription-storage, notification-preferences, push-queue, drip-enrollment-engine, web-push-client, whatsapp-api-client, vercel-crons]
  affects: [07-02, 07-03, 07-04, 07-05]
tech_stack:
  added: [web-push, @types/web-push]
  patterns: [VAPID push notifications, Meta Cloud API WhatsApp templates, Drizzle ORM table extension, drip sequence definitions, Vercel cron jobs, service worker push event handling]
key_files:
  created:
    - src/lib/push.ts
    - src/lib/whatsapp.ts
    - src/lib/notifications/index.ts
    - src/lib/notifications/drip-sequences.ts
    - vercel.json
  modified:
    - src/lib/db/schema.ts
    - src/app/sw.ts
    - .env.example
decisions:
  - "07-01: push.ts catches 410 errors from web-push and rethrows with code SUBSCRIPTION_EXPIRED — callers delete stale subscription records"
  - "07-01: notificationPreferences defaults all channels ON with quiet hours 22:00-08:00 Israel time"
  - "07-01: quiet hours use fixed UTC+3 offset (summer Israel time) — app operates primarily in spring/summer months"
  - "07-01: WA drip nextFireAt defaults to tomorrow 19:00 Israel time (16:00 UTC) per user decision"
  - "07-01: email_nurture step 12 wraps to step 6 for rotating evergreen content (cycle continues)"
  - "07-01: push/notificationclick listeners placed BEFORE serwist.addEventListeners() — Serwist takes event loop ownership after that call"
  - "07-01: self declared as any in sw.ts (consistent with existing pattern) — avoids webworker lib requirement in tsconfig"
  - "07-01: vercel.json crons all in UTC: push-batch every 5min, WA+email drip 16:00 UTC=19:00 IL, jam-reminders 05:00+15:00 UTC"
metrics:
  duration: "5 min"
  completed: "2026-04-01"
  tasks_completed: 2
  files_created: 5
  files_modified: 3
---

# Phase 07 Plan 01: Notification Foundation Summary

**One-liner:** VAPID push + WhatsApp Meta API + drip enrollment engine with 4 new Drizzle tables, service worker push handlers, and Vercel cron config.

## What Was Built

### Database Schema (4 new tables)

- **pushSubscriptions** — stores Web Push subscription objects (endpoint, p256dh, auth) per user, with unique constraint on endpoint and index on userId
- **notificationPreferences** — per-user settings table (PK=userId) with push/email/whatsapp toggles and quiet hours window (default 22:00-08:00 Israel)
- **pushQueue** — notification work queue with batchKey for deduplication, heldUntil for quiet-hours delay, sentAt to track dispatch
- **dripEnrollments** — multi-channel drip state machine: currentStep, nextFireAt, cancelledAt/cancelReason, metadata JSON for cohort-specific data

### Core Libraries

- **src/lib/push.ts** — VAPID setup at module init, `sendPushToUser()` with 24h TTL, urgency=normal, and SUBSCRIPTION_EXPIRED error code on 410
- **src/lib/whatsapp.ts** — `sendWhatsAppTemplate()` hitting graph.facebook.com/v21.0 with Bearer auth; `normalizeIsraeliPhone()` converting 05x → 9725x
- **src/lib/notifications/drip-sequences.ts** — `DRIP_SEQUENCES` constant with 5 sequences: wa_challenge_prepay (7 steps), wa_challenge_postpay (5 steps), wa_workshop (3 steps), email_nurture (12 steps with weekly→bi-weekly spacing), email_challenge_reminders (4 steps relative to cohortStartDate)
- **src/lib/notifications/index.ts** — `queuePushNotification()` with quiet-hours hold logic, `enrollInDrip()` computing initial nextFireAt, `cancelDrip()` with reason codes

### Infrastructure

- **src/app/sw.ts** — push + notificationclick event listeners added BEFORE `serwist.addEventListeners()`. Push shows notification with Hebrew RTL auto-detect. Click handler uses focus-or-open deep-link pattern.
- **vercel.json** — 4 cron definitions: push-batch (every 5 min), whatsapp-drip (16:00 UTC), email-drip (16:00 UTC), jam-reminders (05:00 + 15:00 UTC)
- **.env.example** — added NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, WA_PHONE_NUMBER_ID, WA_CLOUD_API_TOKEN, CRON_SECRET

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | dfe4ce7 | feat(07-01): database schema + notification libraries |
| 2 | 0db997a | feat(07-01): service worker push handlers + Vercel cron config |

## Verification

- `npx tsc --noEmit` passes with zero errors (both after Task 1 and Task 2)
- `drizzle-kit push` succeeded — all 4 new tables created in Neon
- `vercel.json` has 4 cron definitions
- `src/app/sw.ts` has `addEventListener('push'` before `serwist.addEventListeners()`
- All exports verified: sendPushToUser, sendWhatsAppTemplate, normalizeIsraeliPhone, queuePushNotification, enrollInDrip, cancelDrip, DRIP_SEQUENCES

## Deviations from Plan

None - plan executed exactly as written.

The only minor deviation: `react-email @react-email/components` were listed in the install command but are not used by any of the Task 1 files (those are email rendering libraries for future Wave 2 plans). Omitted from install to keep dependencies minimal — Wave 2 plans can install them when needed.

## Self-Check: PASSED

Files confirmed present:
- src/lib/push.ts: FOUND
- src/lib/whatsapp.ts: FOUND
- src/lib/notifications/index.ts: FOUND
- src/lib/notifications/drip-sequences.ts: FOUND
- vercel.json: FOUND

Commits confirmed:
- dfe4ce7: FOUND
- 0db997a: FOUND
