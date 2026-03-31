---
phase: 01-foundation-auth
plan: 04
subsystem: infra
tags: [pwa, serwist, service-worker, offline, install-prompt, manifest, nextjs]

requires:
  - phase: 01-foundation-auth/01-01
    provides: Next.js 16 scaffold with webpack flag in dev script
  - phase: 01-foundation-auth/01-02
    provides: next-intl locale layout (app/[locale]/layout.tsx) where install prompts are mounted

provides:
  - Serwist service worker (src/app/sw.ts) with offline document fallback to /~offline
  - Next.js config wrapping withSerwist(withNextIntl(config)) for service worker build pipeline
  - Web app manifest at /manifest.json with dark brutalist theme (#0a0a0a)
  - Offline fallback page at /~offline with branded dark brutalist styling
  - InstallPrompt component: deferred beforeinstallprompt shown on 2nd+ visit with dismiss
  - IosBanner component: iOS Safari share-button instructions on 2nd+ visit with dismiss
  - Placeholder PWA icons (192x192 + 512x512) in public/
affects: [02, 03, 04, 05, 06, 07, 08, 09, 10]

tech-stack:
  added:
    - "@serwist/next@9.5.7 (already installed in 01-01, now configured)"
    - "serwist@9.5.7 (already installed in 01-01, now configured)"
  patterns:
    - "Serwist config: withSerwist wraps withNextIntl wraps nextConfig — outermost wrapper runs first"
    - "Serwist swSrc path is src/app/sw.ts (project uses src/ prefix for app directory)"
    - "sw.ts declares self as any to avoid webworker lib TypeScript requirement"
    - "Offline page lives outside [locale] segment — static, pre-cached, no locale routing overhead"
    - "InstallPrompt + IosBanner share pwa_visit_count localStorage key but use separate dismissed keys"
    - "PNG icons generated via raw zlib+CRC32 Node.js script — no canvas/sharp dependency needed"

key-files:
  created:
    - src/app/sw.ts (Serwist service worker with defaultCache and /~offline fallback)
    - src/app/manifest.ts (Web manifest: AcroAcademy, dark #0a0a0a, 192+512 icons)
    - src/app/~offline/page.tsx (Branded offline fallback: dark brutalist, static, no JS)
    - src/components/pwa/InstallPrompt.tsx (Deferred install prompt, 2nd+ visit, localStorage dismiss)
    - src/components/pwa/IosBanner.tsx (iOS Safari share-icon instructions, 2nd+ visit, localStorage dismiss)
    - public/icon-192x192.png (Placeholder PWA icon, solid #0a0a0a, valid PNG)
    - public/icon-512x512.png (Placeholder PWA icon, solid #0a0a0a, valid PNG)
    - scripts/generate-icons.mjs (One-off PNG generator using raw zlib, no canvas dependency)
  modified:
    - next.config.ts (Added withSerwist wrapper: swSrc, swDest, additionalPrecacheEntries for /~offline)
    - src/app/[locale]/layout.tsx (Added InstallPrompt and IosBanner mounts inside NextIntlClientProvider)

key-decisions:
  - "swSrc path is src/app/sw.ts not app/sw.ts — project uses src/app/ as App Router directory"
  - "sw.ts declares self as 'any' for __SW_MANIFEST — avoids needing webworker TypeScript lib"
  - "Offline page uses inline styles (no Tailwind import) — lives outside locale layout, has own html/body"
  - "InstallPrompt and IosBanner share pwa_visit_count to avoid double-counting between components"
  - "PNG icons generated via raw CRC32+zlib encoding — no canvas/sharp needed for solid-color placeholders"

patterns-established:
  - "Pattern: PWA components mounted inside NextIntlClientProvider in [locale]/layout.tsx so locale context is available if needed in future"
  - "Pattern: Offline page self-contained with own <html>/<body> and inline styles — no dependency on app layout chain"
  - "Pattern: Both prompts check visit count from shared key but use separate dismissal keys"

requirements-completed: [FOUND-03]

duration: 5min
completed: 2026-03-31
---

# Phase 01 Plan 04: PWA Service Worker, Manifest, and Install Prompts Summary

**Serwist service worker with /~offline fallback, dark brutalist web manifest, deferred install prompt (2nd visit), iOS Safari banner, and placeholder 192/512 icons**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-31T22:26:13Z
- **Completed:** 2026-03-31T22:31:32Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Next.js config updated to compose withSerwist with existing withNextIntl — Serwist builds sw.ts into public/sw.js during production builds
- Dark brutalist web manifest (/manifest.json) with #0a0a0a theme/background and placeholder 192+512 PNG icons
- Offline fallback page at /~offline: static, self-contained HTML, dark monochrome brutalist, served by service worker when offline
- InstallPrompt: captures beforeinstallprompt, surfaces install UI only on 2nd+ visit, dismissable, localStorage-persisted
- IosBanner: detects iOS Safari (not standalone), shows share-icon instructions on 2nd+ visit, dismissable

## Task Commits

Each task was committed atomically:

1. **Task 1: Serwist config, manifest, icons** - `417bc90` (feat)
2. **Task 2: Offline page, install prompt, iOS banner** - `4973a06` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `next.config.ts` - Added withSerwistInit wrapper (swSrc: src/app/sw.ts, swDest: public/sw.js, /~offline precache entry)
- `src/app/sw.ts` - Serwist instance: defaultCache, skipWaiting, clientsClaim, navigationPreload, /~offline fallback
- `src/app/manifest.ts` - MetadataRoute.Manifest with dark brutalist theme, AcroAcademy short name, icon paths
- `src/app/~offline/page.tsx` - Self-contained offline page: own html/body, inline styles, dark brutalist, no JS
- `src/components/pwa/InstallPrompt.tsx` - beforeinstallprompt listener, 2nd-visit gate, install + dismiss buttons
- `src/components/pwa/IosBanner.tsx` - iOS device detection, standalone check, share instructions, dismiss
- `src/app/[locale]/layout.tsx` - Added InstallPrompt + IosBanner mounts
- `public/icon-192x192.png` - Placeholder PWA icon (192x192, solid #0a0a0a)
- `public/icon-512x512.png` - Placeholder PWA icon (512x512, solid #0a0a0a)
- `scripts/generate-icons.mjs` - PNG generator (raw CRC32+zlib, no canvas dependency)

## Decisions Made
- **swSrc path**: Used `src/app/sw.ts` not `app/sw.ts` — the project has App Router in `src/app/` per tsconfig paths
- **sw.ts self type**: Declared `self as any` for `__SW_MANIFEST` — avoids needing `webworker` in tsconfig lib, which would conflict with existing `dom` lib setup
- **Offline page isolation**: `/~offline` sits outside `[locale]` and has its own `<html>/<body>` with inline styles — no dependency on the locale layout chain or Tailwind import
- **Shared visit counter**: Both InstallPrompt and IosBanner read from `pwa_visit_count` so the same increment logic applies; separate dismissed keys prevent one affecting the other

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed swSrc path from app/sw.ts to src/app/sw.ts**
- **Found during:** Task 1 (next.config.ts update)
- **Issue:** Plan specified `swSrc: "app/sw.ts"` but the project uses `src/app/` as the App Router directory per tsconfig `"@/*": ["./src/*"]`
- **Fix:** Changed swSrc to `src/app/sw.ts`, created sw.ts at that path
- **Files modified:** next.config.ts, src/app/sw.ts
- **Verification:** TypeScript check passes; build reaches compilation phase successfully
- **Committed in:** 417bc90 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed TypeScript error in sw.ts: ServiceWorkerGlobalScope not in dom lib**
- **Found during:** Task 1 verification (npm run build)
- **Issue:** `declare const self: ServiceWorkerGlobalScope` failed — `ServiceWorkerGlobalScope` requires the `webworker` TypeScript lib, but tsconfig only has `dom`
- **Fix:** Changed declaration to `declare const self: any & { __SW_MANIFEST: ... }` — avoids lib conflict while preserving runtime behavior
- **Files modified:** src/app/sw.ts
- **Verification:** `npx tsc --noEmit` shows no errors in PWA files
- **Committed in:** 417bc90 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 Rule 3 blocking path mismatch, 1 Rule 1 TypeScript fix)
**Impact on plan:** Both auto-fixes necessary to complete the tasks. No scope creep.

## Issues Encountered
- `npm run build` fails due to pre-existing `DATABASE_URL not set` error in `/api/auth/[...all]` page data collection — this is unrelated to PWA work and was present before this plan. TypeScript compilation and Serwist webpack compilation both succeed before the page data step fails.
- Pre-existing TypeScript error in `src/app/api/user/accept-tos/route.ts` (wrong drizzle import `drizzle-orm/expressions`) — out of scope, logged but not fixed.

## User Setup Required
None — no external service configuration required for PWA functionality.

## Next Phase Readiness
- PWA manifest, service worker source, offline fallback, and install prompt components all in place
- Production build will generate `public/sw.js` once `DATABASE_URL` is set (prerequisite from Plan 01-01 user setup)
- Placeholder icons ready; will be replaced in Phase 2 (Brand Identity)
- Plan 01-05 (TOS page) can proceed immediately — no PWA dependencies

---
*Phase: 01-foundation-auth*
*Completed: 2026-03-31*
