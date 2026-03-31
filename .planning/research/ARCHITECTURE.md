# Architecture Research

**Domain:** Community platform with real-time messaging, partner matching, quiz funnels, events, and payments
**Researched:** 2026-03-31
**Confidence:** MEDIUM-HIGH (Next.js App Router patterns HIGH; real-time architecture MEDIUM; WhatsApp/Green Invoice integrations LOW — external service specifics unverified)

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                   │
│                                                                           │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐             │
│  │  Public   │  │ Community │  │  Quiz     │  │  Admin    │             │
│  │  Pages    │  │  App      │  │  Funnel   │  │  Panel    │             │
│  │ (SSR/SSG) │  │ (RSC+CC)  │  │ (Client) │  │ (Server)  │             │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘             │
│        │              │              │              │                    │
├────────┴──────────────┴──────────────┴──────────────┴────────────────────┤
│                           NEXT.JS APP ROUTER                              │
│  Route Groups: (public) | (community) | (quiz) | (admin) | (api)         │
│  Middleware: Auth guard, locale detection, RTL direction injection        │
├───────────────────────────────────────────────────────────────────────────┤
│                         SERVER ACTION LAYER                               │
│                                                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Match   │ │  Events  │ │  Funnel  │ │  Msgs    │ │ Payments │       │
│  │ Actions  │ │ Actions  │ │ Actions  │ │ Actions  │ │ Actions  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                                           │
│  API Route Handlers (external-facing only):                               │
│  /api/webhooks/green-invoice | /api/webhooks/whatsapp                    │
│  /api/realtime/auth (Ably token endpoint)                                 │
├───────────────────────────────────────────────────────────────────────────┤
│                         DATA & SERVICES LAYER                             │
│                                                                           │
│  ┌──────────────────┐  ┌───────────────┐  ┌────────────────────┐         │
│  │ Vercel Postgres  │  │  Ably         │  │  External Services │         │
│  │ (Neon)           │  │  (real-time)  │  │  Green Invoice     │         │
│  │                  │  │               │  │  Twilio WhatsApp   │         │
│  │ - users          │  │  - chat rooms │  │  Resend (email)    │         │
│  │ - matches        │  │  - presence   │  │  VAPID push        │         │
│  │ - events         │  │               │  │                    │         │
│  │ - messages       │  │               │  │                    │         │
│  │ - payments       │  │               │  │                    │         │
│  │ - push_subs      │  │               │  │                    │         │
│  └──────────────────┘  └───────────────┘  └────────────────────┘         │
└───────────────────────────────────────────────────────────────────────────┘
                                    │
                         ┌──────────┴──────────┐
                         │    Service Worker   │
                         │  (sw.js in /public) │
                         │  Offline cache +    │
                         │  Push handler       │
                         └─────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Public pages | Marketing, SEO landing, challenge/workshop pages, embed | RSC, SSG, next-intl for i18n |
| Community app | Profiles, matching, jam board, messaging UI | RSC for data fetch, Client Components for interactivity |
| Quiz funnel | Multi-step onboarding flows (challenge + workshop) | Client Component state machine, Server Action for submission |
| Admin panel | Approve hosts, manage signups, send notifications | Protected route group, Server Components, data tables |
| Auth middleware | Session check on every request, RTL/locale inject | Auth.js `auth()` in middleware.ts |
| Server Actions | All DB mutations (match, book, message, pay) | `'use server'` functions co-located with features |
| API Route Handlers | Webhook receivers only (Green Invoice, WhatsApp, Ably auth) | Route Handlers under `app/api/` |
| Real-time layer | Chat delivery, presence indicators | Ably SDK; client subscribes, server publishes via REST |
| Service Worker | Offline shell caching, push notification display | `public/sw.js`, registered via `app/layout.tsx` |

---

## Recommended Project Structure

```
src/
├── app/
│   ├── (public)/                   # No auth required
│   │   ├── page.tsx                # Home / hero
│   │   ├── challenge/page.tsx      # 30-day challenge landing
│   │   ├── workshops/page.tsx      # Workshop booking landing
│   │   └── [locale]/...            # next-intl locale routing
│   ├── (community)/                # Auth-required group
│   │   ├── layout.tsx              # Community shell + nav
│   │   ├── feed/page.tsx           # Partner discovery / matching
│   │   ├── profile/
│   │   │   ├── [id]/page.tsx       # Public profile view
│   │   │   └── edit/page.tsx       # Own profile edit
│   │   ├── messages/
│   │   │   ├── page.tsx            # Inbox list (RSC)
│   │   │   └── [threadId]/page.tsx # Thread view (Ably client)
│   │   └── jams/
│   │       ├── page.tsx            # Jam board
│   │       └── new/page.tsx        # Post jam (approved hosts)
│   ├── (quiz)/                     # Standalone quiz flows
│   │   ├── challenge/page.tsx      # Long funnel (10+ steps)
│   │   └── workshop/page.tsx       # Short funnel (2-3 steps)
│   ├── (admin)/                    # Admin-only group
│   │   ├── layout.tsx              # Admin shell + role guard
│   │   ├── members/page.tsx
│   │   ├── bookings/page.tsx
│   │   └── notifications/page.tsx
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── green-invoice/route.ts   # Payment confirmation
│   │   │   └── whatsapp/route.ts        # Inbound WA messages
│   │   └── realtime/
│   │       └── auth/route.ts            # Ably token endpoint
│   ├── layout.tsx                  # Root: fonts, manifest, SW register
│   ├── manifest.ts                 # PWA manifest
│   └── globals.css
├── components/
│   ├── matching/                   # MatchCard, FilterPanel, SkillBadge
│   ├── messaging/                  # ThreadList, MessageBubble, TypingIndicator
│   ├── quiz/                       # QuizStep, ProgressBar, ResultCard
│   ├── jam/                        # JamCard, JamForm, AttendeeList
│   ├── profile/                    # ProfileCard, SkillsChecklist, RatingWidget
│   ├── admin/                      # DataTable, ApprovalButton, NotifBlast
│   └── ui/                         # Shared primitives (Button, Input, Modal)
├── lib/
│   ├── actions/                    # Server Actions (co-located by domain)
│   │   ├── matching.ts
│   │   ├── messages.ts
│   │   ├── events.ts
│   │   ├── payments.ts
│   │   └── notifications.ts
│   ├── db/
│   │   ├── schema.ts               # Drizzle or raw SQL schema
│   │   └── queries/                # Per-domain query functions
│   ├── realtime/
│   │   └── ably.ts                 # Ably client singleton
│   └── utils/
│       ├── matching-algorithm.ts
│       └── rtl.ts                  # Direction helper for i18n
├── middleware.ts                   # Auth guard + locale routing
├── i18n/
│   ├── he.json                     # Hebrew (primary)
│   └── en.json
└── public/
    ├── sw.js                       # Service worker
    ├── manifest.json               # Static manifest fallback
    └── icons/
```

### Structure Rationale

- **(public) route group:** No auth middleware overhead. These are SEO-critical pages; they pre-render at build time and serve from Vercel's CDN edge.
- **(community) route group:** Single layout wraps all community pages with nav and session. Auth.js `auth()` is called once in the group's `layout.tsx`.
- **(quiz) route group:** Completely isolated from community chrome. Quiz flows are conversion funnels — they should have no distracting nav and their own `<html>` with meta tags for social sharing.
- **(admin) route group:** Separate layout with role guard. Admin never bleeds into community routes; simplifies auditing and testing.
- **`lib/actions/`:** All Server Actions centralized here, not scattered inside page files. Keeps database logic out of components.
- **`lib/db/queries/`:** Pure query functions (no Next.js coupling). Testable in isolation.

---

## Architectural Patterns

### Pattern 1: RSC-first with Client Islands

**What:** Server Components handle data fetching and rendering by default. Client Components (`'use client'`) are pushed to leaf nodes for interactivity only.
**When to use:** Everywhere. Default for all new components.
**Trade-offs:** Fewer round trips, smaller JS bundle, but harder to share state across the tree.

```typescript
// RSC fetches data on the server
export default async function FeedPage() {
  const candidates = await getMatchCandidates() // direct DB call, no fetch
  return (
    <div>
      {candidates.map(c => (
        <MatchCard key={c.id} candidate={c} /> // MatchCard is a Client Component
      ))}
    </div>
  )
}

// Client Component handles interaction
'use client'
export function MatchCard({ candidate }: { candidate: Candidate }) {
  const [contacted, setContacted] = useState(false)
  return <div onClick={() => setContacted(true)}>...</div>
}
```

### Pattern 2: Server Actions for All Mutations

**What:** Form submissions, match requests, jam RSVPs, payment initiations all go through Server Actions — never through `fetch('/api/...')` from the client.
**When to use:** All user-initiated writes.
**Trade-offs:** Simpler client code, no explicit API routes to secure; but external services (payment webhooks, WhatsApp) still need Route Handlers.

```typescript
// lib/actions/matching.ts
'use server'
export async function sendMatchRequest(targetUserId: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthenticated')
  await db.insert(matchRequests).values({
    fromUserId: session.user.id,
    toUserId: targetUserId,
  })
  // Trigger notification inside same action
  await notifyUser(targetUserId, 'match_request')
}
```

### Pattern 3: Ably for Real-Time (Not WebSockets Directly)

**What:** Vercel serverless functions cannot hold WebSocket connections. Ably manages persistent connections on its infrastructure; Next.js issues short-lived auth tokens.
**When to use:** All real-time features: chat, presence, typing indicators, live jam attendance counts.
**Trade-offs:** Costs money at scale; removes WebSocket complexity from the app entirely.

```typescript
// app/api/realtime/auth/route.ts
import Ably from 'ably'
export async function GET() {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })
  const client = new Ably.Rest(process.env.ABLY_API_KEY!)
  const tokenRequest = await client.auth.createTokenRequest({
    clientId: session.user.id,
  })
  return Response.json(tokenRequest)
}
```

### Pattern 4: Multi-Step Quiz as Client State Machine

**What:** Quiz funnel is a single page (`/quiz/challenge`) with a step index held in local state. Each step renders a different component. On final step, a Server Action submits all collected data atomically.
**When to use:** All quiz/funnel flows.
**Trade-offs:** Simple, no partial persistence; user loses progress if they close. Add `sessionStorage` backup for long flows (10+ steps).

```typescript
'use client'
const STEPS = [CitySelect, LevelAssess, RoleSelect, ScheduleCheck, /* ... */]

export function ChallengeFunnel() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const Step = STEPS[step]
  return (
    <Step
      answers={answers}
      onAnswer={(k, v) => setAnswers(prev => ({ ...prev, [k]: v }))}
      onNext={() => step < STEPS.length - 1 ? setStep(s => s + 1) : submitQuiz(answers)}
    />
  )
}
```

### Pattern 5: Hybrid Webhook + Server Action for Payments

**What:** Payment initiation uses a Server Action (creates payment session). Payment confirmation arrives via Green Invoice webhook to a Route Handler (updates DB, triggers invoice). Never trust the client to confirm payment.
**When to use:** All payment flows.
**Trade-offs:** Standard and correct. Adds a webhook secret verification step.

---

## Data Flow

### Request Flow (Community Page)

```
User visits /community/feed
    ↓
middleware.ts → auth() check → locale detect → inject dir="rtl"
    ↓
FeedPage (RSC) → getMatchCandidates(userId, filters) → Neon Postgres
    ↓
HTML streamed to browser with candidate cards
    ↓
User clicks "Send match request"
    ↓
MatchCard (Client Component) → sendMatchRequest(targetId) [Server Action]
    ↓
Server: auth() + DB insert + notifyUser()
    ↓
notifyUser() → pick channel: push / email / WhatsApp (based on user prefs)
    ↓
Client receives success → optimistic UI update
```

### Real-Time Chat Flow

```
User opens /community/messages/[threadId]
    ↓
ThreadPage (RSC) → load message history from Postgres (last 50)
    ↓
ChatThread (Client Component) mounts
    ↓
GET /api/realtime/auth → Ably token (scoped to user)
    ↓
Ably client subscribes to channel: messages:thread-[id]
    ↓
User types message → sendMessage() Server Action (stores to Postgres)
    ↓
Server Action publishes to Ably channel via REST
    ↓
All subscribers receive real-time update
```

### Payment Flow

```
User submits quiz/booking form
    ↓
Server Action: createPaymentSession() → Green Invoice API
    ↓
Return payment URL to client
    ↓
Client redirects to Green Invoice hosted page
    ↓
User pays → Green Invoice POSTs webhook to /api/webhooks/green-invoice
    ↓
Route Handler: verify signature → update DB (booking confirmed)
    ↓
Trigger: email (Resend) + push notification + WhatsApp confirmation
    ↓
Redirect user to /booking/confirmation
```

### Quiz Submission Flow

```
User completes all steps in client state machine
    ↓
submitQuizAnswers(answers) Server Action
    ↓
Server: score quiz → determine tier/group → upsert user record
    ↓
If payment required → createPaymentSession() → return URL
    ↓
If free (workshop inquiry) → send notification to admin
    ↓
Client lands on result/confirmation page
```

### i18n + RTL Flow

```
Request arrives
    ↓
middleware.ts: detectLocale() → he or en
    ↓
Rewrite URL to /he/... or /en/...
    ↓
next-intl routing: locale-aware layout wraps page
    ↓
Root layout: <html lang={locale} dir={locale === 'he' ? 'rtl' : 'ltr'}>
    ↓
Tailwind RTL classes (rtl: prefix) applied automatically
    ↓
All strings from /i18n/he.json or /i18n/en.json via useTranslations()
```

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-500 users | Monolith is fine. Single Neon branch. Ably Hobby plan (~$0). Vercel free tier sufficient. |
| 500-5K users | Add Neon read replica for match queries. Enable Ably connection limits on higher plan. Add DB query caching with unstable_cache. |
| 5K-50K users | Consider moving partner matching to a dedicated background job (Vercel Cron or Inngest) rather than inline queries. Add Redis (Upstash) for session data and rate limiting. |
| 50K+ users | Extract matching engine to standalone service. Implement PostGIS or geohash for location queries. Shard message storage by thread date. (Unlikely for Israeli acroyoga community V2.) |

### Scaling Priorities

1. **First bottleneck — DB connections:** Neon serverless driver mitigates this. Use `@neondatabase/serverless` with connection pooling via Neon's built-in proxy. Don't use standard `pg` with Vercel.
2. **Second bottleneck — Matching queries:** A naive "find all users matching filters" query degrades as users grow. Add composite indexes on `(city, role, level)` from day one. Pre-compute match scores as a background task rather than on every page load.
3. **Third bottleneck — Real-time connections:** Ably handles this transparently. Only becomes a cost issue, not a technical one.

---

## Anti-Patterns

### Anti-Pattern 1: Using API Routes for Everything

**What people do:** Put all business logic in `app/api/` Route Handlers, calling them from Client Components with `fetch()`.
**Why it's wrong:** Defeats Server Actions, doubles network round trips, requires manual auth in every endpoint, more surface area to secure.
**Do this instead:** Use Server Actions for all mutations from client code. Only create Route Handlers for external webhook receivers and the Ably auth endpoint.

### Anti-Pattern 2: Trying to Run WebSockets on Vercel Serverless

**What people do:** Spin up a Socket.io server inside a Route Handler or try to hold connections open.
**Why it's wrong:** Vercel serverless functions have a maximum execution timeout (30s Hobby, 300s Pro). They cannot maintain persistent connections. Your Socket.io server will silently fail under load.
**Do this instead:** Use Ably (managed WebSockets). The Next.js app only issues short-lived auth tokens and publishes events via REST. All connection management is offloaded.

### Anti-Pattern 3: Hardcoding Direction in CSS (Not Using RTL Logical Properties)

**What people do:** Use `margin-left`, `padding-left`, `text-align: right` etc. to manually handle RTL.
**Why it's wrong:** Every component needs two code paths. Breaks when switching locale. Tailwind RTL plugin handles this for you.
**Do this instead:** Use Tailwind CSS v3+ RTL support with `rtl:` prefix classes, or CSS logical properties (`margin-inline-start`, `padding-inline-end`). Set `dir` on `<html>` and let the browser and utility classes do the rest.

### Anti-Pattern 4: Monolithic Quiz Component with All Logic Inlined

**What people do:** Build one giant `ChallengePage.tsx` with 600 lines, all step logic, scoring, API calls, and UI mixed together.
**Why it's wrong:** Two funnels (challenge + workshop) diverge over time. Inlined logic becomes unmaintainable.
**Do this instead:** Build a generic `QuizEngine` component that accepts a `steps[]` config array. Challenge and workshop pages pass their own step configs. Scoring logic lives in `lib/utils/quiz-scoring.ts`.

### Anti-Pattern 5: Storing Chat Messages Only in Ably

**What people do:** Rely on Ably's 2-minute message history for "chat history" because they didn't set up the DB write path.
**Why it's wrong:** Users lose message history on reconnect. Ably history is not a database.
**Do this instead:** Every message write goes to Postgres first (via Server Action), then publishes to Ably. On mount, the RSC loads the last N messages from Postgres. Ably only delivers new messages during the session.

### Anti-Pattern 6: Separate Next.js Apps for Community vs Admin

**What people do:** Create `/admin` as a separate deployment to "isolate" it.
**Why it's wrong:** Duplicates auth, DB connections, shared component library. Two deployments to maintain.
**Do this instead:** Use a single Next.js app with a `(admin)` route group. Auth.js role check in the group layout. Deploy once, restrict by role.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Ably | Client subscribes via SDK; server publishes via REST API in Server Actions; `/api/realtime/auth` issues tokens | MEDIUM confidence — standard Ably/Next.js pattern, official Vercel template exists |
| Green Invoice | Server Action calls API to create payment; Route Handler receives webhook at `/api/webhooks/green-invoice` | LOW confidence — Israeli provider, API docs need direct verification |
| Twilio WhatsApp | Server Action calls Twilio API to send; Route Handler receives incoming at `/api/webhooks/whatsapp` | MEDIUM confidence — standard Twilio Next.js pattern verified |
| Resend | Server Action calls Resend SDK for transactional email | HIGH confidence — standard pattern with Next.js |
| Web Push (VAPID) | Server Action sends via `web-push` npm; service worker displays; subscriptions stored in Postgres | HIGH confidence — official Next.js PWA docs |
| Auth.js v5 | `auth()` in middleware, layouts, and Server Actions; `/api/auth/[...nextauth]` route handler | HIGH confidence — official Next.js docs |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Community pages <-> Matching engine | Server Action call to `lib/actions/matching.ts` | Direct import, no HTTP |
| Chat UI <-> Message storage | RSC loads history from Postgres; Ably delivers new messages | Dual channel design (persistence + real-time) |
| Quiz funnel <-> Payment flow | Server Action returns payment URL; client redirects | Payment is a separate user journey after quiz |
| Admin <-> Notifications | Server Action calls `lib/actions/notifications.ts` which fans out to push/email/WA | Single notification function, multiple channels |
| Middleware <-> Auth | `auth()` from Auth.js called in `middleware.ts` — runs on every protected route at edge | Auth.js v5 supports edge runtime |
| Webhook handlers <-> DB | Route Handler verifies signature, then calls same `lib/db/queries/` functions as Server Actions | Shared query layer prevents duplication |

---

## Build Order (Dependencies)

This is the critical sequence for implementation phases. Each tier depends on the previous.

**Tier 1 — Foundation (build first, everything else depends on this):**
1. Database schema (users, sessions, profiles) + Drizzle setup
2. Auth.js v5 integration + middleware route guards
3. next-intl setup + Hebrew RTL layout
4. Root layout with PWA manifest
5. Service worker for offline shell

**Tier 2 — User Identity (depends on Tier 1):**
6. Registration + onboarding flow
7. Profile creation (skills checklist, role, level, location)
8. Profile view pages

**Tier 3 — Core Community Features (depends on Tier 2):**
9. Partner matching engine (query + filter UI)
10. Jam board (post + join)
11. Real-time messaging (Ably integration)

**Tier 4 — Revenue (depends on Tier 2, partially Tier 3):**
12. Quiz funnels (challenge + workshop) — can start independently, but needs user accounts for completion
13. Green Invoice payment integration
14. Booking confirmation + admin notifications

**Tier 5 — Operations (depends on Tier 3 + 4):**
15. Admin panel (manage members, approve hosts, view bookings)
16. Notification fanout (push + email + WhatsApp)
17. SEO meta tags, sitemap, robots.txt

**Tier 6 — Polish (can overlap with Tier 5):**
18. Brutalist interactive design (cursor effects, draggable elements, unconventional scroll)
19. Performance optimization (Lighthouse audit, image optimization)
20. PWA push notifications end-to-end

Note: Quiz funnels (Tier 4) can be built earlier as a standalone lead capture before community features are ready. They are architecturally independent.

---

## Sources

- [Next.js App Router guides](https://nextjs.org/docs/app/guides) — HIGH confidence
- [Next.js PWA official guide](https://nextjs.org/docs/app/guides/progressive-web-apps) — HIGH confidence (fetched 2026-03-31, version 16.2.1)
- [Ably + Next.js real-time chat on Vercel](https://ably.com/blog/realtime-chat-app-nextjs-vercel) — MEDIUM confidence
- [Vercel: Deploying Pusher/Ably with Vercel](https://vercel.com/kb/guide/deploying-pusher-channels-with-vercel) — MEDIUM confidence
- [SoftwareMill: Modern Next.js 15 full-stack architecture](https://softwaremill.com/modern-full-stack-application-architecture-using-next-js-15/) — MEDIUM confidence
- [next-intl RTL + routing](https://next-intl.dev/) — HIGH confidence
- [Auth.js v5 + Next.js 16 guide](https://dev.to/huangyongshan46a11y/authjs-v5-with-nextjs-16-the-complete-authentication-guide-2026-2lg) — MEDIUM confidence
- [Twilio WhatsApp + Next.js](https://www.sent.dm/resources/twilio-node-js-next-js-whatsapp-integration) — MEDIUM confidence
- [Neon real-time comments (Ably LiveSync + Neon)](https://neon.com/guides/real-time-comments) — MEDIUM confidence
- [Next.js Server Actions vs API Routes](https://dev.to/myogeshchavan97/nextjs-server-actions-vs-api-routes-dont-build-your-app-until-you-read-this-4kb9) — MEDIUM confidence

---
*Architecture research for: Acroyoga community platform — Next.js + Vercel*
*Researched: 2026-03-31*
