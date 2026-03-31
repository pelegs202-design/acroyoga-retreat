# Pitfalls Research

**Domain:** Niche community platform — partner matching, real-time messaging, quiz funnels, Israeli payment integration
**Researched:** 2026-03-31
**Confidence:** MEDIUM-HIGH (domain-specific sources + official docs; Green Invoice confidence LOW — limited English documentation)

---

## Critical Pitfalls

### Pitfall 1: Vercel Serverless Cannot Hold WebSocket Connections

**What goes wrong:**
You build the messaging feature using WebSockets (Socket.IO or native WS) via Next.js API routes deployed on Vercel. It works perfectly in local dev. In production, connections silently drop after 10-60 seconds because Vercel serverless functions time out and cannot maintain persistent connections. Chat becomes unreliable. Users notice, stop trusting it, revert to WhatsApp.

**Why it happens:**
Vercel's serverless architecture tears down function instances after execution. There is no persistent process to hold a WebSocket open. Developers assume "API route = HTTP server" behavior and don't hit this limit until production traffic arrives. The official Vercel docs confirm: "Vercel serverless functions do not support WebSocket connections."

**How to avoid:**
Use a dedicated real-time service — not a DIY WebSocket server. The recommended options for a Next.js/Vercel stack in 2026 are:
- **Ably** (managed WebSocket infrastructure, has a Next.js + Vercel integration guide, free tier to 200 concurrent connections)
- **Pusher Channels** (simpler API, good for push-only messaging)
- **Partykit / Rivet** (newer, Vercel-native actor model for persistent WS — experimental in 2025)

For 50-200 users, Ably's free tier covers launch. Implement from the start — retrofitting real-time is expensive.

**Warning signs:**
- Messages work in dev but fail after a minute in preview deployments
- "FUNCTION_INVOCATION_TIMEOUT" errors in Vercel logs
- Users report "chat stopped working" after initial session

**Phase to address:** Phase 1 / Foundation — choose and wire the real-time provider before any messaging UI is built.

---

### Pitfall 2: RTL + LTR Mixing Causes Silent Layout Corruption

**What goes wrong:**
The platform launches in Hebrew. Directional CSS properties (`margin-left`, `float: right`, `text-align: left`, `padding-left`) are hard-coded as LTR. When users switch to English or when English content appears inside Hebrew layout (names, technical terms, numbers), text and layout elements mis-align: buttons appear on the wrong side, form validation messages overflow, flex containers reverse unexpectedly, and icons (arrows, chevrons, back buttons) point the wrong direction.

**Why it happens:**
Developers write CSS from their default LTR perspective. Properties like `margin-left: 16px` carry an implicit cultural assumption. In RTL, this margin should be on the right. Hebrew+English bilingual UIs trigger both directions simultaneously in the same render tree — the hardest case.

**How to avoid:**
- Use CSS logical properties exclusively from day one: `margin-inline-start` instead of `margin-left`, `padding-inline-end` instead of `padding-right`, `inset-inline-start` instead of `left`
- Set `dir="rtl"` on `<html>` for Hebrew locale; `dir="ltr"` for English locale (via `next-intl`)
- Use Tailwind's `rtl:` variant prefix consistently (e.g., `rtl:mr-4 ltr:ml-4`)
- Use `next-intl` for routing (`/he/...`, `/en/...`) — it handles direction switching via locale detection
- Audit all icons that imply direction (back arrow, forward chevron, play button) — they need `.rtl:scale-x-[-1]` treatment
- Never use `text-align: left` — use `text-align: start`

**Warning signs:**
- Any instance of `margin-left`, `padding-right`, `float: left/right`, `position: absolute; left:` in CSS
- Navigation items appearing reversed between Hebrew and English preview
- Form field icons (eye toggle, search icon) appearing on wrong side in Hebrew

**Phase to address:** Phase 1 / Foundation — configure Tailwind RTL, install `next-intl`, set direction on HTML element. Every subsequent phase inherits this correctly or inherits broken layout.

---

### Pitfall 3: Community Dead-on-Arrival — Cold Start Without Seeded Content

**What goes wrong:**
Platform launches. First users register, see an empty partner directory with 3-5 profiles, and no upcoming jam sessions. The matching feature only works with sufficient density. With no activity visible, new users assume the platform is inactive and never return. The community dies before network effects can take hold.

**Why it happens:**
Builders focus on feature completeness and launch when the product is "ready." But community platforms require perceived activity to generate actual activity — a chicken-and-egg problem. WhatsApp groups look "active" because they have history. A new platform has none.

**How to avoid:**
- Pre-seed profiles before public launch: manually import consenting community members from existing WhatsApp groups, even just their name + level + city
- Create 3-5 jam session posts authored by the admin/host account before launch day
- Show total community size prominently even when small ("14 practitioners in Tel Aviv")
- Give the admin/teacher a high-quality profile that functions as social proof
- Consider a "founding member" cohort — invite 20 people from the existing network to be beta users; their profiles constitute the critical mass
- Implement "recently active" signals rather than "joined date" to make sparse activity feel recent

**Warning signs:**
- Launching without pre-seeded profiles from known community members
- Partner matching page showing "No results found" as the first screen new users see
- No upcoming jam sessions on the jam board at launch

**Phase to address:** Phase before public launch — plan a seeding sprint. Recruiting founding members is a product task, not just marketing.

---

### Pitfall 4: Quiz Funnel Drop-Off From Step 1 Due to Friction, Not Interest

**What goes wrong:**
The 30-day challenge quiz has 10+ questions. Users begin but abandon at step 3-5. Conversion data is never collected so the team doesn't know where. The funnel generates few signups; the challenge runs half-empty.

**Why it happens:**
Long funnels feel normal to the builder who designed them — every question seems necessary. But 38% drop-off after the first screen is the industry baseline. For a 10+ step funnel on mobile, completing the quiz requires deliberate commitment. Most users don't commit that early.

**How to avoid:**
- Show a progress bar on every step — "Step 3 of 7" with visual progress reduces abandonment by giving users a sense of completion momentum
- Put the most engaging/visual/playful questions first; put friction questions (email, payment) last
- Never ask for email before question 4 — show value first, collect data after
- Use micro-copy on each question explaining why it matters ("This helps us pair you with the right practice partner")
- Add a "save and continue later" mechanism — or at minimum, preserve state in localStorage so refreshing doesn't reset progress
- Track step-level analytics from day one — without per-step abandonment data you are blind
- For the workshop quiz (2-3 questions), commit to maximum 3 questions. No exceptions.

**Warning signs:**
- No analytics events on individual quiz steps at launch
- The quiz asks for email on step 1 or 2
- No progress indicator visible during the quiz
- Questions presented as a plain form rather than one-at-a-time cards

**Phase to address:** Phase 2 / Quiz Funnels — build step-level analytics into the quiz from the start, not as a post-launch addition.

---

### Pitfall 5: Green Invoice API — Document Type Mismatch Breaks Israeli Invoice Compliance

**What goes wrong:**
Payments process successfully. But the Hebrew invoices (חשבוניות) generated are the wrong document type for the business's VAT registration status, or the VAT configuration is set incorrectly. The business owner discovers this during tax filing or a customer disputes the invoice. Correcting issued invoices requires manual intervention and potentially re-issuing.

**Why it happens:**
Green Invoice (Morning) has 13 document types with different VAT rules depending on business registration: Osek Patur cannot issue type 305 (Tax Invoice), only types 320 or 400. The official API documentation is primarily in Hebrew and lacks English guidance. Developers test with sandbox credentials, get "success" responses, and don't validate the generated document type against Israeli tax requirements.

**How to avoid:**
- Confirm the business's VAT registration status (Osek Murshe, Osek Patur, or Ltd.) before writing any payment integration code — this determines which document types are legal
- For most individual teachers/small businesses in Israel: use type 320 (Tax Invoice-Receipt, חשבונית מס/קבלה) which is the most common correct type
- Test by actually downloading the generated PDF from the Green Invoice dashboard and visually confirming it matches expectations
- Never mix `vatType` at document level and at income row level — pick one and be consistent (set `vatType: 0` at document level to use the account default)
- JWT tokens expire — implement automatic token refresh in the payment service, not manual re-auth

**Warning signs:**
- Using document type 305 without confirming Osek Murshe status
- No PDF review step in integration testing
- JWT expiry causing payment failures with no retry logic
- VAT amount appearing as 0 when it should be 17%

**Phase to address:** Phase 3 / Payments — before writing a single line of Green Invoice API code, confirm business VAT status and document type with the business owner.

---

### Pitfall 6: PWA Offline Caching Breaks Real-Time Features

**What goes wrong:**
The service worker is configured to cache aggressively for offline support. This starts intercepting API responses and WebSocket upgrade requests. Chat messages fail silently or show stale data. Users see "you have new messages" (from push notification) but the in-app chat shows nothing because the service worker served a cached empty response.

**Why it happens:**
PWA offline-first and real-time messaging have opposite requirements: offline caching wants to serve stale data when network is unavailable; real-time messaging requires fresh data always. Naive "cache everything" service worker strategies — common in Next.js PWA tutorials — don't exclude real-time endpoints.

**How to avoid:**
- Explicitly exclude WebSocket upgrade endpoints and real-time API routes from service worker caching (in `next-pwa` config, use `runtimeCaching` with `handler: 'NetworkOnly'` for `/api/messages/**`, `/api/realtime/**`, and Ably/Pusher endpoint patterns)
- Separate the caching strategy: cache static assets and profile data aggressively (Cache First); never cache message feeds or notification APIs
- Use IndexedDB for offline message queue (not localStorage) — supports async, larger storage, doesn't block render
- Test offline behavior explicitly: disable network in DevTools and verify the app shows a meaningful offline state for messaging, not silent failures

**Warning signs:**
- Service worker installed before real-time messaging is implemented and tested
- No explicit `NetworkOnly` rules for API routes in the service worker config
- Push notification arrives but chat UI shows no messages

**Phase to address:** Phase 4 / PWA — when implementing the service worker, write the exclusion rules for real-time endpoints before enabling any caching.

---

### Pitfall 7: Neon/Vercel Postgres Connection Pool Exhaustion Under Load

**What goes wrong:**
The app works fine in development (1-2 concurrent connections). Under even modest production load (20+ simultaneous users triggering database queries), Vercel serverless functions each open their own TCP connection to Postgres. Neon's free/hobby tier allows ~10-20 concurrent connections. The pool exhausts; new requests throw "too many clients" errors; the app returns 500s.

**Why it happens:**
Each Vercel serverless function invocation is stateless and short-lived. Traditional Postgres connection pooling (maintaining a connection pool across requests) doesn't work in serverless because there is no persistent process. Developers use standard Postgres clients (`pg`, `postgres.js`) which open a new TCP connection per invocation.

**How to avoid:**
- Use Neon's serverless driver (`@neondatabase/serverless`) with HTTP transport instead of TCP — it avoids the connection limit problem entirely by using stateless HTTP queries
- Alternatively, use Neon's built-in connection pooler (the `-pooler` hostname suffix in the connection string) for all serverless functions
- Never use the direct (non-pooler) connection string in Vercel serverless functions — reserve it only for migrations
- Vercel's `POSTGRES_URL` environment variable (set up via Neon integration) uses the pooler URL by default — use this, don't override it with a direct connection string

**Warning signs:**
- Connection strings without `-pooler` in the hostname used in API routes
- Using `pg` or `postgres` client directly in serverless functions without explicit `max: 1` pool setting
- "remaining connection slots are reserved" errors in production logs

**Phase to address:** Phase 1 / Foundation — set up database access layer once, correctly. Every phase that follows inherits either the correct or broken pattern.

---

### Pitfall 8: Partner Matching Quality Failure — Matching Without Profile Density

**What goes wrong:**
The matching algorithm runs but produces poor results because most profiles are 40% complete — users skipped the skills checklist, didn't select a role preference (base/flyer/both), or left location blank. "Find a partner" returns either zero results or wildly inappropriate matches (complete beginners matched with advanced flyers, wrong city). Users blame the platform, not the data quality.

**Why it happens:**
Profile completion is optional. Users fill in what they feel like, skip what feels like effort. Unlike dating apps where a photo and age are enough to start swiping, acroyoga matching requires role + level + location as minimum viable data — without all three the match is meaningless.

**How to avoid:**
- Enforce minimum profile completeness before the user can appear in search results or see match suggestions — make this explicit ("Complete your profile to find partners: 2 of 3 required fields missing")
- Use progressive profile completion: collect role + level + city during the initial quiz funnel or registration, not as an afterthought in Settings
- Show a "profile strength" indicator on the member's own profile page
- Don't show "Find Partners" in the nav until the user's own profile meets the minimum threshold
- Display match quality reasoning: "Matched because: same level, same city, complementary role" — this builds trust in the algorithm

**Warning signs:**
- Registration flow that doesn't collect level + role + city
- "Find Partners" link visible to users with incomplete profiles
- Matching query that runs without required fields populated (returns garbage)

**Phase to address:** Phase 2 / Core Community Features — design the registration/onboarding to capture matching-critical data, not leave it for a profile settings page.

---

### Pitfall 9: Brutalist Interactivity Destroying Mobile Performance and Core Web Vitals

**What goes wrong:**
Cursor effects, draggable elements, scroll-triggered animations, and heavy CSS work beautifully on a developer's 16" MacBook Pro. On a mid-range Android phone (the majority of the Israeli mobile market), the experience is janky: animations drop frames, scroll is laggy, interactions feel sticky. Lighthouse scores fall below 50. SEO rankings suffer because Google's Core Web Vitals use real-device data. The brutal aesthetic intended to feel energetic instead feels broken.

**Why it happens:**
Custom cursor effects require `mousemove` event listeners that fire hundreds of times per second — each firing JavaScript on the main thread. CSS animations using `top`/`left` instead of `transform` force expensive layout recalculations. Animation libraries (GSAP, Framer Motion) bundle large JS payloads. On desktop with GPU and fast CPU, none of this is noticeable. On mobile, it's catastrophic.

**How to avoid:**
- Custom cursor effects: disable entirely on touch devices (`@media (pointer: coarse)` — all mobile phones match this). Cursor effects are inherently desktop-only; implement them conditionally from the start
- Use `transform` and `opacity` exclusively for animations — these are GPU-composited and don't cause layout recalculation
- Use `will-change: transform` on elements that animate, but sparingly — it creates a new compositing layer and uses GPU memory
- Implement `prefers-reduced-motion` media query respect — required for accessibility, also provides a natural performance fallback
- Use Framer Motion's `LazyMotion` with the `domAnimation` feature set (not `domMax`) to reduce bundle size
- Test on a real Android mid-range device (or use Chrome DevTools with CPU 4x throttle) every sprint, not just at the end

**Warning signs:**
- Cursor effect code without `pointer: coarse` guard
- Animation properties using `top`, `left`, `width`, `height` instead of `transform`
- Framer Motion imported without `LazyMotion`
- Lighthouse Performance score never checked on mobile

**Phase to address:** Phase 1 / Foundation — establish animation standards and the touch-device guard pattern. Every component built after this inherits the correct approach.

---

### Pitfall 10: WhatsApp Notifications Without Template Approval Blocking Launch

**What goes wrong:**
The plan is to send WhatsApp notifications when a new partner match is available, when a jam session is posted, or when a user receives a message. Development completes. Integration is ready. Launch approaches. Then: the WhatsApp Business API requires pre-approved message templates for all business-initiated messages. Template approval takes 1-5 business days and can be rejected. Launch is blocked or happens without notifications.

**Why it happens:**
WhatsApp Business API distinguishes between user-initiated conversations (free-form replies allowed within a 24-hour window) and business-initiated messages (must use approved templates). Developers treat it like sending an email — write the text, call the API. The template approval step is discovered late.

**How to avoid:**
- Submit message templates 2+ weeks before planned launch date
- Keep templates generic enough to be reused (e.g., "You have a new message on [platform name]. Reply there to connect.") — overly specific templates get rejected
- Design the notification system to fall back to email if WhatsApp template is pending or rejected — don't make WhatsApp the only notification channel
- For the early community (50-200 people), a WhatsApp group broadcast (using the existing informal WA group) is an acceptable substitute for the API-powered notifications at launch
- The simplest initial approach: use the existing WhatsApp group for community-wide announcements; use email for individual notifications; add WhatsApp API in a later phase after templates are approved

**Warning signs:**
- WhatsApp notification implementation planned for the week before launch
- No fallback email notification system
- Template submission not started 2+ weeks before launch

**Phase to address:** Phase 3 / Notifications — start template submission the moment you know what the messages will say. Treat approval as an external dependency with uncertain timeline.

---

### Pitfall 11: Moderation and Safety Vacuum in a Physical-World Connection Platform

**What goes wrong:**
The platform connects real people for physical acroyoga practice — a trust-heavy activity involving physical contact between strangers. No content moderation, reporting, or blocking system exists at launch. A bad actor creates a fake profile or sends harassing messages. The first abuse incident is handled ad hoc via WhatsApp to the admin. Word spreads. Trust in the platform collapses.

**Why it happens:**
Small-community founders assume they know everyone and that formal safety systems are "for big platforms." But even 50 users can have bad actors. A platform facilitating physical meetups between strangers has higher safety stakes than a discussion forum.

**How to avoid:**
- Build report/block at the same time as messaging — not as a post-launch addition. This is a two-day implementation, not a phase of work
- Admin panel must include: ability to see flagged content, deactivate accounts, and delete messages
- Require profile photo for all accounts (reduces fake profiles significantly)
- Add a terms of service acceptance at registration that explicitly covers physical safety and respectful communication
- Consider ID verification or "invite only" for the initial cohort — since this is replacing a known WhatsApp community, every founding member should be vouched for

**Warning signs:**
- Messaging feature built without a "Report" button in the same PR
- Admin panel doesn't expose message logs
- Registration allows anonymous profiles with no photo and no real name

**Phase to address:** Phase 2 / Messaging + Community — safety features are not a V2 concern for a physical-meetup platform. Build report/block with the messaging MVP.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hard-code `dir="rtl"` on `<html>` without `next-intl` routing | Skip i18n setup complexity | Cannot serve English locale; full i18n refactor required later | Never — set up `next-intl` from day one |
| Use direct Neon TCP connection string in API routes | Simpler connection setup | Connection pool exhaustion at 20+ users | Never in serverless — use pooler or HTTP driver always |
| Skip per-step analytics on quiz funnel | Faster to build | Blind to where drop-off occurs; can't optimize without rebuilding | Never — analytics is 1 hour of work that prevents wasted weeks |
| Build real-time chat with Vercel API routes and polling | No external service needed | Scales poorly, laggy UX, fights serverless model | Acceptable only as temporary stub during development (not production) |
| No report/block in messaging MVP | Ship faster | First abuse incident is a trust crisis | Never for a physical-meetup platform |
| Defer profile completion enforcement | Less friction at registration | Matching returns poor results; users blame the algorithm | Acceptable to defer visual indicator; never defer data collection |
| WhatsApp API as the only notification channel | Feels native for Israeli users | Template approval blocks launch; no fallback | Never — always have email as fallback |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Green Invoice API | Using document type 305 (Tax Invoice) for an Osek Patur business | Confirm VAT registration status first; use type 320 for most small businesses |
| Green Invoice API | JWT token not refreshed, causes payment failures after ~1 hour | Implement automatic token refresh (tokens expire; re-auth via POST /v1/account/token) |
| Green Invoice API | Setting `vatType` at both document and row level, causing VAT conflicts | Set `vatType: 0` at document level only, let it inherit |
| Neon Postgres | Using direct (non-pooler) connection string in Vercel serverless functions | Use the `-pooler` hostname or `@neondatabase/serverless` HTTP driver |
| Vercel + WebSockets | Implementing Socket.IO in a Next.js API route | Use Ably, Pusher, or Partykit — Vercel serverless cannot hold persistent connections |
| WhatsApp Business API | Sending business-initiated messages without pre-approved templates | Submit templates 2 weeks before launch; design email fallback |
| next-intl + `dir` attribute | Setting `dir` in a static layout that doesn't switch per locale | Set `dir` on `<html>` dynamically based on current locale in `layout.tsx` |
| Service Worker + real-time | Cache-first strategy intercepting API/WebSocket calls | Explicitly exclude real-time endpoints with `NetworkOnly` handler in `runtimeCaching` |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `mousemove` cursor effect on mobile | Page scroll stutters; main thread blocks | Guard with `@media (pointer: coarse)` — disable on touch devices | All mobile devices |
| CSS animations using `top`/`left` not `transform` | Janky animations; Lighthouse CLS score poor | Animate only `transform` and `opacity` | Always; worse on mid-range Android |
| Framer Motion full bundle import | Large JS payload; slow TTI | Use `LazyMotion` + `domAnimation` feature set | Pages with 5+ animated components |
| Postgres TCP in serverless | "Too many connections" 500 errors | Use Neon HTTP driver or pooler connection string | ~20+ concurrent users |
| Real-time polling loop instead of WebSocket/SSE | Database hammer; high costs; latency | Commit to Ably/Pusher in foundation phase | 50+ active users |
| No image optimization on profile photos | Slow LCP; high bandwidth costs | Use Next.js `<Image>` with sizing constraints; enforce upload limits | First time a user uploads a 6MB photo |
| Aggressive PWA caching of API responses | Stale data; real-time features return empty | `NetworkOnly` for all `/api/**` routes; cache only assets | First time a cached empty state is served |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing Green Invoice API secret in client-side code or `.env.local` committed to repo | Full payment account access; fraudulent invoices | Keep Green Invoice credentials server-only (API route / Edge Function); never in `NEXT_PUBLIC_*` |
| No rate limiting on messaging API | Spam/abuse floods messages; harassment at scale | Add rate limiting middleware (Vercel Edge Middleware or Upstash Ratelimit) on message creation endpoints |
| Allowing direct DB queries from the client | Full table access bypass; data exfiltration | All DB queries go through Next.js API routes or server actions — never client-side Neon queries |
| Profile photos stored without size/type validation | Malware upload; storage cost explosion | Validate MIME type + enforce 5MB limit server-side before accepting upload |
| Partner matching results exposing full user email/phone | PII exposure; unwanted direct contact | Messaging is always in-platform; never expose email or phone in match results |
| JWT from Green Invoice stored in localStorage | XSS can steal token; attacker bills fake invoices | Store Green Invoice JWT in server-side session only (httpOnly cookie or server memory) |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Quiz step asking for email before showing value | High abandon rate at step 1-2 | Ask for email at the last step, after the user has invested in the quiz |
| "No partners found" as first experience on matching page | Platform feels dead; user leaves | Gate "Find Partners" behind profile completion; show seeded profiles at launch |
| Brutalist design with poor color contrast | Fails WCAG AA; excludes users with vision impairment; SEO penalty | Test all color combinations against WCAG AA (4.5:1 ratio for text); brutalism can be high-contrast |
| Navigation that's "clever" but not obvious | Users can't find messaging or profile; bounce | Hebrew users read right-to-left; primary nav should be RTL-native, not mirrored from LTR |
| RTL number display — phone numbers, prices, dates | Numbers read in wrong order in Hebrew context | Use Unicode bidirectional control characters or `dir="ltr"` spans around numbers, prices, and phone numbers embedded in RTL text |
| Match profile with no context about why it's a match | Users don't understand the recommendation; low click-through | Show match rationale inline: "Same level, same city, looking for a flyer" |
| Single-language CTA in a bilingual community | English speakers feel second-class; Hebrew speakers confused by English CTAs | All primary CTAs must exist in both languages; language auto-detected from browser, not forced |

---

## "Looks Done But Isn't" Checklist

- [ ] **Real-time messaging:** Appears to work in dev with polling — verify with Ably/Pusher under production conditions with 5+ concurrent users
- [ ] **Green Invoice integration:** Payment succeeds in sandbox — verify the actual PDF invoice is the correct document type and shows correct VAT for the business's registration status
- [ ] **RTL layout:** Looks correct in Chrome Hebrew locale — verify with Firefox, Safari on iOS, and with the `dir` switching between Hebrew and English in the same session
- [ ] **Quiz funnel analytics:** Quiz is built — verify per-step analytics events are firing in the analytics dashboard, not just that the final submission works
- [ ] **PWA install:** App is installable — verify offline mode shows a meaningful state for messaging (not a silent blank screen)
- [ ] **Neon connection pooling:** App works in dev — verify production uses the `-pooler` connection string and `@neondatabase/serverless` driver in serverless functions
- [ ] **Partner matching:** Algorithm returns results — verify it returns zero results (not garbage) when required fields are missing, and useful results with correct data
- [ ] **Admin panel:** Admin can see users — verify admin can deactivate accounts, delete messages, and view flagged content
- [ ] **WhatsApp notifications:** Integration is coded — verify message templates are approved or that email fallback is in place before launch
- [ ] **Profile photos:** Upload works — verify 6MB uploads are rejected server-side, MIME type is validated, and images are served via Next.js Image optimization

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Messaging built on Vercel API routes (no real-time service) | HIGH | Extract messaging to dedicated service (Ably/Pusher); refactor all message send/receive calls; ~2-3 days |
| RTL not using logical CSS properties | HIGH | Full CSS audit; find/replace directional properties; test all components in both locales; ~1-2 weeks |
| Green Invoice wrong document type — invoices already issued | HIGH | Contact Green Invoice support to void/re-issue; potentially contact all affected customers; legal review |
| Neon TCP connections exhausted in production | MEDIUM | Switch connection string to pooler version + swap to `@neondatabase/serverless`; ~4 hours |
| Cold start — community launched with no seeded profiles | MEDIUM | Aggressive personal outreach to seed 20+ profiles; run a "founding member" campaign; ~1 week |
| Quiz funnel — no step analytics, can't diagnose drop-off | MEDIUM | Add analytics events + wait 2 weeks for data; ~2 days dev work but weeks of lost data |
| Service worker breaking real-time features | MEDIUM | Add `NetworkOnly` exclusions; redeploy service worker; users need to clear cache | ~4 hours |
| WhatsApp templates not approved at launch | LOW | Fall back to email notifications; resubmit templates; no code change needed |
| Profile matching returns poor results due to missing data | LOW | Add profile completion prompts; admin outreach to fill gaps; ~1 day dev |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Vercel + WebSockets incompatibility | Phase 1: Foundation | Real-time provider integration test with 5 concurrent connections on Vercel preview |
| RTL/LTR CSS logical properties | Phase 1: Foundation | All CSS audited for directional properties; `dir` switches correctly between locales |
| Neon connection pool exhaustion | Phase 1: Foundation | Production connection string uses pooler; load test with 20 concurrent DB queries |
| Mobile performance — animation/cursor | Phase 1: Foundation | Lighthouse mobile score > 70; cursor effect disabled on `pointer: coarse` devices |
| Brutalist accessibility (contrast, semantics) | Phase 1: Foundation | WCAG AA contrast check on all text/background combinations |
| Matching without profile density | Phase 2: Core Community | Registration collects level + role + city; matching gated on profile completeness |
| Safety — report/block for physical meetups | Phase 2: Messaging | Report button exists in messaging MVP; admin can deactivate accounts |
| Partner matching quality | Phase 2: Core Community | Matching returns zero results for incomplete profiles; match rationale shown |
| Quiz funnel drop-off analytics | Phase 2: Quiz Funnels | Per-step analytics events firing; progress bar visible; email collected last |
| Green Invoice document type / VAT | Phase 3: Payments | Business VAT status confirmed; PDF invoice reviewed and validated before go-live |
| WhatsApp template approval timing | Phase 3: Notifications | Templates submitted ≥2 weeks before launch; email fallback implemented |
| Cold start / community seeding | Pre-launch sprint | ≥20 seeded profiles from existing community; ≥3 upcoming jam sessions posted |
| PWA service worker + real-time conflict | Phase 4: PWA | `NetworkOnly` rules in place for all API routes; offline state tested for messaging |

---

## Sources

- [Vercel Knowledge Base — WebSocket support in serverless functions](https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections)
- [Ably — Building real-time chat with Next.js and Vercel](https://ably.com/blog/realtime-chat-app-nextjs-vercel)
- [Rivet — WebSocket servers for Vercel Functions (2025)](https://rivet.dev/blog/2025-10-20-how-we-built-websocket-servers-for-vercel-functions/)
- [Neon — Vercel Postgres Transition Guide](https://neon.com/docs/guides/vercel-postgres-transition-guide)
- [Neon — Connecting to Neon from Vercel](https://neon.com/docs/guides/vercel-connection-methods)
- [Green Invoice API documentation](https://greeninvoice.docs.apiary.io/)
- [Daniel Rosehill — Green Invoice API Notes (non-official)](https://github.com/danielrosehill/Green-Invoice-API-My-Notes)
- [Next.js — Internationalization guide](https://nextjs.org/docs/app/guides/internationalization)
- [Tomedes — Hebrew UI/strings localization best practices](https://www.tomedes.com/translator-hub/hebrew-ui-strings-translation)
- [next-intl documentation](https://next-intl.dev/docs/usage/translations)
- [Andrew Chen — Cold Start Problem for social products](https://andrewchen.com/how-to-solve-the-cold-start-problem-for-social-products/)
- [Reform.app — Multi-step form drop-off rates](https://www.reform.app/blog/multi-step-form-drop-off-rates-how-to-reduce-them)
- [Ably — WebSocket architecture best practices](https://ably.com/topic/websocket-architecture-best-practices)
- [WhatsApp Business Platform — Messaging limits](https://developers.facebook.com/docs/whatsapp/messaging-limits/)
- [MDN — PWA Offline and background operation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)
- [Phrase.com — Internationalization beyond code](https://phrase.com/blog/posts/internationalization-beyond-code-a-developers-guide-to-real-world-language-challenges/)
- [House Ink Studio — Brutalist Web Design SEO guide](https://houseinkstudio.com/brutalist-web-design-seo-anti-design-trend-2025/)

---
*Pitfalls research for: Acroyoga community platform — partner matching, real-time messaging, quiz funnels, Israeli payments, RTL/bilingual, PWA*
*Researched: 2026-03-31*
