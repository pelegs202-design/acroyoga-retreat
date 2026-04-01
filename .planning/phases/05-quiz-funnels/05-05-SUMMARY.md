---
phase: 05-quiz-funnels
plan: 05
subsystem: ui
tags: [quiz, workshop, framer-motion, resend, email, ga4, meta-pixel, analytics, i18n, bilingual]

# Dependency graph
requires:
  - phase: 05-01-quiz-engine
    provides: QuizEngine, QuizCard, QuizProgressBar components; quiz_leads table; quiz-analytics helpers
  - phase: 05-02-quiz-content
    provides: workshopQuestions (4-step workshop inquiry)
  - phase: 05-03-quiz-flow
    provides: QuizEngine with text-inputs type support; challenge quiz flow patterns

provides:
  - WorkshopQuizPage: "use client" 4-step inquiry flow using QuizEngine + workshopQuestions
  - WorkshopConfirmationPage: server component showing Request Received message + WorkshopAdvantages
  - WorkshopAdvantages component: 8-card stagger reveal grid (Framer Motion), bilingual, locale-aware
  - POST /api/quiz/workshop: zod validation, quizLeads DB insert, Resend email notification to owner
  - QuizEngine TextInputsStep: textarea-based sub-component for text-inputs question type
  - quiz.workshop i18n section in en.json + he.json (title, confirmation, advantages.items array)
  - GA4 script tags in locale layout (G-BCPEPDR543, afterInteractive strategy)
  - Meta Pixel script tags in locale layout (1646755465782002, afterInteractive strategy)

affects:
  - Phase 6 (payment): both quiz funnels complete, analytics tracking active, conversion-ready CTA
  - Phase 7 (WhatsApp): workshop route has TODO stub for WhatsApp notification

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Workshop quiz flow mirrors challenge flow pattern (useRouter + useLocale + QuizEngine)"
    - "Non-blocking email: resend.emails.send().catch() — lead saved first, email failure non-blocking"
    - "TextInputsStep inline component in QuizEngine — textarea fields derived from question.options[] metadata"
    - "GA4 + Meta Pixel: Script from next/script with strategy='afterInteractive' — defers until page interactive"
    - "WorkshopAdvantages: t.raw('items') for i18n array of objects — typed cast to AdvantageItem[]"

key-files:
  created:
    - src/app/[locale]/(app)/quiz/workshop/page.tsx
    - src/app/[locale]/(app)/quiz/workshop/confirmation/page.tsx
    - src/app/api/quiz/workshop/route.ts
    - src/components/quiz/WorkshopAdvantages.tsx
  modified:
    - src/components/quiz/QuizEngine.tsx
    - src/app/[locale]/layout.tsx
    - messages/en.json
    - messages/he.json

key-decisions:
  - "05-05: TextInputsStep added inline to QuizEngine — small enough to colocate; avoids extra file for single-use sub-component"
  - "05-05: Workshop confirmation page shows advantages immediately (no loader) — direct conversion; inquiry is already submitted"
  - "05-05: Resend email failure is non-blocking — DB insert happens first; email error is logged but does not fail the API response"
  - "05-05: GA4 + Meta Pixel use strategy='afterInteractive' — best practice for analytics; does not block page render"
  - "05-05: WorkshopAdvantages uses t.raw('items') cast to AdvantageItem[] — avoids next-intl array-of-objects type complexity"

patterns-established:
  - "Workshop API route pattern: validate (zod) → DB insert → email (non-blocking) → TODO Phase 7 WhatsApp"
  - "Analytics scripts: always strategy='afterInteractive' in locale layout, not per-page"

requirements-completed: [QUIZ-05, QUIZ-03, QUIZ-04]

# Metrics
duration: 12min
completed: 2026-04-01
---

# Phase 05 Plan 05: Workshop Quiz + Analytics Summary

**3-step workshop inquiry quiz with advantages confirmation page, POST /api/quiz/workshop with Resend email notification, TextInputsStep renderer, and GA4 + Meta Pixel script tags in the locale layout**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-01T22:05:54Z
- **Completed:** 2026-04-01T22:18:00Z
- **Tasks:** 1 of 2 complete (Task 2 is human-verify checkpoint)
- **Files modified:** 8

## Accomplishments

- Built WorkshopQuizFlow client component mirroring challenge flow: QuizEngine + workshopQuestions, onComplete POSTs to /api/quiz/workshop, clears localStorage, redirects to /quiz/workshop/confirmation
- Built WorkshopConfirmationPage (server component): "Request Received!" header + WorkshopAdvantages component with 8 stagger-animated cards in 2-col grid
- Built POST /api/quiz/workshop: zod schema validates group-type, group-details (required), preferred-dates, special-requests (optional); inserts to quizLeads table; sends owner email via Resend (non-blocking); Phase 7 WhatsApp stub
- Extended QuizEngine with TextInputsStep component handling text-inputs question type: textarea for each option-derived field, Continue button advances to next step
- Added GA4 (G-BCPEPDR543) and Meta Pixel (1646755465782002) Script tags with strategy='afterInteractive' to locale layout

## Task Commits

1. **Task 1: Workshop quiz + API + advantages page + analytics scripts** - `c2e7692` (feat)

_Task 2 (human-verify checkpoint) pending human verification_

## Files Created/Modified

- `src/app/[locale]/(app)/quiz/workshop/page.tsx` — WorkshopQuizFlow client component + page shell
- `src/app/[locale]/(app)/quiz/workshop/confirmation/page.tsx` — server component, confirmation message + WorkshopAdvantages
- `src/app/api/quiz/workshop/route.ts` — POST endpoint: zod validation, DB insert, Resend email, Phase 7 stub
- `src/components/quiz/WorkshopAdvantages.tsx` — 8-card stagger grid, Framer Motion, bilingual via t.raw()
- `src/components/quiz/QuizEngine.tsx` — TextInputsStep added for text-inputs question type rendering
- `src/app/[locale]/layout.tsx` — GA4 + Meta Pixel Script tags added
- `messages/en.json` — quiz.workshop section added (title, confirmation, advantages.items)
- `messages/he.json` — quiz.workshop section added in Hebrew

## Decisions Made

- TextInputsStep colocated inline in QuizEngine (not a separate file) — small, single-use, avoids extra import
- Workshop confirmation shows advantages immediately with no loader — no results computation; inquiry already sent
- Resend email failure is non-blocking — DB insert is the source of truth; email is notification only
- GA4 + Meta Pixel use `strategy="afterInteractive"` — defers analytics until page is interactive, no render blocking
- `t.raw("items")` for advantages array cast to `AdvantageItem[]` — cleanest way to consume next-intl array-of-objects

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added TextInputsStep renderer to QuizEngine**
- **Found during:** Task 1 (Workshop quiz page implementation)
- **Issue:** QuizEngine supported `text-inputs` in the type union but had no renderer — workshop-details step would render nothing
- **Fix:** Added inline `TextInputsStep` component with `useState` for textarea fields, derived from `question.options[]` metadata per the 05-02 pattern
- **Files modified:** `src/components/quiz/QuizEngine.tsx`
- **Verification:** TypeScript passes; component renders textarea for each field in workshop-details step
- **Committed in:** `c2e7692` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical renderer)
**Impact on plan:** Required for correctness — workshop quiz would stall on step 3 without it.

## Issues Encountered

None.

## User Setup Required

None — RESEND_API_KEY and OWNER_EMAIL env vars are already documented from Phase 4 (jam RSVP emails). No new external service configuration required.

## Next Phase Readiness

- Both quiz funnels are feature-complete pending human verification (Task 2 checkpoint)
- Phase 5 closes after human verifies end-to-end flows in both languages
- Phase 6 (payment): CTA button links to `#coming-soon` — replace with payment URL when ready
- Phase 7 (WhatsApp): workshop route has `// TODO: Phase 7 — WhatsApp notification` comment

## Self-Check: PASSED

- FOUND: src/app/[locale]/(app)/quiz/workshop/page.tsx
- FOUND: src/app/[locale]/(app)/quiz/workshop/confirmation/page.tsx
- FOUND: src/app/api/quiz/workshop/route.ts
- FOUND: src/components/quiz/WorkshopAdvantages.tsx
- FOUND: commit c2e7692 (Task 1)
- TypeScript: `npx tsc --noEmit` — PASSED (zero errors)

---
*Phase: 05-quiz-funnels*
*Completed: 2026-04-01*
