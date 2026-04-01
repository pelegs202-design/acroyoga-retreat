---
phase: 02-brand-identity
plan: 01
subsystem: ui
tags: [tailwind, css, design-tokens, dark-mode, brand-colors]

# Dependency graph
requires:
  - phase: 01-foundation-auth
    provides: Next.js App Router setup with globals.css and Heebo font already wired
provides:
  - Dark-first design system base (#0a0a0a default, no prefers-color-scheme media query)
  - Hot pink brand accent token (--color-brand: #F472B6) generating Tailwind utility classes
  - Muted pink hover token (--color-brand-muted: #DB2777)
  - Brand foreground token (--color-brand-foreground: #0a0a0a) for text-on-pink contrast
affects:
  - 02-brand-identity (subsequent plans — buttons, wordmark, icons can reference bg-brand, text-brand)
  - All UI components that use color utilities

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Tailwind v4 plain @theme block for brand color tokens (separate from @theme inline)
    - CSS custom property bridge pattern: --brand in :root, --color-brand in @theme references var(--brand)
    - Dark-first design: :root holds dark values directly, no media query fallback

key-files:
  created: []
  modified:
    - src/app/globals.css

key-decisions:
  - "02-01: Plain @theme block used for brand color tokens (not @theme inline) — inline modifier embeds values at build time, breaking runtime CSS variable overrides (Pitfall 5 from research)"
  - "02-01: Brand tokens in :root as --brand/--brand-muted/--brand-foreground, bridged to Tailwind namespace via @theme --color-brand = var(--brand) — allows future dark/light toggling without touching Tailwind utilities"

patterns-established:
  - "@theme block pattern: CSS custom property in :root (--brand) referenced by @theme token (--color-brand) — keeps runtime flexibility while generating utilities"
  - "Dark-first default: always-dark background in :root, no prefers-color-scheme media query"

requirements-completed:
  - BRAND-01

# Metrics
duration: 1min
completed: 2026-04-01
---

# Phase 2 Plan 01: Brand Identity — Dark Theme and Hot Pink Accent Tokens Summary

**Dark-first globals.css with hot pink (#F472B6) brand accent in separate @theme block generating bg-brand, text-brand, border-brand Tailwind utilities**

## Performance

- **Duration:** 1 min
- **Started:** 2026-04-01T09:39:21Z
- **Completed:** 2026-04-01T09:40:08Z
- **Tasks:** 1 of 1
- **Files modified:** 1

## Accomplishments
- Converted globals.css from light-default with dark media query to always-dark (#0a0a0a) — removed `prefers-color-scheme: dark` block entirely
- Added hot pink brand accent (#F472B6 / Tailwind pink-400) as `--brand` in `:root` and `--color-brand` in plain `@theme` block
- Added muted pink (#DB2777) as `--brand-muted` / `--color-brand-muted` for hover states
- Added `--brand-foreground: #0a0a0a` / `--color-brand-foreground` for text-on-pink contrast (WCAG AA compliant)
- Existing `@theme inline` block with Heebo font aliasing left completely untouched

## Task Commits

Each task was committed atomically:

1. **Task 1: Dark-first theme and hot pink brand accent tokens** - `7a5f0a1` (feat)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified
- `src/app/globals.css` - Dark-first :root, removed media query, added brand color tokens in separate @theme block

## Decisions Made
- Plain `@theme` block (not `@theme inline`) for brand colors: the `inline` modifier embeds values at Tailwind build time, which would prevent runtime CSS variable overrides. Research Pitfall 5 documented this risk explicitly.
- Bridge pattern: `:root` holds `--brand` (raw hex), `@theme` maps `--color-brand: var(--brand)` — utility classes reference the CSS variable, not the hardcoded value, preserving future theme flexibility.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required. This is a pure CSS change.

## Next Phase Readiness
- Brand color utilities (bg-brand, text-brand, border-brand, bg-brand-muted, text-brand-foreground) are now available to all components
- Ready for 02-02: buttons and interactive elements using brand colors
- Dark-first baseline established — all subsequent UI work targets #0a0a0a background

---
*Phase: 02-brand-identity*
*Completed: 2026-04-01*
