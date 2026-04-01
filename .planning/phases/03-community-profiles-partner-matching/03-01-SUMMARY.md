---
phase: 03-community-profiles-partner-matching
plan: "01"
subsystem: database-schema
tags: [schema, drizzle, i18n, skills-data, migration]
dependency_graph:
  requires: []
  provides:
    - user.bio column (text, nullable)
    - user.skills column (text[], default empty array)
    - reviews table with FK indexes
    - SKILL_CATEGORIES and ALL_MOVES static constants
    - i18n keys: profile, members, review namespaces in en.json + he.json
  affects:
    - 03-02-PLAN.md (profile edit form — needs bio/skills columns)
    - 03-03-PLAN.md (members directory — needs members i18n keys)
    - 03-04-PLAN.md (review form — needs reviews table + review i18n keys)
    - 03-05-PLAN.md (profile page — needs all of the above)
tech_stack:
  added:
    - drizzle-kit generate (migration tooling used)
    - tsx (used for verification of skills-data.ts exports)
  patterns:
    - Drizzle pgTable with sql`` raw default for PostgreSQL array literal
    - Relations defined after all table declarations to avoid forward-reference TS errors
    - Static skills constant (not DB-stored) with flatMap for ALL_MOVES
key_files:
  created:
    - src/lib/skills-data.ts
    - drizzle/0000_ambitious_black_crow.sql (gitignored, on disk only)
  modified:
    - src/lib/db/schema.ts
    - messages/en.json
    - messages/he.json
decisions:
  - "03-01: Moved all Relations definitions below all table declarations to eliminate TypeScript forward-reference errors on reviews table"
  - "03-01: skills text[] default uses sql template tag with '{}'::text[] PostgreSQL literal — required for Drizzle to emit correct DEFAULT in migration SQL"
  - "03-01: SKILL_CATEGORIES is static TypeScript constant (not DB table) — user.skills stores move name strings from this list as a text array"
  - "03-01: Drizzle migration 0000 is the initial full-schema migration (DB was blank, no prior migration existed); gitignored per project config"
metrics:
  duration: 3 min
  completed_date: "2026-04-01"
  tasks: 3
  files: 5
---

# Phase 03 Plan 01: Schema Foundation, Skills Data, and i18n Keys Summary

**One-liner:** PostgreSQL schema extended with bio/skills/reviews, static 54-move skills taxonomy created, and all Phase 3 i18n keys added to both locales.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extend user schema + create reviews table + generate migration | faa46a4 | src/lib/db/schema.ts, drizzle/0000_ambitious_black_crow.sql |
| 2 | Create static acroyoga skills data | f598f3c | src/lib/skills-data.ts |
| 3 | Add Phase 3 i18n translation keys (en + he) | 8312537 | messages/en.json, messages/he.json |

## Verification Results

1. `npx drizzle-kit generate` — produced `drizzle/0000_ambitious_black_crow.sql` with bio, skills columns and reviews table with FK constraints and indexes
2. `npx tsc --noEmit` — PASS (no TypeScript errors across entire project)
3. `node -e "JSON.parse(...)"` on both JSON files — PASS; en.json: profile(18) members(9) review(6), he.json: matching counts
4. `SKILL_CATEGORIES.length === 7`, `ALL_MOVES.length === 54` — PASS

## Decisions Made

- Moved all `relations()` definitions after all table declarations to eliminate TypeScript forward-reference errors when `userRelations` references `reviews`
- `skills` column default uses `sql` template tag: `sql\`'{}'::text[]\`` — required for Drizzle to emit the PostgreSQL array literal correctly in migration SQL
- `SKILL_CATEGORIES` is a static TypeScript constant (not a DB table) — user selections are stored as move name strings in `user.skills text[]`
- Drizzle migration `0000_ambitious_black_crow.sql` is the initial full-schema migration (DB was blank, no prior migrations existed). File is gitignored per project `.gitignore`.
- `npx drizzle-kit migrate` returned DB URL error (expected in dev environment, will be applied on Vercel/Neon deploy)

## Deviations from Plan

None — plan executed exactly as written. The only minor note: profile namespace has 18 keys (the plan frontmatter said 17 but listed 18 keys in the task body — all keys from the task body were implemented).

## Self-Check: PASSED

All files exist on disk:
- FOUND: src/lib/db/schema.ts
- FOUND: src/lib/skills-data.ts
- FOUND: messages/en.json
- FOUND: messages/he.json

All commits exist in git history:
- FOUND: faa46a4 (schema changes)
- FOUND: f598f3c (skills-data.ts)
- FOUND: 8312537 (i18n keys)
