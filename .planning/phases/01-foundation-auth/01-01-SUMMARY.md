---
phase: 01-foundation-auth
plan: 01
subsystem: infra
tags: [nextjs, drizzle, neon, better-auth, tailwind, serwist, typescript]

requires: []
provides:
  - Next.js 16 App Router project scaffold with TypeScript and Tailwind v4
  - Drizzle ORM connected to Neon via @neondatabase/serverless (HTTP driver)
  - Better Auth server instance with email/password, 30-day sessions, Resend password reset
  - All 5 user onboarding fields: city, role, level, preferredLocale, tosAcceptedAt
  - Better Auth React client (signIn, signUp, signOut, useSession)
  - Auth catch-all API route at /api/auth/[...all]
  - TOS acceptances table schema for version audit history
  - Environment variable template documented in .env.example
affects: [02, 03, 04, 05, 06, 07, 08, 09, 10]

tech-stack:
  added:
    - better-auth@1.5.6 (auth provider with Drizzle adapter)
    - drizzle-orm@0.45.2 (ORM)
    - drizzle-kit@0.31.10 (dev: migrations)
    - "@neondatabase/serverless@1.0.2 (Neon HTTP driver)"
    - next-intl@4.8.4 (i18n, used in later plans)
    - resend@6.10.0 (email delivery for password reset)
    - react-hook-form@7.72.0 (forms, used in later plans)
    - zod@4.3.6 (validation, used in later plans)
    - serwist@9.5.7 + @serwist/next@9.5.7 (PWA, used in later plans)
  patterns:
    - "Drizzle + Neon: neon() HTTP client passed to drizzle() from drizzle-orm/neon-http"
    - "Better Auth: toNextJsHandler(auth) pattern for App Router catch-all route"
    - "Better Auth: additionalFields with input:false for server-set fields (tosAcceptedAt, preferredLocale)"
    - "Better Auth: additionalFields with string type for enum-like fields (role, level) — validated at app layer"
    - "Tailwind v4: font configuration via @theme inline CSS block in globals.css (no tailwind.config.ts)"
    - "Next.js 16: --webpack flag required to disable Turbopack when using Serwist"

key-files:
  created:
    - src/lib/db/index.ts (Drizzle db instance via Neon HTTP)
    - src/lib/db/schema.ts (tosAcceptances table + migration comment)
    - src/lib/auth.ts (Better Auth server config with all custom fields)
    - src/lib/auth-client.ts (Better Auth React client exports)
    - src/app/api/auth/[...all]/route.ts (Auth catch-all handler)
    - drizzle.config.ts (Drizzle config pointing to src/lib/db/schema.ts)
    - .env.example (all 4+1 env vars documented)
  modified:
    - package.json (all Phase 1 deps + --webpack flag in dev script)
    - src/app/globals.css (Heebo font via --font-heebo CSS variable, Tailwind @theme)
    - src/app/layout.tsx (Heebo font loading, AcroYoga Academy metadata)
    - .gitignore (.env.local, public/sw.js, drizzle/ exclusions added)

key-decisions:
  - "Used toNextJsHandler(auth) instead of auth.handler directly — cleaner Better Auth v1.5.x pattern"
  - "Role/level fields use string type not Postgres enum — Better Auth generate may not handle custom enums; validate at app layer"
  - "Tailwind v4 font config: CSS variable via @theme inline block, no tailwind.config.ts needed"
  - "Next.js 16 dev script uses --webpack flag (not --no-turbopack which does not exist in v16)"
  - "Auth route handler wires correctly; 500 error when DATABASE_URL unset is expected/correct behavior"

patterns-established:
  - "Pattern: All server-writable-only user fields use input:false in Better Auth additionalFields"
  - "Pattern: Drizzle db instance created once in src/lib/db/index.ts and imported everywhere"
  - "Pattern: Auth server in src/lib/auth.ts, client in src/lib/auth-client.ts — never mix"

requirements-completed: [FOUND-01, AUTH-01, AUTH-02, AUTH-03]

duration: 10min
completed: 2026-03-31
---

# Phase 01 Plan 01: Foundation Auth - Project Scaffold and Auth Backend Summary

**Next.js 16 scaffold with Drizzle ORM on Neon, Better Auth email/password + 30-day sessions + Resend password reset, and all 5 onboarding user fields baked into the auth schema**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-31T21:57:25Z
- **Completed:** 2026-03-31T22:07:00Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Next.js 16 App Router project initialized with TypeScript, Tailwind v4, ESLint, all Phase 1 npm dependencies installed
- Drizzle ORM configured with Neon serverless HTTP driver; drizzle.config.ts validated clean
- Better Auth configured with email/password, 30-day cookie sessions, Resend password reset, and all 5 user onboarding fields (city, role, level, preferredLocale, tosAcceptedAt)
- Auth catch-all route at `/api/auth/[...all]` wired and verified responding via toNextJsHandler
- TypeScript passes clean (no errors), Heebo font configured for Hebrew+Latin support

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize Next.js 16 project** - `17f1a2b` (chore)
2. **Task 2: Drizzle + Neon + Better Auth** - `35cb0ce` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/lib/db/index.ts` - Drizzle db instance via neon() HTTP driver
- `src/lib/db/schema.ts` - tosAcceptances table for TOS version audit history; migration instructions
- `src/lib/auth.ts` - Better Auth server: email/password, sessions, Resend reset, 5 additionalFields
- `src/lib/auth-client.ts` - Better Auth React client: signIn, signUp, signOut, useSession
- `src/app/api/auth/[...all]/route.ts` - Catch-all auth handler via toNextJsHandler
- `drizzle.config.ts` - Drizzle config with Neon dialect, schema path, migration output
- `.env.example` - All required env vars (DATABASE_URL, RESEND_API_KEY, NEXT_PUBLIC_APP_URL, BETTER_AUTH_SECRET)
- `src/app/globals.css` - Heebo as Tailwind sans font via CSS @theme block
- `src/app/layout.tsx` - Heebo font loading (latin+hebrew), AcroYoga Academy metadata
- `.gitignore` - Added .env.local, public/sw.js, drizzle/ to exclusions
- `package.json` - All Phase 1 deps + --webpack dev flag

## Decisions Made
- **toNextJsHandler pattern**: Used Better Auth v1.5.x recommended pattern over raw `auth.handler`
- **String types for role/level**: Better Auth additionalFields uses string type for enum-like fields; Postgres enum support is unreliable per research Pitfall 5 — validate at application layer instead
- **Tailwind v4 font config**: No tailwind.config.ts needed; font family set via `@theme inline` CSS block in globals.css
- **--webpack flag**: Next.js 16 uses `--webpack` to opt out of Turbopack (not `--no-turbopack`); required for Serwist compatibility

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] create-next-app blocked by .mcp.json alongside .planning/**
- **Found during:** Task 1 (project initialization)
- **Issue:** create-next-app refused to run in non-empty directory even after moving .planning/ — .mcp.json also present
- **Fix:** Moved both .planning/ and .mcp.json to /tmp temporarily, ran create-next-app, restored both
- **Files modified:** None (operational step)
- **Verification:** Both files restored successfully post-init
- **Committed in:** 17f1a2b (Task 1 commit)

**2. [Rule 3 - Blocking] --no-turbopack does not exist in Next.js 16**
- **Found during:** Task 2 verification (dev server start)
- **Issue:** Plan specified `--no-turbopack` but Next.js 16 uses `--webpack` flag instead
- **Fix:** Updated package.json dev script from `--no-turbopack` to `--webpack`
- **Files modified:** package.json
- **Verification:** `npm run dev` starts successfully with "▲ Next.js 16.2.1 (webpack)"
- **Committed in:** 35cb0ce (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 3 - blocking issues)
**Impact on plan:** Both auto-fixes necessary to complete the tasks. No scope creep.

## Issues Encountered
- .env.local has blank DATABASE_URL — auth route returns 500 when hit. This is expected behavior documented in the plan's `user_setup` requirements. TypeScript compiles clean; the route handler wires correctly.

## User Setup Required

Before the auth system is functional, the user must:

1. **Create Neon database**: Vercel Dashboard -> Storage -> Create Postgres Database -> copy connection string
2. **Set DATABASE_URL** in `.env.local`
3. **Push auth schema**: Run `npx @better-auth/cli generate && npx drizzle-kit push`
4. **Create Resend API key**: resend.com -> API Keys -> Create API Key
5. **Set RESEND_API_KEY** in `.env.local`
6. **Verify sending domain** in Resend Dashboard (or use onboarding@resend.dev for testing)

## Next Phase Readiness
- Foundation scaffold complete — all Phase 1 packages installed, TypeScript clean, auth API wired
- Remaining Phase 1 work: 01-02 (i18n + next-intl), 01-03 (auth UI), 01-04 (PWA/Serwist), 01-05 (TOS page)
- Database setup (user-required) must complete before auth UI testing in 01-03
- Schema will gain Better Auth-generated tables (user, session, account, verification) after `npx @better-auth/cli generate && npx drizzle-kit push`

---
*Phase: 01-foundation-auth*
*Completed: 2026-03-31*
