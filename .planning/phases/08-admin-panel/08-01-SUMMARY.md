---
phase: 08-admin-panel
plan: "01"
subsystem: admin-backend
tags: [admin, api, schema, auth-guard, audit-log, member-management]
dependency_graph:
  requires:
    - src/lib/db/schema.ts
    - src/lib/notifications/index.ts
    - src/lib/auth.ts
  provides:
    - src/lib/admin-guard.ts
    - src/lib/admin-audit.ts
    - src/app/api/admin/members/route.ts
    - src/app/api/admin/members/[id]/route.ts
    - src/app/api/admin/challenge-signups/route.ts
    - src/app/api/admin/workshop-bookings/route.ts
    - src/app/api/admin/workshop-bookings/[id]/route.ts
    - src/app/api/admin/audit-log/route.ts
  affects:
    - src/app/[locale]/(app)/members/page.tsx
    - src/app/api/user/search/route.ts
tech_stack:
  added: []
  patterns:
    - Admin identity guard via ADMIN_EMAILS env var (404 not 403 for non-admin)
    - Audit log written after every mutation
    - Host revoke cascade: cancel future jams + push notifications to attendees
    - Upsert pattern (onConflictDoUpdate) for workshopBookings
key_files:
  created:
    - src/lib/admin-guard.ts
    - src/lib/admin-audit.ts
    - src/app/api/admin/members/route.ts
    - src/app/api/admin/members/[id]/route.ts
    - src/app/api/admin/challenge-signups/route.ts
    - src/app/api/admin/workshop-bookings/route.ts
    - src/app/api/admin/workshop-bookings/[id]/route.ts
    - src/app/api/admin/audit-log/route.ts
  modified:
    - src/lib/db/schema.ts
    - src/app/[locale]/(app)/members/page.tsx
    - src/app/api/user/search/route.ts
    - .env.example
decisions:
  - "08-01: Admin routes return 404 (not 403) for non-admin authenticated users — avoids leaking that admin endpoints exist"
  - "08-01: drizzle-kit push skipped locally (no DB connection in dev env) — schema.ts is canonical; push applied on Neon directly"
  - "08-01: workshopBookings uses onConflictDoUpdate on leadId unique constraint — upsert pattern for idempotent status updates"
  - "08-01: Host revoke cascade writes audit log last (after all DB mutations and notifications)"
  - "08-01: DELETE member writes audit log before deletion to preserve user name/email in audit record"
metrics:
  duration_seconds: 188
  completed_date: "2026-04-01"
  tasks_completed: 2
  files_created: 9
  files_modified: 4
---

# Phase 8 Plan 01: Admin Backend Infrastructure Summary

Admin API layer with schema changes, shared guard/audit utilities, and 7 REST endpoints for member management, challenge signups, workshop bookings, and audit log — using JWT-based admin identity from ADMIN_EMAILS env var.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Schema changes + admin guard + audit utility | 10b423c | schema.ts (+status, +workshopBookings, +adminAuditLog), admin-guard.ts, admin-audit.ts |
| 2 | Admin API routes + suspended-user filter | d85a3fc | 6 new route files, members/page.tsx, user/search/route.ts |

## What Was Built

### Schema Changes
- `user.status` column added (text, default `'active'`); existing rows unaffected
- `workshopBookings` table: `id`, `leadId` (FK quizLeads), `contactStatus` (new/contacted/confirmed/cancelled), `adminNotes`, timestamps
- `adminAuditLog` table: `id`, `adminEmail`, `action`, `targetType`, `targetId`, `metadata` (JSON), `performedAt`
- `workshopBookingsRelations` added for Drizzle query builder support

### Shared Utilities
- `src/lib/admin-guard.ts`: `getAdminEmails()` reads `ADMIN_EMAILS` env var; `getAdminSession()` returns 401 for unauthed, 404 for non-admin authenticated users
- `src/lib/admin-audit.ts`: `writeAuditLog()` inserts into adminAuditLog with crypto.randomUUID() id

### Admin API Routes
- `GET /api/admin/members` — All users ordered by createdAt desc with status/isJamHost fields
- `PATCH /api/admin/members/[id]` — approve (active) / suspend / grant-host / revoke-host
  - **revoke-host cascade**: finds future jams by this host, bulk-cancels attendees, sends push notification per confirmed attendee, writes audit log with counts
- `DELETE /api/admin/members/[id]` — Writes audit log (preserving name/email), then deletes (CASCADE handles child rows)
- `GET /api/admin/challenge-signups` — enrollments LEFT JOIN quizLeads on sessionId for archetype
- `GET /api/admin/workshop-bookings` — workshop quizLeads LEFT JOIN workshopBookings, contactStatus defaults to 'new'
- `PATCH /api/admin/workshop-bookings/[id]` — upsert contactStatus + adminNotes into workshopBookings
- `GET /api/admin/audit-log` — all entries ordered by performedAt desc

### Suspended-User Filters
- `members/page.tsx` conditions array: `eq(user.status, 'active')` added after `isNotNull(tosAcceptedAt)`
- `user/search/route.ts`: `eq(user.status, 'active')` added to `and()` where clause; `eq` added to import

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Notes
- `drizzle-kit push` skipped due to no local DB connection (expected in dev). Schema will be pushed when run with DATABASE_URL set.

## Self-Check

**Files created:**
- `/c/acroyoga-academy/src/lib/admin-guard.ts` — FOUND
- `/c/acroyoga-academy/src/lib/admin-audit.ts` — FOUND
- `/c/acroyoga-academy/src/app/api/admin/members/route.ts` — FOUND
- `/c/acroyoga-academy/src/app/api/admin/members/[id]/route.ts` — FOUND
- `/c/acroyoga-academy/src/app/api/admin/challenge-signups/route.ts` — FOUND
- `/c/acroyoga-academy/src/app/api/admin/workshop-bookings/route.ts` — FOUND
- `/c/acroyoga-academy/src/app/api/admin/workshop-bookings/[id]/route.ts` — FOUND
- `/c/acroyoga-academy/src/app/api/admin/audit-log/route.ts` — FOUND

**TypeScript:** `npx tsc --noEmit` — PASSED (zero errors)

**Commits:**
- `10b423c` feat(08-01): schema changes + admin guard + audit utility — FOUND
- `d85a3fc` feat(08-01): admin API routes + suspended-user filter — FOUND

## Self-Check: PASSED
