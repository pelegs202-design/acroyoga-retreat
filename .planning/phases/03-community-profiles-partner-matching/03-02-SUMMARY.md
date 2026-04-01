---
phase: 03-community-profiles-partner-matching
plan: 02
subsystem: ui, api
tags: [vercel-blob, next-intl, drizzle-orm, profile, image-upload, skills]

# Dependency graph
requires:
  - phase: 03-01
    provides: bio/skills columns on user table, ALL_MOVES constant from skills-data.ts, profile i18n keys

provides:
  - POST /api/upload/avatar — auth-gated Vercel Blob client-upload token handler with old-blob cleanup
  - AvatarUpload client component with preview and upload trigger
  - SkillsChecklist component — 7-category tap-to-toggle pink chip grid
  - Extended POST /api/user/update-profile accepting bio (max 500) and skills (string[])
  - /[locale]/(app)/profile/edit page — full profile editing with auth guard

affects:
  - 03-03 (member search/listing — user profiles are now rich with bio and skills)
  - 03-04 (partner matching — relies on skills and role fields being editable)
  - any phase using user.image (photo now managed via Vercel Blob CDN)

# Tech tracking
tech-stack:
  added: ["@vercel/blob@2.3.2 (client-upload pattern for profile photos)"]
  patterns:
    - "Vercel Blob client-upload: handleUploadUrl + onUploadCompleted for auth-gated token flow"
    - "Skills array update: Drizzle typed .update().set({ skills }) for text[] correct serialization"
    - "Profile edit page: server component fetches data, passes to 'use client' form component"
    - "Chip toggle pattern: border-brand bg-brand text-brand-foreground for selected state"

key-files:
  created:
    - src/app/api/upload/avatar/route.ts
    - src/components/profile/AvatarUpload.tsx
    - src/components/profile/SkillsChecklist.tsx
    - src/app/[locale]/(app)/profile/edit/page.tsx
    - src/app/[locale]/(app)/profile/edit/ProfileEditForm.tsx
  modified:
    - src/app/api/user/update-profile/route.ts
    - next.config.ts
    - messages/en.json
    - messages/he.json

key-decisions:
  - "03-02: Vercel Blob client-upload pattern used (not server-upload) — avoids 4.5 MB body limit"
  - "03-02: Old blob deleted in onUploadCompleted callback — prevents CDN storage leaks"
  - "03-02: Skills array update uses Drizzle typed .update() not raw SQL — correct text[] serialization"
  - "03-02: ProfileEditForm extracted as 'use client' co-located file — server component handles auth/data fetch"
  - "03-02: next.config.ts remotePatterns added for *.public.blob.vercel-storage.com — required for Next.js Image with Blob CDN"

patterns-established:
  - "Server page + co-located client form: page.tsx (server) fetches data, ProfileEditForm.tsx (client) handles state"
  - "Skills validation: ALL_MOVES whitelist checked server-side before DB write"

requirements-completed: [PROF-01, PROF-02, PROF-03, PROF-04]

# Metrics
duration: 4min
completed: 2026-04-01
---

# Phase 3 Plan 02: Community Profiles Partner Matching Summary

**Vercel Blob client-upload avatar system + full profile edit page with bio, city, role, level, and 54-move skill chip checklist**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-01T12:23:37Z
- **Completed:** 2026-04-01T12:28:16Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Avatar upload API route: auth-gated Vercel Blob token handler with old-photo cleanup on replacement
- AvatarUpload component: file input with immediate preview using Next.js Image optimization
- SkillsChecklist: 7-category tap-to-toggle pink chip grid reading from SKILL_CATEGORIES
- Extended update-profile API: bio (max 500 chars) + skills (string[] validated against ALL_MOVES whitelist)
- Full profile edit page at /en/profile/edit + /he/profile/edit with auth guard and form state

## Task Commits

Each task was committed atomically:

1. **Task 1: Install @vercel/blob + avatar upload API route + AvatarUpload component** - `d6b5643` (feat)
2. **Task 2: Extend update-profile API + SkillsChecklist + profile edit page** - `5f0ab94` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/app/api/upload/avatar/route.ts` - POST handler using handleUpload for Vercel Blob client-upload token generation; auth-gated; deletes old blob on replace
- `src/components/profile/AvatarUpload.tsx` - Client component: circular avatar preview, file input, upload progress
- `src/components/profile/SkillsChecklist.tsx` - 7-category chip grid from SKILL_CATEGORIES; tap-to-toggle pink/neutral state
- `src/app/[locale]/(app)/profile/edit/page.tsx` - Server component: auth guard, DB fetch of current profile data
- `src/app/[locale]/(app)/profile/edit/ProfileEditForm.tsx` - Client form: photo, bio, city, role, level, skills, save to update-profile
- `src/app/api/user/update-profile/route.ts` - Extended with bio + skills validation and typed array update
- `next.config.ts` - Added Vercel Blob remote image pattern (Rule 2 fix)
- `messages/en.json` - Added profile.save key
- `messages/he.json` - Added profile.save key in Hebrew

## Decisions Made
- Vercel Blob client-upload pattern (not server-upload) — avoids 4.5 MB Next.js body limit for image files
- Old blob deleted in `onUploadCompleted` callback — prevents storage accumulation per research pitfall
- Skills use Drizzle typed `.update().set({ skills })` — raw SQL template tag cannot serialize text[] correctly
- ProfileEditForm co-located as separate file in same directory — keeps server component clean, client form manages all state
- next.config.ts remotePatterns for `*.public.blob.vercel-storage.com` — required for Next.js Image to render Blob CDN images

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added Vercel Blob image domain to next.config.ts**
- **Found during:** Task 1 (AvatarUpload component creation)
- **Issue:** Next.js Image component requires explicit `remotePatterns` for external domains; without it, uploaded profile photos would fail to render with 400 error
- **Fix:** Added `images.remotePatterns` with `*.public.blob.vercel-storage.com` hostname pattern to next.config.ts
- **Files modified:** next.config.ts
- **Verification:** tsc --noEmit passes; config accepted by Next.js
- **Committed in:** d6b5643 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 - missing critical)
**Impact on plan:** Essential for profile photos to render. No scope creep.

## Issues Encountered
None — TypeScript compiled clean on first pass for both tasks.

## User Setup Required
**External service requires configuration.** BLOB_READ_WRITE_TOKEN is noted as already set in .env.local (from plan frontmatter). For production deployment, ensure `BLOB_READ_WRITE_TOKEN` is set in Vercel project environment variables. The Blob store must be connected to the project in Vercel Dashboard → Storage → Blob.

## Next Phase Readiness
- Profile edit page is live at /[locale]/(app)/profile/edit with full auth guard
- Avatar upload, bio, city, role, level, skills all persist to DB
- Skills validation against ALL_MOVES whitelist ensures data quality for partner matching
- Ready for 03-03 (member directory cards showing bio/skills) and 03-04 (partner matching filter logic)

---
*Phase: 03-community-profiles-partner-matching*
*Completed: 2026-04-01*
