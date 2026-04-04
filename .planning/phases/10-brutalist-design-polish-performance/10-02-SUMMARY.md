---
phase: 10-brutalist-design-polish-performance
plan: 02
subsystem: ui
tags: [framer-motion, next-intl, tailwind, brutalist, parallax, horizontal-scroll, drag, homepage]

# Dependency graph
requires:
  - phase: 10-01
    provides: "Effects library: ParallaxLayer, ScrollReveal, MagneticWrapper, HorizontalScrollSection, DraggableCard, globals.css brutalist utilities"

provides:
  - "HeroSection: full-viewport parallax hero with asymmetric layout, magnetic CTAs, Heebo 900 headline"
  - "FeaturesShowcase: 5 staggered ScrollReveal feature cards with animated left-border accent"
  - "HorizontalShowcase: HorizontalScrollSection with DraggableCard wrapping (DSGN-01 satisfied)"
  - "CTASection: magnetic button pair with pink top-accent and radial glow"
  - "ScrollProgressBar: fixed 2px pink bar tracking scrollYProgress"
  - "Homepage page.tsx: server component composing all 5 sections"
  - "Bilingual i18n: home.hero, home.features, home.showcase, home.cta in en.json + he.json"

affects:
  - 10-03
  - 10-04
  - 10-05

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server component page.tsx imports 'use client' section components — animation fully delegated to children"
    - "HorizontalShowcase renders DraggableCard per card — DSGN-01 draggable element requirement"
    - "ScrollReveal delay stagger pattern: 0, 0.15, 0.3, 0.45, 0.6 seconds across feature list"
    - "Asymmetric hero grid: 3fr/2fr columns — brutalist tension without centering"
    - "i18n array-of-objects using indexed keys (items.0.title) — avoids t.raw complexity"

key-files:
  created:
    - src/components/home/HeroSection.tsx
    - src/components/home/FeaturesShowcase.tsx
    - src/components/home/HorizontalShowcase.tsx
    - src/components/home/CTASection.tsx
    - src/components/home/ScrollProgressBar.tsx
  modified:
    - src/app/[locale]/page.tsx
    - messages/en.json
    - messages/he.json

key-decisions:
  - "10-02: page.tsx remains server component — all Framer Motion delegated to 'use client' children, no hydration risk"
  - "10-02: HorizontalShowcase wraps each card in DraggableCard with dragConstraints ±60px + dragElastic 0.3 — satisfies DSGN-01 without breaking horizontal scroll layout"
  - "10-02: FeaturesShowcase uses indexed i18n keys (items.0.title) not t.raw — simpler, avoids TypeScript casting complexity"
  - "10-02: InstagramGrid wrapped in ScrollReveal in page.tsx — consistent scroll-reveal behavior without modifying the existing RSC component"
  - "10-02: Hero asymmetric layout uses CSS logical grid (3fr/2fr) not absolute positioning — RTL-safe without manual dir checks"

patterns-established:
  - "Homepage section pattern: 'use client' component with useTranslations hook consuming next-intl namespaces"
  - "Brutalist section header pattern: pink overline label (tracking-[0.3em] uppercase) + large font-black h2"
  - "Background decoration: large faded number (text-brand/[0.05-0.08]) positioned absolutely with pointer-events-none"

requirements-completed: [DSGN-01, DSGN-04, DSGN-05]

# Metrics
duration: 13min
completed: 2026-04-01
---

# Phase 10 Plan 02: Brutalist Homepage Rebuild Summary

**Full-viewport parallax hero + staggered ScrollReveal features + DraggableCard horizontal showcase + magnetic CTAs composing a scroll-driven brutalist homepage**

## Performance

- **Duration:** 13 min
- **Started:** 2026-04-01T09:28:05Z
- **Completed:** 2026-04-01T09:41:25Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- 5 new homepage section components built using the Phase 10-01 effects library (ParallaxLayer, ScrollReveal, MagneticWrapper, HorizontalScrollSection, DraggableCard)
- DraggableCard wrapping in HorizontalShowcase satisfies DSGN-01 "draggable UI element on key pages" — 5 showcase cards are draggable (±60px, elastic 0.3) on desktop, static on mobile
- Full bilingual i18n coverage: home.hero, home.features, home.showcase, home.cta added to both en.json and he.json with authentic Hebrew copy
- Next.js build passes cleanly: `✓ Compiled successfully`, 79/79 static pages generated

## Task Commits

Each task was committed atomically:

1. **Task 1: Build homepage hero, features, horizontal showcase with draggable cards, and CTA sections** - `023e5b2` (feat)
2. **Task 2: Compose homepage from new sections and verify integration** - `11ad1a1` (feat)

**Plan metadata:** (see final commit below)

## Files Created/Modified

- `src/components/home/HeroSection.tsx` — Full-viewport parallax hero, asymmetric 3fr/2fr grid, magnetic CTA buttons, no text animation (locked decision)
- `src/components/home/FeaturesShowcase.tsx` — 5 staggered ScrollReveal feature cards, background number decoration, animated left-border accent on hover
- `src/components/home/HorizontalShowcase.tsx` — HorizontalScrollSection composing 5 DraggableCard showcase items (DSGN-01)
- `src/components/home/CTASection.tsx` — Magnetic CTA pair, radial pink glow background, top-edge gradient accent
- `src/components/home/ScrollProgressBar.tsx` — Fixed 2px pink bar, useScroll scrollYProgress, origin-[0%] for RTL compatibility
- `src/app/[locale]/page.tsx` — Rewritten to compose all 5 sections + InstagramGrid wrapped in ScrollReveal
- `messages/en.json` — Added home.hero, home.features (5 items), home.showcase (5 cards), home.cta
- `messages/he.json` — Added all same namespaces with natural Hebrew translations

## Decisions Made

- **page.tsx server component pattern:** All Framer Motion code is in "use client" children. page.tsx has zero animation code — no hydration mismatch risk.
- **DraggableCard drag constraints:** ±60px in all directions with dragElastic 0.3 — enough range to feel playful, not enough to break the horizontal scroll layout.
- **i18n indexed keys:** `items.0.title` pattern used instead of `t.raw()` — cleaner TypeScript, no casting required.
- **InstagramGrid in ScrollReveal:** Existing RSC component wrapped with ScrollReveal at page level instead of modifying the component itself.
- **Hero grid:** CSS logical grid `3fr 2fr` — RTL-safe asymmetric layout without manual `dir` checks or absolute positioning.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None — TypeScript compiled cleanly on first pass, Next.js build succeeded without errors.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Homepage is now the primary brutalist showcase — ready for per-page polish in Plans 10-03 through 10-05
- All 5 effects library components are exercised on the homepage
- DSGN-01 (draggable element), DSGN-04 (scroll-driven animations), DSGN-05 (parallax) all satisfied by this plan

---
*Phase: 10-brutalist-design-polish-performance*
*Completed: 2026-04-01*
