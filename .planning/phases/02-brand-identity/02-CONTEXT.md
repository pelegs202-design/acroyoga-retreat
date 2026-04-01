# Phase 2: Brand Identity - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the placeholder "AcroYoga Academy" brand with AcroHavura (אקרוחבורה) across the entire codebase. Apply visual identity tokens (accent color, typography), restyle interactive elements, generate branded PWA icons, and align brand voice. No new features — this is rename + identity application.

</domain>

<decisions>
## Implementation Decisions

### Brand accent color
- Hot pink/magenta (#F472B6 / pink-400) as the primary brand accent color
- Pink used everywhere — buttons, links, active states, toggles, all interactive elements
- Add a secondary muted pink shade for hover states, borders, and subtle backgrounds
- All current white/neutral-100 primary buttons switch to pink in Phase 2 (not deferred to Phase 10)
- Both shades must pass WCAG AA contrast (5.4:1+) against #0a0a0a background

### Wordmark styling
- Heebo 900 (font-black) weight for the brand name — not the current font-bold (700)
- Mixed-case: "AcroHavura" (not ALL CAPS)
- Brand name color is pink (accent color), not white
- Size bumped from text-lg to text-xl for more presence
- Tight tracking (tracking-tight)
- Hebrew wordmark (אקרוחבורה) matches exactly — same weight, color, size, tracking
- Apply to Header component and offline page

### PWA icon design
- Claude's discretion on icon content (initials, geometric shape, or mark)
- Sharp square edges — no rounded corners (brutalist)
- Dark #0a0a0a background with pink accent element
- Code-generated placeholder icons for now — real designed icons deferred to Phase 10
- Must be valid PNGs at 192x192 and 512x512

### Tone & personality
- Brand voice is direct & bold — "Find your partner." "Join the jam." Short, punchy, no fluff
- Password reset email matches bold brand voice — no pleasantries, just action
- TOS keeps legal/formal tone — it's a legal document, don't casualize it
- Homepage tagline stays as-is: "Find your perfect acro partner" / "מצאו את הפרטנר המושלם לאקרו"

### Claude's Discretion
- PWA icon design specifics (initials vs geometric shape)
- Exact muted pink shade value
- Email copy wording within "direct & bold" constraint
- Any typography adjustments needed for Hebrew rendering at 900 weight

</decisions>

<specifics>
## Specific Ideas

- The pink everywhere approach should feel intentional and cohesive — not just "we replaced white with pink." Every pink surface should reinforce the brand.
- Brutalist direction means: thick, heavy, unapologetic. The font-black + pink combination should feel like a stamp, not a whisper.

</specifics>

<deferred>
## Deferred Ideas

- Full SVG logo design — Phase 10 (Brutalist Design Polish)
- Professionally designed PWA icons — Phase 10
- New domain registration — out of scope, keep acroretreat.co.il for now

</deferred>

---

*Phase: 02-brand-identity*
*Context gathered: 2026-04-01*
