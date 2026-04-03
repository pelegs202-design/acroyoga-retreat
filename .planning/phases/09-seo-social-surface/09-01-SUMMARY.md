---
phase: 09-seo-social-surface
plan: 01
subsystem: seo
tags: [seo, metadata, json-ld, schema-dts, sitemap, robots, og-image, hreflang, next-intl]

# Dependency graph
requires:
  - phase: 02-brand-identity
    provides: brand tokens, layout.tsx, title template established
  - phase: 01-foundation-auth
    provides: locale routing, next-intl setup, messages/ convention
provides:
  - buildPageMetadata helper for locale-aware meta + OG + hreflang
  - typed JSON-LD schema builders (Organization, LocalBusiness, Event, FAQ)
  - JsonLd RSC component for script injection
  - Dynamic sitemap.xml with locale-aware URLs + upcoming jams
  - Dynamic robots.txt allowing crawlers, disallowing /api/ and auth routes
  - Branded 1200x630 OG image at /og-image.jpg
  - Organization JSON-LD on every page (injected in root locale layout)
  - Homepage generateMetadata with Hebrew SEO keywords and hreflang
affects: [09-02-city-landing-pages, 09-04-share-buttons, all public pages needing SEO]

# Tech tracking
tech-stack:
  added: [schema-dts@2.0.0, react-share@5.3.0]
  patterns:
    - buildPageMetadata async helper for DRY locale-aware Next.js Metadata objects
    - JsonLd RSC component wraps WithContext<T> — server-only, safe JSON-LD injection via JSON.stringify + angle-bracket escaping
    - Dynamic sitemap.ts + robots.ts via Next.js file convention (no next-sitemap package)
    - Organization schema injected once in root [locale]/layout.tsx — propagates to all pages

key-files:
  created:
    - src/lib/seo/metadata.ts
    - src/lib/seo/schemas.ts
    - src/components/seo/JsonLd.tsx
    - src/app/sitemap.ts
    - src/app/robots.ts
    - public/og-image.jpg
    - public/og-image.svg
  modified:
    - src/app/[locale]/layout.tsx
    - src/app/[locale]/page.tsx
    - messages/en.json
    - messages/he.json
    - package.json

key-decisions:
  - "09-01: JsonLd uses inline HTML injection with angle-bracket unicode escaping — safe because payload is server-only typed JSON-LD output from schema builders, not user input; script type is application/ld+json not text/javascript"
  - "09-01: OG image generated as SVG then converted to JPG via sharp (Next.js dep) — avoids canvas or browser-based ImageResponse complexity at build time"
  - "09-01: robots.ts disallows /api/ and locale-prefixed auth routes (/he/sign-in, /en/sign-in, etc.) — prevents search engine indexing of auth flows while allowing all public pages"
  - "09-01: Hebrew is x-default in hreflang alternates — matches locked decision from CONTEXT.md: primary market is Israel"
  - "09-01: sitemap.ts queries jamSessions where scheduledAt >= now() — past jams excluded because they have no search ranking value"

patterns-established:
  - "Pattern: buildPageMetadata({ locale, namespace, path }) — standard helper for all public pages to generate locale-aware Next.js Metadata"
  - "Pattern: JsonLd<T extends Thing> RSC component — inject any WithContext<T> schema as JSON-LD script tag"
  - "Pattern: Organization schema in [locale]/layout.tsx — injected once at root, appears on all pages"

requirements-completed: [SEO-01]

# Metrics
duration: 4min
completed: 2026-04-01
---

# Phase 9 Plan 01: SEO Infrastructure Summary

**Locale-aware buildPageMetadata helper, typed JSON-LD schema builders using schema-dts, dynamic sitemap.xml + robots.txt, 1200x630 branded OG image, and Organization schema injected on every page**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-01T00:00:32Z
- **Completed:** 2026-04-01T00:04:45Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- SEO lib foundation: buildPageMetadata with hreflang (he/en/x-default), OG data, Twitter card; four typed JSON-LD schema builders (Organization, LocalBusiness, Event, FAQ)
- Infrastructure: dynamic sitemap.ts returning locale-aware URLs for static pages + upcoming jams from DB; dynamic robots.ts blocking /api/ and auth routes
- Organization JSON-LD now injected on every page via root layout; homepage exports generateMetadata with Hebrew SEO keywords

## Task Commits

Each task was committed atomically:

1. **Task 1: Install deps + SEO lib (metadata helper, JSON-LD schemas, JsonLd component)** - `a2b18e0` (feat)
2. **Task 2: Sitemap, robots, OG image, Organization schema in layout, homepage metadata** - `47add1f` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `src/lib/seo/metadata.ts` - buildPageMetadata async helper, locale-aware Metadata with hreflang + OG + Twitter
- `src/lib/seo/schemas.ts` - buildOrganizationSchema, buildLocalBusinessSchema, buildEventSchema, buildFAQSchema using schema-dts types
- `src/components/seo/JsonLd.tsx` - generic RSC JSON-LD script injector
- `src/app/sitemap.ts` - dynamic locale-aware sitemap with static paths + upcoming jams from DB
- `src/app/robots.ts` - dynamic robots.txt allowing all crawlers on public routes, disallowing api + auth
- `public/og-image.jpg` - 1200x630 JPEG (30KB), dark #0A0A0A background, pink #F472B6 AcroHavura brand
- `public/og-image.svg` - source SVG for OG image
- `src/app/[locale]/layout.tsx` - added JsonLd + buildOrganizationSchema injection in body
- `src/app/[locale]/page.tsx` - added generateMetadata using buildPageMetadata({ namespace: 'seo.home' })
- `messages/en.json` - added seo.home, seo.cityTelAviv, seo.cityKfarSaba i18n keys
- `messages/he.json` - added matching Hebrew SEO keys with keyword-rich descriptions from research

## Decisions Made

- JsonLd component uses inline __html prop with JSON.stringify + angle-bracket unicode escaping — safe because payload is server-only typed JSON-LD output from schema builders, not user input; script type is application/ld+json (not JavaScript)
- OG image generated as SVG then converted to JPG via sharp (already a Next.js dependency) — avoids canvas or browser-based complexity
- Hebrew is x-default in hreflang alternates — primary market is Israel (locked decision from CONTEXT.md)
- sitemap.ts excludes past jams (scheduledAt >= now()) — past jams have no search ranking value
- robots.ts disallows locale-prefixed auth routes (/he/sign-in, /en/sign-in, etc.) to prevent indexing of auth flows

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — schema-dts@2.0.0 installed (research referenced 1.1.2 but 2.0.0 is the latest and compatible). TypeScript and build passed cleanly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- buildPageMetadata is ready for city pages (Plan 02) to call with namespace: 'seo.cityTelAviv' / 'seo.cityKfarSaba'
- buildLocalBusinessSchema and buildFAQSchema are ready for city page JSON-LD injection
- buildEventSchema is ready for jam detail pages
- OG image at /og-image.jpg serves all pages

## Self-Check: PASSED

All created files exist on disk. Both task commits (a2b18e0, 47add1f) verified in git log.

---
*Phase: 09-seo-social-surface*
*Completed: 2026-04-01*
