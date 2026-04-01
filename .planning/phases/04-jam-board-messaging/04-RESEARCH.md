# Phase 4: Jam Board + Messaging - Research

**Researched:** 2026-04-01
**Domain:** Real-time messaging (Ably), jam session RSVP/waitlist, Drizzle schema design
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Jam session posting**
- Fields: date & time, location (free text), capacity (max spots), level requirement, optional description/notes
- Approved hosts only — admin must grant jam host permission first
- Host approval via DB flag: `isJamHost` boolean on user table, set manually via DB until admin panel (Phase 8)
- Optional description field for context ("bring a mat", "focusing on washing machines today")

**RSVP & waitlist**
- Auto-waitlist when jam is full — users join waitlist, get auto-promoted when someone cancels
- Waitlist promotion notification via email (Resend) — immediate notification when promoted
- Cancellation locked 4 hours before jam start — prevents last-minute flaking
- After 4-hour lock, user cannot cancel (committed)
- Waitlist auto-promotion is FIFO (first to join waitlist gets promoted first)

**Direct messaging UX**
- Full-screen chat layout (mobile-first, like iMessage) — conversation list is one page, tapping opens full-screen chat thread
- Two entry points: "Message" button on member profiles + "New message" button in conversations list
- No read receipts — just sent timestamps, less pressure
- Unread badge in header — pink dot or count on Messages link
- Real-time via Ably — messages appear without page refresh
- Text only — no images, files, reactions, or voice messages

**Jam board layout**
- Timeline/feed layout — vertical list sorted by date, next jam at top
- Past jams shown below upcoming in a "Past" section for reference
- City + level filters (same pattern as partner search — consistent UX)
- Show attendee avatars/names on each jam card — social proof, see who's going
- Each card shows: date/time, location, host name, spots remaining (e.g. "4/8"), level, RSVP or Join Waitlist button

### Claude's Discretion
- Ably channel architecture (per-conversation channels vs shared)
- Message pagination / lazy loading approach
- How "New message" picker works in conversations list (search/select member)
- Jam card visual design details within brutalist dark theme
- Whether past jams section is collapsed by default
- How attendee avatars display (inline row, stacked, etc.)

### Deferred Ideas (OUT OF SCOPE)
- Push notifications for new messages — Phase 7 (Notifications)
- WhatsApp reminders for upcoming jams — Phase 7
- Group chat in jam threads — out of scope, keep 1:1 only
- Recurring jams (weekly schedule) — future feature, not V1
- Jam cancellation by host — build when needed
- Replace canReview() stub with real jam attendance check — do during Phase 4 execution since jams table will exist
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COMM-02 | User can send and receive 1:1 direct messages with other members | Ably per-conversation channel, DB message store, `useChannel` hook, token auth endpoint |
| COMM-03 | Approved hosts can post jam sessions (date, location, capacity, level) | `isJamHost` flag on user table, jam sessions table, POST `/api/jams` route |
| COMM-04 | User can RSVP to join a posted jam session | `jamAttendees` join table, capacity check, waitlist insert, FIFO ordering |
| COMM-05 | Jam sessions show capacity and waitlist when full | Derived count query, `waitlistPosition` returned from API, card UI states |
| COMM-06 | User can cancel RSVP on a jam session | 4-hour lock check, cascade waitlist promotion, Resend email trigger |
</phase_requirements>

---

## Summary

Phase 4 has two independent feature streams that share a DB migration: the **Jam Board** (structured event posts with RSVP/waitlist) and **1:1 Direct Messaging** (real-time with Ably). Both are well-solved problems with the existing stack — no new infrastructure is needed beyond installing Ably and writing the DB schema.

The jam board is entirely server-rendered with form mutations; the only real-time requirement is messaging. The RSVP/waitlist logic is transactional and must be protected against race conditions (two users claiming the last spot simultaneously). The Ably integration requires a token endpoint — the API key must never be exposed to the client. Message history is stored in Postgres (not Ably), so pagination is a DB query, not an Ably history call.

The `canReview()` stub in `src/app/api/reviews/route.ts` is explicitly noted for replacement during this phase — once `jamAttendees` exists, the check is a simple join query.

**Primary recommendation:** Implement in this order: (1) DB schema migration, (2) Jam board (pure server-side, no real-time complexity), (3) Ably token endpoint + AblyProvider, (4) Messaging UI. This keeps the real-time complexity isolated and lets the jam board ship independently.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ably` | latest (already in PROJECT.md) | Real-time pub/sub for DMs | Decided — Ably is the locked choice |
| `drizzle-orm` | ^0.45.2 (already installed) | Schema + queries for jams/messages | Already in project |
| `resend` | ^6.10.0 (already installed) | Waitlist promotion email | Already in project |
| `react-hook-form` | ^7.72.0 (already installed) | Jam post form, new message form | Already in project |
| `zod` | ^4.3.6 (already installed) | API input validation | Already in project |

### New Install Required
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `ably` | ^2.x | Realtime client + React hooks | Required for COMM-02 |

**Installation:**
```bash
npm install ably
```

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Per-conversation Ably channel | Single shared channel with filtering | Per-channel is simpler, more secure (capability scoped per channel), recommended for 1:1 DMs |
| DB message store + Ably pub/sub | Ably history only | DB store ensures messages survive; Ably history has retention limits on free tier |

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/[locale]/(app)/
│   ├── jams/                    # Jam board pages
│   │   ├── page.tsx             # Feed (upcoming + past sections)
│   │   └── new/page.tsx         # Post a jam (host only)
│   └── messages/                # DM pages
│       ├── page.tsx             # Conversation list
│       └── [conversationId]/
│           └── page.tsx         # Full-screen chat thread (client component)
├── app/api/
│   ├── jams/
│   │   ├── route.ts             # GET (list) + POST (create jam)
│   │   └── [id]/
│   │       ├── route.ts         # GET jam detail
│   │       └── rsvp/
│   │           └── route.ts     # POST (join/cancel RSVP)
│   ├── messages/
│   │   ├── route.ts             # GET conversations list
│   │   └── [conversationId]/
│   │       └── route.ts         # GET message history + POST send message
│   └── ably-token/
│       └── route.ts             # GET — mints Ably token for current user
├── components/
│   ├── jams/
│   │   ├── JamFeed.tsx          # Timeline feed, city/level filter
│   │   ├── JamCard.tsx          # Single jam card with RSVP button
│   │   └── JamForm.tsx          # Create jam form (host only)
│   └── messages/
│       ├── ConversationList.tsx  # Left panel / mobile list page
│       ├── ChatThread.tsx        # Full-screen chat (useChannel)
│       ├── MessageBubble.tsx     # Individual message bubble
│       └── NewMessagePicker.tsx  # Member search to start a conversation
└── lib/db/schema.ts              # Extended with jam + message tables
```

### Pattern 1: Ably Token Authentication (REQUIRED — never expose API key to client)

**What:** A Next.js API route mints a short-lived Ably token for the authenticated user. The client fetches this token and initialises the Ably Realtime client with it.

**Why required:** Exposing the Ably API key client-side gives every user full account access. Token auth scopes capabilities per-channel per-user.

```typescript
// src/app/api/ably-token/route.ts
// Source: https://context7.com/ably/ably-js/llms.txt

import * as Ably from 'ably';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rest = new Ably.Rest({ key: process.env.ABLY_API_KEY! });

  const tokenRequest = await rest.auth.createTokenRequest({
    clientId: session.user.id,
    capability: {
      // Scope: user can only pub/sub their own conversation channels
      // Channel pattern: dm::{sortedId1}::{sortedId2}
      'dm::*': ['publish', 'subscribe'],
    },
    ttl: 3600000, // 1 hour
  });

  return NextResponse.json(tokenRequest);
}
```

### Pattern 2: Ably Client Initialisation in Next.js App Router

**What:** `AblyProvider` wraps only the message-related subtree (not the whole app). The client is created outside the component with `autoConnect: typeof window !== 'undefined'` to prevent SSR connection attempts.

**Critical:** Add `ably` to `serverComponentsExternalPackages` in `next.config.ts` to prevent build errors with Turbopack.

```typescript
// Source: https://github.com/ably/ably-js/blob/main/README.md
// next.config.ts — add to nextConfig:
experimental: {
  serverComponentsExternalPackages: ['ably'],
}
```

```typescript
// src/components/messages/AblyClientProvider.tsx — 'use client'
import { AblyProvider } from 'ably/react';
import * as Ably from 'ably';

const client = new Ably.Realtime({
  authUrl: '/api/ably-token',
  authMethod: 'GET',
  autoConnect: typeof window !== 'undefined',
});

export function AblyClientProvider({ children }: { children: React.ReactNode }) {
  return <AblyProvider client={client}>{children}</AblyProvider>;
}
```

### Pattern 3: useChannel for Real-time DMs

**What:** Each 1:1 conversation uses a deterministic channel name based on the sorted user IDs — so Alice↔Bob always maps to `dm::aliceId::bobId` regardless of who initiates.

```typescript
// Source: https://context7.com/ably/ably-js/llms.txt
import { useChannel } from 'ably/react';

function ChatThread({ myId, otherId }: { myId: string; otherId: string }) {
  // Deterministic channel: sort IDs so both users get same channel name
  const channelName = `dm::${[myId, otherId].sort().join('::')}`;

  const { publish } = useChannel(channelName, (message) => {
    // New message arrived — append to local state
    setMessages(prev => [...prev, message.data]);
  });

  const sendMessage = async (text: string) => {
    // 1. Persist to DB first (source of truth)
    await fetch(`/api/messages/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    // 2. Publish to Ably so other participant gets it in real-time
    await publish('message', { senderId: myId, text, sentAt: Date.now() });
  };
}
```

### Pattern 4: RSVP Race Condition Protection

**What:** Two users clicking RSVP simultaneously could both pass the capacity check. Use a database-level approach: insert with a capacity guard, or use a transaction with row count check.

```typescript
// src/app/api/jams/[id]/rsvp/route.ts
// Pattern: count existing RSVPs inside transaction, then conditionally insert
import { db } from '@/lib/db';
import { jamAttendees, jamSessions } from '@/lib/db/schema';
import { eq, and, count, sql } from 'drizzle-orm';

// Inside POST handler:
const result = await db.transaction(async (tx) => {
  const [jam] = await tx
    .select()
    .from(jamSessions)
    .where(eq(jamSessions.id, jamId))
    .for('update'); // row-level lock

  const [{ confirmedCount }] = await tx
    .select({ confirmedCount: count() })
    .from(jamAttendees)
    .where(and(eq(jamAttendees.jamId, jamId), eq(jamAttendees.status, 'confirmed')));

  const isFullyBooked = confirmedCount >= jam.capacity;
  const status = isFullyBooked ? 'waitlist' : 'confirmed';

  await tx.insert(jamAttendees).values({
    id: randomUUID(),
    jamId,
    userId: session.user.id,
    status,
    joinedAt: new Date(),
  });

  return { status };
});
```

### Pattern 5: Drizzle Schema for Phase 4

```typescript
// Extension to src/lib/db/schema.ts
// Source: https://context7.com/drizzle-team/drizzle-orm-docs/...

import { integer, pgTable, serial, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';

// Add isJamHost to existing user table (via migration)
// ALTER TABLE "user" ADD COLUMN "is_jam_host" boolean DEFAULT false NOT NULL;

export const jamSessions = pgTable('jam_sessions', {
  id: text('id').primaryKey(),
  hostId: text('host_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  location: text('location').notNull(),
  capacity: integer('capacity').notNull(),
  level: text('level').notNull(), // 'beginner' | 'intermediate' | 'advanced' | 'all'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('jam_sessions_scheduled_idx').on(table.scheduledAt),
  index('jam_sessions_host_idx').on(table.hostId),
]);

export const jamAttendees = pgTable('jam_attendees', {
  id: text('id').primaryKey(),
  jamId: text('jam_id').notNull().references(() => jamSessions.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  status: text('status').notNull(), // 'confirmed' | 'waitlist' | 'cancelled'
  joinedAt: timestamp('joined_at').defaultNow().notNull(), // FIFO ordering for waitlist
}, (table) => [
  index('jam_attendees_jam_idx').on(table.jamId),
  index('jam_attendees_user_idx').on(table.userId),
  // Unique constraint: one row per user per jam
]);

// Conversations: one row per unique pair, created lazily on first message
export const conversations = pgTable('conversations', {
  id: text('id').primaryKey(),
  // Store sorted user IDs for deterministic lookup
  participantA: text('participant_a').notNull().references(() => user.id, { onDelete: 'cascade' }),
  participantB: text('participant_b').notNull().references(() => user.id, { onDelete: 'cascade' }),
  // participantA < participantB always (enforced in application layer)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastMessageAt: timestamp('last_message_at').defaultNow().notNull(),
}, (table) => [
  index('conversations_participants_idx').on(table.participantA, table.participantB),
]);

export const directMessages = pgTable('direct_messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
}, (table) => [
  index('direct_messages_conversation_idx').on(table.conversationId),
  index('direct_messages_sent_idx').on(table.sentAt),
]);

// Unread counts: tracks last-read timestamp per user per conversation
export const conversationReads = pgTable('conversation_reads', {
  conversationId: text('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  lastReadAt: timestamp('last_read_at').defaultNow().notNull(),
});
```

### Pattern 6: Waitlist Promotion on Cancel

```typescript
// After marking an attendee as 'cancelled', promote the first waitlisted user (FIFO)
const [nextInLine] = await db
  .select()
  .from(jamAttendees)
  .where(and(
    eq(jamAttendees.jamId, jamId),
    eq(jamAttendees.status, 'waitlist'),
  ))
  .orderBy(asc(jamAttendees.joinedAt)) // FIFO: earliest joinedAt gets promoted
  .limit(1);

if (nextInLine) {
  await db
    .update(jamAttendees)
    .set({ status: 'confirmed' })
    .where(eq(jamAttendees.id, nextInLine.id));

  // Send promotion email via Resend
  await resend.emails.send({
    from: FROM_EMAIL,
    to: promotedUser.email,
    subject: 'A spot opened up for you!',
    text: `Great news — a spot opened in the jam on ${jam.scheduledAt}. You're confirmed!`,
  });
}
```

### Anti-Patterns to Avoid
- **Storing Ably API key in client-side env var (`NEXT_PUBLIC_ABLY_KEY`):** Exposes full account access. Use token auth endpoint always.
- **Using Ably message history as the source of truth for DM history:** Ably history has retention limits (2 min on free plan, longer on paid). DB is the source of truth; Ably is the real-time delivery mechanism only.
- **Creating a conversation row eagerly (on profile "Message" click):** Create the conversation row lazily on first actual message send. Otherwise the conversations list fills with empty threads.
- **Deriving unread count from counting all messages:** Use a `conversationReads` table with `lastReadAt` — count messages newer than that timestamp. Scales better.
- **Not using `.for('update')` row lock in RSVP transaction:** Without a lock, two simultaneous RSVPs can both read `confirmedCount < capacity` and both insert as 'confirmed', exceeding capacity.
- **Sorting user IDs client-side only for Ably channel name:** Sort must be consistent between client publish and server-side token capability grant. Sort alphabetically on both sides.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Real-time delivery | Custom WebSocket server | Ably `useChannel` | Connection management, reconnection, presence all handled |
| Token auth | Expose raw API key | `Ably.Rest.auth.createTokenRequest()` | Security — scoped capabilities, TTL |
| Unread badge count | Poll endpoint every N seconds | Ably channel subscription update + DB count on mount | Ably gives push-based notification; polling wastes requests |
| Race condition on RSVP | Optimistic UI + retry | DB transaction with row lock | Correctness guaranteed at DB level |
| FIFO waitlist ordering | Manual position tracking | `ORDER BY joined_at ASC` on `status = 'waitlist'` | `joinedAt` timestamp is the natural FIFO key |
| Conversation deduplication | Complex lookup logic | Sorted participant IDs as unique pair | `participantA < participantB` always; one query finds the conversation |

**Key insight:** Ably handles connection state, reconnection, and message delivery guarantees. The project's job is schema design and business logic (capacity, waitlist, cancellation locks) — not transport.

---

## Common Pitfalls

### Pitfall 1: SSR / Ably Connection on Server
**What goes wrong:** `Ably.Realtime` instantiated in a Server Component or during SSR fires a WebSocket connection from Node.js, not the browser.
**Why it happens:** Forgetting that `AblyProvider` and `useChannel` must live in Client Components (`'use client'`).
**How to avoid:** `autoConnect: typeof window !== 'undefined'` in client initialisation. Add `ably` to `serverComponentsExternalPackages` in `next.config.ts`. The `ChatThread` page component wraps in a `'use client'` boundary.
**Warning signs:** Build error mentioning `keyv` or `Module not found` in Ably during `next build`.

### Pitfall 2: Ably Channel Name Mismatch
**What goes wrong:** Alice's client subscribes to `dm::aliceId::bobId` but Bob's client publishes to `dm::bobId::aliceId` — they're on different channels, messages never arrive.
**Why it happens:** Not sorting IDs before constructing the channel name.
**How to avoid:** Define a shared helper: `const dmChannel = (a: string, b: string) => \`dm::\${[a, b].sort().join('::')}\`` — import from a single file used by both client and token endpoint.
**Warning signs:** Messages send successfully (no error) but never appear for the recipient.

### Pitfall 3: RSVP Race Condition Exceeds Capacity
**What goes wrong:** Jam has 1 spot left. Two users click RSVP simultaneously. Both read `confirmed = 7, capacity = 8`. Both pass the check. Both get inserted as 'confirmed'. Jam now has 9 confirmed attendees.
**Why it happens:** No locking around the read-then-write sequence.
**How to avoid:** Use a Drizzle transaction with `.for('update')` on the jam row (advisory lock), or use a unique constraint + check constraint at DB level.
**Warning signs:** `confirmedCount` exceeds `capacity` in production under load.

### Pitfall 4: 4-Hour Cancellation Lock Timezone Bug
**What goes wrong:** The jam is at 6 PM local time. Server computes the lock as `scheduledAt - 4 hours` in UTC, but displays or checks in a wrong timezone, allowing cancellation 15 minutes before the jam.
**Why it happens:** Mixing naive timestamps with timezone-aware ones.
**How to avoid:** Store `scheduledAt` as `timestamp with timezone` (already in the schema pattern above). Always compare `new Date() > new Date(jam.scheduledAt.getTime() - 4 * 60 * 60 * 1000)` on the server in UTC. Never trust client-side time for this check.
**Warning signs:** Cancellation succeeds shortly before jam start.

### Pitfall 5: Resend Email Fire-and-Forget Failures
**What goes wrong:** Waitlist promotion email fails silently; promoted user never knows they got a spot.
**Why it happens:** Using `void resend.emails.send(...)` without error handling (the pattern in `auth.ts` is intentional for password reset timing attacks, but is wrong for business-critical notifications).
**How to avoid:** For waitlist promotion emails, `await` the send and log errors. The user is already in the DB as 'confirmed' regardless, but failed emails should be logged for retry.
**Warning signs:** Users complain they didn't receive promotion email; manual DB inspection shows them as 'confirmed'.

### Pitfall 6: Conversation Rows Leaking on "Message" Button Click
**What goes wrong:** Every time someone clicks "Message" on a profile, a conversation row is created even if no message is ever sent. Conversations list fills with empty threads.
**Why it happens:** Creating the conversation row on navigation rather than on first message send.
**How to avoid:** Navigate to `/messages/new?with=userId`. On the "new message" page, show the compose UI without creating a DB row. Only create the conversation row (upsert) when the first message is submitted.
**Warning signs:** `conversations` table has rows with no associated `direct_messages`.

---

## Code Examples

### Deterministic Conversation ID Lookup
```typescript
// Source: architecture pattern, verified against Drizzle docs
// src/app/api/messages/[conversationId]/route.ts

import { eq, and } from 'drizzle-orm';

// Find or create conversation between two users
async function getOrCreateConversation(userAId: string, userBId: string) {
  // Sort ensures participantA < participantB always
  const [a, b] = [userAId, userBId].sort();

  const [existing] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.participantA, a), eq(conversations.participantB, b)))
    .limit(1);

  if (existing) return existing;

  const id = randomUUID();
  await db.insert(conversations).values({
    id,
    participantA: a,
    participantB: b,
  });
  return { id, participantA: a, participantB: b };
}
```

### Jam Board Query (Upcoming + Past Split)
```typescript
// Source: Drizzle docs pattern
import { gt, lt, eq, ilike, desc, asc } from 'drizzle-orm';

const now = new Date();

const upcoming = await db
  .select({
    id: jamSessions.id,
    scheduledAt: jamSessions.scheduledAt,
    location: jamSessions.location,
    capacity: jamSessions.capacity,
    level: jamSessions.level,
    notes: jamSessions.notes,
    hostName: user.name,
    hostImage: user.image,
  })
  .from(jamSessions)
  .innerJoin(user, eq(jamSessions.hostId, user.id))
  .where(gt(jamSessions.scheduledAt, now))
  .orderBy(asc(jamSessions.scheduledAt));

// Attendee counts fetched separately or via subquery
```

### Unread Badge Count
```typescript
// Count conversations where there are messages newer than the user's lastReadAt
const unreadCount = await db
  .select({ count: count() })
  .from(directMessages)
  .innerJoin(conversations, eq(directMessages.conversationId, conversations.id))
  .leftJoin(
    conversationReads,
    and(
      eq(conversationReads.conversationId, conversations.id),
      eq(conversationReads.userId, session.user.id),
    )
  )
  .where(
    and(
      or(
        eq(conversations.participantA, session.user.id),
        eq(conversations.participantB, session.user.id),
      ),
      ne(directMessages.senderId, session.user.id), // don't count own messages
      // sentAt > lastReadAt (or lastReadAt is null = never read)
    )
  );
```

### Cancellation Lock Check
```typescript
// Server-side only — never trust client time
const CANCEL_LOCK_MS = 4 * 60 * 60 * 1000; // 4 hours

function isCancellationLocked(scheduledAt: Date): boolean {
  return Date.now() > scheduledAt.getTime() - CANCEL_LOCK_MS;
}
```

### Replace canReview() Stub (Phase 3 TODO)
```typescript
// src/app/api/reviews/route.ts — replace the stub:
// TODO Phase 4: Replace with real jam attendance check

const sharedJam = await db
  .select({ id: jamAttendees.id })
  .from(jamAttendees)
  .innerJoin(
    jamAttendees as typeof jamAttendees, // self join on same jam
    eq(jamAttendees.jamId, /* alias */.jamId)
  )
  .where(
    and(
      eq(jamAttendees.userId, session.user.id),
      eq(jamAttendees.status, 'confirmed'),
    )
  )
  .limit(1);

const canReview = !!sharedJam;
```

*(Note: the actual join to find shared attendance requires a subquery — use `inArray` or a CTE in practice. The pattern is: find jams where current user attended, then check if reviewee also attended one of those jams.)*

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Ably key in client-side env | Token auth via server endpoint | Always best practice | Security — no API key exposure |
| Polling for new messages | `useChannel` subscription | Ably React hooks v2 | Zero-latency delivery, no polling overhead |
| Separate `ably-js` + React wrapper | `ably/react` subpackage with hooks | Ably JS SDK v2 | `useChannel`, `AblyProvider` built in |
| `serverComponentsExternalPackages` | Same (still current for Next.js App Router) | Next.js App Router era | Required for Ably + Turbopack |

**Deprecated/outdated:**
- `@ably-labs/react-hooks` (separate package): Replaced by `ably/react` built into the official SDK. Do not install.
- `Ably.Realtime.Promise` class: Removed in v2. All methods are now natively async/await.

---

## Discretion Recommendations

### Ably Channel Architecture: Per-Conversation Channels (RECOMMENDED)
One channel per conversation: `dm::{sortedA}::{sortedB}`. 

**Why:** Capability scoping in the token is clean (`dm::*` pattern), no server-side filtering needed, subscription is automatically scoped to the right conversation. The alternative (single shared channel with message filtering) requires the server to filter messages before delivery and exposes all DM traffic to every user's connection.

**Concurrency note:** Ably free tier allows 200 concurrent connections. At this community scale, per-conversation channels are fine.

### Message Pagination: Cursor-Based DB Query (RECOMMENDED)
Load the last 50 messages on thread open (DB query, `ORDER BY sent_at DESC LIMIT 50`). Reverse the array for display (newest at bottom). Load older messages on scroll-up via cursor (`WHERE sent_at < :cursor ORDER BY sent_at DESC LIMIT 50`).

**Why not Ably history:** Ably history on free tier is 2 minutes. DB is the source of truth. This also means the pagination code is a simple Drizzle query, not an Ably-specific API.

### New Message Picker: Member Search
On the "New message" page: show a search input that filters members by name (same `ilike` pattern as the members page). Tap a member to navigate to `/messages/new?with=memberId`. This reuses the existing member search infrastructure.

### Past Jams Section: Collapsed by Default
Show a "Past jams" section header with a count, collapsed by default (`<details>` or client-side toggle). Users rarely need past jams; keeping them collapsed keeps the feed clean.

### Attendee Avatars: Stacked Pill
Show up to 4 stacked avatar images (overlapping circles, tailwind `-ml-2` pattern) then `+N more` text. This is compact, mobile-friendly, and gives social proof without overwhelming the card.

---

## Open Questions

1. **`isJamHost` column — migration approach**
   - What we know: needs to be added to the `user` table as `boolean DEFAULT false NOT NULL`
   - What's unclear: whether to add it in `schema.ts` and run `drizzle-kit push` or generate a migration file
   - Recommendation: Follow the existing project convention (check if `drizzle.config.ts` uses `push` or `generate` — use whichever is already established)

2. **Ably env variable naming**
   - What we know: `ABLY_API_KEY` should be server-only (no `NEXT_PUBLIC_` prefix)
   - What's unclear: whether `ABLY_API_KEY` is already in `.env.local` from prior setup
   - Recommendation: Plan task to add `ABLY_API_KEY` to `.env.local` and Vercel environment variables

3. **canReview() shared-jam join query**
   - What we know: a direct self-join on `jamAttendees` is the right shape
   - What's unclear: exact Drizzle syntax for `inArray` + subquery for this specific check
   - Recommendation: Use `inArray` pattern: find jam IDs where current user is confirmed, then check if reviewee is confirmed in any of those jams. Validate query in Drizzle before finalizing.

---

## Sources

### Primary (HIGH confidence)
- `/ably/ably-js` (Context7) — `useChannel` hook, `AblyProvider`, token auth, channel history, `autoConnect: typeof window !== 'undefined'`
- `https://github.com/ably/ably-js/blob/main/README.md` — Next.js `serverComponentsExternalPackages` config requirement
- `/drizzle-team/drizzle-orm-docs` (Context7) — `pgTable`, `relations`, `timestamp`, `integer`, transaction patterns
- Codebase inspection — existing schema, API route patterns, Resend setup, i18n structure, members page filter pattern

### Secondary (MEDIUM confidence)
- Existing `src/app/api/reviews/route.ts` — confirmed pattern for auth, Drizzle queries, validation in this codebase
- Existing `src/lib/auth.ts` — confirmed Resend initialisation pattern and `FROM_EMAIL` convention

### Tertiary (LOW confidence)
- Ably free-tier history retention (2 minutes) — from training knowledge; verify on Ably pricing page before committing to "DB only" history strategy if on paid plan

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified via Context7 official docs; Ably, Drizzle, Resend all confirmed in codebase
- Architecture: HIGH — patterns verified from Context7 + codebase inspection; schema design follows Drizzle conventions
- Pitfalls: HIGH for SSR/channel-name/race-condition (verified via docs); MEDIUM for Resend email retry (pattern reasoning)

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (Ably SDK is stable; Drizzle is stable; Next.js 16 is current)
