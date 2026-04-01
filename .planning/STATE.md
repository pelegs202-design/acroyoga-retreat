# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-31)

**Core value:** People can find and connect with the right acroyoga partner near them — by level, role, and skills — and show up to practice together.
**Current focus:** Phase 1 — Foundation + Auth

## Current Position

Phase: 2 of 10 (Brand Identity)
Plan: 3 of 5 in current phase
Status: In progress
Last activity: 2026-04-01 — Plan 02-03 completed: Pink applied to all interactive surfaces — wordmarks, primary buttons, chips, progress bar, install prompt, branded PWA icons

Progress: [████░░░░░░] 22%

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: 6.5 min
- Total execution time: 0.65 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-auth | 4 | 30 min | 7.5 min |
| 02-brand-identity | 2 | 9 min | 4.5 min |

**Recent Trend:**
- Last 5 plans: 01-02 (7 min), 01-03 (8 min), 01-04 (5 min), 02-01 (1 min), 02-02 (8 min)
- Trend: Stable

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
- 02-01: Plain @theme block used for brand color tokens (not @theme inline) — inline modifier embeds values at build time, breaking runtime CSS variable overrides
- 02-01: Brand tokens use :root --brand variable bridged to @theme --color-brand via var() — preserves runtime CSS variable flexibility while generating Tailwind utilities
- [Phase 02-02]: 02-02: [locale]/layout.tsx uses title template { default: 'AcroHavura', template: '%s | AcroHavura' } — enables per-page title suffixing in future phases
- [Phase 02-02]: 02-02: Password reset email subject is 'Reset your password.' — direct bold voice, period intentional, no brand name in subject
- [Phase 02-03]: 02-03: Offline page wordmark uses inline style hex #F472B6 (not text-brand) — self-contained page outside [locale], Tailwind not guaranteed in cache context
- [Phase 02-03]: 02-03: PWA icon border thickness 15% of icon size — brutalist frame proportion readable at small icon sizes
- [Phase 02-03]: 02-03: Root page.tsx uses bg-background replacing bg-white dark:bg-black — single CSS variable, no light/dark conditionals

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 3 dependency: Skills checklist content (~50-100 standard acroyoga moves) must be sourced from business owner before Phase 3 begins — content dependency, not technical
- Phase 6 dependency: Confirm business VAT registration status (Osek Patur / Osek Murshe / Ltd.) before writing any Green Invoice code — determines legally valid document types
- Phase 7 dependency: WhatsApp Business API phone verification (1-3 days) + template approval (1-5 days) — start submission process during Phase 6

## Session Continuity

Last session: 2026-04-01
Stopped at: Completed 02-03-PLAN.md — Pink applied to all interactive surfaces, branded PWA icons generated
Resume file: None
