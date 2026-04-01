# Phase 3: Community Profiles + Partner Matching - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Members can build complete profiles (photo, bio, city, role, level, skills checklist) and find compatible acroyoga partners near them. Users can view other profiles and leave private feedback after practicing together. This is the platform's core value proposition — if partner matching works, everything else follows.

</domain>

<decisions>
## Implementation Decisions

### Profile page layout
- Full page with distinct sections: hero photo, about, skills, reviews
- Single photo upload (one profile photo, not gallery)
- Photo storage: Vercel Blob
- Empty sections show prompts to complete ("Add your bio to help partners find you") — nudge, don't hide
- Profile info: name, photo, city, role (base/flyer/both), level, bio, skills checklist, feedback count

### Partner search & filtering
- Three primary filters: city/area, role (base/flyer/both), skill level
- Specific moves filter NOT included (city/role/level are enough)
- Zero results: show broadening suggestion ("No exact matches. Try removing the level filter.")
- Claude's discretion: results display format (card grid vs list) and filter UI placement (sticky bar vs slide-out)

### Skills checklist
- Organized by category: Standing, L-basing, Inversions, Flows, Washing Machines, etc.
- Tap-to-toggle pink chip pills (selected = pink bg, unselected = neutral)
- Claude compiles the standard acroyoga move list with categories — user reviews and approves
- On other people's profiles: show top 5-8 skills + "and X more" (expandable)
- Move data stored as a static list in code (not DB-managed) — can be updated in future phases

### Ratings & reviews
- Thumbs up/down system (not star rating) — less pressure, more honest
- Gated: both users must have RSVPed to the same jam session before reviewing
- Rating includes optional 1-2 sentence text comment
- Reviews are PRIVATE — only the reviewed person sees their feedback
- No public rating displayed on profiles (since reviews are private)
- Profile shows feedback count only ("3 reviews received") without exposing content or sentiment

### Claude's Discretion
- Search results display format (card grid vs list rows)
- Filter UI pattern (sticky top vs slide-out panel) — should be mobile-first
- Exact categories and moves in the skills checklist (Claude researches and proposes)
- Profile section ordering and spacing
- How the "X more skills" expansion works (inline expand vs modal)

</decisions>

<specifics>
## Specific Ideas

- Reviews gated by shared jam attendance creates a trust loop: practice together → leave honest feedback → build reputation. This only works once Phase 4 (Jam Board) exists, so the review feature should be built but will only be fully functional after jams are live.
- The skills checklist should feel fun to fill out — tap-to-toggle pink chips should have satisfying micro-interactions (snap, color transition).
- Private feedback model means profiles show social proof through activity (jams attended, skills known) rather than public ratings.

</specifics>

<deferred>
## Deferred Ideas

- Public review display — could enable later if community requests it
- Skills filtering in partner search — only city/role/level for now
- Photo gallery (multiple photos) — single photo for V1
- Skill-based matching algorithm (surfaces complementary partners) — V2 requirement MATCH-01

</deferred>

---

*Phase: 03-community-profiles-partner-matching*
*Context gathered: 2026-04-01*
