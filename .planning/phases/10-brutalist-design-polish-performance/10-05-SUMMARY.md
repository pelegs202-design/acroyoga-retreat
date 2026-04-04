---
phase: 10-brutalist-design-polish-performance
plan: 05
subsystem: testing
tags: [playwright, axe-core, wcag, a11y, accessibility, lighthouse, performance, framer-motion]

# Dependency graph
requires:
  - phase: 10-01
    provides: MotionProvider, ParallaxLayer, DraggableCard, ScrollReveal, MagneticWrapper
  - phase: 10-02
    provides: HeroSection, HorizontalShowcase, FeaturesShowcase homepage components
  - phase: 10-03
    provides: Header, MobileMenu (Radix Dialog), Footer, auth page brutalist framing
  - phase: 10-04
    provides: City landing pages, quiz flow brutalist polish, QuizCard, QuizResultsPage
provides:
  - Playwright + axe-core WCAG AA test suite (4 spec files, 8 tests, all passing)
  - Compositor-safe animation audit — width/height layout triggers replaced with transform/CSS
  - ParallaxLayer mobile-disabled (no useScroll on mobile < 768px)
  - Footer contrast fixed (WCAG AA compliant — all elements >= 4.5:1 ratio)
  - Performance budget documentation in next.config.ts
affects: [future UI changes must maintain WCAG AA pass, no animate width/height/top/left]

# Tech tracking
tech-stack:
  added: ["@axe-core/playwright", "@playwright/test", "playwright chromium browser"]
  patterns:
    - "axe-core .withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']) + .exclude('[aria-hidden]')"
    - "CSS grid-template-rows: 0fr/1fr accordion (layout-safe alternative to animate height)"
    - "scaleX transform for progress bar (compositor-safe alternative to animate width)"
    - "matchMedia (min-width: 768px) to disable useScroll on mobile in ParallaxLayer"

key-files:
  created:
    - playwright.config.ts
    - tests/a11y/homepage.spec.ts
    - tests/a11y/city.spec.ts
    - tests/a11y/quiz.spec.ts
    - tests/a11y/auth.spec.ts
  modified:
    - src/components/layout/Footer.tsx
    - src/components/home/HeroSection.tsx
    - src/components/effects/ParallaxLayer.tsx
    - src/components/quiz/QuizProgressBar.tsx
    - src/components/quiz/QuizResultsPage.tsx
    - next.config.ts
    - package.json

key-decisions:
  - "10-05: aria-hidden decorative elements excluded from axe-core contrast checks — WCAG 1.4.3 non-text content exception; these ghost numbers (5% opacity) convey no information"
  - "10-05: CSS grid-template-rows accordion replaces Framer Motion animate height — eliminates layout trigger, browser-native smooth collapse"
  - "10-05: scaleX with origin-[0%_50%] replaces animate width on progress bar — RTL-safe compositor transform"
  - "10-05: matchMedia in useEffect detects mobile viewport in ParallaxLayer — disables useScroll tracking on < 768px to preserve Lighthouse mobile score"
  - "10-05: Footer opacity levels raised to /60 minimum for all visible text — genuine WCAG AA violations fixed (not CSS variable false positives)"

requirements-completed: [DSGN-02, DSGN-03]

# Metrics
duration: 25min
completed: 2026-04-04
---

# Phase 10 Plan 05: Accessibility Testing + Performance Audit Summary

**Playwright + axe-core WCAG AA suite (8 tests, all pass) with compositor-safe animation audit fixing width/height layout triggers across quiz components**

## Performance

- **Duration:** 25 min
- **Started:** 2026-04-04T00:44:57Z
- **Completed:** 2026-04-04T01:10:00Z
- **Tasks:** 2 of 3 complete (Task 3 is human-verify checkpoint)
- **Files modified:** 10

## Accomplishments
- Installed @axe-core/playwright + @playwright/test; all 8 WCAG 2.0/2.1 A/AA tests pass across homepage, city, quiz, and auth pages
- Fixed 3 genuine contrast violations in Footer (opacity /30 and /25 on #0a0a0a background failed 4.5:1 ratio — raised to /60)
- Replaced layout-triggering animations: QuizProgressBar width→scaleX, QuizResultsPage height→CSS grid-rows
- ParallaxLayer now disables useScroll on mobile via matchMedia — no scroll tracking < 768px
- Performance budget documented in next.config.ts header comment

## Task Commits

Each task was committed atomically:

1. **Task 1: Install testing dependencies, create Playwright config, write WCAG AA tests** - `8421387` (feat)
2. **Task 2: Lighthouse performance audit and optimization** - `8768c17` (feat)

Task 3 (human-verify checkpoint) awaits user review.

## Files Created/Modified

- `playwright.config.ts` - Playwright config with webServer auto-start on port 3000
- `tests/a11y/homepage.spec.ts` - WCAG AA scan for / (he + en), excludes aria-hidden decorative elements
- `tests/a11y/city.spec.ts` - WCAG AA scan for /he/cities/tel-aviv + /he/cities/kfar-saba
- `tests/a11y/quiz.spec.ts` - WCAG AA scan for /he/quiz + /en/quiz
- `tests/a11y/auth.spec.ts` - WCAG AA scan for /he/sign-in + /he/sign-up
- `src/components/layout/Footer.tsx` - Raised text opacity levels to pass WCAG AA contrast (all text >= 4.5:1)
- `src/components/home/HeroSection.tsx` - scroll hint text-neutral-500 -> text-neutral-400 (4.17:1 -> ~8:1)
- `src/components/effects/ParallaxLayer.tsx` - Mobile disable via matchMedia; static y on < 768px
- `src/components/quiz/QuizProgressBar.tsx` - scaleX replaces width animation (compositor-safe)
- `src/components/quiz/QuizResultsPage.tsx` - CSS grid-rows accordion replaces height animation; removed unused motion import
- `next.config.ts` - Performance budget comment block added

## Decisions Made
- aria-hidden decorative elements (ghost background numbers at 5% opacity, brand/[0.05]) excluded from axe-core contrast scan — WCAG 1.4.3 explicitly exempts decorative content. These elements are `aria-hidden="true"`, provide zero information, and are visually imperceptible.
- CSS grid-template-rows: 0fr/1fr chosen for FAQ accordion over Framer Motion height animation — native browser performance, no JS dependency, works in prefers-reduced-motion context without any special handling.
- scaleX with `origin-[0%_50%]` chosen for progress bar — RTL-safe (grows from start edge regardless of dir attribute), compositor-only, visually identical to width animation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Footer section headings failed WCAG AA contrast — 2.45:1 on dark background**
- **Found during:** Task 1 (running axe-core tests)
- **Issue:** `text-neutral-100/30` renders as #505050 on #0a0a0a = 2.45:1 contrast ratio (required: 4.5:1). Applied to 3 section header labels (פלטפורמה, קהילה, משפטי).
- **Fix:** Changed to `text-neutral-100/60` (~5.5:1 ratio) across all 3 section headers
- **Files modified:** src/components/layout/Footer.tsx
- **Verification:** Tests pass after fix
- **Committed in:** 8421387 (Task 1 commit)

**2. [Rule 1 - Bug] Footer copyright and legal link text failed WCAG AA — 2.06:1 on dark background**
- **Found during:** Task 1 (running axe-core tests)
- **Issue:** `text-neutral-100/25` renders as #454545 on #0a0a0a = 2.06:1 contrast ratio (required: 4.5:1). Applied to copyright text and ToS link.
- **Fix:** Changed to `text-neutral-100/60` with `hover:text-neutral-100/90`
- **Files modified:** src/components/layout/Footer.tsx
- **Verification:** Tests pass after fix
- **Committed in:** 8421387 (Task 1 commit)

**3. [Rule 1 - Bug] HeroSection scroll hint text failed WCAG AA — 4.17:1 (just under 4.5:1)**
- **Found during:** Task 1 (running axe-core tests)
- **Issue:** `text-neutral-500` (#737373) on #0a0a0a = 4.17:1 contrast ratio — 7% under threshold. The scroll hint label at bottom of hero.
- **Fix:** Changed to `text-neutral-400` (#a3a3a3) — passes at ~8:1 ratio
- **Files modified:** src/components/home/HeroSection.tsx
- **Verification:** Tests pass after fix
- **Committed in:** 8421387 (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (3x Rule 1 — genuine contrast bugs)
**Impact on plan:** All contrast fixes necessary for WCAG AA compliance. Opacity levels adjusted by +/30 to +/35 points — visual design character preserved (text remains subdued/secondary) while meeting accessibility requirements.

## Issues Encountered

- First test run failed with "Internal Server Error" for city/quiz/auth pages — the Playwright webServer had started a stale server from a previous test run (port 3000 already in use). Resolved by killing the stale process before re-running; subsequent run with Playwright managing the server lifecycle worked correctly.
- axe-core scans `aria-hidden="true"` decorative elements for contrast (the ghost background numbers in HorizontalShowcase cards). This is technically a false positive since WCAG 1.4.3 exempts decorative/non-text content. Used `.exclude('[aria-hidden="true"]')` with documented justification.

## User Setup Required

**Lighthouse score verification requires manual browser audit.**

Run Lighthouse in Chrome DevTools to confirm the 90+ mobile target:
1. Start the dev server: `cd C:/acroyoga-academy && npm run dev`
2. Open Chrome at http://localhost:3000/he
3. Open DevTools (F12) → Lighthouse tab → Mobile → Performance → Analyze
4. Target: 90+ performance score on homepage

Also verify:
- OS "Reduce motion" setting disables all animations (MotionProvider handles this via MotionConfig reducedMotion="user")
- Mobile width: no horizontal scroll, simplified effects, hamburger menu works

## Next Phase Readiness

This is the final plan of Phase 10. Task 3 (human-verify checkpoint) is pending user confirmation that:
- Visual quality meets approval (parallax, draggable cards, mobile menu)
- Lighthouse mobile score >= 90 on homepage
- prefers-reduced-motion stops all animations

Upon approval, Phase 10 is complete and the project is ready for production deployment.

---
*Phase: 10-brutalist-design-polish-performance*
*Completed: 2026-04-04*
