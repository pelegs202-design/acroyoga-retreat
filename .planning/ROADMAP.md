# Roadmap: AcroYoga Academy (Rebrand TBD)

## Overview

Ten phases from scaffolding to launch-ready community platform. Foundation locks in RTL, database, and real-time infrastructure — decisions that cannot be changed later without full rewrites. Branding resolves early so every subsequent phase uses the real name and identity. Community features (profiles, matching, jam board, messaging) build the core value. Quiz funnels and payments generate revenue independently. Notifications, admin, SEO, and brutalist design polish close the platform. Every phase delivers something independently verifiable.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation + Auth** - Next.js stack on Vercel with RTL i18n, PWA, database layer, auth, and terms acceptance
- [x] **Phase 2: Brand Identity** - Resolve new brand name, visual identity tokens, and apply across the codebase (completed 2026-04-01)
- [ ] **Phase 3: Community Profiles + Partner Matching** - User profiles with skills checklist and partner search by city/role/level
- [ ] **Phase 4: Jam Board + Messaging** - Real-time 1:1 DMs via Ably, jam session posting with RSVP/waitlist
- [ ] **Phase 5: Quiz Funnels** - 30-day challenge quiz (10+ steps) and workshop inquiry quiz with conditional branching
- [ ] **Phase 6: Payments + Invoicing** - Green Invoice checkout for challenge, workshop inquiry, and Hebrew invoice generation
- [ ] **Phase 7: Notifications + Automations** - Push (VAPID), email (Resend), WhatsApp drip, and email nurture sequences
- [ ] **Phase 8: Admin Panel** - Member management, jam host approval, challenge signups, workshop bookings
- [ ] **Phase 9: SEO + Social Surface** - Hebrew city landing pages, structured data, IG embed, share buttons
- [ ] **Phase 10: Brutalist Design Polish + Performance** - Full interactive design system, cursor effects, Lighthouse audit

## Phase Details

### Phase 1: Foundation + Auth
**Goal**: A working Next.js application skeleton on Vercel that handles bilingual Hebrew/English users with RTL layout, persistent auth sessions, installable PWA, and a safe database connection layer — so every subsequent phase inherits these correctly from the start
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):
  1. User can sign up, log in, and stay logged in across browser sessions with email and password
  2. User can reset a forgotten password via an emailed link
  3. Visitor can toggle between Hebrew (RTL, Heebo font) and English on any page with no layout breaks
  4. App can be installed to a mobile home screen and loads a skeleton UI offline
  5. User must accept terms of service before completing signup; the acceptance is recorded
**Plans**: 5 plans
Plans:
- [x] 01-01-PLAN.md — Project scaffold + Drizzle/Neon + Better Auth backend
- [ ] 01-02-PLAN.md — Bilingual next-intl routing + RTL layout + Heebo font + language toggle
- [ ] 01-03-PLAN.md — Auth UI pages (signup, signin, reset, TOS, onboarding, dashboard)
- [ ] 01-04-PLAN.md — PWA setup (Serwist, manifest, offline fallback, install prompt)
- [ ] 01-05-PLAN.md — Integration wiring + human verification checkpoint

### Phase 2: Brand Identity
**Goal**: The platform has a real name and a visual identity system — not "AcroRetreat" or a placeholder — so every subsequent phase builds on the actual brand rather than requiring a retroactive rename pass
**Depends on**: Phase 1
**Requirements**: BRAND-01
**Success Criteria** (what must be TRUE):
  1. A new brand name has been selected and confirmed (replaces "AcroRetreat" everywhere)
  2. Brand name and identity tokens (colors, typography scale, logo mark or wordmark) are applied in the codebase
  3. The domain and any visible references to the old name are updated to the new brand
**Plans**: 3 plans
Plans:
- [ ] 02-01-PLAN.md — Dark-first design tokens + hot pink brand accent color
- [ ] 02-02-PLAN.md — Full AcroHavura rename across all text/code surfaces
- [ ] 02-03-PLAN.md — Pink buttons, wordmark styling, branded PWA icons

### Phase 3: Community Profiles + Partner Matching
**Goal**: Members can build complete profiles and find compatible acroyoga partners near them — delivering the platform's core value proposition
**Depends on**: Phase 2
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04, PROF-05, PROF-06, COMM-01
**Success Criteria** (what must be TRUE):
  1. User can create a profile with photo, bio, city, role preference (base/flyer/both), and skill level
  2. User can select their known moves from a standard acroyoga skills checklist (~50-100 moves)
  3. User can search for partners by city, role, and skill level and see real results
  4. User can view another member's full profile page
  5. User can leave a rating and review for a partner after a jam session together
**Plans**: 4 plans
Plans:
- [ ] 03-01-PLAN.md — Schema extension (bio, skills, reviews table) + skills data + i18n keys
- [ ] 03-02-PLAN.md — Avatar upload (Vercel Blob) + profile edit page with skills checklist
- [ ] 03-03-PLAN.md — Partner search page with filters + member profile view page
- [ ] 03-04-PLAN.md — Private review system (thumbs up/down) + integration verification

### Phase 4: Jam Board + Messaging
**Goal**: Community members can coordinate practice together through posted jam sessions and 1:1 messaging — replacing the WhatsApp group chaos that motivated this platform
**Depends on**: Phase 3
**Requirements**: COMM-02, COMM-03, COMM-04, COMM-05, COMM-06
**Success Criteria** (what must be TRUE):
  1. Approved hosts can post a jam session with date, location, capacity, and level requirement
  2. User can RSVP to a jam, see remaining spots, and join a waitlist when full
  3. User can cancel an RSVP on a jam they have joined
  4. Two users can exchange 1:1 direct messages that arrive in real time without a page refresh
**Plans**: TBD

### Phase 5: Quiz Funnels
**Goal**: Prospective students can complete engaging, visually playful assessment quizzes that qualify them for the 30-day challenge or a private workshop — and receive a personalized result that leads naturally to a payment or inquiry action
**Depends on**: Phase 1
**Requirements**: QUIZ-01, QUIZ-02, QUIZ-03, QUIZ-04, QUIZ-05, QUIZ-06, QUIZ-07
**Success Criteria** (what must be TRUE):
  1. User can complete the 30-day challenge quiz (10+ steps) including city selection and level questions, with visual progress indicated at every step
  2. Quiz follows conditional branches — different paths are shown based on earlier answers
  3. User reaches a personalized results page that reflects their level/strengths before seeing the payment CTA
  4. User can complete the shorter workshop inquiry quiz (2-3 steps: group type, size, preferred dates) and submit it
  5. Per-step completion events are tracked so funnel drop-off is measurable from day one
**Plans**: TBD

### Phase 6: Payments + Invoicing
**Goal**: Users can pay for the 30-day challenge and submit workshop bookings through a compliant Israeli checkout that automatically issues a Hebrew tax invoice — so the platform can generate real revenue on day one
**Depends on**: Phase 5
**Requirements**: PAY-01, PAY-02, PAY-03
**Success Criteria** (what must be TRUE):
  1. User can complete payment for the 30-day challenge (under 500 NIS) via Green Invoice checkout
  2. User can submit a workshop inquiry after the quiz and receive a confirmation that a quote is coming
  3. A valid Hebrew tax invoice (חשבונית) is automatically generated and delivered after every successful payment
**Plans**: TBD

### Phase 7: Notifications + Automations
**Goal**: The platform reaches out to users at the right moment — jam reminders, message alerts, challenge prep — so engagement does not depend on users remembering to check the app
**Depends on**: Phase 6
**Requirements**: NOTIF-01, NOTIF-02, NOTIF-03, NOTIF-04, NOTIF-05
**Success Criteria** (what must be TRUE):
  1. User receives a push notification when they get a new direct message or jam RSVP update
  2. User receives an email confirmation after signing up for the challenge and a reminder the day before each session
  3. Challenge participant receives WhatsApp reminders the day before and morning of each session
  4. New quiz signup receives a WhatsApp warm-up drip sequence building excitement before the first class
  5. Lead who did not convert receives an email nurture follow-up sequence
**Plans**: TBD

### Phase 8: Admin Panel
**Goal**: The site owner has full operational control — approving members, managing jam hosts, viewing challenge signups and workshop bookings — without needing to touch the database directly
**Depends on**: Phase 7
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04
**Success Criteria** (what must be TRUE):
  1. Admin can view all community members and approve or suspend any account
  2. Admin can grant or revoke jam host permission for any member
  3. Admin can see all 30-day challenge signups with payment status in a single view
  4. Admin can see all workshop booking requests and their current state
**Plans**: TBD

### Phase 9: SEO + Social Surface
**Goal**: The platform is discoverable by Hebrew-speaking acroyoga practitioners searching online, and active members can easily share jams and profiles to grow the community organically
**Depends on**: Phase 3
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04
**Success Criteria** (what must be TRUE):
  1. Every page has correct Hebrew meta tags, hreflang attributes, and Open Graph data
  2. City landing pages exist for Tel Aviv and Kfar Saba targeting local אקרויוגה search terms, with structured data
  3. The Instagram feed is embedded on at least one public-facing page
  4. User can share a jam session or profile to WhatsApp or other platforms with a single tap
**Plans**: TBD

### Phase 10: Brutalist Design Polish + Performance
**Goal**: The platform looks and feels unmistakably different from generic yoga/wellness sites — cursor effects, draggable elements, unconventional scroll — while remaining accessible and fast on mobile
**Depends on**: Phase 9
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05, DSGN-06
**Success Criteria** (what must be TRUE):
  1. Desktop users experience cursor-reactive effects and at least one draggable UI element on key pages
  2. Mobile users experience unconventional scroll behavior and Framer Motion animations without jank (60 fps target)
  3. All interactive brutalist elements pass WCAG AA contrast and keyboard accessibility checks
  4. Lighthouse mobile score reaches 90+ on performance despite full animation load
  5. All pages and components are implemented using the `/frontend-design` skill and Google Stitch prototyping workflow
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10

Note: Phase 5 (Quiz Funnels) depends only on Phase 1 (Foundation) — it can begin in parallel with Phases 3-4 once Phase 1 is complete.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation + Auth | 4/5 | In Progress|  |
| 2. Brand Identity | 3/3 | Complete    | 2026-04-01 |
| 3. Community Profiles + Partner Matching | 3/4 | In Progress|  |
| 4. Jam Board + Messaging | 0/TBD | Not started | - |
| 5. Quiz Funnels | 0/TBD | Not started | - |
| 6. Payments + Invoicing | 0/TBD | Not started | - |
| 7. Notifications + Automations | 0/TBD | Not started | - |
| 8. Admin Panel | 0/TBD | Not started | - |
| 9. SEO + Social Surface | 0/TBD | Not started | - |
| 10. Brutalist Design Polish + Performance | 0/TBD | Not started | - |
