---
phase: 09-seo-social-surface
plan: "03"
subsystem: ui
tags: [instagram, social-share, whatsapp, react-share, framer-motion, rsc]

# Dependency graph
requires:
  - phase: 09-01
    provides: OG meta tags and structured data for rich share previews in WhatsApp/social
  - phase: 09-02
    provides: city landing pages that need share buttons

provides:
  - Instagram Graph API client with 6-hour ISR cache and graceful empty-state degradation
  - InstagramGrid RSC rendering 3-column feed on homepage
  - ShareButton floating trigger (fixed bottom-end, RTL-aware)
  - ShareBottomSheet with WhatsApp (primary), native share (mobile), copy link, Facebook
  - Share integration on city landing pages, jams feed, and quiz results pages

affects:
  - 10-design-polish (social section on homepage is now a visual target)
  - future admin cron (refreshInstagramToken exported for future cron/admin route)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - RSC server-only Instagram API fetch with ISR revalidate option (next: { revalidate: 21600 })
    - Graceful degradation — return [] when env token missing, render null to hide section
    - Framer Motion AnimatePresence for bottom-sheet slide-up animation
    - RTL-aware fixed positioning using Tailwind logical properties (end-4 not right-4)

key-files:
  created:
    - src/lib/instagram.ts
    - src/components/social/InstagramGrid.tsx
    - src/components/social/ShareButton.tsx
    - src/components/social/ShareBottomSheet.tsx
  modified:
    - src/app/[locale]/page.tsx
    - src/app/[locale]/(app)/jams/page.tsx
    - src/app/[locale]/(public)/cities/[city]/page.tsx
    - src/app/[locale]/(app)/quiz/challenge/results/page.tsx
    - messages/en.json
    - messages/he.json

key-decisions:
  - "09-03: InstagramGrid renders null (not empty grid) when feed is empty — no broken UI, no empty whitespace"
  - "09-03: InstagramGrid is RSC — fetchInstagramFeed called directly in component body, no useEffect"
  - "09-03: WhatsApp is first/primary share option in bottom sheet — matches Israeli usage patterns"
  - "09-03: ShareButton uses Tailwind logical property end-4 (not right-4) — RTL layout correct without manual dir check"
  - "09-03: INSTAGRAM_ACCESS_TOKEN has no NEXT_PUBLIC_ prefix — server-only token never exposed to client bundle"
  - "09-03: Quiz results ShareButton passes session query param in URL — full shareable URL preserved"

patterns-established:
  - "Server-only env token pattern: read process.env without NEXT_PUBLIC_ prefix in RSC or lib files"
  - "Graceful degradation: any server-fetched optional data returns [] on error, component renders null"
  - "Social share bottom sheet: WhatsApp first, native share conditional (navigator.share detection on mount), copy + Facebook"

requirements-completed:
  - SEO-03
  - SEO-04

# Metrics
duration: 6min
completed: 2026-04-03
---

# Phase 9 Plan 03: Instagram Feed + Social Share Summary

**Instagram RSC feed embed on homepage with graceful token-missing degradation, plus floating WhatsApp-first share sheet on city pages, jams, and quiz results**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-03T22:56:53Z
- **Completed:** 2026-04-03T23:02:30Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Instagram Graph API client (`src/lib/instagram.ts`) with 6-hour ISR cache, graceful empty array when token absent, and `refreshInstagramToken` for future cron use
- `InstagramGrid` RSC renders 3-column photo/video grid on homepage; returns null when no posts (no broken UI)
- `ShareButton` floating button + `ShareBottomSheet` with WhatsApp (primary for Israel), native share (mobile-conditional), copy link with "Copied!" feedback, and Facebook
- Share buttons wired to city landing pages (`/cities/[city]`), jams feed page, and quiz results page with correct shareable URLs including session query param on results

## Task Commits

Each task was committed atomically:

1. **Task 1: Instagram API client + InstagramGrid + homepage** - `8d4e107` (feat)
2. **Task 2: ShareButton + ShareBottomSheet + page integrations** - `50b3b11` (feat)

**Plan metadata:** (committed with state update)

## Files Created/Modified

- `src/lib/instagram.ts` - fetchInstagramFeed (ISR, graceful degradation) + refreshInstagramToken
- `src/components/social/InstagramGrid.tsx` - RSC 3-column grid, VIDEO play overlay, brutalist border
- `src/components/social/ShareButton.tsx` - Fixed floating button, brand pink, end-4 RTL-aware
- `src/components/social/ShareBottomSheet.tsx` - Framer Motion slide-up, 4 share options
- `src/app/[locale]/page.tsx` - Added InstagramGrid below hero
- `src/app/[locale]/(app)/jams/page.tsx` - Added ShareButton with jams URL
- `src/app/[locale]/(public)/cities/[city]/page.tsx` - Added ShareButton with canonical city URL
- `src/app/[locale]/(app)/quiz/challenge/results/page.tsx` - Added ShareButton with session URL
- `messages/en.json` - social.instagram + social.share i18n keys
- `messages/he.json` - Hebrew social.instagram + social.share i18n keys

## Decisions Made

- `InstagramGrid` renders `null` (not an empty div) when feed is empty — no broken UI, no whitespace gap on homepage
- `InstagramGrid` is a pure RSC — `fetchInstagramFeed` called directly in component body, zero client JS for the grid
- WhatsApp is first and most visually prominent share option — primary communication channel in Israel
- `ShareButton` uses `end-4` (Tailwind logical property) instead of `right-4` — correct RTL layout without manual dir checks
- `INSTAGRAM_ACCESS_TOKEN` has no `NEXT_PUBLIC_` prefix — token stays server-only, never leaks to client bundle
- Quiz results `ShareButton` includes `?session=...` query param — the full URL is shareable per Phase 05-04 design

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**External services require manual configuration.**

Instagram feed embed requires a long-lived Instagram Graph API access token from the @acroshay account:

1. Convert @acroshay to **Business or Creator** account (Instagram App → Settings → Account Type)
2. Create a **Meta App** at developers.facebook.com → My Apps → Create App → Add Instagram Login product
3. Generate a **long-lived access token** (60-day expiry) from Meta Developers Console → Instagram Login → Generate Token
4. Add to environment: `INSTAGRAM_ACCESS_TOKEN=<token>`
5. Token must be refreshed before 60-day expiry — call `refreshInstagramToken()` from an admin route or cron (not yet implemented — scheduled for future phase)

**Without this token:** Instagram section is silently hidden on homepage — no crash, no broken UI.

## Next Phase Readiness

- SEO-03 and SEO-04 requirements fully satisfied
- Homepage Instagram grid ready for Phase 10 design polish (visual styling target)
- `refreshInstagramToken()` exported and ready for admin cron route in a future plan
- All share buttons use OG meta tags from Plan 09-01 for rich WhatsApp/social preview cards

---
*Phase: 09-seo-social-surface*
*Completed: 2026-04-03*
