---
phase: 10-brutalist-design-polish-performance
plan: "04"
subsystem: design/ui
tags: [brutalist, city-pages, quiz, scroll-reveal, card-hover, magnetic-wrapper]
dependency_graph:
  requires: ["10-01", "10-02", "10-03"]
  provides: ["brutalist city landing pages", "brutalist quiz flow and results page"]
  affects: ["src/components/city", "src/components/quiz"]
tech_stack:
  added: []
  patterns:
    - "ScrollReveal wrapping for all public page sections"
    - "card-hover CSS class on interactive cards"
    - "btn-press CSS class on CTA links and buttons"
    - "MagneticWrapper on primary CTA in quiz results"
    - "border-s-4 border-brand left-border on FAQ accordions"
key_files:
  created: []
  modified:
    - src/components/city/CityHero.tsx
    - src/components/city/CityFAQ.tsx
    - src/components/city/CityJamList.tsx
    - src/components/city/CityStats.tsx
    - src/app/[locale]/(public)/cities/[city]/page.tsx
    - src/components/quiz/QuizCard.tsx
    - src/components/quiz/QuizResultsPage.tsx
decisions:
  - "10-04: CityHero wraps itself in ScrollReveal — avoids double-wrapping from page.tsx since component is already leaf-level"
  - "10-04: CityFAQ wraps itself in ScrollReveal — consistent with CityHero pattern; page.tsx delegates scroll-reveal responsibility to the components"
  - "10-04: QuizCard selected prop is backward-compatible optional — QuizEngine auto-advances on selection so persistent selected state is not needed; added for future multi-select quiz type support"
  - "10-04: QuizProgressBar already had bg-brand fill + Framer Motion spring animation — no changes needed"
  - "10-04: MagneticWrapper added only to main checkout CTA in quiz results — magnetic effect is high-value on the primary conversion button"
metrics:
  duration: "3 min"
  completed: "2026-04-01"
  tasks_completed: 2
  files_modified: 7
---

# Phase 10 Plan 04: City Pages + Quiz Flow Brutalist Polish Summary

Brutalist design polish applied to city landing pages (Tel Aviv + Kfar Saba) and quiz flow pages (challenge quiz cards + 8-section results page) — completing cohesive brand aesthetic across all public conversion surfaces.

## What Was Built

### Task 1: City Landing Pages Brutalist Polish

**CityHero.tsx** — Added `ScrollReveal` entrance animation wrapper, pink accent bar (`h-1 w-20 bg-brand`) under the main heading, and `btn-press` class on both CTA links for press feedback.

**CityFAQ.tsx** — Added `ScrollReveal` wrapper with `delay={0.1}`, pink accent bar under section heading, brutalist left-border treatment (`border-s-4 border-brand`) on each FAQ `details` element, `group-open:text-brand` on `h3` summary text for open-state pink highlight.

**CityJamList.tsx** — Added `card-hover` class to jam preview cards for scale + pink glow hover effect.

**CityStats.tsx** — Added `card-hover` class to stat count cards.

**city/page.tsx** — Imported `ScrollReveal`, wrapped `CityJamList` and `CityStats` in `ScrollReveal` with staggered delays (0.05s, 0.1s). CityHero and CityFAQ wrap themselves internally. All JSON-LD structured data (LocalBusiness + FAQPage schemas), page metadata, and hreflang alternates preserved unchanged.

### Task 2: Quiz Flow Brutalist Polish

**QuizCard.tsx** — Rewrote with `card-hover btn-press` combined classes, `border-2` base with `border-brand` on hover, selected state with `bg-brand/10 border-brand text-brand`, `aria-pressed` accessibility attribute. Backward-compatible optional `selected` prop defaults to `false`.

**QuizResultsPage.tsx** — Full scroll-reveal treatment: all 8 sections (archetype, radar chart, strengths, fears, testimonials, pricing, FAQ, share) wrapped in `ScrollReveal`. Section headings upgraded to `text-3xl font-black`. Pink accent bars (`h-1 w-16 bg-brand`) added under all section headings. `card-hover` applied to fear items, testimonial cards, and pricing card. `MagneticWrapper` + `btn-press` on main checkout CTA button. `btn-press` on share button. FAQ accordion upgraded to brutalist `border-s-4 border-brand` left-border with `text-brand` open state. All analytics tracking, share URL logic, and pricing values preserved.

**QuizProgressBar.tsx** — Already used `bg-[#F472B6]` fill and Framer Motion spring animation — no changes needed.

**challenge/page.tsx** — Delegates entirely to QuizEngine which uses QuizCard — no page-level structural changes needed.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] `src/components/city/CityHero.tsx` exists and imports ScrollReveal
- [x] `src/app/[locale]/(public)/cities/[city]/page.tsx` contains JSON-LD schema output (`buildFAQSchema`, `buildLocalBusinessSchema`) and ScrollReveal import
- [x] `src/components/city/CityFAQ.tsx` has `border-s-4 border-brand` and `group-open:text-brand`
- [x] `src/components/quiz/QuizCard.tsx` has `card-hover` and `btn-press` classes
- [x] `src/components/quiz/QuizResultsPage.tsx` imports ScrollReveal and MagneticWrapper
- [x] `npx tsc --noEmit` passes (no TypeScript errors)
- [x] Task 1 commit: `ec43720`
- [x] Task 2 commit: `2969d25`

## Self-Check: PASSED
