# Phase 8: Admin Panel - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin dashboard for the site owner to manage members, jam hosts, challenge signups, and workshop bookings without touching the database. All admin functionality lives within the existing Settings page, visible only to admin users.

</domain>

<decisions>
## Implementation Decisions

### Admin access & authentication
- **Identification:** Hardcoded email list in env var (e.g., ADMIN_EMAILS=shai@...) — no DB schema change
- **Initially:** Just Shai's email — single admin
- **Route location:** Inside existing /settings page — admin sections appear only if user's email matches
- **Visibility:** Completely hidden for non-admin users — no trace that admin panel exists
- **Confirmations:** Confirm destructive actions only (suspend account, revoke host, delete account) — approve/grant is instant
- **Audit trail:** Yes — log all admin actions to a DB table (who did what, when)
- **API error for non-admin:** Claude's discretion (404 vs 403)

### Member management UI
- **Display:** Table with sortable columns — name, email, city, role, level, status, joined date
- **Actions per member:** Approve/suspend account, grant/revoke jam host, view full profile, delete account
- **Search/filter:** Full filtering — text search + filter by status + city + role + level
- **Pagination:** Load all — fine for <500 users, simplest approach
- **Delete:** Requires confirmation (destructive action)

### Dashboard layout & data views
- **Organization:** Claude's discretion (tabs vs accordion — pick best UX for the data)
- **Summary stats:** Yes — key metrics at top (total members, active challenges, pending workshops, new signups this week)
- **Challenge signups view:** Name, email, phone, payment status + amount, quiz archetype result, cohort/start date
- **Workshop bookings view:** Name, email, phone, booking status (new/contacted/confirmed/cancelled), preferred dates, group size

### Jam host management
- **Location:** Both — toggle in member table AND dedicated hosts-only filtered view
- **Grant criteria:** Claude's discretion (admin's judgment, optionally show member stats)
- **Revoke effect:** Revoking host status cancels all their future jams (and should notify attendees)

### Claude's Discretion
- Admin section organization (tabs vs accordion vs other)
- API error response for non-admin (404 vs 403)
- Whether to show member stats before granting host
- Table sorting defaults and column widths
- Audit log table schema and display format
- Workshop booking status update mechanism

</decisions>

<specifics>
## Specific Ideas

- Admin panel must feel like a natural extension of the Settings page, not a separate app
- Load-all approach for member table — community is small (<500), keep it simple
- Audit trail is important — want to know who did what and when
- Revoking host is a serious action — must cascade to cancel upcoming jams

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-admin-panel*
*Context gathered: 2026-04-04*
