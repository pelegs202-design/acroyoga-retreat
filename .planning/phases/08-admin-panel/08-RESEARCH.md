# Phase 8: Admin Panel - Research

**Researched:** 2026-04-01
**Domain:** Next.js App Router admin UI, Drizzle ORM schema migrations, TanStack Table, audit logging
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Admin access & authentication**
- Identification: Hardcoded email list in env var (e.g., ADMIN_EMAILS=shai@...) — no DB schema change
- Initially: Just Shai's email — single admin
- Route location: Inside existing /settings page — admin sections appear only if user's email matches
- Visibility: Completely hidden for non-admin users — no trace that admin panel exists
- Confirmations: Confirm destructive actions only (suspend account, revoke host, delete account) — approve/grant is instant
- Audit trail: Yes — log all admin actions to a DB table (who did what, when)
- API error for non-admin: Claude's discretion (404 vs 403)

**Member management UI**
- Display: Table with sortable columns — name, email, city, role, level, status, joined date
- Actions per member: Approve/suspend account, grant/revoke jam host, view full profile, delete account
- Search/filter: Full filtering — text search + filter by status + city + role + level
- Pagination: Load all — fine for <500 users, simplest approach
- Delete: Requires confirmation (destructive action)

**Dashboard layout & data views**
- Organization: Claude's discretion (tabs vs accordion — pick best UX for the data)
- Summary stats: Yes — key metrics at top (total members, active challenges, pending workshops, new signups this week)
- Challenge signups view: Name, email, phone, payment status + amount, quiz archetype result, cohort/start date
- Workshop bookings view: Name, email, phone, booking status (new/contacted/confirmed/cancelled), preferred dates, group size

**Jam host management**
- Location: Both — toggle in member table AND dedicated hosts-only filtered view
- Grant criteria: Claude's discretion (admin's judgment, optionally show member stats)
- Revoke effect: Revoking host status cancels all their future jams (and should notify attendees)

### Claude's Discretion
- Admin section organization (tabs vs accordion vs other)
- API error response for non-admin (404 vs 403)
- Whether to show member stats before granting host
- Table sorting defaults and column widths
- Audit log table schema and display format
- Workshop booking status update mechanism

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ADMIN-01 | Admin can view and manage all community members (approve, suspend) | Schema needs `status` column on `user` table; member management via new `/api/admin/members` route; TanStack Table for client-side sort/filter |
| ADMIN-02 | Admin can grant or revoke jam host permission | `isJamHost` boolean already exists in schema; revoke requires cascade cancel of future `jamSessions` + notify attendees via `queuePushNotification` |
| ADMIN-03 | Admin can view challenge signups with payment status | `challengeEnrollments` joined with `quizLeads` (by sessionId) — both tables exist; no new schema needed |
| ADMIN-04 | Admin can view workshop booking requests | `quizLeads` (quizType='workshop') exists; needs new `workshopContactStatus` column or separate tracking table to store contacted/confirmed/cancelled state |

</phase_requirements>

---

## Summary

Phase 8 adds a hidden admin panel inside the existing Settings page. It is the only page requiring new DB schema additions (user.status column, workshopContactStatus tracking, adminAuditLog table) and a new protected API layer. All data sources already exist — the admin panel is entirely a read/write layer on top of existing tables (`user`, `jamSessions`, `jamAttendees`, `challengeEnrollments`, `quizLeads`).

The architectural pattern is: server component Settings page checks `ADMIN_EMAILS` env var, conditionally renders `<AdminPanel>` client component, which fetches from `/api/admin/*` routes. Each admin route independently re-validates admin identity server-side. The client component uses TanStack Table v8 for the member table with client-side sort/filter on the full load-all dataset.

The most complex operation is host revoke: it must atomically set `isJamHost=false`, find all future jams by that host, cancel each jam (bulk update `jamAttendees` status to 'cancelled'), notify all confirmed attendees via `queuePushNotification`, and log the action to the audit table — all in a single API handler.

**Primary recommendation:** Use tabs (not accordion) for admin section organization — tabs clearly separate the 4 concerns (Members, Challenge Signups, Workshop Bookings, Audit Log) without hiding content behind toggles in a dense admin context.

---

## Standard Stack

### Core (already in project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 16.2.1 | Server components + Route Handlers for admin API | Already in use — server components gate admin render server-side |
| Drizzle ORM | 0.45.2 | Schema migrations + typed queries | Already in use — all DB operations use this |
| Better Auth | 1.5.6 | Session validation in admin routes | Already in use — `auth.api.getSession()` pattern established |
| Zod | 4.3.6 | Input validation in admin API routes | Already in use throughout API layer |

### New Addition Required
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| @tanstack/react-table | 8.21.3 | Client-side sortable/filterable member table | Headless, TypeScript-native, works with React 19; project already uses recharts (TanStack ecosystem) |

### Supporting (already in project, reused)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-intl | 4.8.4 | Hebrew/English i18n for admin UI labels | All visible strings need translation keys |
| framer-motion | 12.38.0 | Tab animations / panel transitions | Already in use for UI transitions |
| zod | 4.3.6 | Admin API body validation | Every admin mutation route |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @tanstack/react-table | Manual HTML table + useState sort | TanStack handles multi-column sort, global filter, column filtering — saves ~200 lines of hand-rolled logic |
| @tanstack/react-table | AG Grid Community | AG Grid is heavier; not needed for <500 rows; TanStack is headless so it fits the project's custom CSS |
| text column for user.status | pgEnum for user.status | Project already uses text columns with app-layer validation (see role, level fields in schema) — consistent to stay with text |

**Installation:**
```bash
npm install @tanstack/react-table
```

---

## Architecture Patterns

### Recommended File Structure
```
src/
├── app/
│   ├── [locale]/(app)/settings/
│   │   └── page.tsx              # Add isAdmin check, conditionally render <AdminPanel>
│   └── api/
│       └── admin/
│           ├── members/
│           │   └── route.ts      # GET all users, with admin guard
│           ├── members/[id]/
│           │   └── route.ts      # PATCH (approve/suspend/host toggle), DELETE
│           ├── challenge-signups/
│           │   └── route.ts      # GET challenge enrollments joined with quiz leads
│           ├── workshop-bookings/
│           │   └── route.ts      # GET + PATCH (update contact status)
│           └── audit-log/
│               └── route.ts      # GET audit entries
├── components/
│   └── admin/
│       ├── AdminPanel.tsx         # Tabs shell, admin-only client component
│       ├── MemberTable.tsx        # TanStack Table member grid
│       ├── MemberActionButtons.tsx
│       ├── ChallengeSignupsTable.tsx
│       ├── WorkshopBookingsTable.tsx
│       └── AdminSummaryStats.tsx
└── lib/
    └── db/
        └── schema.ts             # Add: user.status, workshopContactStatus column, adminAuditLog table
```

### Pattern 1: Admin Identity Check (Server-Side, Two-Layer)

**What:** Every admin surface validates identity twice — once in the Server Component (for UI gating) and once in the API Route Handler (for data security). Never trust only the UI check.

**When to use:** Every admin API route and the Settings server component.

```typescript
// Source: established pattern in this codebase (auth-guard.ts + every API route)

// Layer 1: Settings page.tsx (Server Component)
const session = await getAuthSession();
const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim());
const isAdmin = session && adminEmails.includes(session.user.email);

// Only render if admin — no trace in HTML for non-admins
return (
  <div className="mx-auto max-w-2xl pb-16">
    <NotificationPreferences />
    {isAdmin && <AdminPanel />}
  </div>
);

// Layer 2: Every /api/admin/* route handler
function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!getAdminEmails().includes(session.user.email)) {
    // Use 404 to avoid leaking that an admin endpoint exists
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  // ... admin logic
}
```

**API error choice (Claude's Discretion):** Use **404** for non-admin API requests. 403 reveals that the endpoint exists and the caller is authenticated but lacks permission — 404 reveals nothing. This is the recommended pattern for hidden admin endpoints.

### Pattern 2: TanStack Table with Client-Side Sort + Filter

**What:** Load all users at once into a client component, use TanStack Table for interactive sort/filter/search with no round trips.

**When to use:** Member management table (<500 rows, load-all approach locked).

```typescript
// Source: https://tanstack.com/table/v8/docs/guide/sorting + column-filtering
'use client';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { useState, useMemo } from 'react';

type Member = {
  id: string; name: string; email: string; city: string | null;
  role: string | null; level: string | null; status: string;
  isJamHost: boolean; createdAt: string;
};

export function MemberTable({ members }: { members: Member[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<Member>[]>(() => [
    { accessorKey: 'name', header: 'Name', enableSorting: true },
    { accessorKey: 'email', header: 'Email', enableSorting: true },
    { accessorKey: 'city', header: 'City', enableColumnFilter: true },
    { accessorKey: 'role', header: 'Role', enableColumnFilter: true },
    { accessorKey: 'level', header: 'Level', enableColumnFilter: true },
    { accessorKey: 'status', header: 'Status', enableColumnFilter: true },
    { accessorKey: 'isJamHost', header: 'Host' },
    { accessorKey: 'createdAt', header: 'Joined', enableSorting: true },
    // actions column: id: 'actions', cell: ({ row }) => <MemberActionButtons member={row.original} />
  ], []);

  const table = useReactTable({
    data: members,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  // render table.getHeaderGroups() + table.getRowModel().rows
}
```

### Pattern 3: Host Revoke Cascade

**What:** When revoking host status, atomically: set isJamHost=false, find+cancel all future jams, notify each confirmed attendee, write audit log — all in one API handler.

**When to use:** PATCH /api/admin/members/[id] with action='revoke-host'.

```typescript
// Source: rsvp/route.ts cancellation pattern in this codebase
// Step 1: Set isJamHost = false
await db.update(user).set({ isJamHost: false }).where(eq(user.id, memberId));

// Step 2: Find all future jams by this host
const futureJams = await db
  .select({ id: jamSessions.id, scheduledAt: jamSessions.scheduledAt, location: jamSessions.location })
  .from(jamSessions)
  .where(and(eq(jamSessions.hostId, memberId), gt(jamSessions.scheduledAt, new Date())));

// Step 3: For each jam, cancel all confirmed attendees + notify them
for (const jam of futureJams) {
  const confirmedAttendees = await db
    .select({ id: jamAttendees.id, userId: jamAttendees.userId })
    .from(jamAttendees)
    .where(and(eq(jamAttendees.jamId, jam.id), eq(jamAttendees.status, 'confirmed')));

  // Bulk update attendee status to 'cancelled'
  if (confirmedAttendees.length > 0) {
    await db
      .update(jamAttendees)
      .set({ status: 'cancelled' })
      .where(eq(jamAttendees.jamId, jam.id));

    // Notify each attendee (non-blocking via existing queuePushNotification)
    for (const attendee of confirmedAttendees) {
      await queuePushNotification(
        attendee.userId,
        'jam_rsvp',
        'Jam cancelled',
        `The jam at ${jam.location} was cancelled`,
        '/jams',
      );
    }
  }
}
// Step 4: Write audit log entry
await db.insert(adminAuditLog).values({ /* ... */ });
```

### Pattern 4: Admin Audit Log Write

**What:** Every admin mutation writes a row to `admin_audit_log` with action type, target entity, performing admin, and timestamp.

**When to use:** End of every successful admin action handler.

```typescript
// Utility function — call at end of each successful admin handler
async function writeAuditLog(
  adminEmail: string,
  action: string,           // e.g. 'approve_member', 'revoke_host', 'delete_member'
  targetType: string,        // e.g. 'user', 'jam_session'
  targetId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await db.insert(adminAuditLog).values({
    id: crypto.randomUUID(),
    adminEmail,
    action,
    targetType,
    targetId,
    metadata: metadata ? JSON.stringify(metadata) : null,
    performedAt: new Date(),
  });
}
```

### Pattern 5: Challenge Signup Data Join

**What:** Challenge signups live in `challengeEnrollments` joined to `quizLeads` via `sessionId`. The admin view needs fields from both.

```typescript
// Source: schema.ts — challengeEnrollments.sessionId = quizLeads.sessionId
const signups = await db
  .select({
    enrollmentId: challengeEnrollments.id,
    customerName: challengeEnrollments.customerName,
    customerEmail: challengeEnrollments.customerEmail,
    customerPhone: challengeEnrollments.customerPhone,
    amountPaid: challengeEnrollments.amountPaid,
    status: challengeEnrollments.status,
    paidAt: challengeEnrollments.paidAt,
    cohortStartDate: challengeEnrollments.cohortStartDate,
    archetype: quizLeads.resultType,    // quiz archetype result
  })
  .from(challengeEnrollments)
  .leftJoin(quizLeads, eq(challengeEnrollments.sessionId, quizLeads.sessionId))
  .orderBy(desc(challengeEnrollments.paidAt));
```

### Pattern 6: Workshop Booking Status Tracking

**What:** Workshop bookings currently live only in `quizLeads` (quizType='workshop') with no contact status field. Admin needs to track: new → contacted → confirmed → cancelled. This requires either a new `workshopBookings` table or a `contactStatus` column on `quizLeads`.

**Recommendation:** Add a separate `workshopBookings` table rather than adding nullable columns to `quizLeads`. Reasons: (a) quizLeads has a unique constraint on sessionId making it idempotent — adding mutable state columns creates confusion; (b) workshop tracking is inherently a different concern from lead capture; (c) clean schema separation.

```typescript
// New table to add to schema.ts
export const workshopBookings = pgTable('workshop_bookings', {
  id: text('id').primaryKey(),
  leadId: text('lead_id').notNull().references(() => quizLeads.id, { onDelete: 'cascade' }),
  contactStatus: text('contact_status').notNull().default('new'), // 'new'|'contacted'|'confirmed'|'cancelled'
  adminNotes: text('admin_notes'),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('workshop_bookings_lead_id_idx').on(table.leadId),
  index('workshop_bookings_status_idx').on(table.contactStatus),
  unique('workshop_bookings_lead_unique').on(table.leadId), // 1:1 with quiz lead
]);
```

The admin workshop bookings view joins `quizLeads` (quizType='workshop') with `workshopBookings` (left join — newly submitted leads won't have a booking row yet, default to 'new').

### Anti-Patterns to Avoid

- **Checking admin in middleware only:** Middleware is not a security boundary (CVE-2025-29927); every API route must independently re-validate admin identity.
- **Using client-side `useSession()` to gate admin content:** Client session is async and can flash; admin sections must be server-rendered with the session check happening before any HTML is sent.
- **Revoking host without cascade:** Setting isJamHost=false without cancelling future jams leaves orphaned scheduled jams that the ex-host can no longer manage and attendees cannot cancel from.
- **Skipping audit log on any mutation:** Even "small" actions like approve need an audit trail; write audit log inside the same try/catch block as the mutation so failures are visible.
- **pgEnum for user.status:** This project uses text columns with application-layer validation for role/level — use text for status too, validated in Zod. pgEnum changes require ALTER TYPE migrations which are fragile.

---

## Schema Changes Required

Three new schema additions needed. All follow patterns already established in schema.ts.

### 1. Add `status` column to `user` table

```typescript
// In schema.ts, inside the user pgTable definition — add after isJamHost:
status: text('status').notNull().default('active'), // 'active' | 'suspended' | 'pending'
```

**Migration:** `drizzle-kit generate` then `drizzle-kit migrate`

**Notes:**
- Default 'active' means all existing users are unaffected
- 'pending' = registered but not yet approved (if admin wants to gate new signups)
- 'suspended' = admin action, hides user from member search (add `eq(user.status, 'active')` condition to existing member queries)

### 2. New `workshopBookings` tracking table

```typescript
export const workshopBookings = pgTable('workshop_bookings', {
  id: text('id').primaryKey(),
  leadId: text('lead_id').notNull().references(() => quizLeads.id, { onDelete: 'cascade' }),
  contactStatus: text('contact_status').notNull().default('new'),
  adminNotes: text('admin_notes'),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('workshop_bookings_lead_id_idx').on(table.leadId),
  unique('workshop_bookings_lead_unique').on(table.leadId),
]);
```

### 3. New `adminAuditLog` table

```typescript
export const adminAuditLog = pgTable('admin_audit_log', {
  id: text('id').primaryKey(),
  adminEmail: text('admin_email').notNull(),
  action: text('action').notNull(),        // approve_member | suspend_member | delete_member | grant_host | revoke_host | update_workshop_status
  targetType: text('target_type').notNull(), // user | jam_session | workshop_booking
  targetId: text('target_id').notNull(),
  metadata: text('metadata'),              // JSON string for extra context (old/new values)
  performedAt: timestamp('performed_at').defaultNow().notNull(),
}, (table) => [
  index('admin_audit_log_performed_at_idx').on(table.performedAt),
  index('admin_audit_log_admin_email_idx').on(table.adminEmail),
]);
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Member table sort/filter/search | Custom useState sort logic | @tanstack/react-table | Multi-column sort, global filter, column filters, type-safety — 200+ lines of edge cases handled |
| Admin identity check utility | Inline env-var parsing everywhere | Shared `isAdminEmail(email)` helper | DRY, single place to change format of ADMIN_EMAILS |
| Attendee notification loop | Custom push logic | `queuePushNotification()` from `@/lib/notifications` | Already handles quiet hours, batch keys, existing schema |
| Audit log writes | Ad-hoc db.insert per route | `writeAuditLog()` shared utility | Consistent schema, metadata format, error isolation |

**Key insight:** The project already has all the heavy infrastructure (push notifications, Drizzle queries, session validation pattern). Admin panel is pure application logic on top — resist adding new libraries beyond @tanstack/react-table.

---

## Common Pitfalls

### Pitfall 1: Admin Check Only in UI Layer
**What goes wrong:** Admin sections appear to be hidden, but `/api/admin/*` routes are accessible to any authenticated user who knows the URL.
**Why it happens:** Developer adds `if (!isAdmin) return null` in the React component and forgets the API is a separate surface.
**How to avoid:** Every route handler in `/api/admin/*` must call `getAdminEmails()` and validate `session.user.email` before touching any data. Write a shared `assertAdmin(session)` helper function and call it at the top of every handler.
**Warning signs:** API route that only checks `if (!session)` without checking admin email.

### Pitfall 2: Host Revoke Without Cascade
**What goes wrong:** Admin sets `isJamHost=false` but future jams by that user remain in the DB. Attendees show up for a jam with no host.
**Why it happens:** Simple PATCH to isJamHost field without thinking about downstream state.
**How to avoid:** Host revoke is a multi-step transaction: (1) update user, (2) find future jams, (3) cancel attendees, (4) notify attendees, (5) audit log. Always do all 5 in one handler, non-atomically but sequentially with error logging between steps.
**Warning signs:** PATCH route that only updates `isJamHost` and returns immediately.

### Pitfall 3: Suspended User Still Appears in Member Search
**What goes wrong:** Admin suspends a user but they still show up in partner search, member grid, and jam attendee lists.
**Why it happens:** Existing queries in members/page.tsx and user/search/route.ts don't filter by status (field doesn't exist yet).
**How to avoid:** After adding `user.status`, add `eq(user.status, 'active')` condition to: `src/app/[locale]/(app)/members/page.tsx`, `src/app/api/user/search/route.ts`. Also exclude suspended users from jam attendee eligibility.
**Warning signs:** Members page still shows all users after suspension test.

### Pitfall 4: Workshop Bookings Missing from Admin View
**What goes wrong:** Admin visits workshop bookings table and sees nothing, or sees stale data.
**Why it happens:** Workshop leads are in `quizLeads` with `quizType='workshop'` — not a dedicated table. The join to `workshopBookings` (new table) uses left join; new leads have no booking row yet and display as 'new' status.
**How to avoid:** Use LEFT JOIN, not INNER JOIN, between quizLeads and workshopBookings. Treat NULL booking row as status='new'. The admin update action (PATCH) must INSERT if no row exists (upsert pattern) rather than UPDATE.
**Warning signs:** Workshop bookings count is 0 immediately after a workshop lead submits.

### Pitfall 5: `user.status` Default Not Set
**What goes wrong:** Adding `status text NOT NULL DEFAULT 'active'` migration on a non-empty table — if the migration doesn't include the DEFAULT, the ALTER TABLE fails.
**Why it happens:** Drizzle-kit generate usually handles this, but custom migration edits can strip defaults.
**How to avoid:** Verify generated migration SQL includes `DEFAULT 'active'` in the ALTER TABLE statement before running. The generated SQL should look like: `ALTER TABLE "user" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;`
**Warning signs:** Migration fails with "column cannot contain null values" on a populated table.

### Pitfall 6: Admin Panel Client Component Flashes for Non-Admins
**What goes wrong:** Non-admin sees a brief flash of the admin section before React hydrates and hides it.
**Why it happens:** Admin check done in a client component with `useSession()` which is async.
**How to avoid:** Admin check MUST happen in the Settings Server Component (`page.tsx`). Pass `isAdmin` as a prop to the Settings page markup — the admin section is either rendered in HTML or not. Never check admin in a client component that fetches its own session.
**Warning signs:** `{isAdmin && <AdminPanel />}` inside a `'use client'` component.

---

## Code Examples

### Admin Guard Helper (shared across all admin routes)

```typescript
// Source: established auth.api.getSession() pattern in this codebase
// File: src/lib/admin-guard.ts (new utility)

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);
}

export async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (!getAdminEmails().includes(session.user.email)) {
    return { session: null, error: NextResponse.json({ error: 'Not found' }, { status: 404 }) };
  }
  return { session, error: null };
}
```

### Admin API Route Template

```typescript
// File: src/app/api/admin/members/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-guard';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(_request: NextRequest) {
  const { session, error } = await getAdminSession();
  if (error) return error;

  const members = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      city: user.city,
      role: user.role,
      level: user.level,
      status: user.status,
      isJamHost: user.isJamHost,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt));

  return NextResponse.json({ members });
}
```

### Settings Page Admin Conditional (Server Component)

```typescript
// File: src/app/[locale]/(app)/settings/page.tsx
import { getAuthSession } from '@/lib/auth-guard';
import { getAdminEmails } from '@/lib/admin-guard';
import { AdminPanel } from '@/components/admin/AdminPanel';

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getAuthSession();
  if (!session) redirect({ href: '/sign-in', locale });

  const isAdmin = getAdminEmails().includes(session.user.email);

  return (
    <div className="mx-auto max-w-2xl pb-16">
      <h1 className="mb-8 text-3xl font-bold text-neutral-100">{t('title')}</h1>
      <NotificationPreferences />
      {isAdmin && <AdminPanel />}
    </div>
  );
}
```

### Drizzle Migration Workflow

```bash
# 1. Edit src/lib/db/schema.ts (add status to user, add workshopBookings, add adminAuditLog)
# 2. Generate migration SQL
npx drizzle-kit generate

# 3. Review generated SQL in /drizzle/ — verify:
#    ALTER TABLE "user" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;
#    CREATE TABLE "workshop_bookings" ...
#    CREATE TABLE "admin_audit_log" ...

# 4. Apply to DB
npx drizzle-kit migrate
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Table v7 (class-based) | @tanstack/react-table v8 (hooks) | 2022 | v8 is fully TypeScript, headless, framework-agnostic |
| next-auth for auth | Better Auth | 2024 | Better Auth is already in this project; don't introduce next-auth |
| Separate /admin route | Section inside Settings page | Project decision | Avoids new route, no nav link to discover |
| pgEnum for status fields | text with app-layer validation | This project's pattern | Avoids fragile ALTER TYPE migrations in production |

**Deprecated/outdated patterns:**
- Middleware-only auth protection: Not valid since CVE-2025-29927; middleware cannot be a security boundary
- Client-side `useSession()` for admin gating: Creates flash-of-content, not server-authoritative

---

## Open Questions

1. **Should suspended users be able to log in?**
   - What we know: CONTEXT.md says "suspend account" — account exists but is blocked
   - What's unclear: Does suspend mean "can't log in" or "logged in but can't participate"? Better Auth has no built-in `banUser` without the admin plugin
   - Recommendation: For Phase 8, implement suspend as "hidden from member search + blocked from RSVP/message APIs" rather than blocking login. Full login block requires Better Auth admin plugin or custom session invalidation — defer to future phase.

2. **Do workshop quiz leads auto-create a workshopBookings row on submission?**
   - What we know: The quiz/workshop route inserts into quizLeads only
   - What's unclear: Should Phase 8 add a trigger to auto-create a 'new' workshopBookings row on lead insert, or should the admin view handle NULL via LEFT JOIN?
   - Recommendation: LEFT JOIN + treat NULL as 'new' in the API response. Auto-create rows on demand (PATCH upsert) when admin first updates status. Simpler than modifying the quiz submission route.

3. **Summary stats "new signups this week" — which table?**
   - What we know: Users register via Better Auth into the `user` table (createdAt); quiz leads go to quizLeads
   - What's unclear: "New signups" means community member registrations (user table) vs quiz leads (quizLeads table)
   - Recommendation: Count from `user` table for "new community members this week" and separately count `quizLeads.createdAt` for "new quiz leads this week". Both are useful; show both as separate stats.

---

## Sources

### Primary (HIGH confidence)
- Codebase read: `src/lib/db/schema.ts` — full schema, all existing tables and columns
- Codebase read: `src/lib/auth.ts`, `src/lib/auth-guard.ts` — admin guard pattern baseline
- Codebase read: `src/app/api/jams/[id]/rsvp/route.ts` — attendee notification pattern for host revoke cascade
- Codebase read: `src/app/api/user/update-profile/route.ts` — Drizzle update pattern, session validation
- Codebase read: `src/app/[locale]/(app)/settings/page.tsx` — existing settings page structure
- Codebase read: `src/lib/notifications/index.ts` — `queuePushNotification` signature and behavior
- Codebase read: `src/app/api/quiz/workshop/route.ts` — workshop data structure (answers JSON fields)
- Codebase read: `package.json` — exact library versions in use

### Secondary (MEDIUM confidence)
- [TanStack Table v8 Sorting Guide](https://tanstack.com/table/v8/docs/guide/sorting) — verified: getSortedRowModel, SortingState APIs
- [TanStack Table v8 Column Filtering](https://tanstack.com/table/v8/docs/guide/column-filtering) — verified: getFilteredRowModel, ColumnFiltersState APIs
- [@tanstack/react-table npm](https://www.npmjs.com/package/@tanstack/react-table) — current version: 8.21.3
- [Drizzle ORM Migrations](https://orm.drizzle.team/docs/migrations) — generate + migrate workflow
- [Next.js Security Best Practices 2026](https://www.authgear.com/post/nextjs-security-best-practices) — middleware not a security boundary
- [Next.js forbidden() function](https://nextjs.org/docs/app/api-reference/functions/forbidden) — 404 vs 403 choice confirmed

### Tertiary (LOW confidence)
- WebSearch: audit log schema pattern — not verified against official Drizzle docs; pattern is custom application logic, not library-specific
- WebSearch: workshop booking status tracking — general SaaS patterns, not framework-specific

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all core libraries read from package.json directly; TanStack Table version from npm
- Schema changes: HIGH — read full schema.ts; additions derived directly from requirements and existing patterns
- Architecture: HIGH — all patterns derived from reading actual codebase files
- Host revoke cascade: HIGH — derived directly from existing rsvp/route.ts cancellation logic
- Pitfalls: HIGH — admin gating pitfalls from CVE-2025-29927 research; others derived from code reading
- Workshop booking status: MEDIUM — no existing booking tracking table; recommendation is judgment call

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (Drizzle, TanStack Table APIs are stable; Next.js 16 App Router patterns stable)
