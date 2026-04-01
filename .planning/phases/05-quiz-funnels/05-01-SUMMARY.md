---
phase: 05-quiz-funnels
plan: 01
subsystem: ui
tags: [framer-motion, recharts, react-hook-form, zod, drizzle, neon, quiz, analytics, ga4, meta-pixel]

# Dependency graph
requires:
  - phase: 01-foundation-auth
    provides: Better Auth, Drizzle/Neon DB connection, Next.js 16 app router scaffold
provides:
  - framer-motion and recharts installed and importable
  - quiz_leads and quiz_events Drizzle table definitions pushed to Neon
  - QuizEngine component with useReducer state machine, AnimatePresence directional slides, RTL support
  - QuizCard visual option button component with hover/tap animation
  - QuizProgressBar animated step indicator
  - QuizContactStep with react-hook-form + zod validation (name/email/international phone)
  - quiz-analytics.ts with trackQuizStart, trackQuizStep, trackQuizComplete (GA4 + Meta Pixel)
  - Exported QuizState, Question, QuestionOption types for Plan 05-02/05-03

affects: [05-02-challenge-quiz, 05-03-workshop-quiz]

# Tech tracking
tech-stack:
  added: [framer-motion@12.38.0, recharts@3.8.1]
  patterns:
    - useReducer state machine for multi-step wizard flows
    - AnimatePresence with custom direction prop for directional slide transitions
    - RTL-aware direction: document.documentElement.dir detection, multiply dir by -1 for RTL
    - quiz-analytics helpers: typeof window guards prevent SSR errors
    - crypto.randomUUID() for session ID generation (no nanoid needed)

key-files:
  created:
    - src/lib/quiz/quiz-analytics.ts
    - src/components/quiz/QuizEngine.tsx
    - src/components/quiz/QuizCard.tsx
    - src/components/quiz/QuizProgressBar.tsx
    - src/components/quiz/QuizContactStep.tsx
  modified:
    - src/lib/db/schema.ts
    - package.json
    - package-lock.json

key-decisions:
  - "05-01: Quiz table IDs use text PK (not serial) — consistent with all other schema tables in this project"
  - "05-01: QuestionOption.label uses { en: string; he: string } inline bilingual object — avoids next-intl dependency inside quiz components"
  - "05-01: RTL slide direction derived from document.documentElement.dir (not locale prop) — actual DOM dir attribute is authoritative at render time"
  - "05-01: drizzle/migration folder is gitignored — schema.ts is canonical source of truth, push applied directly to Neon"
  - "05-01: fbq and gtag declared with global function overloads in analytics file — avoids any cast while preserving type safety"

patterns-established:
  - "Quiz components all 'use client' — Framer Motion and interactive state require client rendering"
  - "Analytics helpers always check typeof window !== 'undefined' and typeof gtag/fbq === 'function' before firing"
  - "QuizEngine exports types (QuizState, Question, QuestionOption) — future quiz definition files import from here"

requirements-completed: [QUIZ-06, QUIZ-07]

# Metrics
duration: 4min
completed: 2026-04-02
---

# Phase 05 Plan 01: Quiz Funnels Infrastructure Summary

**Framer Motion quiz shell with useReducer state machine, bilingual QuizCard/ContactStep components, quiz_leads/quiz_events Neon tables, and GA4 + Meta Pixel analytics helpers**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-02T00:18:38Z
- **Completed:** 2026-04-02T00:22:40Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Installed framer-motion@12.38.0 and recharts@3.8.1; generated and pushed Drizzle migration 0002 adding quiz_leads and quiz_events tables to Neon
- Built QuizEngine with useReducer (ANSWER/BACK/SET_CONTACT/RESTORE/RESET actions), AnimatePresence directional slide transitions, RTL awareness, and localStorage save/restore
- Created QuizCard (motion.button with whileHover/whileTap), QuizProgressBar (animated spring width), QuizContactStep (react-hook-form + zod, international phone validation), and quiz-analytics.ts (trackQuizStart/trackQuizStep/trackQuizComplete with SSR guards)

## Task Commits

1. **Task 1: Install deps + DB schema + analytics helpers** - `eec86d7` (feat)
2. **Task 2: QuizEngine + QuizCard + QuizProgressBar + QuizContactStep** - `3a6e663` (feat)

**Plan metadata:** _(final docs commit below)_

## Files Created/Modified

- `src/lib/db/schema.ts` - Added quizLeads and quizEvents table exports before relations block
- `src/lib/quiz/quiz-analytics.ts` - trackQuizStart, trackQuizStep, trackQuizComplete with GA4 + Meta Pixel + SSR guards
- `src/components/quiz/QuizEngine.tsx` - Core quiz shell: useReducer, AnimatePresence, RTL, localStorage, exported types
- `src/components/quiz/QuizCard.tsx` - Visual option card: motion.button, hot-pink hover border, locale-aware label
- `src/components/quiz/QuizProgressBar.tsx` - Animated step bar: spring width, Step X of Y text
- `src/components/quiz/QuizContactStep.tsx` - Contact form: react-hook-form, zod, name/email/phone with international regex
- `package.json` - Added framer-motion, recharts

## Decisions Made

- Quiz table IDs use text PK — consistent with all other schema tables in this project
- QuestionOption.label uses inline `{ en: string; he: string }` bilingual object — avoids next-intl dependency inside reusable quiz components
- RTL slide direction derived from `document.documentElement.dir` at render time — the actual DOM dir attribute is authoritative (not locale prop)
- drizzle migration folder is gitignored — schema.ts is canonical, push applied directly to Neon
- fbq and gtag declared as global function overloads in analytics file — avoids `any` cast while keeping type safety

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `npx drizzle-kit push` initially failed because the DATABASE_URL env var was not loaded from .env.local automatically. Fixed by passing the env var explicitly on the command line (Rule 3 — blocking). No file changes required.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All quiz building blocks are ready for Plan 05-02 (Challenge Quiz page) and 05-03 (Workshop Quiz page)
- QuizState, Question, and QuestionOption types are exported from QuizEngine.tsx — quiz definition files in 05-02/05-03 should import from there
- GA4 and Meta Pixel script tags still need to be added to the Next.js layout (planned for a later phase)

## Self-Check: PASSED

- FOUND: src/lib/db/schema.ts (quizLeads + quizEvents)
- FOUND: src/lib/quiz/quiz-analytics.ts
- FOUND: src/components/quiz/QuizEngine.tsx
- FOUND: src/components/quiz/QuizCard.tsx
- FOUND: src/components/quiz/QuizProgressBar.tsx
- FOUND: src/components/quiz/QuizContactStep.tsx
- FOUND: commit eec86d7 (Task 1)
- FOUND: commit 3a6e663 (Task 2)
- TypeScript: `npx tsc --noEmit` — PASSED (zero errors)

---
*Phase: 05-quiz-funnels*
*Completed: 2026-04-02*
