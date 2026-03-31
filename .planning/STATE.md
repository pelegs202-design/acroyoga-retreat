# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-31)

**Core value:** People can find and connect with the right acroyoga partner near them — by level, role, and skills — and show up to practice together.
**Current focus:** Phase 1 — Foundation + Auth

## Current Position

Phase: 1 of 10 (Foundation + Auth)
Plan: 4 of 5 in current phase
Status: In progress
Last activity: 2026-03-31 — Plan 01-04 completed: Serwist PWA service worker, web manifest, offline fallback, install prompt, iOS banner

Progress: [███░░░░░░░] 14%

## Performance Metrics

**Velocity:**
- Total plans completed: 4
- Average duration: 7.5 min
- Total execution time: 0.50 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-auth | 4 | 30 min | 7.5 min |

**Recent Trend:**
- Last 5 plans: 01-01 (10 min), 01-02 (7 min), 01-03 (8 min), 01-04 (5 min)
- Trend: Improving

*Updated after each plan completion*

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

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 3 dependency: Skills checklist content (~50-100 standard acroyoga moves) must be sourced from business owner before Phase 3 begins — content dependency, not technical
- Phase 6 dependency: Confirm business VAT registration status (Osek Patur / Osek Murshe / Ltd.) before writing any Green Invoice code — determines legally valid document types
- Phase 7 dependency: WhatsApp Business API phone verification (1-3 days) + template approval (1-5 days) — start submission process during Phase 6

## Session Continuity

Last session: 2026-03-31
Stopped at: Completed 01-04-PLAN.md — Serwist PWA service worker, dark manifest, offline page, install prompt, iOS banner
Resume file: None
