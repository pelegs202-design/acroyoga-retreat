---
phase: 02-brand-identity
plan: 03
subsystem: ui
tags: [tailwind, css-variables, pwa, brand, icons, buttons]

# Dependency graph
requires:
  - phase: 02-01-brand-tokens
    provides: bg-brand, text-brand, border-brand, bg-brand-muted, text-brand-foreground Tailwind utilities from --color-brand CSS variable
provides:
  - Pink Heebo-900 wordmark in Header (text-xl font-black text-brand tracking-tight)
  - Pink wordmark in offline page (fontWeight 900, color #F472B6, fontSize 1.25rem)
  - All auth primary buttons pink (bg-brand / text-brand-foreground / hover:bg-brand-muted)
  - OnboardingWizard selected chips pink (border-brand bg-brand), progress bar pink (bg-brand)
  - InstallPrompt install button pink (#F472B6 inline style)
  - Branded PWA icons: 192x192 and 512x512 dark+pink PNGs
affects:
  - 02-04 (remaining brand surfaces, if any)
  - 10-design-polish (final icon design will replace these placeholders)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Primary action buttons: bg-brand text-brand-foreground hover:bg-brand-muted (replaces bg-neutral-100 text-neutral-950 hover:bg-white)
    - Selected interactive chips: border-brand bg-brand text-brand-foreground
    - Progress bar fill: bg-brand
    - Offline page: all brand surfaces use inline styles with literal hex values (no Tailwind — page is outside locale segment)
    - PWA icons: generated via raw zlib/CRC32 Node.js script, pixel-by-pixel RGBA buffers

key-files:
  created:
    - public/icon-192x192.png
    - public/icon-512x512.png
  modified:
    - src/components/layout/Header.tsx
    - src/app/~offline/page.tsx
    - src/components/auth/SignInForm.tsx
    - src/components/auth/SignUpForm.tsx
    - src/components/auth/ResetPasswordForm.tsx
    - src/components/auth/TosAcceptance.tsx
    - src/components/auth/OnboardingWizard.tsx
    - src/components/pwa/InstallPrompt.tsx
    - src/app/page.tsx

key-decisions:
  - "02-03: Offline page wordmark uses inline style hex #F472B6 (not text-brand) — offline page is self-contained outside [locale], Tailwind not guaranteed in cache context"
  - "02-03: PWA icon border thickness is 15% of icon size (29px at 192, 77px at 512) — brutalist frame proportion matches brand"
  - "02-03: page.tsx root uses bg-background replacing bg-white dark:bg-black — consolidates to single CSS variable, no light/dark conditionals needed"

patterns-established:
  - "Primary button pattern: bg-brand text-brand-foreground hover:bg-brand-muted disabled:cursor-not-allowed disabled:opacity-50"
  - "Selected chip pattern: border-brand bg-brand text-brand-foreground (conditional class in ternary)"
  - "Progress fill pattern: bg-brand (replaces bg-neutral-100)"

requirements-completed: [BRAND-01]

# Metrics
duration: 12min
completed: 2026-04-01
---

# Phase 2 Plan 3: Brand Identity — Interactive Surfaces Summary

**Hot pink applied to every primary action surface: all auth buttons, onboarding chips, progress bar, install prompt, wordmarks in header and offline page, plus branded dark+pink PWA placeholder icons at 192x192 and 512x512**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-04-01T09:35:00Z
- **Completed:** 2026-04-01T09:47:00Z
- **Tasks:** 3
- **Files modified:** 9 + 2 binary PNGs

## Accomplishments
- Header wordmark upgraded to Heebo 900, text-xl, pink (text-brand), tracking-tight — was bold text-lg white
- All 7 primary action buttons across auth forms, TOS, onboarding, and install prompt switched to pink (bg-brand)
- OnboardingWizard selected chips and progress bar both use pink — full interactive surface coverage
- Branded placeholder PWA icons generated: dark #0a0a0a background with thick pink #F472B6 border frame, brutalist square edges

## Task Commits

Each task was committed atomically:

1. **Task 1: Pink wordmark in Header and offline page** - `2adbdd0` (feat)
2. **Task 2: Switch all primary buttons and interactive surfaces to pink** - `e2c02c6` (feat)
3. **Task 3: Generate branded placeholder PWA icons** - `5605c5f` (feat)

**Plan metadata:** (docs commit — pending)

## Files Created/Modified
- `src/components/layout/Header.tsx` - Wordmark: text-xl font-black text-brand tracking-tight
- `src/app/~offline/page.tsx` - Wordmark: fontWeight 900, color #F472B6, fontSize 1.25rem, letterSpacing -0.025em (removed uppercase, opacity)
- `src/components/auth/SignInForm.tsx` - Submit button: bg-brand text-brand-foreground hover:bg-brand-muted
- `src/components/auth/SignUpForm.tsx` - Submit button: bg-brand text-brand-foreground hover:bg-brand-muted
- `src/components/auth/ResetPasswordForm.tsx` - Both buttons (request + reset): bg-brand text-brand-foreground hover:bg-brand-muted
- `src/components/auth/TosAcceptance.tsx` - Accept button: bg-brand text-brand-foreground hover:bg-brand-muted
- `src/components/auth/OnboardingWizard.tsx` - Continue/Finish buttons pink, selected chips border-brand bg-brand, progress bar bg-brand
- `src/components/pwa/InstallPrompt.tsx` - Install button backgroundColor #F472B6
- `src/app/page.tsx` - Root page: bg-white dark:bg-black -> bg-background
- `public/icon-192x192.png` - Branded 192x192 RGBA PNG, dark bg + pink frame
- `public/icon-512x512.png` - Branded 512x512 RGBA PNG, dark bg + pink frame

## Decisions Made
- Offline page uses inline style `color: "#F472B6"` rather than a Tailwind class — this page lives outside the locale segment and is self-contained (own html/body), so Tailwind class reliability in cache is not guaranteed. Inline hex is explicit and always works.
- PWA icons generated via raw Node.js zlib/CRC32 PNG encoding (no external image library dependency), same approach validated in Phase 1.
- Border thickness chosen at 15% of icon size (~29px at 192, ~77px at 512) to create a strong brutalist frame visible at small icon sizes.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Brand identity visually cohesive across all interactive surfaces
- Wordmark uses consistent typography (Heebo 900, pink) in both Header and offline page
- PWA icons are functional placeholders — Phase 10 will replace with final designed icons
- Ready for Phase 2 Plan 4 (if any remaining brand surfaces) or Phase 3

---
*Phase: 02-brand-identity*
*Completed: 2026-04-01*
