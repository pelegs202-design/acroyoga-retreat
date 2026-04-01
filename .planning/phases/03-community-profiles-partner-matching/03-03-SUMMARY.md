---
phase: 03-community-profiles-partner-matching
plan: "03"
subsystem: ui
tags: [next.js, drizzle, react, tailwind, next-intl, server-components]

requires:
  - phase: 03-01
    provides: schema extensions (bio, skills on user table, reviews table), skills-data.ts with SKILL_CATEGORIES and ALL_MOVES, Phase 3 i18n keys in en.json/he.json

provides:
  - Partner search page at /members with URL-driven city/role/level filters and member grid
  - Public member profile page at /members/[userId] with hero, bio, skills sections
  - MemberFilters client component (sticky, URL-searchParams-driven, RTL-safe)
  - MemberCard component (dark card with avatar, badges, top 3 skills chips)
  - MembersGrid component (grid layout + zero-results broadening suggestion)
  - ProfileHero server component (photo, name, city, role/level badges, edit button on own profile)
  - ProfileBio server component (bio text, own-empty nudge, hidden on other-empty)
  - SkillsDisplay client component (top 8 chips + expandable "and X more", own-empty nudge)

affects:
  - 03-04 (profile edit page — links from ProfileHero edit button and SkillsDisplay nudge)
  - 04-jam-board (member profile linked from jam attendee list)

tech-stack:
  added: []
  patterns:
    - Server component with Drizzle conditional filter array using and(...conditions.filter(Boolean))
    - searchParams as Promise awaited in Next.js 15+ page props
    - Client filter component updating URL via router.push + useSearchParams
    - Server components passed locale prop for getTranslations (non-hook pattern)

key-files:
  created:
    - src/app/[locale]/(app)/members/page.tsx
    - src/app/[locale]/(app)/members/[userId]/page.tsx
    - src/components/members/MemberFilters.tsx
    - src/components/members/MemberCard.tsx
    - src/components/members/MembersGrid.tsx
    - src/components/profile/ProfileHero.tsx
    - src/components/profile/ProfileBio.tsx
    - src/components/profile/SkillsDisplay.tsx
  modified: []

key-decisions:
  - "03-03: Drizzle filter conditions built as array with .filter(Boolean) cast — avoids conditional chaining and keeps and() call clean with dynamic number of conditions"
  - "03-03: ProfileHero/ProfileBio are server components receiving locale prop — getTranslations called directly; SkillsDisplay is client component for expand/collapse interactivity"
  - "03-03: MemberFilters uses onChange on city input (debounce-free) — acceptable for short text inputs at this scale; can add debounce in Phase 10 polish"
  - "03-03: MembersGrid broadening suggestion uses level > role > city priority to identify most-restrictive active filter"

patterns-established:
  - "Empty-state visibility rule: own profile sees nudge, other user sees nothing — applied in ProfileBio and SkillsDisplay"
  - "Profile skill chips use bg-brand/10 border-brand/30 text-brand — subtle pink read-only chip style distinct from interactive toggle chips"

requirements-completed:
  - PROF-05
  - COMM-01

duration: 3min
completed: "2026-04-01"
---

# Phase 03 Plan 03: Partner Search and Profile View Summary

**URL-driven partner search with city/role/level Drizzle filtering and a full public profile view with photo, bio, expandable skills chips, and private feedback count**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-01T12:21:51Z
- **Completed:** 2026-04-01T12:24:23Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Partner search page at /members queries Drizzle with conditional ilike/eq filters; self excluded via ne(); searchParams properly awaited per Next.js 15+ pattern
- Member cards display avatar (photo/initials fallback), name, city, role/level badges, and top 3 skill chips; zero-results broadening suggestion names the most restrictive active filter
- Public profile view at /members/[userId] renders hero, bio, skills, and private feedback count; own vs other profile logic governs empty state visibility; notFound() on invalid userId

## Task Commits

1. **Task 1: Partner search page with filters and member grid** - `f1185e2` (feat)
2. **Task 2: Member profile view with hero, bio, skills, feedback count** - `434c352` (feat)

## Files Created/Modified

- `src/app/[locale]/(app)/members/page.tsx` - Server component: Drizzle query with conditional filters, MemberFilters + MembersGrid
- `src/app/[locale]/(app)/members/[userId]/page.tsx` - Server component: profile data fetch, review count, all profile sections
- `src/components/members/MemberFilters.tsx` - Client: sticky filter bar, URL searchParams updates on change
- `src/components/members/MemberCard.tsx` - Card: avatar, name, city, role/level badges, top 3 skills chips, Link to profile
- `src/components/members/MembersGrid.tsx` - Grid: renders MemberCard list, zero-results empty state with broadening hint
- `src/components/profile/ProfileHero.tsx` - Server: large avatar, name, city, role/level badges, edit button on own profile
- `src/components/profile/ProfileBio.tsx` - Server: bio text, own-empty nudge, hidden when other user has no bio
- `src/components/profile/SkillsDisplay.tsx` - Client: top 8 skill chips + expand button, own-empty nudge with edit link

## Decisions Made

- Drizzle filter conditions built as array with `.filter(Boolean)` cast — avoids conditional chaining and keeps `and()` call clean with dynamic number of conditions
- ProfileHero and ProfileBio are server components receiving a `locale` prop so they can call `getTranslations` directly without being client components
- SkillsDisplay is a client component for expand/collapse interactivity (useState)
- MembersGrid broadening suggestion uses level > role > city priority to identify the most restrictive active filter for the removal hint

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- /members partner search and /members/[userId] profile view are complete and ready
- ProfileHero edit button links to /profile/edit (implemented in 03-04)
- SkillsDisplay empty-state nudge links to /profile/edit (implemented in 03-04)
- Plan 03-04 (profile edit) and 03-05 (reviews/feedback form) can now proceed

---
*Phase: 03-community-profiles-partner-matching*
*Completed: 2026-04-01*
