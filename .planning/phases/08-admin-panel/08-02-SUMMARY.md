---
phase: 08-admin-panel
plan: "02"
subsystem: admin-ui
tags: [admin, ui, tanstack-table, i18n, settings, member-management]
dependency_graph:
  requires:
    - src/lib/admin-guard.ts
    - src/app/api/admin/members/route.ts
    - src/app/api/admin/challenge-signups/route.ts
    - src/app/api/admin/workshop-bookings/route.ts
    - src/app/api/admin/audit-log/route.ts
  provides:
    - src/components/admin/AdminPanel.tsx
    - src/components/admin/AdminSummaryStats.tsx
    - src/components/admin/MemberTable.tsx
    - src/components/admin/MemberActionButtons.tsx
    - src/components/admin/ChallengeSignupsTable.tsx
    - src/components/admin/WorkshopBookingsTable.tsx
    - src/components/admin/AuditLogTable.tsx
  affects:
    - src/app/[locale]/(app)/settings/page.tsx
    - messages/en.json
    - messages/he.json
tech_stack:
  added:
    - "@tanstack/react-table@8.21.3"
  patterns:
    - TanStack Table with SortingState + ColumnFiltersState + globalFilter
    - Server-side admin gate in Next.js Server Component (zero client flash)
    - Inline-editable table cells (notes field) with onBlur/Enter save
    - Lazy data fetch per tab (audit log fetched only when tab opened)
    - Framer Motion AnimatePresence for tab content transitions
key_files:
  created:
    - src/components/admin/AdminPanel.tsx
    - src/components/admin/AdminSummaryStats.tsx
    - src/components/admin/MemberTable.tsx
    - src/components/admin/MemberActionButtons.tsx
    - src/components/admin/ChallengeSignupsTable.tsx
    - src/components/admin/WorkshopBookingsTable.tsx
    - src/components/admin/AuditLogTable.tsx
  modified:
    - src/app/[locale]/(app)/settings/page.tsx
    - messages/en.json
    - messages/he.json
    - package.json
decisions:
  - "08-02: AdminPanel imports Task 2 files causing tsc errors if run mid-task — committed both tasks before tsc check was blocking"
  - "08-02: AuditLogTable uses hardcoded ACTION_LABELS map alongside useTranslations — audit.actions namespace strings available but map used for DRY action mapping"
  - "08-02: WorkshopBookingsTable PATCH uses leadId (not id) as URL param to match existing /api/admin/workshop-bookings/[id] route which accepts leadId"
  - "08-02: MemberTable hostsOnly toggle filters data before passing to TanStack Table — cleaner than adding a custom filter function to the column"
metrics:
  duration_seconds: 324
  completed_date: "2026-04-03"
  tasks_completed: 2
  files_created: 7
  files_modified: 4
---

# Phase 8 Plan 02: Admin Panel UI Summary

Complete admin UI with 7 new components — tabbed panel (Members, Challenge Signups, Workshop Bookings, Audit Log), TanStack Table member grid with sort/filter/search/hosts-toggle, inline-editable workshop bookings, and server-side admin gating in the Settings page with full bilingual i18n.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | TanStack Table install + AdminPanel + SummaryStats + MemberTable + ActionButtons | 6fcf346 | AdminPanel.tsx, AdminSummaryStats.tsx, MemberTable.tsx, MemberActionButtons.tsx, package.json |
| 2 | Challenge/Workshop/Audit tables + Settings integration + i18n | bb0987b | ChallengeSignupsTable.tsx, WorkshopBookingsTable.tsx, AuditLogTable.tsx, settings/page.tsx, en.json, he.json |

## What Was Built

### Admin Component Shell
- `AdminPanel.tsx`: Client component with 4 tabs using `useState<Tab>`. Framer Motion `AnimatePresence`+`fadeUp` for tab transitions. Fetches members+signups+bookings on mount in parallel; lazy-fetches audit log when that tab is first opened. Exports type definitions for all data shapes (AdminMember, ChallengeSignup, WorkshopBooking, AuditLogEntry) used across child components.
- `AdminSummaryStats.tsx`: 2x2 grid stat cards — Total Members, New This Week (7-day filter), Active Challenges (status='confirmed'), Pending Workshops (contactStatus='new'/null).

### Member Management
- `MemberTable.tsx`: TanStack Table with `SortingState + getSortedRowModel`, `ColumnFiltersState + getFilteredRowModel`, `globalFilter` text search across name+email. Filter row: text input + status/city/role/level dropdowns + hosts-only toggle button. Status column shows green/red dot+text. isJamHost shows pink "Host" badge.
- `MemberActionButtons.tsx`: Per-row approve/suspend/grant-host/revoke-host/view/delete. Destructive actions (suspend, revoke-host, delete) use `window.confirm()`. Loading state disables all buttons during API calls.

### Data Tables
- `ChallengeSignupsTable.tsx`: Simple HTML table — name/email/phone/amount/status/archetype/cohort/paidAt. Status badges: confirmed=green, refunded=red. Empty state shown when no signups.
- `WorkshopBookingsTable.tsx`: Inline-editable status dropdown (triggers PATCH on change). Inline notes editing — click to edit, saves on blur or Enter, Escape cancels. Parses `answers` JSON to extract groupType/groupSize/preferredDates with try/catch fallback to "—". PATCH targets `/api/admin/workshop-bookings/{leadId}`.
- `AuditLogTable.tsx`: Read-only table with `ACTION_LABELS` map for human-readable action names. Metadata JSON parsed to `key: value` pairs. Formatted datetime with time.

### Settings Integration
- `settings/page.tsx`: Added `isAdminEmail` import + server-side `isAdmin` constant. `AdminPanel` conditionally rendered after `NotificationPreferences` inside a `border-t border-neutral-800 mt-12 pt-8` divider. Non-admin users see zero HTML trace of admin functionality — no client-side flash possible.

### i18n
- Both `messages/en.json` and `messages/he.json` extended with full `admin` namespace: title, tabs (4), stats (4), members (all column headers + filter labels + confirm strings + action labels), challenge (8 columns), workshop (9 columns + 4 status labels), audit (6 columns + 6 action label mappings).

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

**Files created:**
- `/c/acroyoga-academy/src/components/admin/AdminPanel.tsx` — FOUND
- `/c/acroyoga-academy/src/components/admin/AdminSummaryStats.tsx` — FOUND
- `/c/acroyoga-academy/src/components/admin/MemberTable.tsx` — FOUND
- `/c/acroyoga-academy/src/components/admin/MemberActionButtons.tsx` — FOUND
- `/c/acroyoga-academy/src/components/admin/ChallengeSignupsTable.tsx` — FOUND
- `/c/acroyoga-academy/src/components/admin/WorkshopBookingsTable.tsx` — FOUND
- `/c/acroyoga-academy/src/components/admin/AuditLogTable.tsx` — FOUND

**TypeScript:** `npx tsc --noEmit` — PASSED (zero errors)

**Build:** `npm run build` — PASSED (only pre-existing Serwist warning)

**Commits:**
- `6fcf346` feat(08-02): install TanStack Table + AdminPanel shell + MemberTable + actions — FOUND
- `bb0987b` feat(08-02): challenge/workshop/audit tables + Settings integration + i18n — FOUND

## Self-Check: PASSED
