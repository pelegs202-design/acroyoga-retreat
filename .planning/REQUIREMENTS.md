# Requirements: AcroYoga Academy

**Defined:** 2026-03-31
**Core Value:** People can find and connect with the right acroyoga partner near them — by level, role, and skills — and show up to practice together.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FOUND-01**: Site loads on Vercel with Next.js, Vercel Postgres (Neon), Drizzle ORM
- [x] **FOUND-02**: Bilingual Hebrew RTL + English with language toggle (next-intl)
- [x] **FOUND-03**: PWA installable with home screen icon and offline profile/skills view
- [x] **FOUND-04**: Mobile-first responsive design across all pages
- [x] **FOUND-05**: Digital terms of service acceptance on signup

### Authentication

- [x] **AUTH-01**: User can sign up with email and password
- [x] **AUTH-02**: User can log in and stay logged in across sessions (session persistence)
- [x] **AUTH-03**: User can reset password via email link

### Profiles

- [x] **PROF-01**: User can create profile with photo, bio, and city
- [x] **PROF-02**: User can set acroyoga role preference (base / flyer / both)
- [x] **PROF-03**: User can set skill level (beginner / intermediate / advanced)
- [x] **PROF-04**: User can select known moves from standard acroyoga skills checklist
- [x] **PROF-05**: User can view other members' profiles
- [x] **PROF-06**: User can rate and review partners after completing a jam session together

### Community

- [x] **COMM-01**: User can search for partners by city, role, skill level, and known moves
- [x] **COMM-02**: User can send and receive 1:1 direct messages with other members
- [x] **COMM-03**: Approved hosts can post jam sessions (date, location, capacity, level)
- [x] **COMM-04**: User can RSVP to join a posted jam session
- [x] **COMM-05**: Jam sessions show capacity and waitlist when full
- [x] **COMM-06**: User can cancel RSVP on a jam session

### Quiz Funnels

- [x] **QUIZ-01**: 30-day challenge assessment quiz with 10+ visual/playful questions that assess acroyoga level and readiness
- [x] **QUIZ-02**: Quiz includes city selection (Tel Aviv / Kfar Saba) as part of the flow
- [x] **QUIZ-03**: Quiz provides personalized assessment results based on answers (level, strengths, areas to develop)
- [x] **QUIZ-04**: Post-quiz results page showcases what makes us special and different before the payment CTA
- [x] **QUIZ-05**: Workshop inquiry quiz with 2-3 questions (group type: couples/friends/corporate, group size, preferred dates)
- [x] **QUIZ-06**: Quiz has conditional branching (different paths based on answers)
- [x] **QUIZ-07**: Quiz progress is visually indicated (progress bar or step counter)

### Payments

- [x] **PAY-01**: User can pay for 30-day challenge via Green Invoice checkout (under 500 NIS)
- [x] **PAY-02**: User can submit workshop inquiry and receive quote/booking confirmation
- [x] **PAY-03**: Green Invoice generates automatic Hebrew tax invoice (חשבונית) on payment

### Automations & Notifications

- [x] **NOTIF-01**: Push notifications for new messages, jam RSVPs, and partner activity
- [x] **NOTIF-02**: Email notifications for confirmations, jam reminders, and account actions
- [x] **NOTIF-03**: WhatsApp reminder before class (day before + morning of for 30-day challenge sessions)
- [x] **NOTIF-04**: WhatsApp warm-up automation sequence after quiz signup (drip messages to build excitement before first class)
- [x] **NOTIF-05**: Email nurture campaign (follow-up sequences, re-engagement for leads who didn't convert)

### Design

- [ ] **DSGN-01**: Brutalist interactive design with cursor effects, draggable elements, and unconventional scroll behavior
- [ ] **DSGN-02**: Design is accessible (WCAG AA) despite brutalist aesthetic
- [ ] **DSGN-03**: High Lighthouse performance scores on mobile despite heavy interactivity
- [ ] **DSGN-04**: All UI built with Tailwind CSS v4 (CSS logical properties for RTL), Framer Motion v12 (animations/interactions), shadcn/ui + Radix UI (accessible primitives), Heebo font (Hebrew)
- [ ] **DSGN-05**: All pages and components use `/frontend-design` skill to produce distinctive, non-generic interfaces matching brutalist vision
- [ ] **DSGN-06**: Use Google Stitch (stitch-mcp) for AI-powered UI prototyping and Tailwind/React code generation before implementation

### SEO & Social

- [ ] **SEO-01**: Hebrew SEO optimization (meta tags, structured data, hreflang for אקרויוגה terms)
- [ ] **SEO-02**: City landing pages for Tel Aviv and Kfar Saba targeting local acroyoga searches
- [ ] **SEO-03**: Instagram feed embed on public pages
- [ ] **SEO-04**: Share-to-WhatsApp and social share buttons on jams and profiles

### Admin

- [ ] **ADMIN-01**: Admin can view and manage all community members (approve, suspend)
- [ ] **ADMIN-02**: Admin can approve or revoke jam host permissions
- [ ] **ADMIN-03**: Admin can view all 30-day challenge signups and payment status
- [ ] **ADMIN-04**: Admin can view all workshop booking requests

### Branding

- [x] **BRAND-01**: Develop new brand name (replacing AcroRetreat)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Matching

- **MATCH-01**: Skill-based partner matching algorithm (surfaces complementary partners)
- **MATCH-02**: Waitlist management for oversubscribed jams

### Monetization

- **MONET-01**: Auto Hebrew invoicing integrated into admin dashboard
- **MONET-02**: Admin payment/revenue analytics view

### Growth

- **GROW-01**: Teacher training / certification program pages and enrollment
- **GROW-02**: Corporate workshop management portal
- **GROW-03**: Multi-city expansion beyond Israel

### Engagement

- **ENGAGE-01**: WhatsApp notification channel for jam reminders and partner matches
- **ENGAGE-02**: Email digest (weekly community activity summary)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Video content library / tutorials | Storage/CDN costs, not core to community value — link to YouTube/IG instead |
| Retreat booking system | Retreats get minimal mention; not a V2 priority |
| Native mobile app (iOS/Android) | PWA covers mobile; no app store friction |
| Map view for partner finding | Filter by city/area is simpler and sufficient for Israeli geography |
| Practice log / training history | Not core to matching or revenue; adds complexity |
| Public forum / discussion boards | Moderation burden too high for launch; use DM + jam threads |
| Points / gamification / badges | Acroyoga culture is collaborative not competitive; feels patronizing |
| Paid membership tiers for users | Creates friction before trust; monetize through programs not access fees |
| Real-time typing indicators / reactions / voice messages | Enormous complexity; simple 1:1 text messaging is sufficient |
| Automated calendar sync (Google/Apple) | Complex OAuth per provider; .ics export is sufficient |
| Email verification on signup | Adds friction; defer to v1.x if spam becomes an issue |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 — Foundation + Auth | Complete |
| FOUND-02 | Phase 1 — Foundation + Auth | Complete |
| FOUND-03 | Phase 1 — Foundation + Auth | Complete |
| FOUND-04 | Phase 1 — Foundation + Auth | Complete |
| FOUND-05 | Phase 1 — Foundation + Auth | Complete |
| AUTH-01 | Phase 1 — Foundation + Auth | Complete |
| AUTH-02 | Phase 1 — Foundation + Auth | Complete |
| AUTH-03 | Phase 1 — Foundation + Auth | Complete |
| BRAND-01 | Phase 2 — Brand Identity | Complete |
| PROF-01 | Phase 3 — Community Profiles + Partner Matching | Complete |
| PROF-02 | Phase 3 — Community Profiles + Partner Matching | Complete |
| PROF-03 | Phase 3 — Community Profiles + Partner Matching | Complete |
| PROF-04 | Phase 3 — Community Profiles + Partner Matching | Complete |
| PROF-05 | Phase 3 — Community Profiles + Partner Matching | Complete |
| PROF-06 | Phase 3 — Community Profiles + Partner Matching | Complete |
| COMM-01 | Phase 3 — Community Profiles + Partner Matching | Complete |
| COMM-02 | Phase 4 — Jam Board + Messaging | Complete |
| COMM-03 | Phase 4 — Jam Board + Messaging | Complete |
| COMM-04 | Phase 4 — Jam Board + Messaging | Complete |
| COMM-05 | Phase 4 — Jam Board + Messaging | Complete |
| COMM-06 | Phase 4 — Jam Board + Messaging | Complete |
| QUIZ-01 | Phase 5 — Quiz Funnels | Complete |
| QUIZ-02 | Phase 5 — Quiz Funnels | Complete |
| QUIZ-03 | Phase 5 — Quiz Funnels | Complete |
| QUIZ-04 | Phase 5 — Quiz Funnels | Complete |
| QUIZ-05 | Phase 5 — Quiz Funnels | Complete |
| QUIZ-06 | Phase 5 — Quiz Funnels | Complete |
| QUIZ-07 | Phase 5 — Quiz Funnels | Complete |
| PAY-01 | Phase 6 — Payments + Invoicing | Complete |
| PAY-02 | Phase 6 — Payments + Invoicing | Complete |
| PAY-03 | Phase 6 — Payments + Invoicing | Complete |
| NOTIF-01 | Phase 7 — Notifications + Automations | Complete |
| NOTIF-02 | Phase 7 — Notifications + Automations | Complete |
| NOTIF-03 | Phase 7 — Notifications + Automations | Complete |
| NOTIF-04 | Phase 7 — Notifications + Automations | Complete |
| NOTIF-05 | Phase 7 — Notifications + Automations | Complete |
| ADMIN-01 | Phase 8 — Admin Panel | Pending |
| ADMIN-02 | Phase 8 — Admin Panel | Pending |
| ADMIN-03 | Phase 8 — Admin Panel | Pending |
| ADMIN-04 | Phase 8 — Admin Panel | Pending |
| SEO-01 | Phase 9 — SEO + Social Surface | Pending |
| SEO-02 | Phase 9 — SEO + Social Surface | Pending |
| SEO-03 | Phase 9 — SEO + Social Surface | Pending |
| SEO-04 | Phase 9 — SEO + Social Surface | Pending |
| DSGN-01 | Phase 10 — Brutalist Design Polish + Performance | Pending |
| DSGN-02 | Phase 10 — Brutalist Design Polish + Performance | Pending |
| DSGN-03 | Phase 10 — Brutalist Design Polish + Performance | Pending |
| DSGN-04 | Phase 10 — Brutalist Design Polish + Performance | Pending |
| DSGN-05 | Phase 10 — Brutalist Design Polish + Performance | Pending |
| DSGN-06 | Phase 10 — Brutalist Design Polish + Performance | Pending |

**Coverage:**
- v1 requirements: 40 total
- Mapped to phases: 40
- Unmapped: 0

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-03-31 — traceability populated after roadmap creation*
