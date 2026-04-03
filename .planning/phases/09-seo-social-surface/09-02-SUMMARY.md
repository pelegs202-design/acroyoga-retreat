---
phase: 09-seo-social-surface
plan: 02
subsystem: seo
tags: [seo, city-pages, json-ld, aeo, drizzle, server-components, isr, hreflang, next-intl]

# Dependency graph
requires:
  - phase: 09-01
    provides: buildPageMetadata, buildLocalBusinessSchema, buildFAQSchema, buildEventSchema, JsonLd component
  - phase: 01-foundation-auth
    provides: locale routing, next-intl, messages/ convention
provides:
  - Public (public) route group layout — no auth guard, bot-crawlable
  - City landing pages for Tel Aviv and Kfar Saba at /[locale]/cities/[city]
  - ISR city pages with hourly revalidation for fresh jam data
  - LocalBusiness + FAQPage JSON-LD on city pages
  - Event JSON-LD per jam card in CityJamList
  - City-specific Hebrew generateMetadata with hreflang
  - AEO-optimized Hebrew FAQ with direct conversational answers
  - city column on jamSessions table (nullable, migration applied)
affects: [09-03-instagram-embed, 09-04-share-buttons, sitemap (already covers cities)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - ISR city pages: export const revalidate = 3600 for hourly fresh jam data
    - Server Component DB queries with city column OR ILIKE location fallback for existing jams
    - FAQ content as inline bilingual constants passed from page to component (not i18n)
    - details/summary HTML accordion for AEO-friendly FAQ (no JavaScript required, semantic HTML)
    - drizzle-kit push via dotenv-cli loading .env.local for CI-less migration

key-files:
  created:
    - src/app/[locale]/(public)/layout.tsx
    - src/app/[locale]/(public)/cities/[city]/page.tsx
    - src/components/city/CityHero.tsx
    - src/components/city/CityJamList.tsx
    - src/components/city/CityStats.tsx
    - src/components/city/CityFAQ.tsx
  modified:
    - src/lib/db/schema.ts
    - messages/en.json
    - messages/he.json

key-decisions:
  - "09-02: city column on jamSessions is nullable — existing jams have no city set; CityJamList uses ILIKE fallback on location field when city IS NULL"
  - "09-02: FAQ items are inline bilingual constants in page.tsx (per-city typed record) — passed to CityFAQ as props; avoids next-intl array-of-objects complexity for stable marketing copy"
  - "09-02: details/summary HTML accordion used for CityFAQ — no JS dependency, semantic HTML for AEO crawlers, FAQPage JSON-LD handles schema at page level"
  - "09-02: (public) route group has no auth guard — naturally bypasses (app) auth because it is a separate route group; proxy.ts next-intl middleware only handles locale routing, not auth"
  - "09-02: npx dotenv-cli -e .env.local needed to load DATABASE_URL for drizzle-kit push — env not auto-loaded by drizzle-kit in this project config"

patterns-established:
  - "Pattern: (public) route group for pages that must be bot-crawlable without auth"
  - "Pattern: ISR with revalidate = 3600 for city pages — fresh jam data hourly, pre-rendered for SEO"

requirements-completed: [SEO-02]

# Metrics
duration: 5min
completed: 2026-04-01
---

# Phase 9 Plan 02: City Landing Pages Summary

**ISR city pages for Tel Aviv and Kfar Saba with LocalBusiness + FAQPage + Event JSON-LD, AEO-optimized Hebrew FAQ, and public (public) route group with no auth guard**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-03T22:48:45Z
- **Completed:** 2026-04-03T22:53:45Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- DB schema: nullable `city` column added to `jamSessions` table; migration applied to Neon via `drizzle-kit push` (dotenv-cli pattern for .env.local loading)
- Route group: `(public)` layout with no auth guard — city pages fully crawlable by bots without login
- City page: `generateStaticParams` returns 4 combos (he+en x tel-aviv+kfar-saba), ISR revalidate=3600, `generateMetadata` uses city-specific i18n namespace, LocalBusiness + FAQPage JSON-LD injected
- 4 server components: CityHero (h1, bilingual subtitles with both acroyoga spellings), CityJamList (DB query with city column + ILIKE location fallback, Event JSON-LD per jam), CityStats (member + jam counts), CityFAQ (6 AEO-optimized Hebrew Q&As, details/summary accordion)
- i18n: city.telAviv/kfarSaba hero keys + city.noJams/stats/faq keys added to both messages/

## Task Commits

Each task was committed atomically:

1. **Task 1: DB migration + public route group + city page with metadata and JSON-LD** - `6bbf285` (feat)
2. **Task 2: City page components (Hero, JamList, Stats, FAQ) with AEO-optimized Hebrew content** - `c77b7dc` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `src/lib/db/schema.ts` - city column added to jamSessions table
- `src/app/[locale]/(public)/layout.tsx` - no-auth pass-through layout for public route group
- `src/app/[locale]/(public)/cities/[city]/page.tsx` - city page with generateStaticParams, generateMetadata, JSON-LD injection, notFound for unsupported slugs
- `src/components/city/CityHero.tsx` - h1 hero with Hebrew city name, bilingual subtitle, primary CTA to quiz + secondary to jams
- `src/components/city/CityJamList.tsx` - upcoming jams by city with DB query (city column OR ILIKE location), Event JSON-LD per jam, empty state
- `src/components/city/CityStats.tsx` - member count (ILIKE user.city) + jam count, large brutalist stat cards
- `src/components/city/CityFAQ.tsx` - AEO FAQ, Hebrew Q&As, details/summary accordion, no JS required
- `messages/en.json` - city.telAviv/kfarSaba hero + city.noJams/upcomingJams/spotsRemaining/joinJam/stats/faq keys
- `messages/he.json` - matching Hebrew i18n keys

## Decisions Made

- city column on jamSessions is nullable — ILIKE fallback on location field for existing jams without city set
- FAQ items are inline bilingual constants per city slug (not i18n files) — same stable pattern from Phase 05-04
- details/summary accordion for CityFAQ — no JS, semantic HTML, AEO-friendly, FAQPage JSON-LD at page level
- (public) route group naturally bypasses auth — separate from (app) route group; no middleware changes needed
- drizzle-kit push requires dotenv-cli to load .env.local; DATABASE_URL not auto-loaded

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] DB migration failed without DATABASE_URL in env**
- **Found during:** Task 1 verification (npm run build)
- **Issue:** `drizzle-kit push` failed with "connection url required" — DATABASE_URL in .env.local not auto-loaded
- **Fix:** Used `npx dotenv-cli -e .env.local -- npx drizzle-kit push` to explicitly load env file
- **Files modified:** None (runtime fix)
- **Impact:** Build passed after migration applied

## Issues Encountered

The first build attempt failed at ISR prerender with `column "city" does not exist` from Neon. This was because `drizzle-kit push` needed `dotenv-cli` to load `.env.local`. Applied migration via `dotenv-cli` pattern and rebuild succeeded cleanly.

## User Setup Required

None — migration was applied automatically to Neon via drizzle-kit push.

## Next Phase Readiness

- City pages ready at `/he/cities/tel-aviv` and `/he/cities/kfar-saba` (and `/en/` variants)
- Both pages are fully public (no login required) — search bots can crawl freely
- LocalBusiness + FAQPage + Event JSON-LD present in HTML source
- Sitemap from Plan 01 already covers city pages via static URL list

## Self-Check: PASSED

All created files verified on disk. Both task commits (6bbf285, c77b7dc) confirmed in git log.

---
*Phase: 09-seo-social-surface*
*Completed: 2026-04-01*
