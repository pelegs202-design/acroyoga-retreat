# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-31)

**Core value:** People can find and connect with the right acroyoga partner near them — by level, role, and skills — and show up to practice together.
**Current focus:** Phase 10 — Brutalist Design Polish + Performance

## Current Position

Phase: 10 of 10 (Brutalist Design Polish + Performance) — IN PROGRESS
Plan: 3 of 5 in current phase — 10-03 COMPLETE
Status: Brutalist header (magnetic nav, hamburger) + Radix Dialog mobile menu (DSGN-04 WCAG AA) + 4-col footer on all pages + auth pages in 2px pink-bordered brutalist card with bold headings
Last activity: 2026-04-04 — Plan 10-03 complete: Header/footer/mobile-menu redesign + auth page polish

Progress: [██████████] 97%

## Performance Metrics

**Velocity:**
- Total plans completed: 10
- Average duration: 5.6 min
- Total execution time: 0.93 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-auth | 4 | 30 min | 7.5 min |
| 02-brand-identity | 2 | 9 min | 4.5 min |
| 03-community-profiles-partner-matching | 3 | 9 min | 3 min |
| 04-jam-board-messaging | 1 | 6 min | 6 min |
| 05-quiz-funnels | 2 | 8 min | 4 min |

**Recent Trend:**
- Last 5 plans: 02-03 (4 min), 03-01 (3 min), 03-03 (3 min), 04-01 (6 min), 05-01 (4 min)
- Trend: Stable

*Updated after each plan completion*
| Phase 04 P03 | 4 | 3 tasks | 3 files |
| Phase 04-jam-board-messaging P05 | 18 | 2 tasks | 12 files |
| Phase 05-quiz-funnels P04 | 7 | 2 tasks | 8 files |
| Phase 05-quiz-funnels P03 | 4 | 2 tasks | 5 files |
| Phase 05-quiz-funnels P05 | 12 | 2 tasks | 8 files |
| Phase 06-payments-invoicing P01 | 13 | 2 tasks | 5 files |
| Phase 06-payments-invoicing P02 | 12 | 2 tasks | 6 files |
| Phase 07-notifications-automations P01 | 5 | 2 tasks | 8 files |
| Phase 07-notifications-automations P02 | 4 | 2 tasks | 10 files |
| Phase 07-notifications-automations P04 | 7 | 2 tasks | 7 files |
| Phase 07-notifications-automations P03 | 3 | 2 tasks | 4 files |
| Phase 07-notifications-automations P05 | 12 | 2 tasks | 5 files |
| Phase 07-notifications-automations P06 | 5 | 1 tasks | 1 files |
| Phase 08-admin-panel P01 | 3 | 2 tasks | 13 files |
| Phase 08-admin-panel P02 | 5 | 2 tasks | 11 files |
| Phase 10-brutalist-design-polish-performance P01 | 9 | 2 tasks | 13 files |
| Phase 10-brutalist-design-polish-performance P03 | 15 | 2 tasks | 9 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: Phase 5 (Quiz Funnels) depends only on Phase 1 — can begin in parallel with Phases 3-4
- Roadmap: Green Invoice needs mandatory pre-phase validation spike before Phase 6 begins (LOW confidence in API docs)
- Roadmap: WhatsApp template approval takes 1-5 days — submit templates during Phase 6 to unblock Phase 7
- Roadmap: Brand name must be resolved in Phase 2 before SEO (Phase 9) and design polish (Phase 10)
- Roadmap: Community cold start — seed 20+ profiles from existing WhatsApp community before public launch (between Phase 3 and public go-live)
- 01-01: role/level user fields use string type not Postgres enum — Better Auth generate unreliable with custom enums; validate at app layer
- 01-01: Better Auth auth route uses toNextJsHandler(auth) pattern (not raw auth.handler)
- 01-01: Next.js 16 dev script uses --webpack flag (not --no-turbopack) for Serwist compatibility
- 01-02: Next.js 16 uses proxy.ts (not middleware.ts) — middleware filename was deprecated in v16
- 01-02: Root layout returns children only (no html/body) — locale layout provides its own html element
- 01-02: Import typed navigation from @/i18n/navigation (not next-intl directly) for type-safe locale routing
- 01-04: swSrc path for Serwist is src/app/sw.ts (not app/sw.ts) — project uses src/ prefix for App Router
- 01-04: sw.ts declares self as any for __SW_MANIFEST — avoids webworker lib requirement in tsconfig
- 01-04: Offline page is self-contained (own html/body, inline styles) — lives outside [locale] segment for cache reliability
- [Phase 01-03]: 01-03: getAuthSession() in every protected Server Component — middleware not trusted for security (CVE-2025-29927)
- [Phase 01-03]: 01-03: tosAcceptedAt updated via raw Drizzle sql tag (not authClient) — input:false additionalField cannot be set through Better Auth client SDK
- 02-01: Plain @theme block used for brand color tokens (not @theme inline) — inline modifier embeds values at build time, breaking runtime CSS variable overrides
- 02-01: Brand tokens use :root --brand variable bridged to @theme --color-brand via var() — preserves runtime CSS variable flexibility while generating Tailwind utilities
- [Phase 02-02]: 02-02: [locale]/layout.tsx uses title template { default: 'AcroHavura', template: '%s | AcroHavura' } — enables per-page title suffixing in future phases
- [Phase 02-02]: 02-02: Password reset email subject is 'Reset your password.' — direct bold voice, period intentional, no brand name in subject
- [Phase 02-03]: 02-03: Offline page wordmark uses inline style hex #F472B6 (not text-brand) — self-contained page outside [locale], Tailwind not guaranteed in cache context
- [Phase 02-03]: 02-03: PWA icon border thickness 15% of icon size — brutalist frame proportion readable at small icon sizes
- [Phase 02-03]: 02-03: Root page.tsx uses bg-background replacing bg-white dark:bg-black — single CSS variable, no light/dark conditionals
- [Phase 03-01]: 03-01: Relations defined after all table declarations to avoid TypeScript forward-reference errors when userRelations references reviews table
- [Phase 03-01]: 03-01: skills text[] default uses sql template tag with '{}'::text[] PostgreSQL array literal — required for correct Drizzle migration SQL
- [Phase 03-01]: 03-01: SKILL_CATEGORIES is a static TypeScript constant (not DB-stored) — user.skills stores move name strings from this list
- [Phase 03-01]: 03-01: Drizzle migration 0000 is the initial full-schema migration — DB was blank, no prior migrations existed; gitignored per project config
- [Phase 03-03]: 03-03: Drizzle filter conditions built as array with .filter(Boolean) cast — avoids conditional chaining and keeps and() call clean with dynamic number of conditions
- [Phase 03-03]: 03-03: ProfileHero/ProfileBio are server components receiving locale prop — getTranslations called directly; SkillsDisplay is client component for expand/collapse interactivity
- [Phase 03-03]: 03-03: Empty-state visibility rule — own profile sees nudge, other user sees nothing — applied consistently in ProfileBio and SkillsDisplay
- [Phase 03-03]: 03-03: MembersGrid broadening suggestion uses level > role > city priority to identify most-restrictive active filter for removal hint
- [Phase 03-02]: 03-02: Vercel Blob client-upload pattern used (not server-upload) — avoids 4.5 MB Next.js body limit for image files
- [Phase 03-02]: 03-02: Old blob deleted in onUploadCompleted callback — prevents CDN storage accumulation on photo replacement
- [Phase 03-02]: 03-02: Skills array update uses Drizzle typed .update().set({ skills }) — raw SQL template tag cannot serialize text[] correctly
- [Phase 03-02]: 03-02: ProfileEditForm extracted as 'use client' co-located file — server component handles auth/data fetch, client form manages all interactive state
- [Phase 03-02]: 03-02: next.config.ts remotePatterns added for *.public.blob.vercel-storage.com — required for Next.js Image to render Vercel Blob CDN images
- [Phase 03-04]: 03-04: canReview stub is a top-level const=true with TODO comment — Phase 4 replaces with real jam attendance check
- [Phase 03-04]: 03-04: isOwnProfile gates feedback count (owner sees) and ReviewForm (others see) — mutually exclusive privacy boundary
- [Phase 04-01]: 04-01: isJamHost is boolean column on user table (not a separate role value) — preserves existing role field for base/flyer encoding
- [Phase 04-01]: 04-01: conversationReads uses text id PK + unique constraint on (conversationId, userId) — consistent with all other schema tables
- [Phase 04-01]: 04-01: Application layer must sort participant IDs alphabetically (A < B) before INSERT to conversations — unique(participantA, participantB) does not handle (A,B) vs (B,A) ordering
- [Phase 04-01]: 04-01: drizzle/migration.sql gitignored — migration 0001 applied to Neon via drizzle-kit push; schema.ts is canonical source of truth
- [Phase 04-02]: 04-02: Race safety uses unique constraint (23505) as final net rather than SELECT FOR UPDATE — neon-http is stateless HTTP, no persistent connections for row locks
- [Phase 04-02]: 04-02: Email failure on waitlist promotion is non-blocking — DB is already updated, log error and continue
- [Phase 04-02]: 04-02: canReview subquery requires 'confirmed' status for both parties — waitlisted and cancelled attendees cannot review
- [Phase 04-02]: 04-02: 4-hour cancellation lock is enforced server-side only — client time is never trusted
- [Phase 04]: 04-03: inArray batch query used for other-user details and last messages — avoids N+1 pattern in conversation list
- [Phase 04]: 04-03: hasUnread excludes own messages (senderId !== userId) — prevents self-messages from triggering badge
- [Phase 04]: 04-03: Unread count uses raw sql template tag for complex LEFT JOIN with OR + IS NULL — cleaner than verbose Drizzle builder
- [Phase 04-04]: 04-04: isJamHost added to GET /api/jams response so JamFeed can show host button without extra fetch — one query in existing handler
- [Phase 04-04]: 04-04: Past jams lazy-fetched on first collapsible toggle — historical data rarely needed, keeps initial page load light
- [Phase 04-04]: 04-04: Optimistic RSVP UI reverts on any API error — client state never diverges from server truth permanently
- [Phase 04-jam-board-messaging]: 04-05: ChatThread polls /api/messages/[conversationId] every 3s using setInterval — no Ably or WebSocket
- [Phase 04-jam-board-messaging]: 04-05: Optimistic send appends localId-keyed pending message, replaced by server-confirmed on success
- [Phase 04-jam-board-messaging]: 04-05: /api/user/search and /api/user/profile created (Rule 3 deviation) — required by NewMessagePicker
- [Phase 05-01]: 05-01: Quiz table IDs use text PK — consistent with all other schema tables in this project
- [Phase 05-01]: 05-01: QuestionOption.label uses inline { en: string; he: string } bilingual object — avoids next-intl dependency inside quiz components
- [Phase 05-01]: 05-01: RTL slide direction derived from document.documentElement.dir at render time — DOM dir attribute is authoritative (not locale prop)
- [Phase 05-01]: 05-01: drizzle migration folder is gitignored — schema.ts is canonical source of truth, push applied directly to Neon
- [Phase 05-01]: 05-01: fbq and gtag declared as global function overloads in analytics file — avoids any cast while preserving type safety
- [Phase 05-02]: 05-02: Question/QuestionOption types re-declared in challenge-questions.ts — plans 05-01 and 05-02 execute in parallel so direct import from QuizEngine.tsx is not available; shapes identical for drop-in compatibility
- [Phase 05-02]: 05-02: workshopQuestions has 4 steps — plan header says "3 steps" but task detail lists 4 distinct IDs; task detail is authoritative
- [Phase 05-02]: 05-02: text-inputs workshop step uses options[] to carry field metadata — reuses existing Question schema without adding a non-standard fields property
- [Phase 05-02]: 05-02: Tie-breaking priority Explorer > Artist > Connector > Athlete — favours beginner-friendly archetypes on tied scores
- [Phase 05-04]: 05-04: ChallengeResultsFlow tries localStorage before API — original quiz taker gets instant cached result; sharers fetch from API; consistent experience across both paths
- [Phase 05-04]: 05-04: FAQ items hardcoded in component as bilingual constants — avoids next-intl array-of-objects complexity; stable marketing copy
- [Phase 05-04]: 05-04: Price anchoring (299/499) with hardcoded urgency — display-only spot count and next-start date sufficient for MVP
- [Phase 05-quiz-funnels]: 05-03: QuizEngine gained onStepAnswer optional prop — per-step tracking required but original interface had no hook; added backward-compatible callback
- [Phase 05-quiz-funnels]: 05-03: Question.type widened to include text-inputs — challenge-questions.ts uses this type; QuizEngine original union was incomplete
- [Phase 05-quiz-funnels]: 05-03: Lead submission non-blocking — quiz redirects to results regardless of API error; localStorage preserves answers for retry
- [Phase 05-quiz-funnels]: 05-05: TextInputsStep added inline to QuizEngine — small enough to colocate; avoids extra file for single-use sub-component
- [Phase 05-quiz-funnels]: 05-05: Workshop confirmation page shows advantages immediately (no loader) — direct conversion; inquiry is already submitted
- [Phase 05-quiz-funnels]: 05-05: Resend email failure is non-blocking — DB insert happens first; email error logged but does not fail the API response
- [Phase 05-quiz-funnels]: 05-05: GA4 + Meta Pixel use strategy='afterInteractive' in locale layout — defers analytics until page is interactive, no render blocking
- [Phase 05-quiz-funnels]: 05-05: WorkshopAdvantages uses t.raw('items') cast to AdvantageItem[] — cleanest pattern for next-intl array-of-objects consumption
- [Phase 06-01]: GI document remarks field carries sessionId (format: sessionId:xxx) for webhook-to-lead linking
- [Phase 06-01]: Webhook returns HTTP 200 on all errors to prevent GI retry storms; idempotency via gi_document_id unique constraint
- [Phase 06-01]: challengeEnrollments links via sessionId not userId FK — quiz takers may not have auth accounts
- [Phase 06-02]: AddToCalendarButton loaded via dynamic import ssr:false — library uses browser APIs; crashes on server
- [Phase 06-02]: .env.example CHALLENGE_WA_GROUP_URL renamed to NEXT_PUBLIC_CHALLENGE_WA_GROUP_URL — client components require NEXT_PUBLIC_ prefix
- [Phase 06-02]: PAY-02 confirmed satisfied by Phase 5 workshop inquiry flow — no new work required in Phase 6
- [Phase 07-01]: 07-01: push.ts catches 410 from web-push and rethrows with code SUBSCRIPTION_EXPIRED — callers delete stale subscription records
- [Phase 07-01]: 07-01: notificationPreferences defaults all channels ON with quiet hours 22:00-08:00 Israel time
- [Phase 07-01]: 07-01: quiet hours use fixed UTC+3 offset (summer Israel time) — app operates primarily in spring/summer months
- [Phase 07-01]: 07-01: WA drip nextFireAt defaults to tomorrow 19:00 Israel time (16:00 UTC) per user decision
- [Phase 07-01]: 07-01: email_nurture step 12 wraps to step 6 for rotating evergreen content (cycle continues)
- [Phase 07-01]: 07-01: push/notificationclick listeners placed BEFORE serwist.addEventListeners() — Serwist takes event loop ownership after that call
- [Phase 07-01]: 07-01: vercel.json crons all in UTC: push-batch every 5min, WA+email drip 16:00 UTC=19:00 IL, jam-reminders 05:00+15:00 UTC
- [Phase 07-02]: POST /api/push/subscribe uses onConflictDoUpdate on endpoint unique constraint — handles subscription refresh without duplicate rows
- [Phase 07-02]: Partner-match IIFE is fire-and-forget — profile update response returns before potentially slow matching query
- [Phase 07-02]: promptForPush called with void operator in UI — fire-and-forget, never blocks RSVP or send flow
- [Phase 07-04]: 07-04: @react-email/components installed (was missing from package.json) — required for JSX email templates
- [Phase 07-04]: 07-04: email_nurture wraps to step 6 (NURTURE_CYCLE_START=6) after completing 12 steps — matches locked decision from 07-01
- [Phase 07-04]: 07-04: Challenge reminders: even steps = day-before (18:00 IL), odd steps = morning-of (08:00 IL) — interleaved timing
- [Phase 07-04]: 07-04: CompletionCertificate sent on final email_challenge_reminders step (transactional)
- [Phase 07-04]: 07-04: Unsubscribe POST returns JSON (RFC 8058); GET returns branded HTML page
- [Phase 07-04]: 07-04: Unsub upserts notificationPreferences with emailMarketing=false — handles users with no prefs row
- [Phase 07-03]: WA drip cron tracks consecutive failures in enrollment metadata; cancels after 3 strikes with reason 'error'
- [Phase 07-03]: cancel-first then enroll-new on payment; sequential awaits prevent race with drip cron
- [Phase 07-05]: 07-05: Settings page created fresh at /[locale]/(app)/settings/page.tsx — no prior settings page existed
- [Phase 07-05]: 07-05: i18n keys in messages/ (not src/i18n/locales/) — project uses top-level messages/ convention from Phase 1
- [Phase 07-05]: 07-05: Per-field PATCH on change (no submit button) — immediate feedback UX, each toggle saves independently
- [Phase 07-05]: 07-05: WhatsApp opt-out cancels dripEnrollments with reason 'opted_out' via bulk UPDATE — all active WA sequences stopped atomically
- [Phase 07-06]: 07-06: Phone lookup queries challengeEnrollments (confirmed, ordered by paidAt desc) first, falls back to quizLeads (ordered by createdAt desc) — no schema migration required
- [Phase 07-06]: 07-06: Both DB lookups use .catch(() => []) — phone lookup failure is non-fatal; cron falls through to email-only for that attendee
- [Phase 08-01]: 08-01: Admin routes return 404 (not 403) for non-admin authenticated users — avoids leaking that admin endpoints exist
- [Phase 08-01]: 08-01: workshopBookings uses onConflictDoUpdate on leadId unique constraint — upsert pattern for idempotent status updates
- [Phase 08-01]: 08-01: DELETE member writes audit log before deletion to preserve user name/email in audit record
- [Phase 08-01]: 08-01: Host revoke cascade writes audit log after all DB mutations and push notifications complete
- [Phase 08-02]: 08-02: AdminPanel exports type definitions for all data shapes — co-located with component, imported by all child tables
- [Phase 08-02]: 08-02: MemberTable hostsOnly toggle filters data before TanStack Table — cleaner than custom filter function
- [Phase 08-02]: 08-02: WorkshopBookingsTable PATCH uses leadId as URL param — matches /api/admin/workshop-bookings/[id] route which accepts leadId
- [Phase 08-02]: 08-02: AuditLogTable uses hardcoded ACTION_LABELS map for DRY action code → readable string mapping alongside i18n namespace
- [Phase 09-01]: 09-01: JsonLd component uses inline __html with JSON.stringify + angle-bracket unicode escaping — safe because payload is server-only typed JSON-LD output from schema builders, not user input
- [Phase 09-01]: 09-01: Hebrew is x-default in hreflang alternates — primary market is Israel
- [Phase 09-01]: 09-01: sitemap.ts excludes past jams (scheduledAt >= now()) — past jams have no search ranking value
- [Phase 09-01]: 09-01: OG image generated as SVG then converted to JPG via sharp — avoids canvas or browser-based ImageResponse complexity
- [Phase 09-02]: 09-02: city column on jamSessions is nullable — CityJamList uses ILIKE fallback on location field when city IS NULL for existing jams
- [Phase 09-02]: 09-02: FAQ items are inline bilingual constants per city slug in page.tsx — passed to CityFAQ as props; avoids next-intl array-of-objects complexity for stable marketing copy
- [Phase 09-02]: 09-02: details/summary HTML accordion used for CityFAQ — no JS dependency, semantic HTML for AEO crawlers, FAQPage JSON-LD at page level
- [Phase 09-02]: 09-02: (public) route group has no auth guard — naturally bypasses (app) auth; no proxy.ts changes needed
- [Phase 09-02]: 09-02: drizzle-kit push requires dotenv-cli -e .env.local to load DATABASE_URL — env not auto-loaded by drizzle-kit in this project config
- [Phase 09-03]: 09-03: InstagramGrid renders null (not empty grid) when feed is empty — no broken UI, no whitespace gap on homepage
- [Phase 09-03]: 09-03: InstagramGrid is pure RSC — fetchInstagramFeed called directly in component body, zero client JS for the grid
- [Phase 09-03]: 09-03: WhatsApp is first/most prominent share option in bottom sheet — primary communication channel in Israel
- [Phase 09-03]: 09-03: ShareButton uses end-4 (Tailwind logical property) not right-4 — correct RTL layout without manual dir checks
- [Phase 09-03]: 09-03: INSTAGRAM_ACCESS_TOKEN has no NEXT_PUBLIC_ prefix — server-only token, never exposed to client bundle
- [Phase 09-03]: 09-03: Quiz results ShareButton includes ?session= query param in URL — full shareable URL per Phase 05-04 design
- [Phase 10-01]: 10-01: MotionProvider extracted as "use client" component — MotionConfig needs React client context; layout.tsx is server component, cannot use MotionConfig inline
- [Phase 10-01]: 10-01: DraggableCard renders two DOM elements (hidden md:block + md:hidden) — cleanest desktop-only drag pattern without useMediaQuery hook dependency
- [Phase 10-01]: 10-01: ParallaxLayer uses will-change-transform only on inner motion.div — avoids global GPU layer promotion which causes mobile frame drops
- [Phase 10-01]: 10-01: Custom scrollbar hidden on mobile via media query — native mobile scroll UX superior; custom scrollbar no value on touch
- [Phase 10-01]: 10-01: Stitch MCP unavailable — design references created manually per /frontend-design skill with exact brand tokens (#0a0a0a, #F472B6, Heebo 900) and RTL adaptation notes
- [Phase 10-02]: 10-02: page.tsx remains server component — all Framer Motion delegated to "use client" children, no hydration risk
- [Phase 10-02]: 10-02: HorizontalShowcase wraps each card in DraggableCard with dragConstraints +-60px + dragElastic 0.3 — satisfies DSGN-01 without breaking horizontal scroll layout
- [Phase 10-02]: 10-02: FeaturesShowcase uses indexed i18n keys (items.0.title) not t.raw — simpler, avoids TypeScript casting complexity
- [Phase 10-02]: 10-02: InstagramGrid wrapped in ScrollReveal in page.tsx — consistent scroll-reveal without modifying the existing RSC component
- [Phase 10-02]: 10-02: Hero asymmetric layout uses CSS logical grid (3fr/2fr) not absolute positioning — RTL-safe without manual dir checks
- [Phase 10-03]: 10-03: MobileMenu uses Radix Dialog (not custom dropdown) — provides WCAG AA focus trap, escape-to-close, aria-modal, scroll lock for free per DSGN-04
- [Phase 10-03]: 10-03: Auth layout card is in layout.tsx (not in form components) — form components render headless into the card; avoids double-wrapping
- [Phase 10-03]: 10-03: MobileMenu slide animation uses Radix data-[state] + Tailwind animate-in/out — no Framer Motion needed for this simple slide transition

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 6 dependency: Confirm business VAT registration status (Osek Patur / Osek Murshe / Ltd.) before writing any Green Invoice code — determines legally valid document types
- Phase 7 dependency: WhatsApp Business API phone verification (1-3 days) + template approval (1-5 days) — start submission process during Phase 6

## Session Continuity

Last session: 2026-04-04
Stopped at: Completed 10-03-PLAN.md — Brutalist header/footer/mobile-menu (Radix Dialog) + auth page polish
Resume file: .planning/phases/10-brutalist-design-polish-performance/10-03-SUMMARY.md
