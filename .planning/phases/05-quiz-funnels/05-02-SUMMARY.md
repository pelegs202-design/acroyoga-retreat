---
phase: 05-quiz-funnels
plan: 02
subsystem: ui
tags: [quiz, typescript, bilingual, archetype, radar-chart, branching-logic]

requires:
  - phase: 05-01-quiz-engine (parallel)
    provides: QuizEngine renderer component that consumes these types and data

provides:
  - 13-entry challenge quiz question schema with bilingual text and option-level branching
  - Branching logic helpers: getNextQuestion, getTotalSteps, getQuestionById
  - 4-archetype result calculator with radar data, fears, strengths, and personalized fear-addressing
  - 4-step workshop inquiry quiz schema

affects:
  - 05-quiz-funnels (plans 03, 04, 05 — all UI plans need this content)
  - Any future quiz analytics or A/B testing that references question IDs

tech-stack:
  added: []
  patterns:
    - "Declarative question schema with option-level nextQuestionId overrides for branching"
    - "Parallel type re-declaration pattern — types declared alongside data so UI plans can import without circular dependency on QuizEngine"
    - "Archetype scoring as pure function — answers map to weighted integer scores, ties broken by priority array"
    - "buildRadar factory function — DRY construction of 5-axis radar objects from raw number arrays"

key-files:
  created:
    - src/lib/quiz/challenge-questions.ts
    - src/lib/quiz/branching-logic.ts
    - src/lib/quiz/result-calculator.ts
    - src/lib/quiz/workshop-questions.ts
  modified: []

key-decisions:
  - "05-02: Question/QuestionOption types re-declared in challenge-questions.ts — plans 05-01 and 05-02 execute in parallel so direct import from QuizEngine.tsx is not available; shapes are identical for drop-in compatibility"
  - "05-02: text-inputs workshop step uses options[] array to carry field metadata — reuses existing Question schema without adding a new fields property; UI layer interprets each option as a form field descriptor"
  - "05-02: Tie-breaking priority Explorer > Artist > Connector > Athlete — favours beginner-friendly archetypes on equal scores; Explorer is the most welcoming label for first-timers"
  - "05-02: workshopQuestions has 4 steps (group-type, group-details, workshop-details, workshop-contact) — plan spec shows 3 steps in the header but 4 in the task detail; task detail is authoritative"

patterns-established:
  - "Quiz content files: pure TypeScript data/logic modules with no React imports — clean separation from UI"
  - "Bilingual content: every user-visible string is { en: string; he: string } — no English-only fallbacks"

requirements-completed: [QUIZ-01, QUIZ-02, QUIZ-05, QUIZ-06]

duration: 4min
completed: 2026-04-01
---

# Phase 05 Plan 02: Quiz Content and Logic Summary

**13-question branching challenge quiz with 4-archetype result calculator, 5-axis radar chart data, personalized fear-addressing, and 4-step workshop inquiry — all bilingual Hebrew/English, zero UI code**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-01T20:58:39Z
- **Completed:** 2026-04-01T21:02:45Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Challenge quiz: 13 question entries (11 logical steps + 3 branching Q3 variants), Q2 experience level branches to different question sets for beginners/intermediate/advanced
- Branching logic: getNextQuestion resolves option-level overrides before defaultNextId; getTotalSteps walks the answer graph for progress bar denominator
- Result calculator: 4 archetypes (Explorer/Athlete/Connector/Artist) with weighted scoring, tie-breaking, 5-axis radar data (Strength/Balance/Trust/Flexibility/Coordination), archetype fears and strengths, plus answer-specific fear personalization
- Workshop inquiry: 4 steps covering group type, group size, event details (dates + special requests), and contact

## Task Commits

1. **Task 1: Challenge questions schema + branching logic** - `a8344f6` (feat)
2. **Task 2: Result calculator + workshop questions** - `91a8696` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/lib/quiz/challenge-questions.ts` — 410 lines: 13 question definitions with bilingual text, branching option IDs, QuestionOption/Question types
- `src/lib/quiz/branching-logic.ts` — 84 lines: getNextQuestion, getTotalSteps, getQuestionById helpers
- `src/lib/quiz/result-calculator.ts` — 283 lines: ResultArchetype type, 4 archetype definitions, calculateResult scoring, getPersonalizedFears
- `src/lib/quiz/workshop-questions.ts` — 123 lines: 4-step workshop inquiry schema

## Decisions Made

- Question/QuestionOption types re-declared in challenge-questions.ts — plans 05-01 and 05-02 run in parallel, direct import from QuizEngine would create a dependency that doesn't exist yet; shapes are identical for zero-friction future consolidation
- workshopQuestions has 4 entries — plan header says "3-step" but task detail lists 4 distinct question IDs; task detail is authoritative
- Tie-breaking order Explorer > Artist > Connector > Athlete — Explorer is the most welcoming label, appropriate when a first-timer produces a tied score
- text-inputs workshop step uses options[] to carry field metadata (field id + label) — avoids adding a non-standard fields property to the Question schema

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All quiz content and logic is complete and exportable
- Plans 05-03 (QuizPage UI), 05-04 (ResultPage UI), and 05-05 (tracking/leads) can import from these four modules
- No blockers

---
*Phase: 05-quiz-funnels*
*Completed: 2026-04-01*
