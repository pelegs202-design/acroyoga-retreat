# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-31)

**Core value:** People can find and connect with the right acroyoga partner near them — by level, role, and skills — and show up to practice together.
**Current focus:** Phase 1 — Foundation + Auth

## Current Position

Phase: 4 of 10 (Jam Board + Messaging)
Plan: 3 of 5 in current phase
Status: In progress — Plan 04-03 complete
Last activity: 2026-04-01 — Plan 04-03 complete: Messaging API (conversation list, history, send, unread count)

Progress: [████░░░░░░] 30%

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- Average duration: 6.1 min
- Total execution time: 0.82 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-auth | 4 | 30 min | 7.5 min |
| 02-brand-identity | 2 | 9 min | 4.5 min |
| 03-community-profiles-partner-matching | 3 | 9 min | 3 min |
| 04-jam-board-messaging | 1 | 6 min | 6 min |

**Recent Trend:**
- Last 5 plans: 02-02 (8 min), 02-03 (4 min), 03-01 (3 min), 03-03 (3 min), 04-01 (6 min)
- Trend: Stable

*Updated after each plan completion*
| Phase 04 P03 | 4 | 3 tasks | 3 files |

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

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 6 dependency: Confirm business VAT registration status (Osek Patur / Osek Murshe / Ltd.) before writing any Green Invoice code — determines legally valid document types
- Phase 7 dependency: WhatsApp Business API phone verification (1-3 days) + template approval (1-5 days) — start submission process during Phase 6

## Session Continuity

Last session: 2026-04-01
Stopped at: Completed 04-02-PLAN.md — Jam Board API complete (GET+POST /api/jams, RSVP endpoint, real canReview). Ready for 04-03/04-04.
Resume file: .planning/phases/04-jam-board-messaging/04-02-SUMMARY.md
