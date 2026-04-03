---
phase: 07-notifications-automations
plan: 02
subsystem: push-notifications
tags: [push, web-push, cron, partner-match, permission-prompt, real-time]
dependency_graph:
  requires: [07-01]
  provides: [push-subscribe-api, push-batch-cron, usePushPermission, push-triggers]
  affects: [messages-api, rsvp-api, reviews-api, update-profile-api, JamCard, ChatThread]
tech_stack:
  added: []
  patterns:
    - Web Push subscription upsert on endpoint unique constraint
    - Cron batch grouping by userId+eventType with collapse logic
    - Non-blocking IIFE for partner-match without awaiting response
    - Fire-and-forget void promptForPush() in UI components
    - Israel timezone day boundary for rate limiting
key_files:
  created:
    - src/app/api/push/subscribe/route.ts
    - src/app/api/cron/push-batch/route.ts
    - src/hooks/usePushPermission.ts
  modified:
    - src/app/api/messages/[conversationId]/route.ts
    - src/app/api/jams/[id]/rsvp/route.ts
    - src/app/api/reviews/route.ts
    - src/app/api/user/update-profile/route.ts
    - src/components/jams/JamCard.tsx
    - src/components/messages/ChatThread.tsx
decisions:
  - "07-02: POST /api/push/subscribe uses onConflictDoUpdate on endpoint unique constraint — handles subscription refresh without duplicate rows"
  - "07-02: push-batch cron collapses new_message and jam_rsvp events per user into summary notifications — reduces notification fatigue for high-activity users"
  - "07-02: Partner-match IIFE is fire-and-forget (not awaited) — profile update response returns before potentially slow matching query"
  - "07-02: Partner-match rate limit uses Israel timezone start-of-day boundary (UTC+3) — consistent with quiet hours approach from 07-01"
  - "07-02: Review push omits reviewer name — reviews are private thumbs-up/down per existing design, caller cannot infer who reviewed them"
  - "07-02: promptForPush called with void operator in UI — fire-and-forget, never blocks RSVP or send flow"
metrics:
  duration: 4 min
  completed_date: "2026-04-03"
  tasks: 2
  files: 10
---

# Phase 7 Plan 02: Push Notification End-to-End Summary

One-liner: Full push pipeline — subscribe endpoint, batch cron with quiet-hours and batching, event triggers in all four APIs including partner-match with daily rate limiting, and permission prompt hook wired into JamCard and ChatThread.

## What Was Built

### Task 1: Push Subscribe API + Batch Cron Dispatcher

**`src/app/api/push/subscribe/route.ts`**
- POST endpoint requiring authenticated session
- Accepts `{ endpoint, p256dh, auth }` — validates all three non-empty
- Upserts into `pushSubscriptions` table using `onConflictDoUpdate` on `endpoint` unique constraint
- Captures `user-agent` header from request
- Returns 201 on success

**`src/app/api/cron/push-batch/route.ts`**
- GET handler with `Bearer CRON_SECRET` token guard
- `export const runtime = 'nodejs'` for web-push compatibility
- Queries `pushQueue WHERE sent_at IS NULL AND (held_until IS NULL OR held_until <= now())` — limit 100
- Batching: groups by `userId::eventType`; collapses `new_message` to "X new messages", `jam_rsvp` to "X jam updates"
- Per-user: checks `notificationPreferences` (skip if `pushEnabled=false`), re-checks quiet hours (belt-and-suspenders)
- Sends via `sendPushToUser`, catches `SUBSCRIPTION_EXPIRED` (410) and deletes stale subscription
- Marks all batched rows `sentAt = now()`
- Never throws — returns JSON `{ sent: N }` always

### Task 2: Push Triggers + Permission Prompt Hook + UI Wiring

**`src/hooks/usePushPermission.ts`**
- Exports `usePushPermission()` returning `{ promptForPush, permissionState }`
- Detects support on mount (`Notification`, `serviceWorker`, `PushManager`)
- `promptForPush`: requestPermission → `pushManager.subscribe` → extract p256dh/auth as base64 → POST `/api/push/subscribe`
- Does NOT auto-prompt — callers invoke at the right moment

**Messages API trigger** (`src/app/api/messages/[conversationId]/route.ts`):
- After insert: resolves recipient ID from conversation participants, fetches sender name, calls `queuePushNotification` with `batchKey = msg_{conversationId}`

**RSVP API triggers** (`src/app/api/jams/[id]/rsvp/route.ts`):
- After join: queues push for jam host (skips if host === joiner), language-aware title/body from `preferredLocale`
- After waitlist promotion: queues push for promoted user, language-aware "You're in!" / "קיבלת מקום!"

**Reviews API trigger** (`src/app/api/reviews/route.ts`):
- After insert: queues `review` push for reviewee — no reviewer name (privacy: thumbs-up/down only)

**Profile update partner-match trigger** (`src/app/api/user/update-profile/route.ts`):
- Fires only if `city`, `role`, or `level` included in update with non-empty value
- IIFE (non-blocking): fetches updated user from DB, queries complementary users by city + complementary role + adjacent level
- Rate limit: skips if matched user already received `partner_match` push today (Israel timezone start-of-day)
- Deep link: `/members/{updatedUserId}`

**JamCard UI wiring** (`src/components/jams/JamCard.tsx`):
- Imports `usePushPermission`; after successful RSVP `join` and `permissionState === 'default'`: `void promptForPush()`

**ChatThread UI wiring** (`src/components/messages/ChatThread.tsx`):
- Imports `usePushPermission`; after successful message send and `permissionState === 'default'`: `void promptForPush()`

## Deviations from Plan

None — plan executed exactly as written.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | `1c41d87` | feat(07-02): push subscribe API + batch cron dispatcher |
| Task 2 | `770ea02` | feat(07-02): push triggers, partner-match, permission prompt hook + UI wiring |

## Self-Check: PASSED

- FOUND: src/app/api/push/subscribe/route.ts
- FOUND: src/app/api/cron/push-batch/route.ts
- FOUND: src/hooks/usePushPermission.ts
- FOUND: commit 1c41d87
- FOUND: commit 770ea02
