---
phase: 05-quiz-funnels
plan: 03
subsystem: ui
tags: [quiz, next-intl, framer-motion, drizzle, zod, api-routes, lead-capture]

# Dependency graph
requires:
  - phase: 05-01-quiz-engine
    provides: QuizEngine component, QuizState/Question/QuestionOption types, localStorage save/restore
  - phase: 05-02-quiz-content
    provides: challengeQuestions, calculateResult, branching logic

provides:
  - /quiz entry page: two equal cards (30-day challenge + private workshop) with locale-aware routing
  - /quiz/challenge page: full 11-step quiz flow with per-step event tracking and lead submission
  - POST /api/quiz/events: inserts step tracking events to quiz_events table (unauthenticated)
  - POST /api/quiz/leads: inserts completed lead to quiz_leads table (idempotent, unauthenticated)
  - QuizEngine: onStepAnswer optional prop for per-step event callbacks

affects:
  - 05-04-results: results page receives sessionId via query param after lead submission
  - 05-05-analytics: event tracking infrastructure is live

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server component quiz entry page: setRequestLocale + getTranslations, no use client"
    - "Client component quiz flow: useLocale() from next-intl, useRouter from @/i18n/navigation"
    - "Fire-and-forget tracking: fetch(...).catch(() => {}) pattern — never blocks UI"
    - "Idempotent lead API: unique constraint violation (23505) returns ok:true — safe to retry"
    - "Zod validation in API routes: safeParse with first issue message in error response"

key-files:
  created:
    - src/app/[locale]/(app)/quiz/page.tsx
    - src/app/[locale]/(app)/quiz/challenge/page.tsx
    - src/app/api/quiz/events/route.ts
    - src/app/api/quiz/leads/route.ts
  modified:
    - src/components/quiz/QuizEngine.tsx

key-decisions:
  - "05-03: QuizEngine gained onStepAnswer optional prop — plan called for per-step tracking but original interface had no hook; added as backward-compatible optional callback"
  - "05-03: QuizEngine Question.type widened to include text-inputs — challenge-questions.ts declares the type but original QuizEngine type omitted it; fixed for type safety"
  - "05-03: challenge/page.tsx is 'use client' at top level (not a Server Component wrapper) — the entire page needs hooks (useRouter, useLocale); no benefit to wrapping in a server shell"
  - "05-03: Lead submission non-blocking — if POST /api/quiz/leads fails the user still reaches results page"

requirements-completed: [QUIZ-01, QUIZ-02, QUIZ-07]

# Metrics
duration: 4min
completed: 2026-04-01
---

# Phase 05 Plan 03: Quiz Entry Page + Challenge Flow Summary

**Quiz entry page at /quiz with two equal option cards, full 11-step challenge quiz flow with per-step tracking, and unauthenticated API routes for events and lead capture**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-01T21:26:05Z
- **Completed:** 2026-04-01T21:30:48Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Built /quiz entry page as a server component with two equal brutalist cards (challenge + workshop) using locale-aware Link from @/i18n/navigation; styled with bg-neutral-900 / border-neutral-800 / hover:border-brand
- Built /quiz/challenge as a client-only page (ChallengeQuizFlow) that renders QuizEngine with challengeQuestions, fires fire-and-forget POST to /api/quiz/events on each step, POSTs lead data on contact submit, clears localStorage, then router.push to results?session=…
- Created POST /api/quiz/events: zod schema (sessionId, quizType, questionId, eventType enum, answer optional), inserts to quiz_events, returns { ok: true }
- Created POST /api/quiz/leads: zod schema with email validation + E.164 phone regex, inserts to quiz_leads, idempotent on duplicate sessionId (23505), returns { ok: true, sessionId }

## Task Commits

1. **Task 1: Quiz entry page + challenge quiz flow page** — `9f5a7c4` (feat)
2. **Task 2: Quiz API routes (events + leads)** — `f7f94f8` (feat)

## Files Created/Modified

- `src/app/[locale]/(app)/quiz/page.tsx` — Server component entry page, two card layout, link to /quiz/challenge and /quiz/workshop
- `src/app/[locale]/(app)/quiz/challenge/page.tsx` — Client component, ChallengeQuizFlow, per-step tracking, lead submit, results redirect
- `src/app/api/quiz/events/route.ts` — POST, zod validated, inserts to quiz_events
- `src/app/api/quiz/leads/route.ts` — POST, zod validated, idempotent insert to quiz_leads
- `src/components/quiz/QuizEngine.tsx` — Added onStepAnswer optional prop; widened Question.type to include text-inputs

## Decisions Made

- QuizEngine got an `onStepAnswer` optional prop — the plan required per-step event tracking but the component had no callback hook; added as backward-compatible optional prop and called it in `handleAnswer`
- `Question.type` widened to include `"text-inputs"` — challenge-questions.ts already uses this type for workshop-style steps; QuizEngine's original type union was incomplete
- `/quiz/challenge/page.tsx` is fully `"use client"` — requires useRouter + useLocale, no value in server wrapper
- Lead submission is non-blocking — on fetch error the quiz flow continues to results page; data integrity relies on localStorage backup if retry is needed

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Type Mismatch] QuizEngine Question.type missing text-inputs**
- **Found during:** Task 1 — TypeScript error when passing challengeQuestions to QuizEngine
- **Issue:** challenge-questions.ts declares `type: 'text-inputs'` but QuizEngine.tsx only accepted `"single-choice" | "city-select" | "contact"`
- **Fix:** Added `"text-inputs"` to the union in QuizEngine.tsx
- **Files modified:** src/components/quiz/QuizEngine.tsx
- **Commit:** 9f5a7c4

**2. [Rule 2 - Missing Functionality] QuizEngine had no per-step callback hook**
- **Found during:** Task 1 — plan spec requires firing POST /api/quiz/events on each step answer, but QuizEngine had no onStepAnswer prop
- **Fix:** Added optional `onStepAnswer?: (sessionId, questionId, answerId) => void` to QuizEngineProps; called in handleAnswer after dispatch
- **Files modified:** src/components/quiz/QuizEngine.tsx
- **Commit:** 9f5a7c4

## Issues Encountered

- None beyond the two auto-fixed type/interface issues above.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Full quiz flow is live end-to-end: /quiz → /quiz/challenge → 11 steps → lead saved → /quiz/challenge/results?session=…
- Events tracked per step in quiz_events table; leads captured in quiz_leads table
- Plan 05-05 can add admin/analytics views; plan 05-04 (results page) is already complete

## Self-Check: PASSED

- FOUND: src/app/[locale]/(app)/quiz/page.tsx
- FOUND: src/app/[locale]/(app)/quiz/challenge/page.tsx
- FOUND: src/app/api/quiz/events/route.ts
- FOUND: src/app/api/quiz/leads/route.ts
- FOUND: commit 9f5a7c4 (Task 1)
- FOUND: commit f7f94f8 (Task 2)
- TypeScript: npx tsc --noEmit — PASSED (zero errors)

---
*Phase: 05-quiz-funnels*
*Completed: 2026-04-01*
