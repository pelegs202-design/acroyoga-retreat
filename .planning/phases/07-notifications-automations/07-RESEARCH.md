# Phase 7: Notifications + Automations - Research

**Researched:** 2026-04-01
**Domain:** Push notifications (VAPID/Serwist), WhatsApp Cloud API, Resend email sequences, Vercel Cron Jobs
**Confidence:** MEDIUM-HIGH (verified against official docs and Context7 where available; WhatsApp pricing confirmed via Ycloud/Meta; Vercel cron from official docs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Push notification triggers & content**
- Events that fire push: New direct message, jam RSVP updates (someone joins your jam, waitlist promotion, jam cancelled), new review received, partner activity (new member matching city + role + level)
- Tone: Minimal & clean — "New message from Noa", no emoji, straightforward
- Batching: Batch if multiple events arrive close together (e.g., 3 messages in 1 min → one push "3 new messages")
- Quiet hours: 22:00-08:00 default, hold pushes during night, deliver in morning. User can adjust.
- Language: Match user's app language setting (Hebrew or English)
- Partner activity matching: City + role + level — precise matching, only notify when new member complements the user
- Partner activity rate limit: Max 1 partner-match push per day, even if multiple join
- Click-through: Deep link to content — message push → opens that conversation, jam push → opens that jam
- Permission prompt timing: After first meaningful action (RSVP to jam or send a message), not on first login

**WhatsApp drip sequence design**
- API: Official Meta Cloud API (direct Meta integration)
- Business identity: Personal feel with business name — messages feel like they're from a person ("אני מאקרוחבורה") on a business number
- Language: Match quiz language — if they took quiz in English, WA in English; Hebrew quiz → Hebrew WA
- Personalization: Use first name from quiz signup
- Send time: Evening 19:00-20:00
- Unsubscribe: Reply STOP to opt out — include "שלח/י STOP להפסיק" at bottom of first message
- Reply behavior: Continue drip regardless of user replies — replies don't pause or stop the sequence

**Pre-payment challenge drip (7+ messages)**
- Content arc: Mix value + urgency — Welcome → tip → testimonial → tip → scarcity/spots → countdown → final push
- Spacing: Decreasing gaps — start every 2 days, tighten to daily as challenge start date approaches
- Expiry: If challenge start date passes before conversion, stop drip and send missed-it message ("Hey, the challenge started! Next round is in X weeks" with waitlist link)
- On payment: Stop pre-payment drip, switch to post-payment drip (different sequence)
- CTA buttons: Yes — include quick-reply buttons on templates (e.g., "לפרטים נוספים", "להרשם עכשיו")

**Post-payment challenge drip (5 messages)**
- Congrats → intro to community → prep tips → what to expect → see you tomorrow

**Challenge session reminders**
- Day before at 18:00 + morning of at 08:00 — two reminders per session

**Workshop inquiry drip (3 messages)**
- Confirmation → what to expect → follow-up if no response

**Email sequence strategy**
- Tool: Resend for everything (transactional + marketing) — already integrated
- From address: shai@acroretreat.co.il for all emails
- Design: Brutalist brand style — dark background, hot pink accents, Heebo font, bold — matches the app
- Language: Match app/quiz language (bilingual templates)
- Tracking: Track both opens and clicks
- Unsubscribe: One-click unsubscribe from all marketing emails
- Reminder timing: Same as WhatsApp — day before 18:00 + morning 08:00
- Channel overlap: Both WhatsApp AND email always — redundancy intentional, no fallback logic

**Challenge signup emails**
1. Confirmation email on signup — "You're in! Here's what to expect"
2. Day-before session reminder — "Tomorrow at 18:00 — bring comfortable clothes"
3. Post-session recap — session summary + next session details
4. Completion certificate — styled email + shareable branded image for Instagram/WhatsApp

**Nurture sequence (leads who didn't convert)**
- Never stop — email indefinitely until conversion or unsubscribe
- Initial burst (first month): Weekly emails — value content + social proof + community highlights
- Offer strategy: Value-first for 4 emails, then single discount offer on email 5
- Personalization: Reference their quiz archetype result in emails
- Long-term (after first month): Biweekly — mix of community highlights + educational tips + next challenge date CTA
- Content management: Pre-written rotating templates (10-12 templates that cycle)
- No cap: Never stops, biweekly forever until convert or unsub

**Notification preferences & opt-out**
- Settings location: Inside existing Settings page — add a "Notifications" section
- Controls: Per-channel toggles: Push (on/off), Email marketing (on/off), WhatsApp (on/off)
- Defaults: Everything ON — push, email, WhatsApp all enabled by default
- Transactional emails (confirmations, password resets) always send regardless of marketing toggle

### Claude's Discretion
- Push notification batching window/algorithm
- Exact quiet hours adjustment UI
- WhatsApp template text/copy (content of each drip message)
- Email template HTML/design implementation
- Shareable completion image design
- Cron/scheduling implementation for timed sends
- Database schema for notification preferences and drip state tracking

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| NOTIF-01 | Push notifications for new messages, jam RSVPs, and partner activity | VAPID + web-push + Serwist push event handler patterns documented; subscription storage schema defined |
| NOTIF-02 | Email notifications for confirmations, jam reminders, and account actions | Resend already integrated; scheduledAt param verified; transactional + marketing patterns documented |
| NOTIF-03 | WhatsApp reminder before class (day before + morning of for 30-day challenge sessions) | Meta Cloud API REST pattern documented; Vercel Cron schedule verified for 08:00 + 18:00 UTC (Pro plan required) |
| NOTIF-04 | WhatsApp warm-up automation sequence after quiz signup (drip messages to build excitement before first class) | Drip state machine DB schema documented; cron dispatch pattern; template approval process documented |
| NOTIF-05 | Email nurture campaign (follow-up sequences, re-engagement for leads who didn't convert) | Resend scheduledAt + batch.send patterns; drip step state machine in DB; rotating template approach documented |
</phase_requirements>

---

## Summary

Phase 7 layers three notification channels (VAPID push, WhatsApp Cloud API, Resend email) onto an existing Next.js 16 + Serwist PWA + Drizzle/Neon stack. The core challenge is orchestrating timed sequences (drip messages, session reminders) without persistent processes — Vercel's serverless environment requires Vercel Cron Jobs as the scheduling backbone, with a drip-state table in Neon tracking which step each lead is on and when to fire next.

The Serwist service worker already exists at `src/app/sw.ts` and handles offline precaching. Push notifications require extending it with `push` and `notificationclick` event listeners before the `serwist.addEventListeners()` call, plus a new database table for push subscriptions (endpoint, p256dh, auth). The VAPID key pair must be generated once and stored in environment variables. The permission prompt must be deferred until after the user's first meaningful action (RSVP or send message), not on page load.

WhatsApp requires direct Meta Cloud API integration. The platform needs a Meta Developer App, a WhatsApp Business Account, and a registered business phone number (fresh number not previously on WhatsApp). Template messages must be pre-approved by Meta before sending — approval currently takes 24-48 hours. Templates are categorized as Utility (reminders) or Marketing (drip/nurture), which affects pricing. As of July 1 2025, Meta moved from per-conversation to per-message billing. Hebrew is a supported language with code `he`. Resend is already integrated in the project and needs no new credentials — it only needs email templates built and the drip scheduling crons wired up.

**Primary recommendation:** Build the drip state machine as a central `drip_enrollments` table with `sequenceType`, `currentStep`, and `nextFireAt` columns. All three cron jobs (push batching, WhatsApp send, email send) query this table and fire based on `nextFireAt <= now()`. This avoids complex inter-job coordination and keeps state in one place.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `web-push` | 3.6.7 | VAPID key generation + server-side push sending | Official W3C Web Push Protocol implementation; maintained by Google engineers |
| `@types/web-push` | 3.6.4 | TypeScript types for web-push | Official type definitions; project uses strict TypeScript |
| Meta WhatsApp Cloud API | v21.0 (Graph API) | Send WhatsApp template messages | Locked decision — direct Meta integration, no third-party provider |
| Resend SDK | ^6.10.0 (already installed) | All email sending | Already in package.json; existing usage in auth.ts and quiz/workshop route |
| Vercel Cron Jobs | Built-in | Schedule recurring sends | Native to Vercel; no additional infrastructure; defined in vercel.json |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-email` | Latest | Build email templates as React components | When building brutalist HTML email templates for Resend |
| `@react-email/components` | Latest | Pre-built email primitives (Html, Body, Section, etc.) | Components for email template composition |
| `sharp` (optional) | Latest | Generate shareable completion certificate image | If generating OG/certificate images server-side |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vercel Cron (built-in) | Inngest / Trigger.dev | Inngest gives better retry/observability but adds external service dependency and cost; Vercel Cron is sufficient for < 10 cron jobs on Pro plan |
| web-push (VAPID) | Firebase Cloud Messaging | FCM is heavy and Google-dependent; VAPID is standard, provider-free, works with Serwist already in project |
| Meta Cloud API direct | Twilio / MessageBird / Green API | Locked decision — direct Meta is free API access, no per-message markup from middleware providers |
| Resend for email | Sendgrid / Postmark | Locked decision — already integrated and working in auth.ts |

**Installation:**
```bash
npm install web-push @types/web-push
# react-email packages if not already installed:
npm install react-email @react-email/components
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   └── api/
│       ├── push/
│       │   ├── subscribe/route.ts       # Store push subscription
│       │   └── send/route.ts            # Internal: send push to user(s)
│       ├── cron/
│       │   ├── push-batch/route.ts      # Cron: flush queued push notifications
│       │   ├── whatsapp-drip/route.ts   # Cron: fire due WhatsApp drip steps
│       │   ├── email-drip/route.ts      # Cron: fire due email drip steps
│       │   └── jam-reminders/route.ts   # Cron: day-before + morning jam reminders
│       └── notifications/
│           └── preferences/route.ts     # GET/PATCH user notification prefs
├── lib/
│   ├── push.ts                          # webpush.setVapidDetails + sendToUser()
│   ├── whatsapp.ts                      # sendTemplate() wrapping fetch to graph API
│   ├── email/
│   │   ├── index.ts                     # resend.emails.send() wrappers
│   │   └── templates/
│   │       ├── ChallengeConfirmation.tsx
│   │       ├── SessionReminder.tsx
│   │       ├── NurtureStep.tsx
│   │       └── CompletionCertificate.tsx
│   └── db/
│       └── schema.ts                    # Extended with new tables (see below)
└── components/
    └── settings/
        └── NotificationPreferences.tsx  # Toggle UI in Settings page
vercel.json                              # Cron job definitions
```

### Pattern 1: Vercel Cron Job with CRON_SECRET Guard

**What:** Scheduled API routes invoked by Vercel's cron system, secured with a shared secret.
**When to use:** All timed dispatches (drip sends, jam reminders, push batching).

```typescript
// Source: https://vercel.com/docs/cron-jobs/manage-cron-jobs
// src/app/api/cron/whatsapp-drip/route.ts
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs'; // required for web-push and fetch

export function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  // ... dispatch logic
  return Response.json({ success: true });
}
```

```json
// vercel.json — Pro plan required for sub-daily intervals
{
  "crons": [
    { "path": "/api/cron/push-batch",     "schedule": "*/5 * * * *"  },
    { "path": "/api/cron/whatsapp-drip",  "schedule": "0 17 * * *"   },
    { "path": "/api/cron/email-drip",     "schedule": "0 17 * * *"   },
    { "path": "/api/cron/jam-reminders",  "schedule": "0 6 * * *"    }
  ]
}
```

Note: All Vercel Cron times are UTC. Israel is UTC+3 (UTC+2 in winter). To fire at 19:00 Israel time, use `0 16 * * *` in summer and `0 17 * * *` in winter.

### Pattern 2: Drip State Machine Table

**What:** One table tracks every active automation enrollment with current step and next fire time.
**When to use:** WhatsApp drip sequences, email nurture sequences.

```typescript
// Proposed schema addition to src/lib/db/schema.ts
export const dripEnrollments = pgTable('drip_enrollments', {
  id:             text('id').primaryKey(),
  leadId:         text('lead_id').notNull(),           // references quiz_leads.id
  userId:         text('user_id'),                     // null for pre-auth leads
  sequenceType:   text('sequence_type').notNull(),      // 'wa_challenge_prepay' | 'wa_challenge_postpay' | 'email_nurture' | 'wa_workshop'
  channel:        text('channel').notNull(),            // 'whatsapp' | 'email'
  recipientPhone: text('recipient_phone'),
  recipientEmail: text('recipient_email'),
  recipientName:  text('recipient_name').notNull(),
  preferredLocale:text('preferred_locale').notNull().default('he'),
  currentStep:    integer('current_step').notNull().default(0),
  totalSteps:     integer('total_steps').notNull(),
  nextFireAt:     timestamp('next_fire_at', { withTimezone: true }),
  completedAt:    timestamp('completed_at', { withTimezone: true }),
  cancelledAt:    timestamp('cancelled_at', { withTimezone: true }),
  cancelReason:   text('cancel_reason'),               // 'paid' | 'opted_out' | 'expired'
  createdAt:      timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('drip_enrollments_next_fire_idx').on(table.nextFireAt),
  index('drip_enrollments_lead_id_idx').on(table.leadId),
  index('drip_enrollments_sequence_type_idx').on(table.sequenceType),
]);
```

Cron queries: `SELECT * FROM drip_enrollments WHERE next_fire_at <= now() AND completed_at IS NULL AND cancelled_at IS NULL LIMIT 50`

### Pattern 3: VAPID Push Subscription Storage

**What:** Store browser push subscriptions per user to enable server-initiated pushes.

```typescript
// Additional table for schema.ts
export const pushSubscriptions = pgTable('push_subscriptions', {
  id:            text('id').primaryKey(),
  userId:        text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  endpoint:      text('endpoint').notNull().unique(),
  p256dh:        text('p256dh').notNull(),     // browser public key
  auth:          text('auth').notNull(),        // auth secret
  userAgent:     text('user_agent'),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('push_subscriptions_user_id_idx').on(table.userId),
]);

// Notification preference toggles (per-user)
export const notificationPreferences = pgTable('notification_preferences', {
  userId:            text('user_id').primaryKey().references(() => user.id, { onDelete: 'cascade' }),
  pushEnabled:       boolean('push_enabled').default(true).notNull(),
  emailMarketing:    boolean('email_marketing').default(true).notNull(),
  whatsappEnabled:   boolean('whatsapp_enabled').default(true).notNull(),
  quietHoursStart:   integer('quiet_hours_start').default(22).notNull(),  // 0-23
  quietHoursEnd:     integer('quiet_hours_end').default(8).notNull(),
  updatedAt:         timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

// Push notification queue (for batching + quiet hours)
export const pushQueue = pgTable('push_queue', {
  id:         text('id').primaryKey(),
  userId:     text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  eventType:  text('event_type').notNull(),   // 'new_message' | 'jam_rsvp' | 'review' | 'partner_match'
  title:      text('title').notNull(),
  body:       text('body').notNull(),
  deepLink:   text('deep_link').notNull(),    // e.g. '/messages/conv_xxx'
  batchKey:   text('batch_key'),              // groups related events for batching
  queuedAt:   timestamp('queued_at').defaultNow().notNull(),
  sentAt:     timestamp('sent_at', { withTimezone: true }),
  heldUntil:  timestamp('held_until', { withTimezone: true }),  // quiet hours hold
}, (table) => [
  index('push_queue_user_unsent_idx').on(table.userId, table.sentAt),
]);
```

### Pattern 4: VAPID Service Worker Extension (Serwist)

**What:** Extend existing `src/app/sw.ts` with push + click handlers BEFORE `serwist.addEventListeners()`.

```typescript
// Source: https://serwist.pages.dev/docs/next/getting-started
// src/app/sw.ts (extended)
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: { url: string; revision: string | null }[];
};

// MUST come BEFORE serwist.addEventListeners()
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;
  const data = event.data.json() as { title: string; body: string; url: string };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: { url: data.url },
      dir: 'auto',  // browser auto-detects RTL for Hebrew
    })
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(targetUrl));
      if (existing) return existing.focus();
      return self.clients.openWindow(targetUrl);
    })
  );
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [{
      url: '/~offline',
      matcher({ request }) { return request.destination === 'document'; },
    }],
  },
});

serwist.addEventListeners();
```

### Pattern 5: Meta WhatsApp Cloud API Template Send

**What:** Send a pre-approved WhatsApp template message via direct REST call.

```typescript
// Source: https://developers.facebook.com/blog/post/2022/10/31/sending-messages-with-whatsapp-in-your-nodejs-application/
// src/lib/whatsapp.ts
const WA_API_VERSION = 'v21.0';
const WA_PHONE_ID = process.env.WA_PHONE_NUMBER_ID!;
const WA_TOKEN = process.env.WA_CLOUD_API_TOKEN!;

export async function sendWhatsAppTemplate({
  to,
  templateName,
  languageCode,     // 'he' for Hebrew, 'en_US' for English
  bodyParams = [],  // Array of string values for {{1}}, {{2}} placeholders
}: {
  to: string;           // Phone number with country code, no + (e.g. "9725412345678")
  templateName: string;
  languageCode: string;
  bodyParams?: string[];
}) {
  const components = bodyParams.length > 0
    ? [{
        type: 'body',
        parameters: bodyParams.map((text) => ({ type: 'text', text })),
      }]
    : [];

  const res = await fetch(
    `https://graph.facebook.com/${WA_API_VERSION}/${WA_PHONE_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WA_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`WhatsApp API error: ${JSON.stringify(err)}`);
  }
  return res.json();
}
```

### Pattern 6: Server-Side Push Send

```typescript
// Source: https://github.com/web-push-libs/web-push
// src/lib/push.ts
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:admin@acrohavura.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function sendPushToUser(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; url: string }
) {
  const pushSub = {
    endpoint: subscription.endpoint,
    keys: { p256dh: subscription.p256dh, auth: subscription.auth },
  };
  try {
    await webpush.sendNotification(pushSub, JSON.stringify(payload), {
      urgency: 'normal',
      TTL: 60 * 60 * 24, // 24 hours TTL — drop if not delivered within a day
    });
  } catch (err: unknown) {
    // StatusCode 410 = subscription expired/unsubscribed — remove from DB
    if (typeof err === 'object' && err !== null && 'statusCode' in err && (err as { statusCode: number }).statusCode === 410) {
      // Caller should delete the subscription from DB
      throw Object.assign(new Error('Subscription expired'), { code: 'SUBSCRIPTION_EXPIRED' });
    }
    throw err;
  }
}
```

### Pattern 7: Resend with Scheduling

```typescript
// Source: https://resend.com/docs/send-with-nextjs
// Schedule a single email for the future
const { data, error } = await resend.emails.send({
  from: 'AcroHavura <shai@acroretreat.co.il>',
  to: [recipientEmail],
  subject: 'מחר בשעה 18:00 — יוגה אקרובטית',
  react: SessionReminderEmail({ name, sessionDate, city }),
  scheduledAt: new Date(reminderTime).toISOString(),  // up to 30 days ahead
  headers: {
    // Required for marketing emails (Gmail/Yahoo compliance)
    'List-Unsubscribe': `<https://acrohavura.com/unsubscribe?token=${unsubToken}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  },
  tags: [
    { name: 'sequence', value: sequenceType },
    { name: 'step', value: String(stepNumber) },
  ],
});

// Batch send (up to 100 at once, NO scheduling in batch mode)
const { data, error } = await resend.batch.send([
  { from: ..., to: ..., subject: ..., react: ... },
  { from: ..., to: ..., subject: ..., react: ... },
]);
```

**IMPORTANT:** `batch.send()` and `scheduledAt` are mutually exclusive. Scheduled sends must use `resend.emails.send()` individually, not `batch.send()`.

### Anti-Patterns to Avoid

- **Registering push handlers AFTER `serwist.addEventListeners()`:** Serwist takes ownership of the event loop — your handlers must be added first.
- **Using `node-cron` or `setInterval` in Vercel:** Serverless functions are stateless and ephemeral — timers do not persist. Use Vercel Cron Jobs exclusively.
- **Sending WhatsApp free-form text outside 24h customer window:** Meta only allows template messages to outbound-initiated conversations outside the 24-hour window. All drip sequences MUST use approved templates.
- **Storing VAPID private key in `NEXT_PUBLIC_` env var:** NEXT_PUBLIC_ is exposed to the browser. Private key must be in server-only env var (`VAPID_PRIVATE_KEY`).
- **Asking for push permission on page load:** User will immediately deny. Locked decision: prompt only after first RSVP or first sent message.
- **Using `batch.send()` with `scheduledAt`:** These are incompatible — `batch.send()` sends immediately only.
- **Ignoring 410 errors from webpush.sendNotification:** A 410 means the subscription is gone — must remove from DB or the cron will keep failing on that subscription.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Push payload encryption | Custom AES-GCM encryption | `web-push` library | RFC 8291 encryption is complex; web-push handles it correctly |
| VAPID signature generation | Custom JWT signing | `web-push.setVapidDetails()` | VAPID JWT format has specific expiry constraints |
| WhatsApp message delivery | Custom webhook server | Meta Cloud API + template system | Meta handles delivery, retry, read receipts; templates enforced by Meta |
| HTML email rendering | Raw HTML strings | `react-email` + `@react-email/components` | Email client compatibility (Outlook, Gmail) is a minefield; react-email pre-tests across clients |
| Cron scheduling | Custom database polling job | Vercel Cron Jobs | No persistent processes in serverless; Vercel Cron is the correct primitive |
| Unsubscribe token management | Custom crypto token system | Pass userId + HMAC or use Resend Audiences | Resend Audiences handles unsubscribe list management at scale |

**Key insight:** The scheduling problem in serverless environments is fundamentally different from traditional servers. The only correct approach on Vercel is: store "fire at" timestamps in the database, run a cron that queries for due items, process them, and update the next fire time. Do not attempt to use timeouts, setTimeout, or background async work.

---

## Common Pitfalls

### Pitfall 1: Hobby Plan Cron Limitations

**What goes wrong:** Cron expressions that run more than once per day fail deployment with "Hobby accounts are limited to daily cron jobs."
**Why it happens:** Vercel Hobby plan restricts crons to once per day. This phase needs multiple cron runs (push batching every 5 min, jam reminders at specific times).
**How to avoid:** Verify the project is on **Vercel Pro plan** before configuring crons. The push-batch cron runs every 5 minutes; the reminder crons run twice daily (08:00 and 18:00 UTC-ish). Both require Pro.
**Warning signs:** Deployment fails with cron frequency error. Check project billing plan first.

### Pitfall 2: WhatsApp Template Approval Blocking Development

**What goes wrong:** Templates must be approved before sending. If you start coding drip logic and templates are still in review, you cannot test end-to-end.
**Why it happens:** Meta template review takes 24-48 hours (marketing) up to a few days in edge cases.
**How to avoid:** Submit ALL templates at the start of Phase 7 before writing any code. Use Meta's test phone number for basic API connectivity testing while templates are in review. The roadmap note says "submit templates during Phase 6 to unblock Phase 7" — if this wasn't done, do it on day 1 of Phase 7.
**Warning signs:** Templates still "Pending" on day 2. Contact Meta Business support; ensure templates use approved variable format `{{1}}`, not custom syntax.

### Pitfall 3: WhatsApp Pricing Model Changed July 1 2025

**What goes wrong:** The old "1000 free conversations/month" free tier no longer applies as of July 1, 2025. Meta now charges per delivered message.
**Why it happens:** Meta transitioned from per-conversation to per-message billing.
**How to avoid:** Budget for per-message costs. Utility template messages (reminders) cost significantly less than marketing templates (drip sequences). For a small cohort (e.g., 30 challenge participants × 2 reminders × 30 days = 1800 utility messages), costs are minimal at ~$0.005-0.01/message. Marketing drip messages (7 messages × 50 leads = 350) are more expensive (~$0.05-0.15/message). Track usage in Meta Business Manager.
**Warning signs:** Unexpected billing from Meta; API returns rate-limit errors.

### Pitfall 4: VAPID Push Subscription Expiry (410 Errors)

**What goes wrong:** Stored push subscriptions become invalid when users clear browser data, revoke permissions, or switch browsers. `sendNotification()` throws with statusCode 410.
**Why it happens:** The push endpoint URL is browser-generated and expires.
**How to avoid:** Catch 410 errors in `sendPushToUser()` and delete the subscription from the database. Handle this in the cron that processes the push queue.
**Warning signs:** Push cron log shows repeated errors for the same user; "Push subscription has unsubscribed or expired" messages.

### Pitfall 5: Vercel Cron UTC Timezone

**What goes wrong:** Cron fires at wrong local time — 08:00 UTC is 11:00 Israel time (IDT, UTC+3) or 10:00 Israel time (IST, UTC+2 in winter).
**Why it happens:** Vercel crons always run in UTC.
**How to avoid:** Israel's challenge session reminders should fire at 18:00 local. That means:
  - IDT (Apr-Oct, UTC+3): Use `0 15 * * *` UTC to send at 18:00 local
  - IST (Oct-Apr, UTC+2): Use `0 16 * * *` UTC to send at 18:00 local
  - Morning of: IDT `0 5 * * *` UTC → 08:00 IDT; IST `0 6 * * *` UTC → 08:00 IST
  The simplest approach: pick one fixed UTC time that works year-round (e.g. `0 16 * * *` = 18:00 IDT / 18:00 IST — works both seasons since Israel uses two offsets). Document this explicitly.
**Warning signs:** Reminder sends arrive at 15:00 or 11:00 Israel time instead of 18:00.

### Pitfall 6: Push Permission Timing

**What goes wrong:** Prompt fires on page load; user denies; push never works for that user.
**Why it happens:** Browsers block repeated permission prompts after a user denies once.
**How to avoid:** Locked decision — prompt only after first meaningful action (first RSVP or first message sent). Implement a small hook that detects these events and shows the prompt. Once denied, do not show again; check `Notification.permission === 'denied'` before prompting.
**Warning signs:** Permission denied rate > 80% (industry average for on-load prompts is very high denial).

### Pitfall 7: Quiet Hours Hold + Push Batching Complexity

**What goes wrong:** Batching window and quiet hours interact in unexpected ways — a batch of messages could span the quiet-hours boundary.
**Why it happens:** Events are queued continuously; the cron fires every 5 minutes; quiet hours check must happen per-user, per-timezone.
**How to avoid:** Use `heldUntil` column in `push_queue` table. When queueing a push, if current time is in user's quiet hours, set `heldUntil = next_morning_at_quiet_hours_end`. Cron queries `WHERE sent_at IS NULL AND (held_until IS NULL OR held_until <= now())`. Batching: after quiet-hours hold expires, query all unsent events for the user, group by `event_type`, and send one notification per type (e.g., "3 new messages").
**Warning signs:** Users receive pushes at 02:00; batching doesn't reduce notification count.

### Pitfall 8: WhatsApp Phone Number Requirements

**What goes wrong:** Trying to use a number already registered on WhatsApp personal/business.
**Why it happens:** Meta requires a fresh number with no existing WhatsApp association.
**How to avoid:** Use a fresh Israeli business phone number (SIM card with Israeli prefix 05x). The number must be capable of receiving SMS for verification. It cannot currently be on any WhatsApp account — deregister first if reusing.
**Warning signs:** Registration fails with "Number already registered on WhatsApp"; verification SMS not received.

### Pitfall 9: Drip Cancel-on-Payment Race Condition

**What goes wrong:** A lead pays while a drip message is being sent by the cron. The drip continues after payment.
**Why it happens:** Cron queries `cancelled_at IS NULL` before checking payment status; payment webhook fires after cron reads the row.
**How to avoid:** In the payment webhook handler (`/api/payments/webhook`), immediately set `cancelled_at = now()` and `cancel_reason = 'paid'` for all `wa_challenge_prepay` enrollments for that lead. In the drip cron, wrap each step in a transaction that re-checks `cancelled_at IS NULL` before sending. Additionally, start the post-payment drip by creating a new `wa_challenge_postpay` enrollment.
**Warning signs:** Lead receives pre-payment drip messages after paying; no post-payment drip triggered.

---

## Code Examples

Verified patterns from official sources:

### VAPID Key Generation (one-time setup)

```bash
# Source: https://github.com/web-push-libs/web-push
npx web-push generate-vapid-keys
# Output:
# Public Key: BHxxx...
# Private Key: xxx...

# Add to .env.local:
# NEXT_PUBLIC_VAPID_PUBLIC_KEY=BHxxx...
# VAPID_PRIVATE_KEY=xxx...
```

### Client-Side Push Subscription (in React component)

```typescript
// Source: https://github.com/mvdam/nextjs-webpush/blob/main/ARTICLE.md
export async function subscribeToPush(userId: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  const reg = await navigator.serviceWorker.ready;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  });

  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
      auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
    }),
  });
}
```

### WhatsApp Template Send (REST without SDK)

```typescript
// Source: https://developers.facebook.com/blog/post/2022/10/31/sending-messages-with-whatsapp-in-your-nodejs-application/
// Full example in Pattern 5 above
await sendWhatsAppTemplate({
  to: '9720541234567',       // Israeli mobile: 972 + 054... (no +, no leading 0)
  templateName: 'challenge_reminder_he',
  languageCode: 'he',
  bodyParams: ['מיכל', 'מחר'],  // Fill {{1}} = name, {{2}} = "tomorrow"
});
```

### Resend with List-Unsubscribe Header

```typescript
// Source: https://resend.com/docs/dashboard/emails/add-unsubscribe-to-transactional-emails
await resend.emails.send({
  from: 'AcroHavura <shai@acroretreat.co.il>',
  to: [email],
  subject: subject,
  react: EmailTemplate({ ...props }),
  headers: {
    'List-Unsubscribe': `<https://acrohavura.com/api/unsubscribe?token=${token}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  },
});
```

### Drip Enrollment Creation (after quiz lead capture)

```typescript
// After inserting into quiz_leads in /api/quiz/leads
await db.insert(dripEnrollments).values({
  id: crypto.randomUUID(),
  leadId: quizLeadId,
  sequenceType: 'wa_challenge_prepay',
  channel: 'whatsapp',
  recipientPhone: normalizeIsraeliPhone(phone),  // Convert 054... → 9725...
  recipientName: firstName,
  preferredLocale: detectedLocale,  // 'he' or 'en'
  currentStep: 0,
  totalSteps: 7,
  nextFireAt: addDays(new Date(), 1),  // first message tomorrow
});
```

### Israeli Phone Number Normalization

```typescript
// Israeli numbers: 05x-xxxxxxx → 9725xxxxxxx (WhatsApp format)
export function normalizeIsraeliPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('972')) return digits;
  if (digits.startsWith('0'))   return '972' + digits.slice(1);
  return '972' + digits;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| WhatsApp per-conversation billing (1000 free/month) | Per-message billing; utility templates free within 24h service window | July 1, 2025 | Drip sequences (marketing templates) now have per-message cost; plan accordingly |
| WhatsApp On-Premises API | WhatsApp Cloud API (hosted by Meta) | 2022 onwards, fully current in 2026 | No server to run; direct REST calls; free access; v21.0 current |
| FCM/GCM for web push | VAPID (RFC 8292) native web push | Standard since 2016; now universal | Provider-free; works in Serwist/service workers; supported by all modern browsers including iOS 16.4+ |
| node-cron / setInterval for scheduling | Vercel Cron Jobs (vercel.json) | Since Vercel introduced cron jobs (~2023) | Only correct approach in serverless; Hobby = once/day max, Pro = once/minute minimum |
| next-pwa | Serwist (drop-in successor) | 2023-2024 | next-pwa unmaintained; Serwist is the maintained fork with App Router support |

**Deprecated/outdated:**
- `next-pwa`: Replaced by Serwist — project already uses `@serwist/next` correctly
- WhatsApp Business App (non-API): Cannot send templates programmatically; not relevant
- `node-cron` in Next.js API routes: Does not work in Vercel serverless environment

---

## Open Questions

1. **Vercel Plan Tier**
   - What we know: Hobby plan limits crons to once/day. Phase needs multiple-per-day crons.
   - What's unclear: Whether the project is currently on Hobby or Pro.
   - Recommendation: Verify in Vercel dashboard before writing cron configs. If on Hobby, upgrade to Pro ($20/month) before starting this phase.

2. **WhatsApp Business Phone Number**
   - What we know: Need a fresh Israeli number not previously registered on WhatsApp.
   - What's unclear: Whether the user has a dedicated business number ready, or needs to get one.
   - Recommendation: Confirm in planning. If not ready, acquiring a new SIM/virtual number is a blocker that takes 1-2 days.

3. **WhatsApp Template Submission Timing**
   - What we know: Roadmap calls for submitting templates during Phase 6. Approval takes 24-48 hours.
   - What's unclear: Whether templates were actually submitted during Phase 6.
   - Recommendation: On day 1 of Phase 7, check Meta Business Manager. If templates are not yet submitted, submit immediately. Development can proceed but end-to-end WhatsApp testing is blocked until approval.

4. **Hebrew WhatsApp Template Language Code**
   - What we know: Meta supports Hebrew; standard ISO 639-1 code for Hebrew is `he`; WhatsApp language codes follow ISO 639-1.
   - What's unclear: Cannot confirm from official Meta docs (Meta's docs pages returned CSS rather than documentation during research).
   - Recommendation: Use `he` when creating templates. Verify in Meta's template creation UI under the "Language" dropdown — the code appears when you select Hebrew. If `he` is not accepted, try `he_IL`.
   - Confidence: MEDIUM (standard ISO code, widely used in WhatsApp integrations, not directly confirmed from Meta official docs)

5. **Resend Domain for acroretreat.co.il**
   - What we know: From address is `shai@acroretreat.co.il`; open+click tracking must be enabled per-domain in Resend.
   - What's unclear: Whether `acroretreat.co.il` is already a verified Resend domain with DNS records configured.
   - Recommendation: Check Resend dashboard. If not verified, DNS verification takes minutes but DNS propagation can take up to 24 hours. Verify and enable click/open tracking before building email templates.

6. **iOS Push Notification Support**
   - What we know: iOS 16.4+ supports web push for installed PWA home screen apps; older iOS does not.
   - What's unclear: What percentage of AcroHavura's users are on iOS < 16.4.
   - Recommendation: Push notifications work for the app's installed PWA users on iOS 16.4+. For older iOS, push silently fails — no error, just no delivery. Design the system to be graceful (push is enhancement, not requirement).

---

## Sources

### Primary (HIGH confidence)
- [Vercel Cron Jobs official docs](https://vercel.com/docs/cron-jobs) — cron expression format, vercel.json config, security pattern
- [Vercel Cron Jobs Usage & Pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing) — Hobby (once/day, 100 jobs) vs Pro (once/min, 100 jobs) confirmed
- [Vercel Managing Cron Jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs) — CRON_SECRET auth pattern, idempotency guidance
- [web-push GitHub README](https://github.com/web-push-libs/web-push) — version 3.6.7, VAPID API, sendNotification signature
- [Resend Next.js docs](https://resend.com/docs/send-with-nextjs) — scheduledAt parameter, App Router pattern
- [Resend tracking docs](https://resend.com/docs/dashboard/domains/tracking) — per-domain open/click tracking setup
- [Resend unsubscribe docs](https://resend.com/docs/dashboard/emails/add-unsubscribe-to-transactional-emails) — List-Unsubscribe header syntax
- [Serwist Next.js docs](https://serwist.pages.dev/docs/next/getting-started) — service worker structure

### Secondary (MEDIUM confidence)
- [Meta WhatsApp Node.js SDK docs](https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/messages/template/) — template message method signature; REST body structure
- [Meta developer blog post](https://developers.facebook.com/blog/post/2022/10/31/sending-messages-with-whatsapp-in-your-nodejs-application/) — endpoint URL `graph.facebook.com/v{VERSION}/{PHONE_ID}/messages`, JSON body structure
- [Ycloud WhatsApp pricing update blog](https://www.ycloud.com/blog/whatsapp-api-pricing-update) — per-message pricing confirmed July 1 2025, Middle East -42% utility discount
- [WebPush Next.js article](https://github.com/mvdam/nextjs-webpush/blob/main/ARTICLE.md) — client-side subscription code, VAPID key generation
- [Medium: Push Notifications in Next.js Jan 2026](https://medium.com/@amirjld/implementing-push-notifications-in-next-js-using-web-push-and-server-actions-f4b95d68091f) — server action pattern, service worker handler

### Tertiary (LOW confidence)
- [WASenderApi: WhatsApp Cloud API Setup 2025](https://wasenderapi.com/blog/how-to-get-whatsapp-api-access-in-2025-a-step-by-step-guide) — setup steps overview; not from Meta directly
- Hebrew language code `he` — standard ISO 639-1; not confirmed from Meta's actual language list page (page returned CSS instead of content during research)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed in official docs or existing package.json
- Vercel Cron: HIGH — confirmed from official Vercel docs including pricing table
- WhatsApp Cloud API mechanics: MEDIUM — REST endpoint and JSON body confirmed; Hebrew language code not confirmed from official Meta docs
- Push notifications (VAPID + Serwist): HIGH — confirmed across multiple sources including official web-push library and recent Next.js guides
- Email (Resend): HIGH — library already in package.json, patterns verified in existing codebase and official docs
- WhatsApp pricing: MEDIUM — confirmed from Ycloud (Meta partner) blog; not from Meta's own pricing page

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (30 days — WhatsApp pricing changes frequently; verify current rates before launch)
