---
phase: 04-jam-board-messaging
plan: 03
subsystem: api
tags: [drizzle, postgres, nextjs, messaging, polling, pagination]

# Dependency graph
requires:
  - phase: 04-01
    provides: conversations, directMessages, conversationReads schema tables in Neon

provides:
  - GET /api/messages — conversation list with last message preview, other user info, unread status
  - POST /api/messages — lazy conversation creation with sorted participant IDs, send first message
  - GET /api/messages/[conversationId] — cursor-based paginated message history, auto mark-as-read
  - POST /api/messages/[conversationId] — send message in existing conversation, updates lastMessageAt
  - GET /api/messages/unread — efficient single-query unread count for header badge polling

affects: [04-05-messaging-ui, header-badge-component]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Cursor-based pagination via ISO timestamp `before` query param
    - Upsert pattern for conversationReads using select-then-insert/update (Neon HTTP driver lacks onConflictDoUpdate)
    - Raw sql`` tag for complex multi-table aggregation queries (unread count)
    - Sorted participant IDs (A < B) enforced at POST handler layer before DB insert

key-files:
  created:
    - src/app/api/messages/route.ts
    - src/app/api/messages/[conversationId]/route.ts
    - src/app/api/messages/unread/route.ts
  modified: []

key-decisions:
  - "04-03: inArray batch query used for other-user details and last messages — avoids N+1 pattern in conversation list"
  - "04-03: hasUnread excludes own messages (senderId !== userId) — prevents self-messages from triggering badge"
  - "04-03: Unique constraint race condition in POST /api/messages caught via pgErr.code === '23505' with re-fetch — safe concurrent conversation creation"
  - "04-03: Unread count uses raw sql`` not Drizzle builder — complex LEFT JOIN with OR + IS NULL conditions are cleaner in raw SQL"
  - "04-03: conditions array typed as ReturnType<typeof eq>[] for dynamic Drizzle and(...conditions) spread — avoids type errors with lt() mixed in"

patterns-established:
  - "Conversation participant lookup: always check participantA and participantB, return 403 not 404 when user found but not participant"
  - "Read tracking: fetching messages auto-marks as read; sending auto-marks sender as read"
  - "Pagination: before=ISO-timestamp cursor, limit=1-100 (default 50), hasMore indicates more pages"

requirements-completed: [COMM-02]

# Metrics
duration: 4min
completed: 2026-04-01
---

# Phase 4 Plan 03: Messaging API Summary

**Three REST API endpoints implementing full 1:1 messaging CRUD: lazy conversation creation with sorted participant IDs, cursor-based paginated history with auto-read-tracking, and a single-query unread count for polling.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-01T17:51:22Z
- **Completed:** 2026-04-01T17:55:42Z
- **Tasks:** 3
- **Files modified:** 3 created

## Accomplishments
- GET /api/messages returns full conversation list: other user details (batched via inArray), last message preview, unread indicator per conversation
- POST /api/messages lazily creates conversation on first message with sorted participant IDs (A < B) and race-condition safety (unique constraint catch + re-fetch)
- GET /api/messages/[conversationId] returns cursor-based paginated history (oldest-first display), auto-marks as read on fetch
- POST /api/messages/[conversationId] sends to existing thread, updates lastMessageAt, marks sender as read
- GET /api/messages/unread uses single efficient SQL query (no N+1) for 5-10 second polling cadence

## Task Commits

Each task was committed atomically:

1. **Task 1: Conversation list and new conversation endpoints** - `53c269c` (feat)
2. **Task 2: Message history and send-in-thread endpoints** - `4e47cee` (feat)
3. **Task 3: Unread count endpoint for header badge** - `958d117` (feat)

## Files Created/Modified
- `src/app/api/messages/route.ts` - GET conversation list + POST lazy conversation creation
- `src/app/api/messages/[conversationId]/route.ts` - GET paginated history + POST send message
- `src/app/api/messages/unread/route.ts` - GET unread count via single aggregation SQL query

## Decisions Made
- Batch-fetched other-user details with `inArray` instead of per-conversation queries — avoids N+1 problem
- `hasUnread` excludes own messages (`senderId !== userId`) so self-sent messages don't trigger the badge
- Race condition in conversation creation handled by catching `pgErr.code === '23505'` and re-fetching — safe for concurrent first-message sends
- Raw `sql` tag used for unread count query — complex LEFT JOIN with OR + IS NULL is cleaner than verbose Drizzle builder chain
- `conditions` array typed as `ReturnType<typeof eq>[]` to allow mixing `eq()` and `lt()` in the `and(...conditions)` spread

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three message API routes are in place and type-safe
- Plan 04-04 (jam board API) can proceed independently
- Plan 04-05 (messaging UI) can now implement the polling pattern — calls GET /api/messages every 3s for active chat, GET /api/messages/unread every 10s for header badge

---
*Phase: 04-jam-board-messaging*
*Completed: 2026-04-01*
