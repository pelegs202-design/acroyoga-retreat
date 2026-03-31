---
phase: 01-foundation-auth
plan: 02
subsystem: ui
tags: [next-intl, i18n, rtl, heebo, bilingual, hebrew, tailwind, nextjs]

requires:
  - phase: 01-foundation-auth/01-01
    provides: Next.js 16 scaffold with Tailwind v4, Heebo font CSS variable, package.json with next-intl installed

provides:
  - next-intl URL-prefix bilingual routing (/en/, /he/) with localeDetection
  - src/proxy.ts (Next.js 16 middleware file with locale detection and URL-prefix routing)
  - src/i18n/routing.ts (defineRouting config, en/he locales, defaultLocale en)
  - src/i18n/request.ts (getRequestConfig loading messages by locale)
  - src/i18n/navigation.ts (typed Link, redirect, usePathname, useRouter)
  - app/[locale]/layout.tsx (locale-aware root layout with dir, lang, Heebo, NextIntlClientProvider)
  - messages/en.json and messages/he.json (all Phase 1 translation namespaces)
  - LanguageToggle component with IL/US flag buttons
  - Header component with app name and language toggle using logical CSS properties
affects: [03, 04, 05, 06, 07, 08, 09, 10]

tech-stack:
  added: []
  patterns:
    - "next-intl v4: proxy.ts (not middleware.ts) is the correct filename in Next.js 16"
    - "next-intl v4: createNavigation(routing) provides typed navigation hooks and Link component"
    - "next-intl v4: getRequestConfig + getMessages() pattern for server-side message loading"
    - "RTL: dir set dynamically from locale in [locale]/layout.tsx (he=rtl, all others=ltr)"
    - "CSS logical properties: ms-auto, me-auto, ps-4, pe-4 used throughout for RTL/LTR compatibility"
    - "next-intl plugin: createNextIntlPlugin wraps NextConfig in next.config.ts"

key-files:
  created:
    - src/i18n/routing.ts (defineRouting with en/he locales)
    - src/i18n/request.ts (getRequestConfig loading messages from messages/${locale}.json)
    - src/i18n/navigation.ts (typed navigation exports via createNavigation)
    - src/proxy.ts (next-intl createMiddleware — renamed from middleware.ts per Next.js 16)
    - src/app/[locale]/layout.tsx (locale-aware layout: Heebo font, dir/lang, NextIntlClientProvider, Header)
    - src/app/[locale]/page.tsx (home page with useTranslations("home"), logical CSS properties)
    - messages/en.json (English: common, home, auth, tos, onboarding, offline namespaces)
    - messages/he.json (Hebrew: same structure, all values translated)
    - src/components/layout/LanguageToggle.tsx (flag buttons IL/US with active locale ring highlight)
    - src/components/layout/Header.tsx (app name leading edge, language toggle trailing edge)
  modified:
    - next.config.ts (wrapped with createNextIntlPlugin pointing to src/i18n/request.ts)
    - src/app/layout.tsx (stripped to minimal wrapper — lang/dir/font moved to [locale]/layout.tsx)

key-decisions:
  - "Next.js 16 proxy.ts: renamed middleware.ts to proxy.ts — Next.js 16 deprecated the middleware filename convention"
  - "Root layout returns children only — no html/body wrapper at root to avoid duplicate html elements"
  - "Heebo font instance defined in [locale]/layout.tsx — not root layout — so font variable is always scoped to locale context"
  - "LanguageToggle uses useTransition for non-blocking locale switch (no loading spinner needed)"

patterns-established:
  - "Pattern: All locale-aware layouts live in src/app/[locale]/ — never in src/app/ root"
  - "Pattern: Import typed navigation from @/i18n/navigation (not next-intl directly) for type-safe routing"
  - "Pattern: CSS logical properties (ms-, me-, ps-, pe-) used instead of physical (ml, mr, pl, pr) everywhere"
  - "Pattern: setRequestLocale(locale) called at top of every [locale] Server Component for static rendering"

requirements-completed: [FOUND-02, FOUND-04]

duration: 7min
completed: 2026-03-31
---

# Phase 01 Plan 02: i18n Bilingual Routing with RTL Support Summary

**next-intl URL-prefix bilingual routing (/en/, /he/) with dynamic RTL direction, Heebo Hebrew+Latin font, flag-icon language toggle, and all Phase 1 translation strings in English and Hebrew**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-03-31T22:15:52Z
- **Completed:** 2026-03-31T22:22:00Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- next-intl URL-prefix routing configured with en/he locales, browser localeDetection, and createNextIntlPlugin wiring
- Locale-aware `[locale]/layout.tsx` sets `dir="rtl"` for Hebrew and `dir="ltr"` for English on the `<html>` element, with Heebo font variable scoped correctly
- Flag-icon language toggle (IL/US) in header switches locale via URL with active locale visually highlighted
- All Phase 1 translation namespaces (common, home, auth, tos, onboarding, offline) complete in both English and Hebrew

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure next-intl routing, middleware, and locale-aware layout** - `307cdb5` (feat)
2. **Task 2: Translation files and flag-icon language toggle** - `8c4c35a` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/i18n/routing.ts` - defineRouting with en/he locales and localeDetection:true
- `src/i18n/request.ts` - getRequestConfig loading messages from messages/${locale}.json
- `src/i18n/navigation.ts` - typed Link, redirect, usePathname, useRouter via createNavigation(routing)
- `src/proxy.ts` - next-intl createMiddleware (Next.js 16 filename convention)
- `next.config.ts` - wrapped with createNextIntlPlugin pointing to src/i18n/request.ts
- `src/app/layout.tsx` - stripped to minimal wrapper (returns children only, no html/body)
- `src/app/[locale]/layout.tsx` - locale-aware layout: Heebo font, dir/lang, NextIntlClientProvider, dark theme
- `src/app/[locale]/page.tsx` - home page with useTranslations, logical CSS properties, mobile-first
- `messages/en.json` - English translations: all Phase 1 namespaces
- `messages/he.json` - Hebrew translations: all Phase 1 namespaces
- `src/components/layout/LanguageToggle.tsx` - IL/US flag buttons, useTransition, active ring highlight
- `src/components/layout/Header.tsx` - brutalist header with logical property positioning

## Decisions Made
- **proxy.ts filename**: Next.js 16 deprecated `middleware.ts` — renamed to `proxy.ts` as required by framework
- **Root layout returns children only**: Avoids duplicate html/body elements when locale layout provides its own
- **Heebo in [locale]/layout.tsx**: Font instance scoped to locale context (not root) — ensures font variable is always present when locale-aware components render
- **useTransition in LanguageToggle**: Non-blocking locale switch prevents UI freeze during navigation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Renamed middleware.ts to proxy.ts for Next.js 16 compatibility**
- **Found during:** Task 1 verification (build output)
- **Issue:** Next.js 16 deprecated the `middleware.ts` filename convention in favor of `proxy.ts`; build showed deprecation warning and would have caused conflict error in dev mode
- **Fix:** Renamed `src/middleware.ts` to `src/proxy.ts`
- **Files modified:** src/proxy.ts (rename)
- **Verification:** TypeScript passes clean, deprecation warning resolved
- **Committed in:** 307cdb5 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking)
**Impact on plan:** Required rename for Next.js 16 compatibility. No scope creep.

## Issues Encountered
- Pre-existing `DATABASE_URL` missing in `.env.local` causes `next build` to fail on `/api/auth/[...all]` route (documented in 01-01-SUMMARY). Out of scope for this plan — i18n routing, TypeScript, and compilation all pass cleanly.

## User Setup Required
None - no additional external service configuration required for i18n.

## Next Phase Readiness
- Bilingual routing established — all Phase 1 pages (auth, TOS, onboarding) can use `[locale]` route group
- Translation strings ready for 01-03 (auth UI) and 01-05 (TOS page)
- CSS logical properties pattern established — RTL-safe from the start
- Header placeholder ready for auth status buttons (to be added in 01-03)
- Database setup (user-required) still needed before auth UI testing in 01-03

---
*Phase: 01-foundation-auth*
*Completed: 2026-03-31*

## Self-Check: PASSED

All required files exist and both task commits verified:
- src/i18n/routing.ts: FOUND
- src/i18n/request.ts: FOUND
- src/i18n/navigation.ts: FOUND
- src/proxy.ts: FOUND
- src/app/[locale]/layout.tsx: FOUND
- src/app/[locale]/page.tsx: FOUND
- messages/en.json: FOUND
- messages/he.json: FOUND
- src/components/layout/LanguageToggle.tsx: FOUND
- src/components/layout/Header.tsx: FOUND
- Commit 307cdb5: FOUND
- Commit 8c4c35a: FOUND
