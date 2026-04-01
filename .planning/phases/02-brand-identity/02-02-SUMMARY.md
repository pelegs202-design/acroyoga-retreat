---
phase: 02-brand-identity
plan: 02
subsystem: ui
tags: [i18n, pwa, next-intl, branding, manifest]

# Dependency graph
requires:
  - phase: 02-brand-identity/02-01
    provides: CSS custom properties for brand colors
provides:
  - Brand name "AcroHavura" / "אקרוחבורה" on all 8 user-visible surfaces
  - PWA manifest with AcroHavura name and short_name
  - Per-page title template "%s | AcroHavura" in locale layout metadata
  - i18n strings in en.json and he.json updated with new brand
  - Auth email sender and subject using AcroHavura brand voice
affects: [03-partner-discovery, 09-seo, 10-design-polish, all-phases-using-appName]

# Tech tracking
tech-stack:
  added: []
  patterns: [title template for per-page suffixing in Next.js metadata]

key-files:
  created: []
  modified:
    - src/app/layout.tsx
    - src/app/[locale]/layout.tsx
    - src/app/manifest.ts
    - src/app/~offline/page.tsx
    - src/components/pwa/InstallPrompt.tsx
    - src/lib/auth.ts
    - messages/en.json
    - messages/he.json

key-decisions:
  - "02-02: [locale]/layout.tsx uses title template { default: 'AcroHavura', template: '%s | AcroHavura' } — enables per-page suffixing in future phases without re-visiting layout"
  - "02-02: Password reset email subject is 'Reset your password.' (no brand name) — direct bold voice, period is intentional"
  - "02-02: manifest short_name is 'AcroHavura' (11 chars) — fits iOS 12-char PWA limit"

patterns-established:
  - "i18n pattern: common.appName drives all header/UI brand name rendering — update there, propagates everywhere via useTranslations"
  - "Email voice pattern: direct imperative subject lines with no brand fluff — 'Reset your password.' not 'Reset your AcroHavura password'"

requirements-completed: [BRAND-01]

# Metrics
duration: 8min
completed: 2026-04-01
---

# Phase 02 Plan 02: Brand Identity Rename Summary

**Brand renamed from "AcroYoga Academy" to "AcroHavura" / "אקרוחבורה" across all 8 user-visible surfaces: metadata, PWA manifest, i18n strings, offline page, install prompt, and auth email sender**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-01T09:33:00Z
- **Completed:** 2026-04-01T09:41:19Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- All metadata and browser tab titles now show AcroHavura (with per-page template support)
- PWA manifest name and short_name both updated to AcroHavura (11 chars, within iOS limit)
- i18n files updated: 4 occurrences in en.json, 4 occurrences in he.json
- Offline page and install prompt banner display AcroHavura
- Auth email sender is now "AcroHavura <noreply@acro.academy>" with direct bold subject line
- Zero remaining grep hits for old brand names across src/ and messages/

## Task Commits

Each task was committed atomically:

1. **Task 1: Rename brand in metadata, manifest, and i18n strings** - `b0e690c` (feat)
2. **Task 2: Rename brand in offline page, install prompt, and auth email** - `7bad310` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/app/layout.tsx` - title metadata -> "AcroHavura"
- `src/app/[locale]/layout.tsx` - title template `{ default: "AcroHavura", template: "%s | AcroHavura" }`
- `src/app/manifest.ts` - name/short_name -> "AcroHavura", description updated
- `src/app/~offline/page.tsx` - page title and branded header -> AcroHavura
- `src/components/pwa/InstallPrompt.tsx` - install banner text -> "Install AcroHavura"
- `src/lib/auth.ts` - FROM_EMAIL sender -> "AcroHavura <noreply@acro.academy>", subject -> "Reset your password."
- `messages/en.json` - 4 brand name occurrences -> AcroHavura
- `messages/he.json` - 4 brand name occurrences -> אקרוחבורה

## Decisions Made
- Used title template `{ default: "AcroHavura", template: "%s | AcroHavura" }` in locale layout — this enables future per-page titles to suffix `| AcroHavura` without touching layout.tsx again
- Email subject changed to `"Reset your password."` (no brand name) — aligns with direct bold brand voice from CONTEXT.md; the period is intentional, not a typo
- manifest short_name kept at "AcroHavura" (11 chars) — fits iOS 12-char PWA limit

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `grep -r "AcroYoga\|..."` returned one hit in `communityConduct.body` for the phrase "AcroYoga is built on trust..." — this is the sport name, not the brand name "AcroYoga Academy". Confirmed correct as-is; the plan targets compound brand strings only.

## User Setup Required
None - no external service configuration required.

## Self-Check: PASSED

All 8 source files exist and contain AcroHavura. Both task commits (b0e690c, 7bad310) present in git log. SUMMARY.md created at correct path.

## Next Phase Readiness
- Brand is locked: "AcroHavura" / "אקרוחבורה" appears on every surface
- Phase 02-03 (logo and favicon) can proceed — all textual brand surfaces are clean
- SEO phase (09) can use metadata title template already in place

---
*Phase: 02-brand-identity*
*Completed: 2026-04-01*
