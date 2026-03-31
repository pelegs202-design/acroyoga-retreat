# Phase 1: Foundation + Auth - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a working Next.js application skeleton on Vercel with bilingual Hebrew/English (RTL), PWA install, persistent auth sessions, database layer, and terms acceptance. Every subsequent phase inherits these foundations. No community features, no quiz funnels, no design polish — just the scaffold.

</domain>

<decisions>
## Implementation Decisions

### Auth flow
- Email + password only — no social login (Google, Apple) in v1
- No email verification required — users get immediate access after signup
- Email verification reminder shown later but not blocking
- Quick onboarding wizard after first signup: 2-3 steps (city, base/flyer role, level) so the app feels personalized from the start
- Password reset via standard email link flow (not OTP)

### Language switching
- Default language detected from browser locale — Hebrew for he-IL, English for everyone else
- Toggle displayed as flag icons (IL/US) in the header — visual, compact, always visible
- URL-based routing: `/he/about`, `/en/about` — each language has its own URL for SEO
- Language preference persisted in user profile for logged-in users — overrides URL/cookie on login

### PWA behavior
- Install prompt shown after 2nd visit — avoids annoying first-time browsers
- Placeholder app icon — will be replaced in Phase 2 (Brand Identity)
- Dark/monochrome theme color from day one — set the brutalist tone before brand is finalized

### Offline skeleton
- Claude's Discretion — pick whatever makes sense for a pre-content phase (branded splash or cached shell)

### Terms acceptance
- Separate full-screen step after signup — not an inline checkbox on the signup form
- Users who decline can browse public content but cannot create profile, message, or RSVP
- TOS text generated as part of this phase in both Hebrew and English
- Combined TOS + Privacy Policy in one document — simpler for a community platform
- Acceptance timestamp recorded in database

### Claude's Discretion
- Offline skeleton approach (branded splash vs cached app shell)
- Database schema details for auth and TOS tables
- Email delivery provider for password reset emails (Resend likely, per Phase 7 alignment)
- Exact onboarding wizard step count and field layout
- Heebo font loading strategy

</decisions>

<specifics>
## Specific Ideas

- Brutalist tone starts in Phase 1 with dark/monochrome PWA theme — don't wait for Phase 2
- Onboarding wizard fields (city, role, level) should align with Phase 3's profile schema so no migration is needed later
- Flag toggle should be immediately recognizable without text labels
- TOS should cover community conduct basics since the platform replaces WhatsApp groups

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 1 scope.

</deferred>

---

*Phase: 01-foundation-auth*
*Context gathered: 2026-04-01*
