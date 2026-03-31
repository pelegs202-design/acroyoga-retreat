---
phase: 01-foundation-auth
plan: 03
subsystem: ui
tags: [auth, forms, react-hook-form, zod, next-intl, rtl, better-auth, drizzle, tailwind]

requires:
  - phase: 01-foundation-auth/01-01
    provides: Better Auth server/client, Drizzle db, tosAcceptances schema, auth additionalFields (city, role, level, preferredLocale, tosAcceptedAt)
  - phase: 01-foundation-auth/01-02
    provides: next-intl bilingual routing, [locale] layout, messages files, Header, typed navigation

provides:
  - Complete auth UI: sign-up, sign-in, reset-password pages in (auth) route group
  - src/lib/auth-guard.ts — server-side session validation helper (CVE-2025-29927 safe)
  - Full-screen TOS acceptance page with scrollable bilingual TOS + Privacy Policy content
  - 2-step onboarding wizard (city+role → level) with progress bar and Skip option
  - POST /api/user/accept-tos — session-gated, records tosAcceptances row + updates user.tos_accepted_at
  - POST /api/user/update-profile — session-gated, atomic update for city/role/level/preferredLocale
  - Protected dashboard page with server-side auth + TOS guard
  - Complete post-signup flow: signup → TOS → onboarding → dashboard
  - (app) and (auth) route group layouts
  - All TOS content (tosContent namespace) in English and Hebrew
  - dashboard namespace in English and Hebrew

affects: [04, 05]

tech-stack:
  added:
    - "@hookform/resolvers@5.2.2 (zodResolver integration for react-hook-form + zod)"
  patterns:
    - "Auth guard: getAuthSession() in every protected Server Component — never trust middleware for security"
    - "Server-only auth: auth.api.getSession({ headers: await headers() }) pattern used in API routes and pages"
    - "TOS update: raw Drizzle sql template tag to update input:false fields not settable via authClient"
    - "Dynamic SQL SET clause: Drizzle sql tagged template with reduce for variable field updates"
    - "Onboarding skip: always POSTs preferredLocale even if user skips all fields"
    - "Route groups: (auth) = centered card layout, (app) = max-width container, both inside [locale]"
    - "ResetPasswordForm uses Suspense boundary because useSearchParams() requires it in Next.js App Router"

key-files:
  created:
    - src/lib/auth-guard.ts (getAuthSession export — single safe auth check for Server Components)
    - src/app/[locale]/(auth)/layout.tsx (centered card layout for auth pages)
    - src/app/[locale]/(auth)/sign-up/page.tsx (sign-up page with session redirect)
    - src/app/[locale]/(auth)/sign-in/page.tsx (sign-in page with session redirect)
    - src/app/[locale]/(auth)/reset-password/page.tsx (reset password page with Suspense)
    - src/app/[locale]/(auth)/tos/page.tsx (full-screen TOS page, requires session)
    - src/app/[locale]/(auth)/onboarding/page.tsx (onboarding wizard page, requires TOS)
    - src/app/[locale]/(app)/layout.tsx (authenticated app route group container)
    - src/app/[locale]/(app)/dashboard/page.tsx (protected dashboard with welcome message)
    - src/components/auth/SignUpForm.tsx (react-hook-form+zod, redirects to /tos on success)
    - src/components/auth/SignInForm.tsx (TOS/onboarding-aware redirect after sign-in)
    - src/components/auth/ResetPasswordForm.tsx (dual-mode: request email or apply token reset)
    - src/components/auth/TosAcceptance.tsx (full-screen scrollable TOS with Accept/Decline)
    - src/components/auth/OnboardingWizard.tsx (2-step wizard, always saves preferredLocale)
    - src/app/api/user/accept-tos/route.ts (POST: tosAcceptances insert + user.tos_accepted_at update)
    - src/app/api/user/update-profile/route.ts (POST: validated city/role/level/preferredLocale update)
  modified:
    - messages/en.json (added tosContent, dashboard, and extra auth/onboarding keys)
    - messages/he.json (same structure in Hebrew)
    - package.json (@hookform/resolvers added)

key-decisions:
  - "Auth guard via auth.api.getSession (not middleware): Every protected Server Component calls getAuthSession() — aligns with research CVE-2025-29927 guidance"
  - "TOS update via raw SQL: tosAcceptedAt has input:false in Better Auth additionalFields — cannot use authClient.updateUser(); Drizzle sql template tag used for direct UPDATE"
  - "Onboarding always saves preferredLocale: Skip button still POSTs { preferredLocale: currentLocale } to record language preference even when user skips city/role/level"
  - "ResetPasswordForm wrapped in Suspense: Next.js App Router requires Suspense boundary when using useSearchParams() in a client component rendered by a server page"
  - "Dynamic SET clause via reduce: update-profile route builds the SQL SET fragment dynamically using Drizzle sql template tag reduce — type-safe and injection-safe"
  - "@hookform/resolvers auto-installed: Was not in original package.json despite react-hook-form being listed — Rule 3 auto-fix"

patterns-established:
  - "Pattern: Every protected route calls getAuthSession() from src/lib/auth-guard.ts — no middleware security"
  - "Pattern: TOS acceptance flow is signup → /tos → /onboarding → /dashboard (not /dashboard directly)"
  - "Pattern: API routes return { ok: true, ...data } on success, { error: string } on failure"
  - "Pattern: input:false additionalFields use direct Drizzle sql UPDATE (not authClient)"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, FOUND-05]

duration: 7min
completed: 2026-03-31
---

# Phase 01 Plan 03: Auth UI Pages, TOS, Onboarding, and Dashboard Summary

**Complete auth UI with signup → full-screen TOS acceptance → 2-step onboarding wizard (city/role/level) → protected dashboard, all bilingual RTL/LTR, using react-hook-form + zod and server-side auth guards**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-03-31T22:25:36Z
- **Completed:** 2026-03-31T22:32:00Z
- **Tasks:** 2
- **Files modified:** 18

## Accomplishments

- Auth route group `(auth)` with centered card layout; app route group `(app)` with max-width container
- Sign-up form with react-hook-form + zod (name/email/password), redirects to `/tos` on success — no email verification blocking
- Sign-in form with TOS/onboarding-aware redirect: checks `tosAcceptedAt` and `city/role/level` to determine destination
- Password reset form with two modes (request email, apply token from URL) wrapped in Suspense
- `getAuthSession()` helper exports from `src/lib/auth-guard.ts` — CVE-2025-29927 safe pattern for all protected routes
- Full-screen `TosAcceptance` component with scrollable bilingual TOS + Privacy Policy, sticky action bar with Accept/Decline
- `OnboardingWizard` 2-step flow (city+role → level) with progress bar; Skip always saves `preferredLocale`
- `POST /api/user/accept-tos` — inserts `tosAcceptances` audit row + raw SQL update for `tos_accepted_at` on user
- `POST /api/user/update-profile` — validated enums, dynamic Drizzle sql SET for city/role/level/preferredLocale
- Dashboard server page with auth + TOS guards, welcome message with user name
- All TOS content in both English and Hebrew (`tosContent` namespace)

## Task Commits

Each task committed atomically:

1. **Task 1: Auth layout, sign-up/sign-in/reset forms, auth guard** — `d5dee87` (feat)
2. **Task 2: TOS acceptance, onboarding wizard, dashboard, API routes** — `53e3ddc` (feat)

## Files Created/Modified

**Created:**
- `src/lib/auth-guard.ts` — getAuthSession() — single safe auth check for Server Components
- `src/app/[locale]/(auth)/layout.tsx` — centered card layout
- `src/app/[locale]/(auth)/sign-up/page.tsx` — sign-up with session redirect
- `src/app/[locale]/(auth)/sign-in/page.tsx` — sign-in with TOS-aware redirect
- `src/app/[locale]/(auth)/reset-password/page.tsx` — Suspense-wrapped reset form
- `src/app/[locale]/(auth)/tos/page.tsx` — full-screen TOS (requires session)
- `src/app/[locale]/(auth)/onboarding/page.tsx` — wizard (requires TOS accepted)
- `src/app/[locale]/(app)/layout.tsx` — app route group container
- `src/app/[locale]/(app)/dashboard/page.tsx` — protected dashboard
- `src/components/auth/SignUpForm.tsx`
- `src/components/auth/SignInForm.tsx`
- `src/components/auth/ResetPasswordForm.tsx`
- `src/components/auth/TosAcceptance.tsx`
- `src/components/auth/OnboardingWizard.tsx`
- `src/app/api/user/accept-tos/route.ts`
- `src/app/api/user/update-profile/route.ts`

**Modified:**
- `messages/en.json` — tosContent, dashboard, additional auth/onboarding keys
- `messages/he.json` — same structure in Hebrew
- `package.json` — @hookform/resolvers added

## Decisions Made

- **Auth guard over middleware**: `getAuthSession()` called in every Server Component — aligns with CVE-2025-29927 research guidance
- **Raw SQL for TOS update**: `tosAcceptedAt` is `input:false` in Better Auth, cannot be set via `authClient.updateUser()` — raw Drizzle sql template UPDATE used instead
- **Onboarding always saves locale**: Skip POSTs `{ preferredLocale: currentLocale }` — records language preference even when user skips all other fields
- **Suspense for ResetPasswordForm**: Next.js App Router requires Suspense when `useSearchParams()` used in client components
- **Dynamic SQL SET via reduce**: `update-profile` builds SET clause from variable fields array using `sql` template tag reduce — no string concatenation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] @hookform/resolvers missing from package.json**
- **Found during:** Task 1 (creating SignUpForm.tsx)
- **Issue:** `react-hook-form` was in package.json but `@hookform/resolvers` (required for zodResolver) was not
- **Fix:** `npm install @hookform/resolvers`
- **Files modified:** package.json, package-lock.json
- **Commit:** d5dee87 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking)
**Impact on plan:** Required install to use zodResolver with react-hook-form. No scope creep.

## Issues Encountered

- Better Auth-generated `user` table columns not yet in `schema.ts` (only `tosAcceptances` is defined there). The `accept-tos` and `update-profile` routes use raw `sql` template tag updates targeting the Better Auth generated `user` table — these will work once `npx @better-auth/cli generate && npx drizzle-kit push` is run to create the actual DB tables.
- Auth pages will only function after DATABASE_URL is set and DB schema is pushed (inherited from 01-01 setup requirement).

## User Setup Required

Before the auth flow is testable end-to-end:
1. Set `DATABASE_URL` in `.env.local`
2. Run `npx @better-auth/cli generate && npx drizzle-kit push` to create user/session/account tables with all additionalFields
3. Set `RESEND_API_KEY` for password reset emails
4. Set `NEXT_PUBLIC_APP_URL` (e.g., `http://localhost:3000` for local dev)

## Next Phase Readiness

- Auth UI complete — signup/signin/reset/TOS/onboarding/dashboard all implemented
- `getAuthSession()` pattern established and ready for use in Phase 2+ protected pages
- `update-profile` API route ready for Phase 3 profile editor (no additional fields needed)
- Onboarding fields (city, role, level) aligned with Phase 3 profile schema — no migration needed
- Remaining Phase 1 plans: 01-04 (PWA/Serwist manifest), 01-05 (already covered — TOS content delivered in this plan)

---
*Phase: 01-foundation-auth*
*Completed: 2026-03-31*

## Self-Check: PASSED

All 16 required files exist and both task commits verified:
- src/lib/auth-guard.ts: FOUND
- src/app/[locale]/(auth)/layout.tsx: FOUND
- src/app/[locale]/(auth)/sign-up/page.tsx: FOUND
- src/app/[locale]/(auth)/sign-in/page.tsx: FOUND
- src/app/[locale]/(auth)/reset-password/page.tsx: FOUND
- src/app/[locale]/(auth)/tos/page.tsx: FOUND
- src/app/[locale]/(auth)/onboarding/page.tsx: FOUND
- src/app/[locale]/(app)/layout.tsx: FOUND
- src/app/[locale]/(app)/dashboard/page.tsx: FOUND
- src/components/auth/SignUpForm.tsx: FOUND
- src/components/auth/SignInForm.tsx: FOUND
- src/components/auth/ResetPasswordForm.tsx: FOUND
- src/components/auth/TosAcceptance.tsx: FOUND
- src/components/auth/OnboardingWizard.tsx: FOUND
- src/app/api/user/accept-tos/route.ts: FOUND
- src/app/api/user/update-profile/route.ts: FOUND
- Commit d5dee87: FOUND
- Commit 53e3ddc: FOUND
