# Project Research Summary

**Project:** AcroYoga Academy — Israeli community platform (rebrand TBD)
**Domain:** Niche sports community platform — partner matching, real-time messaging, quiz funnels, PWA, Israeli payments
**Researched:** 2026-03-31
**Confidence:** MEDIUM-HIGH overall (stack HIGH; architecture MEDIUM-HIGH; features MEDIUM; Green Invoice LOW)

## Executive Summary

AcroYoga Academy is a mobile-first community platform replacing WhatsApp groups for Israeli acroyoga practitioners. The recommended approach is a Next.js 16 App Router monolith on Vercel, using Neon Postgres with Drizzle ORM, Better Auth for sessions, Ably for real-time messaging, and Green Invoice for Israeli payment compliance. RTL Hebrew support via next-intl must be built into the foundation — it cannot be retrofitted. The quiz funnels (30-day challenge + private workshops) are architecturally independent from the community features and can be built as the primary revenue vehicle before community density is established.

The biggest structural risk is building real-time chat on Vercel serverless functions without a managed WebSocket layer — this silently fails in production. The second largest risk is launching with an empty community: partner matching requires seeded profiles to be useful, and an empty platform will kill retention before network effects can take hold. Both risks are fully preventable by making the right infrastructure choices in the foundation phase and running a deliberate founding-member seeding sprint before public launch.

Green Invoice integration carries the highest uncertainty in the stack — the API docs require a developer account to inspect fully, VAT document type must be confirmed against the business's actual registration status before any code is written, and JWT token expiry must be handled automatically. All other components have well-documented patterns and the stack choices are validated at HIGH-MEDIUM confidence.

---

## Key Findings

### Recommended Stack

The stack is Next.js 16 + React 19 deployed on Vercel, with Neon Postgres accessed via Drizzle ORM's serverless HTTP driver. Authentication is handled by Better Auth 1.x (Auth.js was absorbed into Better Auth in early 2026; do not use Auth.js v4/v5). Real-time messaging uses Ably as a managed WebSocket layer — Vercel serverless cannot hold WebSocket connections natively. The PWA is implemented via serwist (the maintained successor to the unmaintained next-pwa). Styling uses Tailwind v4 with CSS logical properties for RTL. Internationalization uses next-intl v4 from day one.

**Core technologies:**
- **Next.js 16 / React 19**: Full-stack framework — App Router, Server Components, Server Actions, SSR/SSG. Vercel-native.
- **Drizzle ORM + Neon (@neondatabase/serverless)**: Serverless-safe Postgres access. HTTP transport avoids connection pool exhaustion. Cold starts under 200ms vs Prisma's 1-3s.
- **Better Auth 1.5.6**: Self-hosted auth with full App Router support. No per-MAU cost. Auth.js is maintenance-only — do not use.
- **Ably**: Managed WebSocket infrastructure. Vercel serverless cannot hold persistent connections; Ably handles all real-time connections externally.
- **next-intl 4.8.4**: App Router-native i18n. Handles Hebrew RTL locale routing and `dir` injection.
- **Tailwind v4.2.2**: CSS-native config with logical properties (`ms-*`, `me-*`) required for RTL flip behavior.
- **framer-motion 12.x**: React 19-compatible. Required for brutalist interactive design. Must use `LazyMotion` + `domAnimation` subset to control bundle size.
- **serwist 9.5.7**: Next.js 15+ compatible PWA service worker. The only maintained next-pwa successor.
- **Green Invoice API**: Israeli payment + חשבונית generation. No official Node.js SDK — build a thin typed wrapper. JWT tokens expire; implement auto-refresh.
- **Resend**: Transactional email. React Email templates, 3K/month free tier.
- **web-push + VAPID**: Push notifications without third-party broker cost.

**Critical version notes:** next@16 mandates React 19. Tailwind v4 uses `@tailwindcss/postcss` plugin, not the v3 PostCSS pattern. serwist requires `@serwist/next` for the Next.js plugin. next-i18next is Pages Router only — do not use.

### Expected Features

Research identifies a clear MVP boundary. The platform must replace WhatsApp group coordination, not replicate all of WhatsApp's features.

**Must have for v1 launch (P1):**
- User auth + community profile with photo, bio, role, level, city — gate to everything else
- Skills checklist (50-100 standard moves, base/flyer/both tags) — required for matching to be meaningful
- Partner search with filters (city, role, level) — the core value proposition
- Jam board with RSVP (host posts, members join) — replaces WhatsApp event chaos
- Simple 1:1 messaging — bridges trust before in-person jam
- Quiz funnel: 30-day challenge (10+ steps, visual, conditional) — primary revenue acquisition from day 1
- Green Invoice payment integration — Israeli VAT compliance; cannot launch paid programs without it
- Hebrew + English bilingual with RTL — non-negotiable for Israeli market; cannot be retrofitted
- Push + email notifications — without these, RSVP rates collapse
- Admin panel (approve hosts, manage members) — platform breaks without moderation capability
- PWA shell — mobile-first delivery; target demographic is phone-only
- Report/block functionality in messaging — required for a physical-meetup platform; not a v2 concern

**Should have after v1 validation (P2):**
- User ratings and reviews — add when sessions have happened and real data exists
- Quiz funnel: private workshops / corporate — add when challenge funnel is proven
- WhatsApp notification channel — add if push notification open rates fall below 15%
- IG feed embed + social proof section — add when community photo content exists
- Share-to-WhatsApp buttons on events — Israeli network effect amplifier
- SEO city landing pages (TLV, Kfar Saba, etc.) — takes 3-6 months to rank; start when content strategy is ready

**Defer to v2+ (P3):**
- Skill-based matching algorithm — defer until 200+ active profiles with populated skills data
- Corporate workshop management portal — validate demand through quiz funnel first
- Multi-city expansion beyond Israel — local density before geographic spread
- Waitlist management — defer until jams are actually filling up

**Anti-features to reject explicitly:** full-featured chat (users will stay on WhatsApp anyway; build simple 1:1 only), global community expansion (kills local relevance), gamification/badges (patronizing to experienced practitioners), native mobile app (PWA is sufficient for v1), automated booking calendar sync (informal jams don't need Google Calendar sync).

### Architecture Approach

The system is a single Next.js monolith using route groups to separate public (SSG/SSR), community (auth-required, RSC + client islands), quiz (isolated conversion funnel), and admin (role-guarded) surfaces. Server Actions handle all client-initiated mutations; Route Handlers exist only for external webhooks (Green Invoice, WhatsApp) and the Ably token endpoint. The database write path always runs before Ably publishing — messages are persisted to Postgres first, then broadcast via Ably. Never store messages only in Ably.

**Major components:**
1. **(public) route group** — Marketing, SEO landing pages, challenge/workshop pages. SSG, no auth middleware. Served from Vercel CDN edge.
2. **(community) route group** — Profiles, matching, jam board, messaging UI. RSC for data fetch, client components only at leaf nodes for interactivity.
3. **(quiz) route group** — Isolated from community chrome. Client state machine steps array; Server Action submits atomically on final step. `sessionStorage` backup for the 10+ step challenge funnel.
4. **(admin) route group** — Role-guarded. Separate layout. Single app deployment — do not create a separate admin deployment.
5. **`lib/actions/`** — All Server Actions centralized by domain (matching, messages, events, payments, notifications). Not scattered in page files.
6. **`lib/db/queries/`** — Pure query functions decoupled from Next.js. Shared by both Server Actions and Route Handlers (webhook handlers).
7. **Real-time layer (Ably)** — Client subscribes via SDK; server publishes via REST API inside Server Actions; `/api/realtime/auth` issues scoped tokens.
8. **Service worker (serwist)** — Offline caching for static assets and profile data only. `NetworkOnly` rules for all `/api/**` and real-time endpoints.

### Critical Pitfalls

The following pitfalls carry HIGH recovery cost if not addressed in the correct phase. Address these proactively.

1. **Vercel serverless cannot hold WebSocket connections** — Socket.IO or native WebSockets silently fail in production (Vercel confirms this). Use Ably from the foundation phase. Do not start messaging UI before the real-time provider is integrated and tested on a Vercel preview deployment with 5+ concurrent connections.

2. **RTL/LTR layout corruption if not built in from day one** — Any `margin-left`, `padding-right`, `float`, or `position: left` in CSS will break the Hebrew/English switch. Recovery requires a full CSS audit (1-2 weeks). Use CSS logical properties exclusively (`margin-inline-start`, `padding-inline-end`) and Tailwind's `rtl:` prefix from the first commit.

3. **Neon connection pool exhaustion** — Using a standard `pg` client or direct (non-pooler) connection string in Vercel serverless functions exhausts Neon's connection limit at ~20 concurrent users. Use `@neondatabase/serverless` HTTP driver or the `-pooler` hostname. Set this up once in the foundation — every phase inherits it.

4. **Community cold start / dead platform at launch** — An empty partner directory kills the product before network effects form. Run a deliberate founding-member seeding sprint before public launch: import 20+ consenting community members from existing WhatsApp groups, post 3-5 upcoming jam sessions from the admin account. This is a product task, not marketing.

5. **Green Invoice document type mismatch** — Using the wrong document type (e.g., type 305 for an Osek Patur business) creates non-compliant invoices. Recovery requires voiding and re-issuing. Before writing any payment code, confirm the business's VAT registration status and the correct document type with the business owner. Review the generated PDF in the sandbox before going live.

6. **Quiz funnel drop-off with no analytics** — Without per-step analytics events, it is impossible to diagnose where users abandon the funnel. Add step-level tracking from day one. The fix is 1 hour of work; the cost of skipping it is weeks of lost optimization data.

7. **WhatsApp template approval blocking launch** — Business-initiated WhatsApp messages require pre-approved templates (1-5 day approval, can be rejected). Submit templates 2+ weeks before planned launch. Always implement email as a fallback notification channel — never make WhatsApp the only channel.

---

## Implications for Roadmap

Based on the architecture's build-order tiers and the pitfall-to-phase mapping from research, the following 6-phase structure is recommended. Phases 1-3 are tightly sequenced by dependency. Phase 4 can begin in parallel with Phase 3.

### Phase 1: Foundation + Infrastructure
**Rationale:** Everything else depends on these decisions. Getting real-time, RTL, and database connection wrong here has HIGH recovery cost that cascades through all future phases. Architecture research explicitly calls this "Tier 1 — build first."
**Delivers:** Working Next.js app skeleton on Vercel with auth, bilingual RTL layout, database access layer, real-time provider integrated, service worker shell, and PWA manifest.
**Addresses:** User auth (email + password), Hebrew RTL layout, PWA installability.
**Avoids (critical):** Vercel WebSocket incompatibility, RTL layout corruption, Neon connection pool exhaustion, mobile animation performance trap, brutalist accessibility failures.
**Research flag: SKIP research-phase** — all patterns are well-documented in official Next.js, Neon, Ably, serwist, and next-intl docs.

### Phase 2: User Identity + Community Core
**Rationale:** Partner matching only works with populated profiles. Registration must collect role + level + city inline — not deferring to a settings page. Messaging requires report/block built simultaneously (physical-meetup safety requirement).
**Delivers:** Community profile with skills checklist, partner search with filters, jam board with RSVP, 1:1 messaging with report/block.
**Addresses:** Partner search, community profiles, skills checklist, jam board, messaging, admin host approval.
**Avoids:** Matching quality failure (enforce profile completeness at registration), safety vacuum (report/block ships with messaging MVP), cold start (onboarding captures matching-critical data).
**Research flag: SKIP research-phase** — standard community platform patterns; FEATURES.md has complete dependency mapping.

### Phase 3: Quiz Funnels + Revenue
**Rationale:** Quiz funnels are architecturally independent and can generate revenue before community density is established. They are the primary acquisition path for the 30-day challenge and workshops. Green Invoice must be resolved before this phase begins.
**Delivers:** 30-day challenge quiz funnel (10+ steps with step-level analytics), workshop quiz funnel (2-3 steps), Green Invoice payment integration, booking confirmation flow, admin booking management.
**Addresses:** Quiz funnel: 30-day challenge, quiz funnel: private workshops, Green Invoice payment + Israeli invoicing, program landing pages.
**Avoids:** Quiz funnel drop-off (progress bar, email collected last, per-step analytics from day one), Green Invoice document type mismatch (confirm VAT status before writing code), WhatsApp template approval blocking launch (submit templates 2 weeks before launch; email fallback required).
**Research flag: NEEDS research-phase** — Green Invoice API requires direct developer account inspection before this phase. Confirm endpoint list, document types, and webhook signature format. This is LOW confidence in research.

### Phase 4: Notifications + Admin Operations
**Rationale:** Notifications require booking/messaging from Phases 2-3 to be meaningful. Admin panel expands from basic moderation to full operations dashboard. WhatsApp channel is added here (after templates are pre-submitted in Phase 3).
**Delivers:** Push notification end-to-end (VAPID + service worker), email notifications (Resend), WhatsApp notifications via Meta Cloud API or Twilio (if templates approved), full admin panel (members, bookings, jam approvals, notification blasts).
**Addresses:** Push + email + WhatsApp notifications, admin panel (full), challenge signup management, workshop booking management.
**Avoids:** PWA service worker breaking real-time features (write `NetworkOnly` exclusions before enabling any caching).
**Research flag: SKIP research-phase** — Resend, web-push, and Ably notification patterns are HIGH confidence. WhatsApp template submission is an operational task, not a research question.

### Phase 5: Public Surface + SEO
**Rationale:** SEO city landing pages and social proof require content to exist (community activity, photos). Building SEO infrastructure before there is content to index wastes the opportunity. This phase also adds IG feed embed and share-to-WhatsApp buttons.
**Delivers:** SEO-optimized landing pages for Hebrew acroyoga terms and city pages (TLV, Kfar Saba), sitemap and robots.txt, hreflang tags, structured data, IG feed embed, share-to-WhatsApp buttons, social proof section.
**Addresses:** SEO optimization for Hebrew terms, Instagram feed embed, social proof, share buttons.
**Avoids:** Building SEO before community content exists (organic rankings take 3-6 months; content must already exist to index).
**Research flag: SKIP research-phase** — next-intl hreflang, Next.js sitemap generation, and Web Share API are well-documented.

### Phase 6: Brutalist Polish + Performance
**Rationale:** Brutalist interactive design (cursor effects, draggable elements, unconventional scroll) is layered on top of working core features — not built in isolation. Animation standards are set in Phase 1 (foundation), but full design realization happens here. Performance audit closes the loop.
**Delivers:** Full brutalist interactive design system, Framer Motion animations across key pages, Lighthouse audit and optimization pass, PWA offline states polished, brand naming implementation.
**Addresses:** Brutalist interactive design with cursor effects and draggable elements, Framer Motion unconventional scroll, performance optimization.
**Avoids:** Cursor effects without `pointer: coarse` guard (desktop-only), CSS animations that cause layout recalculation (use `transform`/`opacity` only), Framer Motion full bundle (use `LazyMotion` + `domAnimation`).
**Research flag: SKIP research-phase** — Framer Motion, Tailwind, and Lighthouse patterns are HIGH confidence.

### Pre-Launch Sprint (between Phase 2 and Phase 3 public launch)
**Rationale:** Community seeding is not a feature — it is a product launch requirement. Cold start pitfall recovery cost is MEDIUM (1 week) but avoidable entirely with deliberate preparation.
**Delivers:** 20+ seeded profiles from existing WhatsApp community (consenting members), 3-5 upcoming jam sessions posted by approved hosts, founding member cohort defined and onboarded.
**Avoids:** Dead platform at launch, "No results found" as the first matching experience.

### Phase Ordering Rationale

- Foundation-first is enforced by 4 HIGH-cost pitfalls that all require Phase 1 resolution (WebSockets, RTL, DB connections, animation standards). Skipping foundation to "ship features faster" creates compounding technical debt.
- Community features before quiz funnels is the default order, but quiz funnels are architecturally independent — they can begin in parallel once the foundation auth layer is available. At minimum, the challenge landing page and quiz funnel can be built and deployed to collect leads before the community is fully functional.
- SEO and social proof are deferred to Phase 5 intentionally — Hebrew city landing pages need real community content to rank effectively. Infrastructure without content is wasted work.
- Green Invoice integration is isolated to Phase 3 with a mandatory pre-phase validation step (confirm VAT status, inspect API with live credentials). This is the only external dependency with LOW confidence.

### Research Flags

**Needs research-phase during planning:**
- **Phase 3 (Green Invoice):** API docs require live developer account access. Confirm: full endpoint list, document types for business VAT status, webhook signature format, token refresh behavior, sandbox vs production environment differences. This cannot be skipped — issuing wrong document types has legal/tax consequences.

**Standard patterns (skip research-phase):**
- **Phase 1:** Next.js App Router, Neon, Ably, serwist, next-intl all have HIGH-confidence official docs.
- **Phase 2:** Community platform CRUD patterns, Drizzle schema design, react-hook-form + Zod, Ably real-time chat — all well-documented.
- **Phase 4:** Resend, web-push/VAPID, Next.js admin patterns — HIGH confidence.
- **Phase 5:** Next.js sitemap, hreflang, next-intl routing — HIGH confidence.
- **Phase 6:** Framer Motion LazyMotion, Tailwind RTL, Lighthouse optimization — HIGH confidence.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core stack (Next.js, Neon, Drizzle, Better Auth, next-intl, serwist) verified via npm registry + official docs. Package versions current as of 2026-03-31. Auth.js deprecation confirmed via HN discussion + project README (MEDIUM). |
| Features | MEDIUM | Competitor analysis covers AcroYoga.org, AcroRoots, AcroWorld + sport matching app patterns. No direct Israeli acroyoga platform data available — feature expectations inferred from analogous niche community platforms. |
| Architecture | MEDIUM-HIGH | Next.js App Router patterns HIGH confidence (official docs). Ably real-time architecture MEDIUM (official Vercel integration guide exists). Green Invoice + WhatsApp integrations LOW (external service specifics unverified). |
| Pitfalls | MEDIUM-HIGH | Vercel WebSocket limit confirmed by official Vercel KB. RTL logical properties confirmed by MDN. Neon pooling confirmed by official Neon docs. Green Invoice VAT document types LOW (Hebrew-only docs, limited community sources). |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Green Invoice API endpoints and document types:** Must be verified with live developer account credentials before Phase 3 begins. Specifically: full POST `/documents` payload schema, document type codes valid for this business's VAT status, webhook signature verification format, and token expiry + refresh behavior. Do not write payment code without this. See STACK.md "Green Invoice API — What We Know" section.
- **WhatsApp Business API setup timeline:** Meta Cloud API phone number verification takes 1-3 days; message template approval takes 1-5 days. This timeline needs to be factored into Phase 3 planning. Template content must be drafted before Phase 3 begins to allow buffer.
- **Skills checklist content:** The standard acroyoga moves list (~50-100 items) needs to be sourced from the business owner / acroyoga domain expert before Phase 2 builds the skills checklist UI. This is a content dependency, not a technical one.
- **Brand naming:** PROJECT.md notes the brand name is part of project scope (replacing "AcroRetreat"). Brand name must be resolved before Phase 5 (SEO pages) and ideally before Phase 6 (design polish). Does not block Phases 1-4.
- **Business VAT registration status:** Required before any Green Invoice code is written. Confirm with business owner: is this Osek Patur, Osek Murshe, or Ltd.? This determines which document types are legally valid.

---

## Sources

### Primary (HIGH confidence)
- [Next.js App Router guides](https://nextjs.org/docs/app/guides) — routing, Server Actions, Server Components, PWA manifest
- [Next.js PWA official guide](https://nextjs.org/docs/app/guides/progressive-web-apps) — serwist integration, service worker, offline
- [Drizzle ORM + Neon official guide](https://orm.drizzle.team/docs/tutorials/drizzle-nextjs-neon) — serverless driver setup, schema migration
- [Better Auth homepage + Next.js docs](https://better-auth.com/docs/integrations/next) — App Router session handling
- [next-intl App Router docs](https://next-intl.dev/docs/getting-started/app-router) — locale routing, RTL direction
- [Neon — Connecting from Vercel](https://neon.com/docs/guides/vercel-connection-methods) — pooler vs direct connection strings
- [Supabase Realtime + Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs) — (evaluated but Ably chosen)
- [npm registry](https://registry.npmjs.org/) — all package versions verified 2026-03-31

### Secondary (MEDIUM confidence)
- [Ably + Next.js real-time chat on Vercel](https://ably.com/blog/realtime-chat-app-nextjs-vercel) — Ably integration pattern
- [Vercel KB — WebSocket support in serverless functions](https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections) — WebSocket incompatibility confirmed
- [Auth.js absorbed into Better Auth — HN discussion](https://news.ycombinator.com/item?id=45389293) — corroborated by project README
- [serwist as next-pwa successor](https://javascript.plainenglish.io/building-a-progressive-web-app-pwa-in-next-js-with-serwist-next-pwa-successor-94e05cb418d7) — corroborated by Next.js PWA official guide
- [Pushwoosh — WhatsApp vs email vs push engagement 2025](https://www.pushwoosh.com/blog/email-whatsapp-marketing/) — WA 99% open rate, push 20%, email 2%; informs notification channel priority
- [Andrew Chen — Cold Start Problem for social products](https://andrewchen.com/how-to-solve-the-cold-start-problem-for-social-products/) — seeding strategy
- [Reform.app — Multi-step form drop-off rates](https://www.reform.app/blog/multi-step-form-drop-off-rates-how-to-reduce-them) — 38% first-screen drop-off baseline
- [AcroYoga.org Community](https://www.acroyoga.org/community) — competitor feature baseline
- [RTL/SEO optimization guide — GtechMe](https://www.gtechme.com/insights/right-to-left-seo-and-ux-optimization-guide/) — Hebrew RTL implementation requirements

### Tertiary (LOW confidence — needs validation)
- [Green Invoice API Apiary](https://greeninvoice.docs.apiary.io/) + [GitHub notes](https://github.com/danielrosehill/Green-Invoice-API-My-Notes) — endpoint patterns, JWT auth, document types. Apiary content not machine-readable; all details need live account verification.
- [Auth.js v5 + Next.js 16 guide](https://dev.to/huangyongshan46a11y/authjs-v5-with-nextjs-16-the-complete-authentication-guide-2026-2lg) — community article; Better Auth is now the recommendation, not Auth.js v5
- [WhatsApp Business Platform — Messaging limits](https://developers.facebook.com/docs/whatsapp/messaging-limits/) — template approval process; timeline estimates from community reports

---

*Research completed: 2026-03-31*
*Ready for roadmap: yes*
