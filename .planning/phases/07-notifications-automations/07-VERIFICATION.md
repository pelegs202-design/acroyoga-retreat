---
phase: 07-notifications-automations
verified: 2026-04-01T00:10:00Z
status: human_needed
score: 5/5 success criteria verified
re_verification:
  previous_status: gaps_found
  previous_score: 4/5
  gaps_closed:
    - "Challenge participant receives WhatsApp reminders the day before and morning of each session (NOTIF-03) — phone lookup now queries challengeEnrollments.customerPhone (primary) and quizLeads.phone (fallback) by attendee email; unsafe cast removed; WhatsApp send path is reachable"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Push permission prompt timing — RSVP to a jam"
    expected: "After first successful RSVP, browser push permission dialog appears. Not before."
    why_human: "Browser permission dialog cannot be verified programmatically — requires live browser interaction"
  - test: "Push deep-link click-through"
    expected: "Clicking a push notification opens the app to the correct conversation or jam detail page"
    why_human: "Requires a live push delivery and click — cannot be simulated by grep"
  - test: "Email template visual rendering"
    expected: "ChallengeConfirmation, SessionReminder, NurtureStep, CompletionCertificate render with dark background (#0a0a0a), hot pink (#F472B6) accents, Heebo font"
    why_human: "Visual appearance verification requires running react-email dev server"
  - test: "NotificationPreferences toggles in Settings"
    expected: "Each toggle saves without page reload; quiet hours dropdowns persist on page refresh; WhatsApp OFF shows cancellation side-effect"
    why_human: "Client-side state persistence and PATCH API interaction requires live browser testing"
  - test: "Cron endpoint auth"
    expected: "All four cron endpoints return 200 with correct CRON_SECRET Bearer token and 401 without it"
    why_human: "Requires deployed environment with CRON_SECRET set — cannot be tested locally without env var"
---

# Phase 7: Notifications + Automations — Verification Report

**Phase Goal:** The platform reaches out to users at the right moment — jam reminders, message alerts, challenge prep — so engagement does not depend on users remembering to check the app
**Verified:** 2026-04-01T00:10:00Z
**Status:** human_needed
**Re-verification:** Yes — after gap closure (Plan 07-06, commit bbc78be)

---

## Re-Verification Summary

Previous status: `gaps_found` (4/5 success criteria). One gap: NOTIF-03 WhatsApp jam reminders silently skipped because `user.phone` does not exist on the user table.

Plan 07-06 closed the gap by replacing the dead unsafe cast with a real two-stage phone lookup. The fix was verified against actual file contents, schema columns, and commit history.

**Current status: `human_needed` — all 5 automated must-haves verified, 5 items awaiting live browser/cron testing (carry-forward from initial verification).**

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User receives a push notification when they get a new direct message or jam RSVP update | VERIFIED | `queuePushNotification` called in messages API (2 call sites confirmed); push-batch cron sends via `sendPushToUser`; JamCard and ChatThread wire `promptForPush` after first action |
| 2 | User receives an email confirmation after signing up for the challenge and a reminder the day before each session | VERIFIED | `email_challenge_reminders` drip enrolled on payment; email-drip cron sends SessionReminder; jam-reminders cron sends email for confirmed jamSession attendees; ChallengeConfirmation template exists (220 lines) |
| 3 | Challenge participant receives WhatsApp reminders the day before and morning of each session | VERIFIED | jam-reminders/route.ts (commit bbc78be): queries `challengeEnrollments` by `customerEmail` (primary, `status='confirmed'`, `desc(paidAt)`) then falls back to `quizLeads` by `email` (`desc(createdAt)`); `if (userPhone)` guard reached with real value; `sendWhatsAppTemplate` call present and reachable at line 195 |
| 4 | New quiz signup receives a WhatsApp warm-up drip sequence building excitement before the first class | VERIFIED | quiz/leads/route.ts enrolls challenge leads in `wa_challenge_prepay` (7 steps) and workshop leads in `wa_workshop` (3 steps); whatsapp-drip cron processes due enrollments with template personalization (4 enrollment call sites confirmed) |
| 5 | Lead who did not convert receives an email nurture follow-up sequence | VERIFIED | quiz/leads/route.ts also enrolls in `email_nurture`; email-drip cron present (email_nurture referenced 8 times); NurtureStep template with archetype personalization; unsubscribe endpoint cancels enrollments; emailMarketing preference respected |

**Score: 5/5 success criteria verified**

---

## NOTIF-03 Gap Closure: Three-Level Verification

### Level 1: Exists

`src/app/api/cron/jam-reminders/route.ts` — present (257 lines).

Commit `bbc78be` ("fix(07-06): resolve attendee phone via challengeEnrollments/quizLeads") modifies this file: +32, -8.

### Level 2: Substantive — All six plan verification checks pass

| Check | Result | Detail |
|-------|--------|--------|
| `challengeEnrollments` imported from schema | PASS | Line 8: `challengeEnrollments,` in schema import |
| `quizLeads` imported from schema | PASS | Line 9: `quizLeads,` in schema import |
| Unsafe cast `(attendeeUser as { phone?: string })` removed | PASS | `grep` returns exit 1 — pattern not found anywhere in file |
| "Phase 7+ enhancement" placeholder comment removed | PASS | `grep` returns exit 1 — pattern not found anywhere in file |
| `sendWhatsAppTemplate` called with `userPhone` | PASS | Line 195: `sendWhatsAppTemplate({ to: userPhone, ... })` inside `if (userPhone)` block |
| Email send block untouched | PASS | Lines 209-238 unchanged — `sendTransactionalEmail` with `SessionReminder` template |

### Level 3: Wired — Phone lookup reaches real schema columns

| Source column | Schema location | File reference |
|---------------|----------------|----------------|
| `challengeEnrollments.customerPhone` | `schema.ts` line 229: `customerPhone: text("customer_phone")` | `jam-reminders/route.ts` line 169: `.select({ customerPhone: challengeEnrollments.customerPhone })` |
| `challengeEnrollments.customerEmail` | `schema.ts` line 227: `customerEmail: text("customer_email")` | `jam-reminders/route.ts` line 173: `eq(challengeEnrollments.customerEmail, attendeeUser.email)` |
| `challengeEnrollments.status` | `schema.ts` line 230: `status: text("status")` | `jam-reminders/route.ts` line 174: `eq(challengeEnrollments.status, "confirmed")` |
| `quizLeads.phone` | `schema.ts` line 198: `phone: text("phone").notNull()` | `jam-reminders/route.ts` line 185: `.select({ phone: quizLeads.phone })` |
| `quizLeads.email` | `schema.ts` line 197: `email: text("email").notNull()` | `jam-reminders/route.ts` line 187: `eq(quizLeads.email, attendeeUser.email)` |

All columns exist in schema. All references in the cron use the correct table objects imported from schema (not string literals). Both DB lookups use `.catch(() => [])` — phone lookup failure is non-fatal; the cron degrades gracefully to email-only for that attendee.

---

## Required Artifacts — All Plans

### Plan 01 — Foundation (carry-forward, no regressions)

| Artifact | Status | Evidence |
|----------|--------|---------|
| `src/lib/db/schema.ts` — 4 notification tables | VERIFIED | pushSubscriptions, notificationPreferences, pushQueue, dripEnrollments present |
| `src/lib/push.ts` — VAPID setup + sendPushToUser | VERIFIED | webpush.setVapidDetails on init; sendPushToUser with TTL=24h |
| `src/lib/whatsapp.ts` — sendWhatsAppTemplate + normalizeIsraeliPhone | VERIFIED | Fetches graph.facebook.com/v21.0; 05x → 972x normalization |
| `src/lib/notifications/drip-sequences.ts` — 5 sequence types | VERIFIED | wa_challenge_prepay (7), wa_challenge_postpay (5), wa_workshop (3), email_nurture (12), email_challenge_reminders (4) |
| `src/app/sw.ts` — push + notificationclick listeners | VERIFIED | Both listeners before serwist.addEventListeners() |
| `vercel.json` — 4 cron definitions | VERIFIED | push-batch (*/5), whatsapp-drip, email-drip, jam-reminders (0 5,15) |

### Plan 02 — Push System (carry-forward, no regressions)

| Artifact | Status | Evidence |
|----------|--------|---------|
| `src/app/api/push/subscribe/route.ts` | VERIFIED | Auth-gated; upserts on endpoint conflict; 201 |
| `src/app/api/cron/push-batch/route.ts` | VERIFIED | Quiet hours; collapses new_message/jam_rsvp; 410 cleanup |
| `src/hooks/usePushPermission.ts` | VERIFIED | promptForPush; subscribes via pushManager; POSTs to /api/push/subscribe |

### Plan 03 — WhatsApp Drip (gap now closed)

| Artifact | Status | Evidence |
|----------|--------|---------|
| `src/app/api/cron/whatsapp-drip/route.ts` | VERIFIED | DRIP_SEQUENCES lookup; sendWhatsAppTemplate; expiry; STOP opt-out; 3-strike cancel |
| `src/app/api/cron/jam-reminders/route.ts` | VERIFIED | Email path works; WhatsApp path now resolves phone from challengeEnrollments/quizLeads — gap closed by bbc78be |

### Plan 04 — Email System (carry-forward, no regressions)

| Artifact | Status | Evidence |
|----------|--------|---------|
| `src/lib/email/templates/ChallengeConfirmation.tsx` | VERIFIED | 220 lines; bilingual; dark/pink brand |
| `src/lib/email/templates/SessionReminder.tsx` | VERIFIED | 214 lines; isEve prop; locale-aware |
| `src/lib/email/templates/NurtureStep.tsx` | VERIFIED | 356 lines; stepNumber 1-12; archetype personalization |
| `src/lib/email/templates/CompletionCertificate.tsx` | VERIFIED | 254 lines; completionDate prop |
| `src/lib/email/index.ts` | VERIFIED | Resend wrapper; List-Unsubscribe headers; HMAC-SHA256 token |
| `src/app/api/cron/email-drip/route.ts` | VERIFIED | Nurture cycling; emailMarketing gating; CompletionCertificate on final step |
| `src/app/api/unsubscribe/route.ts` | VERIFIED | GET bilingual HTML; POST RFC 8058; verifyUnsubToken; cancels email_nurture |

### Plan 05 — Preferences UI (carry-forward, no regressions)

| Artifact | Status | Evidence |
|----------|--------|---------|
| `src/components/settings/NotificationPreferences.tsx` | VERIFIED | 220 lines; PATCH on change; optimistic update with rollback; quiet hours |
| `src/app/api/notifications/preferences/route.ts` | VERIFIED | GET returns defaults; PATCH validates; upserts; whatsappEnabled=false cancels WA drips |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/app/sw.ts` | push display | `self.addEventListener('push')` | WIRED | Fires before serwist.addEventListeners() |
| `src/lib/push.ts` | web-push | `webpush.sendNotification` | WIRED | TTL + urgency params |
| `src/lib/whatsapp.ts` | Meta Graph API | `fetch(graph.facebook.com)` | WIRED | Bearer token; error body thrown |
| `src/app/api/messages/[conversationId]/route.ts` | push notifications | `queuePushNotification` | WIRED | 2 call sites confirmed |
| `src/app/api/jams/[id]/rsvp/route.ts` | push notifications | `queuePushNotification` | WIRED | Lines 143 + 251 (host + promoted user) |
| `src/app/api/cron/jam-reminders/route.ts` | `src/lib/whatsapp.ts` | `sendWhatsAppTemplate` with phone from DB lookup | WIRED | Line 195; phone resolved from challengeEnrollments or quizLeads; guard `if (userPhone)` reached with real value (NOTIF-03 gap closed) |
| `src/app/api/cron/whatsapp-drip/route.ts` | `src/lib/whatsapp.ts` | `sendWhatsAppTemplate` | WIRED | Line 163 |
| `src/app/api/payments/webhook/route.ts` | drip enrollment | `cancelDrip` + `enrollInDrip` | WIRED | Lines 113, 116, 120, 133 |
| `src/app/api/quiz/leads/route.ts` | drip enrollment | `enrollInDrip` | WIRED | 4 call sites |
| `src/app/api/cron/email-drip/route.ts` | `src/lib/email/index.ts` | `sendMarketingEmail` | WIRED | Line 225 via sendNurtureEmail |
| `src/components/settings/NotificationPreferences.tsx` | `/api/notifications/preferences` | `fetch PATCH` | WIRED | Line 78 |

---

## Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| NOTIF-01 | 07-01, 07-02, 07-05 | Push notifications for new messages, jam RSVPs, and partner activity | SATISFIED | Push pipeline complete: subscription storage, 4 API trigger points, batch cron with quiet hours, browser prompt in JamCard + ChatThread |
| NOTIF-02 | 07-01, 07-04, 07-05 | Email notifications for confirmations, jam reminders, and account actions | SATISFIED | ChallengeConfirmation template; email_challenge_reminders drip; jam-reminders email path; unsubscribe (GET + POST RFC 8058) |
| NOTIF-03 | 07-01, 07-03, 07-06 | WhatsApp reminder before class (day before + morning of for 30-day challenge sessions) | SATISFIED | jam-reminders cron now resolves phone via challengeEnrollments.customerPhone (primary) or quizLeads.phone (fallback) by email; WhatsApp send path is live; graceful degradation to email-only when no phone found. Gap closed by commit bbc78be. |
| NOTIF-04 | 07-01, 07-03 | WhatsApp warm-up automation sequence after quiz signup | SATISFIED | quiz/leads enrolls wa_challenge_prepay (7 steps) or wa_workshop (3 steps); whatsapp-drip cron processes with personalization, expiry/opt-out, 3-strike cancel |
| NOTIF-05 | 07-01, 07-04 | Email nurture campaign for leads who did not convert | SATISFIED | email_nurture (12 steps, cycles from step 6); emailMarketing gating; one-click unsubscribe; archetype personalization in NurtureStep |

All 5 NOTIF requirements satisfied. No orphaned requirements found — REQUIREMENTS.md marks all five as Complete under Phase 7.

---

## Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| None | — | — | — |

The "Phase 7+ enhancement" placeholder comment and the dead `(attendeeUser as { phone?: string })` unsafe cast have both been removed (confirmed by grep returning exit 1 on both patterns). No TODO/FIXME/placeholder stubs found in any critical path file.

---

## Human Verification Required

These items carry forward from the initial verification — they are behavioral/visual and cannot be confirmed by static analysis.

### 1. Push Permission Prompt Timing

**Test:** Sign in, navigate to /jams, RSVP to a jam for the first time
**Expected:** Browser push permission dialog appears after RSVP succeeds, not on page load. A second RSVP should not re-prompt if already granted.
**Why human:** Browser `Notification.requestPermission()` dialog cannot be verified programmatically

### 2. Push Notification Deep-Link Click-Through

**Test:** Have a second user send a direct message, wait for push notification, click it
**Expected:** Notification click opens or focuses the app and navigates to the correct conversation URL
**Why human:** Requires live push delivery via VAPID and a real browser notification click

### 3. Email Template Visual Rendering

**Test:** Run `npx react-email dev` in the project root, open each template in the preview server
**Expected:** ChallengeConfirmation, SessionReminder, NurtureStep, CompletionCertificate render with dark background (#0a0a0a), hot pink (#F472B6) accents, Heebo font. Hebrew locale shows RTL layout.
**Why human:** Visual appearance requires running the react-email preview server

### 4. Settings Notification Toggles

**Test:** Navigate to Settings, locate the Notifications section, toggle each of the 3 switches and adjust quiet hours
**Expected:** Each toggle saves without page reload; quiet hours selects persist on page refresh; "Preferences saved" feedback appears briefly; no console errors
**Why human:** Client-side state persistence and optimistic update/rollback behavior requires live browser testing

### 5. Cron Endpoints Auth

**Test:** `curl -H "Authorization: Bearer <CRON_SECRET>" https://<your-domain>/api/cron/push-batch` and similarly for the other 3 crons
**Expected:** Returns 200 JSON with `{ sent: N }` or `{ processed: N, sent: N, errors: N }`. Without the token: 401.
**Why human:** Requires deployed environment with CRON_SECRET env var configured

---

## Gaps Summary

No gaps remain. NOTIF-03 is the only gap that was identified in the initial verification. Plan 07-06 closed it with a targeted fix to `src/app/api/cron/jam-reminders/route.ts`:

- Removed the dead `(attendeeUser as { phone?: string }).phone` unsafe cast that was silently returning `undefined` for every user
- Added a primary lookup against `challengeEnrollments.customerPhone` (filtered to `status='confirmed'`, ordered by `paidAt desc`) — uses paid enrollment data for highest confidence
- Added a fallback lookup against `quizLeads.phone` (ordered by `createdAt desc`) — covers attendees who enrolled via quiz but may not have a payment record
- Both lookups use `.catch(() => [])` so a DB failure is non-fatal; the cron degrades to email-only for that attendee
- Removed stale placeholder comment ("Phase 7+ enhancement")
- Commit `bbc78be` on 2026-04-01 carries these changes; commit stats (+32, -8 lines) match described scope

The `sendWhatsAppTemplate` call at line 195 is now reachable for any attendee who provided a phone number at payment or quiz submission time. Attendees with no phone on either table continue to receive email reminders only (correct graceful behavior).

---

_Verified: 2026-04-01T00:10:00Z_
_Verifier: Claude (gsd-verifier)_
_Re-verification after Plan 07-06 gap closure_
