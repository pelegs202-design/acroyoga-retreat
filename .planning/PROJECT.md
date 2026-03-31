# AcroYoga Academy (Working Title — Rebrand TBD)

## What This Is

A brutalist, interactive community platform for acroyoga practitioners in Israel. Replaces scattered WhatsApp groups with structured partner matching, jam sessions, and built-in messaging. Also serves as the commercial hub for a 30-day in-person training challenge (Tel Aviv / Kfar Saba) and private workshops (couples + corporate). Mobile-first PWA on Vercel, bilingual Hebrew + English.

## Core Value

**People can find and connect with the right acroyoga partner near them — by level, role, and skills — and show up to practice together.** If the community matching works, everything else (challenges, workshops, revenue) follows.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Brutalist interactive design with cursor effects, draggable elements, unconventional scroll
- [ ] Quiz funnel: 30-day challenge (10+ questions, visual/playful, city selection, level assessment)
- [ ] Quiz funnel: private workshops (2-3 questions, couples/groups + corporate)
- [ ] Community partner matching (skill level, role preference base/flyer, location, skills known)
- [ ] Community profiles (photo, bio, skills checklist from standard moves, ratings/reviews)
- [ ] Jam board (post open sessions, approved hosts only + admin)
- [ ] Built-in messaging between community members
- [ ] User auth (email + password)
- [ ] Payment via Green Invoice (payment + automatic Hebrew invoicing)
- [ ] 30-day challenge program pages (in-person, 3x/week, TLV + Kfar Saba, under 500 NIS)
- [ ] Private workshop booking (couples/groups + corporate events)
- [ ] Admin panel (manage members, challenge signups, workshop bookings, approve jam hosts)
- [ ] Push notifications + email + WhatsApp group notifications
- [ ] Instagram feed embed, social proof, share buttons
- [ ] Bilingual Hebrew (RTL) + English
- [ ] PWA (installable, offline capable, home screen icon)
- [ ] SEO optimized for Hebrew acroyoga terms
- [ ] Fast performance on Vercel
- [ ] Digital terms of service acceptance
- [ ] Brand naming (part of project scope)

### Out of Scope

- Video content library — not for V2, may add later
- Retreat booking system — retreats get minimal mention only
- Native mobile app — PWA covers mobile for now
- Teacher training program — planned but not V2 scope (platform should support it eventually)
- Map view for finding practitioners — filter by city/area instead
- Practice log / training history tracking

## Context

**Current state:** Existing site at acroretreat.co.il built on Site123. Will be replaced entirely — same domain pointed to Vercel.

**The problem being solved:** Israeli acroyoga community coordinates through WhatsApp groups. Partners are hard to find, skill levels are mixed with no filtering, jam session posts get buried in chat history, and people flake with no accountability. No purpose-built platform exists — just FB groups and individual teacher sites.

**Competition:** WhatsApp groups (primary), some individual teacher websites. No one has built a structured community platform for acroyoga in Israel. First-mover opportunity.

**Target audience:** 50-200 acroyoga practitioners at launch (existing network + organic growth). Israeli, mobile-first, mix of beginners and advanced.

**Media assets:** Some professional acroyoga photos available, may need additional shoots.

**Rebranding:** Moving away from "AcroRetreat" name. New brand name to be developed as part of this project.

## Constraints

- **Stack**: Next.js 16 on Vercel, Vercel Postgres (Neon), Drizzle ORM, Better Auth
- **Payments**: Green Invoice (Israeli gateway + invoicing combined)
- **Domain**: acroretreat.co.il (repoint from Site123 to Vercel)
- **Language**: Bilingual Hebrew RTL + English, Hebrew primary
- **Design Stack**: Tailwind CSS v4 (CSS logical properties for RTL), Framer Motion v12 (draggable, cursor effects, scroll animations, quiz transitions), shadcn/ui + Radix UI (accessible headless primitives, heavily customized for brutalist aesthetic), Heebo font (Hebrew)
- **Design Direction**: Brutalist / interactive chaos — cursor effects, draggable elements, unconventional scroll. Must still be accessible (WCAG AA) and fast.
- **Performance**: Vercel-optimized, targeting high Lighthouse scores despite heavy interactivity
- **SEO**: Critical growth channel — must rank for Hebrew acroyoga terms (אקרויוגה)
- **Design Tools**: Google Stitch (via `stitch-mcp` MCP server) for AI-powered UI prototyping and Tailwind/React code generation. Use `/frontend-design` skill for all UI implementation — produces distinctive, production-grade interfaces that avoid generic AI aesthetics. Critical for brutalist design goal.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vercel + Next.js 16 + Drizzle + Better Auth | Vercel-native stack; Drizzle avoids Prisma cold-start penalty on serverless; Better Auth replaces stalled Auth.js v5 | — Pending |
| Green Invoice for payments + invoicing | Single tool handles both Israeli payment processing and חשבונית generation | — Pending |
| Built-in chat over WhatsApp integration | The whole point is replacing WA group chaos with structured communication | — Pending |
| PWA over native app | Faster to ship, still feels app-like, no app store friction | — Pending |
| Brutalist interactive design | Differentiate from generic yoga/wellness sites, match acroyoga's raw physical energy | — Pending |
| No map view | Filter by city/area is simpler, faster, and sufficient for Israeli geography | — Pending |
| Standard acroyoga moves for skills | Use universally recognized poses rather than custom curriculum | — Pending |

---
*Last updated: 2026-03-31 after requirements definition*
