# Requirements: AcroYoga Academy

**Defined:** 2026-03-31
**Core Value:** People can find and connect with the right acroyoga partner near them — by level, role, and skills — and show up to practice together.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [ ] **FOUND-01**: Site loads on Vercel with Next.js, Vercel Postgres (Neon), Drizzle ORM
- [ ] **FOUND-02**: Bilingual Hebrew RTL + English with language toggle (next-intl)
- [ ] **FOUND-03**: PWA installable with home screen icon and offline profile/skills view
- [ ] **FOUND-04**: Mobile-first responsive design across all pages
- [ ] **FOUND-05**: Digital terms of service acceptance on signup

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User can log in and stay logged in across sessions (session persistence)
- [ ] **AUTH-03**: User can reset password via email link

### Profiles

- [ ] **PROF-01**: User can create profile with photo, bio, and city
- [ ] **PROF-02**: User can set acroyoga role preference (base / flyer / both)
- [ ] **PROF-03**: User can set skill level (beginner / intermediate / advanced)
- [ ] **PROF-04**: User can select known moves from standard acroyoga skills checklist
- [ ] **PROF-05**: User can view other members' profiles
- [ ] **PROF-06**: User can rate and review partners after completing a jam session together

### Community

- [ ] **COMM-01**: User can search for partners by city, role, skill level, and known moves
- [ ] **COMM-02**: User can send and receive 1:1 direct messages with other members
- [ ] **COMM-03**: Approved hosts can post jam sessions (date, location, capacity, level)
- [ ] **COMM-04**: User can RSVP to join a posted jam session
- [ ] **COMM-05**: Jam sessions show capacity and waitlist when full
- [ ] **COMM-06**: User can cancel RSVP on a jam session

### Quiz Funnels

- [ ] **QUIZ-01**: 30-day challenge assessment quiz with 10+ visual/playful questions that assess acroyoga level and readiness
- [ ] **QUIZ-02**: Quiz includes city selection (Tel Aviv / Kfar Saba) as part of the flow
- [ ] **QUIZ-03**: Quiz provides personalized assessment results based on answers (level, strengths, areas to develop)
- [ ] **QUIZ-04**: Post-quiz results page showcases what makes us special and different before the payment CTA
- [ ] **QUIZ-05**: Workshop inquiry quiz with 2-3 questions (group type: couples/friends/corporate, group size, preferred dates)
- [ ] **QUIZ-06**: Quiz has conditional branching (different paths based on answers)
- [ ] **QUIZ-07**: Quiz progress is visually indicated (progress bar or step counter)

### Payments

- [ ] **PAY-01**: User can pay for 30-day challenge via Green Invoice checkout (under 500 NIS)
- [ ] **PAY-02**: User can submit workshop inquiry and receive quote/booking confirmation
- [ ] **PAY-03**: Green Invoice generates automatic Hebrew tax invoice (חשבונית) on payment

### Automations & Notifications

- [ ] **NOTIF-01**: Push notifications for new messages, jam RSVPs, and partner activity
- [ ] **NOTIF-02**: Email notifications for confirmations, jam reminders, and account actions
- [ ] **NOTIF-03**: WhatsApp reminder before class (day before + morning of for 30-day challenge sessions)
- [ ] **NOTIF-04**: WhatsApp warm-up automation sequence after quiz signup (drip messages to build excitement before first class)
- [ ] **NOTIF-05**: Email nurture campaign (follow-up sequences, re-engagement for leads who didn't convert)

### Design

- [ ] **DSGN-01**: Brutalist interactive design with cursor effects, draggable elements, and unconventional scroll behavior
- [ ] **DSGN-02**: Design is accessible (WCAG AA) despite brutalist aesthetic
- [ ] **DSGN-03**: High Lighthouse performance scores on mobile despite heavy interactivity

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

- [ ] **BRAND-01**: Develop new brand name (replacing AcroRetreat)

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
| (populated during roadmap creation) | | |

**Coverage:**
- v1 requirements: 37 total
- Mapped to phases: 0
- Unmapped: 37

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-03-31 after initial definition*
