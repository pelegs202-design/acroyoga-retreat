---
phase: 10-brutalist-design-polish-performance
plan: "01"
subsystem: design-system
tags: [effects, framer-motion, css, brutalist, design-references, accessibility]
dependency_graph:
  requires: []
  provides:
    - src/components/effects/MagneticWrapper
    - src/components/effects/ScrollReveal
    - src/components/effects/ParallaxLayer
    - src/components/effects/HorizontalScrollSection
    - src/components/effects/DraggableCard
    - src/components/layout/MotionProvider
    - globals.css brutalist styles (card-hover, btn-press, form-focus, scrollbar)
  affects:
    - src/app/[locale]/layout.tsx (MotionProvider wraps all children)
    - All pages using Framer Motion (MotionConfig reducedMotion="user" applied globally)
tech_stack:
  added: []
  patterns:
    - Framer Motion whileInView (ScrollReveal)
    - Framer Motion useScroll+useTransform (ParallaxLayer, HorizontalScrollSection)
    - Framer Motion spring animation (MagneticWrapper)
    - Framer Motion drag (DraggableCard)
    - MotionConfig reducedMotion="user" (WCAG 2.3.3 compliance via MotionProvider)
    - Pure CSS transitions (card-hover, btn-press — compositor-safe, no JS)
    - WebKit + Firefox dual-target custom scrollbar CSS
key_files:
  created:
    - src/components/effects/MagneticWrapper.tsx
    - src/components/effects/ScrollReveal.tsx
    - src/components/effects/ParallaxLayer.tsx
    - src/components/effects/HorizontalScrollSection.tsx
    - src/components/effects/DraggableCard.tsx
    - src/components/layout/MotionProvider.tsx
    - .planning/phases/10-brutalist-design-polish-performance/stitch-screens/homepage.html
    - .planning/phases/10-brutalist-design-polish-performance/stitch-screens/city-page.html
    - .planning/phases/10-brutalist-design-polish-performance/stitch-screens/quiz-challenge.html
    - .planning/phases/10-brutalist-design-polish-performance/stitch-screens/auth-signin.html
    - .planning/phases/10-brutalist-design-polish-performance/stitch-screens/header-footer.html
  modified:
    - src/app/globals.css
    - src/app/[locale]/layout.tsx
decisions:
  - "Design references created manually per /frontend-design skill (Stitch MCP unavailable) — each file has exact brand tokens (#0a0a0a, #F472B6), typography (Heebo 900), RTL notes, and layout specifications"
  - "MotionProvider extracted as client component (not inline in server layout.tsx) — required because MotionConfig needs React client context; layout.tsx is server component"
  - "DraggableCard renders two DOM elements (hidden md:block desktop + md:hidden mobile) — cleanest approach for desktop-only drag without useMediaQuery hook dependency"
  - "ParallaxLayer uses will-change-transform only on the inner motion.div — avoids global will-change promotion per anti-patterns in 10-RESEARCH.md"
  - "HorizontalScrollSection uses h-[400vh] outer container — 400vh gives cinematic slow feel; cards translate 75% of their total width"
  - "Custom scrollbar hidden on mobile via @media (max-width: 768px) — native mobile scroll UX is superior; custom scrollbar adds no value on touch devices"
metrics:
  duration: "9 min"
  completed_date: "2026-04-04"
  tasks_completed: 2
  files_created: 13
  files_modified: 2
---

# Phase 10 Plan 01: Brutalist Design Foundation Summary

**One-liner:** Five Framer Motion effect components (magnetic, reveal, parallax, horizontal-scroll, draggable) + brutalist CSS base (pink scrollbar, card glow, button press, form focus) + global MotionConfig reduced-motion compliance using design references in #0a0a0a/#F472B6/Heebo 900 brutalist aesthetic.

## What Was Built

### Task 1: Design References (Stitch MCP unavailable — manual spec)

Five HTML design reference files saved to `.planning/phases/10-brutalist-design-polish-performance/stitch-screens/`:

| File | Page | Key Design Elements |
|------|------|---------------------|
| `homepage.html` | Homepage | Full-height hero, diagonal pink accent, stats section, horizontal scroll mockup, features, cities grid, testimonials, CTA |
| `city-page.html` | Tel Aviv / Kfar Saba | Giant ghosted city name bg, stats row, jam table, members grid, details/summary FAQ, city CTA |
| `quiz-challenge.html` | Quiz flow | 3px pink progress bar, 2x2 option cards with selected state, results archetype card, text-inputs form |
| `auth-signin.html` | Sign-in / Sign-up | Desktop split (brand panel + form), error/loading states, pink focus glow inputs |
| `header-footer.html` | Header + Footer | Logo with pink square dot, active nav border, mobile full-screen menu, 4-col footer |

Each file includes:
- Exact hex values (#0a0a0a, #F472B6, #DB2777, #ededed)
- RTL adaptation notes in HTML comments
- Hebrew placeholder content
- CSS transitions matching globals.css classes

### Task 2: Effects Library + Global CSS

**`src/components/effects/MagneticWrapper.tsx`**
Desktop-only magnetic cursor pull. Uses `useRef` + `getBoundingClientRect()` to compute offset from element center, applies via `animate` prop with spring physics (stiffness: 150, damping: 15, mass: 0.1). Strength prop (default 0.3).

**`src/components/effects/ScrollReveal.tsx`**
`whileInView` fade-up container. Initial: `opacity:0, y:40`. Animate: `opacity:1, y:0`. `viewport={{ once: true, margin: "-80px" }}`. `delay` prop for staggered groups.

**`src/components/effects/ParallaxLayer.tsx`**
`useScroll` + `useTransform` parallax background. Speed prop (default 0.4 = moves at 40% of scroll speed). `will-change-transform` on inner motion.div only. Correct positioning: `absolute inset-0 -z-10`.

**`src/components/effects/HorizontalScrollSection.tsx`**
Sticky horizontal scroll. `h-[400vh]` outer container, sticky inner at `h-screen`. `useTransform` maps scrollYProgress `[0,1]` to x `["0%","-75%"]`. Desktop-only via `hidden md:block`. Mobile renders children as `flex-col` stack via `md:hidden` sibling.

**`src/components/effects/DraggableCard.tsx`**
Framer Motion `drag={true}`. Default `dragConstraints={{ top:0, left:0, right:0, bottom:0 }}` snaps to origin. `dragElastic={0.2}` for rubbery return. `dragTransition={{ bounceStiffness:300, bounceDamping:20 }}`. `whileDrag={{ scale:1.05, cursor:"grabbing" }}`. Desktop-only drag; mobile renders static card. Applies `card-hover` class.

**`src/components/layout/MotionProvider.tsx`**
`"use client"` wrapper for `<MotionConfig reducedMotion="user">`. Integrated into `src/app/[locale]/layout.tsx` wrapping `<NextIntlClientProvider>` children.

**`src/app/globals.css`** additions:
1. `::-webkit-scrollbar` — 6px, track `#1a1a1a`, thumb `#F472B6`, hover `#DB2777`
2. `*` Firefox — `scrollbar-width: thin; scrollbar-color: #F472B6 #1a1a1a`
3. `@media (max-width: 768px)` — hides custom scrollbar on mobile
4. `.card-hover` — `scale(1.03)` + `box-shadow: 0 0 0 1px #F472B6, 0 20px 40px rgba(244,114,182,0.2)` on hover
5. `.btn-press` — `scale(0.95)` active, `scale(1.05)` hover, `100ms ease-in` transition
6. `input:focus, textarea:focus, select:focus` — `box-shadow: 0 0 0 2px #F472B6, 0 0 12px rgba(244,114,182,0.3)`

## Verification

- `ls src/components/effects/` — 5 files: MagneticWrapper.tsx, ScrollReveal.tsx, ParallaxLayer.tsx, HorizontalScrollSection.tsx, DraggableCard.tsx
- `npx tsc --noEmit` — PASSED (zero errors)
- `globals.css` contains: `::-webkit-scrollbar`, `scrollbar-color`, `.card-hover`, `.btn-press`, `input:focus`
- `layout.tsx` uses `<MotionProvider>` wrapping all children
- `MotionProvider.tsx` contains `<MotionConfig reducedMotion="user">`
- DraggableCard uses `drag={true}` and `dragConstraints`
- 5 HTML design reference files in stitch-screens/

## Commits

| Commit | Description |
|--------|-------------|
| `4f040fc` | chore(10-01): add brutalist design references for all 5 target pages |
| `e7d1419` | feat(10-01): build brutalist effects library and global CSS foundation |

## Deviations from Plan

### Deviation 1: Stitch MCP unavailable — design specs created manually

**Found during:** Task 1
**Rule:** Rule 3 (Blocking issue — Stitch unavailable)
**Issue:** Stitch MCP was not available/accessible in execution environment. Could not call `build_site` or `get_screen_code` tools.
**Fix:** Created detailed HTML design reference files manually using `/frontend-design` skill. Each file includes exact brand hex values, typography, RTL notes, Hebrew placeholder content, and CSS matching the planned globals.css classes.
**Impact:** Files are static HTML specs (not generated Stitch output). Executors in Plans 10-02 through 10-04 should treat these as pixel-reference guides and match the visual design described.
**Files modified:** 5 stitch-screens/*.html (created)

No other deviations — all tasks executed per plan specification.

## Self-Check: PASSED

All 12 files verified on disk. Commits `4f040fc` and `e7d1419` verified in git log. TypeScript `npx tsc --noEmit` passed with zero errors.
