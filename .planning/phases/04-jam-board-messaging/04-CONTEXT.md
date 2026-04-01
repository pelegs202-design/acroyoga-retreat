# Phase 4: Jam Board + Messaging - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Community members can coordinate practice through posted jam sessions (with RSVP, capacity, waitlist) and exchange 1:1 direct messages in real time via Ably. Replaces WhatsApp group coordination chaos. No group chat, no reactions, no voice — simple 1:1 text DMs and structured jam event posts.

</domain>

<decisions>
## Implementation Decisions

### Jam session posting
- Fields: date & time, location (free text), capacity (max spots), level requirement, optional description/notes
- Approved hosts only — admin must grant jam host permission first
- Host approval via DB flag: `isJamHost` boolean on user table, set manually via DB until admin panel (Phase 8)
- Optional description field for context ("bring a mat", "focusing on washing machines today")

### RSVP & waitlist
- Auto-waitlist when jam is full — users join waitlist, get auto-promoted when someone cancels
- Waitlist promotion notification via email (Resend) — immediate notification when promoted
- Cancellation locked 4 hours before jam start — prevents last-minute flaking
- After 4-hour lock, user cannot cancel (committed)
- Waitlist auto-promotion is FIFO (first to join waitlist gets promoted first)

### Direct messaging UX
- Full-screen chat layout (mobile-first, like iMessage) — conversation list is one page, tapping opens full-screen chat thread
- Two entry points: "Message" button on member profiles + "New message" button in conversations list
- No read receipts — just sent timestamps, less pressure
- Unread message badge in header — pink dot or count on Messages link
- Polling-based (every 3-5 seconds) — no Ably dependency, simpler stack. Can upgrade to WebSockets later if needed.
- Text only — no images, files, reactions, or voice messages

### Jam board layout
- Timeline/feed layout — vertical list sorted by date, next jam at top
- Past jams shown below upcoming in a "Past" section for reference
- City + level filters (same pattern as partner search — consistent UX)
- Show attendee avatars/names on each jam card — social proof, see who's going
- Each card shows: date/time, location, host name, spots remaining (e.g. "4/8"), level, RSVP or Join Waitlist button

### Claude's Discretion
- Ably channel architecture (per-conversation channels vs shared)
- Message pagination / lazy loading approach
- How "New message" picker works in conversations list (search/select member)
- Jam card visual design details within brutalist dark theme
- Whether past jams section is collapsed by default
- How attendee avatars display (inline row, stacked, etc.)

</decisions>

<specifics>
## Specific Ideas

- The jam board should feel like an event feed, not a calendar. Direct, scannable, action-oriented.
- Waitlist auto-promotion + email notification creates urgency — "a spot opened up, grab it"
- The 4-hour cancellation lock is a community-trust feature — it signals commitment
- "Message" button on profiles creates a natural flow: browse partners → find someone → message them → arrange to jam
- The review system from Phase 3 gates on shared jam attendance — once jams are live, the `canReview()` stub should be replaced with real jam attendance lookup

</specifics>

<deferred>
## Deferred Ideas

- Push notifications for new messages — Phase 7 (Notifications)
- WhatsApp reminders for upcoming jams — Phase 7
- Group chat in jam threads — out of scope, keep 1:1 only
- Recurring jams (weekly schedule) — future feature, not V1
- Jam cancellation by host — build when needed
- Replace canReview() stub with real jam attendance check — do during Phase 4 execution since jams table will exist

</deferred>

---

*Phase: 04-jam-board-messaging*
*Context gathered: 2026-04-01*
