# Feature Research

**Domain:** Niche sports community platform — partner matching, event coordination, quiz funnels
**Researched:** 2026-03-31
**Confidence:** MEDIUM (ecosystem research + competitor analysis; no direct Israeli acroyoga platform data available)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| User profile with photo + bio | Every community platform; without it, no identity or trust | LOW | Needs: role (base/flyer/both), level, city, bio |
| Skills checklist (moves list) | Acroyoga-specific; partners need to know what you can do before agreeing to jam | MEDIUM | Standard moves list ~50-100 items; filterable by base/flyer/both |
| Partner search by role, level, city | Core problem being solved — replacing WhatsApp group scroll | MEDIUM | Filter: role, city, level, availability; sort by proximity |
| Jam board (open sessions) | Replacing the "anyone doing acro this week?" WhatsApp messages | MEDIUM | Host posts session: date, location, capacity, level. Others join. |
| Event RSVP / join session | Users expect one-click join; a list without RSVP is just a calendar | LOW | Needs capacity limit, waitlist, cancel flow |
| In-app messaging between members | Users refuse to DM on WhatsApp before vetting; platform messaging bridges trust gap | HIGH | Requires auth, thread UI, read receipts, notifications |
| Mobile-first / PWA | Target demographic uses phones; web-only desktop = no traction | MEDIUM | PWA with offline support for profile/skills view |
| Push + email notifications | Missed event, new partner match, message received — without notifications, platform is dead | MEDIUM | Firebase FCM for push; email for digest + confirmations |
| Hebrew language support | Israeli audience; Hebrew-first UI or 50% drop-off from non-English speakers | MEDIUM | RTL layout required; direction must be set at design level, not bolted on |
| Admin moderation panel | Platform breaks without ability to approve hosts, remove bad actors, manage content | MEDIUM | Members list, approve/suspend, host approval workflow |
| Basic user ratings / trust signals | Physical partner work requires trust; users won't connect with zero-reputation profiles | MEDIUM | Simple star + text review; visibility on profile |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Quiz funnel — 30-day challenge | Interactive lead capture; 5-20x conversion over static form; routes to right product | MEDIUM | 10+ visual/playful questions, conditional branching, city + budget path, results page with CTA |
| Quiz funnel — private workshops | Short 2-3 question qualifier; separates couples/groups/corporate; reduces unqualified leads | LOW | Simpler than challenge funnel; feeds booking flow |
| Brutalist visual design | Memorable; signals this isn't another generic yoga app; creates shareable moments | LOW (if committed to design system) | Risk: niche taste; do user test with target demographic early |
| Skill-based partner matching algorithm | Goes beyond "find people in your city" — surfaces partners whose skills complement yours | HIGH | Depends on skills checklist being populated; cold start problem |
| Host approval workflow | Quality control for jams; approved hosts = community trust, reduces flakes | LOW | Admin toggles; email notification to host |
| WhatsApp notification integration | Israeli market: WhatsApp is the dominant channel; email is secondary | MEDIUM | Requires WA Business API or Twilio; per-message cost; must be opt-in |
| Social proof section + IG feed embed | Replaces "is this real?" doubt; shows community in action | LOW | IG Basic Display API or oembed; auto-refreshing feed |
| Share-to-WhatsApp buttons on events | Network effect via Israeli users' native sharing behavior | LOW | Web Share API or hardcoded WA share URL |
| Green Invoice payment + invoicing | Israeli market requirement; businesses need VAT-compliant invoices | MEDIUM | Green Invoice API; auto-invoice on payment; PDF download |
| SEO for Hebrew acroyoga terms | אקרויוגה in TLV/Kfar Saba has low competition; organic acquisition | MEDIUM | hreflang tags, Hebrew meta/headings, structured data, city landing pages |
| Bilingual Hebrew/English toggle | Serves both sabras and olim / expats; wider community coverage | LOW | i18next with RTL/LTR toggle; must be designed-in not patched in |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time chat with full features (typing indicators, reactions, threads, voice messages) | "Like WhatsApp but inside the app" | Enormous complexity; users will still use WhatsApp anyway; no incremental value over simple messaging | Build simple 1:1 threaded text messaging only; add WA share button so users can move to WA when comfortable |
| Global acroyoga community (all countries) | "Why limit to Israel?" | Dilutes the local relevance that is the core value prop; matching breaks when city filters span continents; support overhead explodes | Launch Israel-only; add city/country expansion later when proven |
| Automated skill matching algorithm v1 | "Match me with the perfect partner" | Requires dense user data to work; on thin profiles it surfaces garbage matches that destroy trust | Manual search with filters is more reliable at launch; save algorithm for v2 when profiles have history |
| Public forum / discussion boards | "Build community engagement" | Moderation burden is high; toxic content destroys community faster than lack of forums; Israeli communities are opinionated | Use event comment threads + DM; defer forums until there is active moderation capacity |
| Native mobile app (iOS + Android) | "PWA isn't good enough" | 6-12 month dev cost; app store approval friction; update lag; PWA serves use case adequately for v1 | Ship PWA first; convert to native only if push notification open rates are too low |
| Automated booking + calendar sync | "Sync to my Google Calendar" | Complex OAuth flows per provider; event types in acroyoga are informal jams not appointments | Manual RSVP with add-to-calendar export (.ics file); no live sync needed |
| Video upload / move library hosting | "Show my moves" | Storage costs, CDN costs, transcoding pipeline; this is a community/matching platform not YouTube | Link to YouTube/Instagram; don't host video internally |
| Points / gamification / badges | "Keep users engaged" | Hollow engagement; acro community culture is collaborative not competitive; risks feeling patronizing to experienced practitioners | Let real connections and jams drive retention; social proof (photos, reviews) is more authentic than badges |
| Paid subscription tiers for users | "Monetize the members" | Membership fees create friction before trust is established; Israeli small community will fragment over paywalls | Monetize through workshops, challenge programs, corporate bookings — not member access fees |

---

## Feature Dependencies

```
[User Account + Auth]
    └──requires──> [User Profile]
                       └──requires──> [Skills Checklist]
                                          └──enables──> [Partner Search]
                                          └──enables──> [Skill-Based Matching (v2)]

[User Profile]
    └──requires──> [Ratings / Reviews]
                       └──requires──> [Completed Session History]

[Jam Board]
    └──requires──> [User Account + Auth]
    └──requires──> [Host Approval (Admin)]
    └──enables──> [RSVP / Join Session]
                       └──enables──> [Session Notifications]

[Messaging]
    └──requires──> [User Account + Auth]
    └──enables──> [Partner Connection Flow]

[Quiz Funnel]
    └──requires──> [Landing Page / SEO setup]
    └──enables──> [Workshop / Challenge Booking]
                       └──requires──> [Green Invoice Payment]
                                          └──produces──> [Invoice / Receipt]

[Admin Panel]
    └──requires──> [User Account + Auth]
    └──controls──> [Host Approval]
    └──controls──> [Member Moderation]

[WhatsApp Notifications]
    └──requires──> [WA Business API credentials]
    └──enhances──> [Session Notifications]
    └──enhances──> [Quiz Funnel Follow-up]

[Bilingual RTL Support]
    └──must be built into design from day 1; cannot be retrofitted
    └──affects──> all UI components

[IG Feed Embed]
    └──requires──> [Instagram Basic Display API / oembed]
    └──enhances──> [Social Proof on Landing Page]
```

### Dependency Notes

- **Skills Checklist requires Profile**: a profile without skills is not useful for partner matching; they ship together.
- **Partner Search requires Skills Checklist populated**: cold start — matching quality degrades until sufficient profiles exist; mitigate by seeding with existing WhatsApp group members.
- **Ratings requires Session History**: only users who actually jammed together should be able to leave reviews; prevents fake reviews; session attendance is the gate.
- **Quiz Funnel requires SEO/Landing Page**: quiz is the conversion mechanism; traffic must exist first; SEO is the prerequisite, not the reward.
- **RTL conflicts with any retrofitted localization**: dir="rtl" and CSS logical properties must be in the base design system. Adding RTL to an LTR codebase post-launch causes widespread layout regressions.
- **WhatsApp Business API has costs**: per-message pricing applies; design notification triggers conservatively to avoid unexpected bills.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — validates that this platform can replace WhatsApp groups for acroyoga coordination.

- [ ] User auth (email + phone, no OAuth complexity) — gate to everything else
- [ ] Community profile (photo, bio, city, role, level, skills checklist) — the directory
- [ ] Partner search (filter by city, role, level) — core use case
- [ ] Jam board (hosts post sessions, members RSVP) — replaces WhatsApp event chaos
- [ ] Simple 1:1 messaging — lets partners connect before committing to jam
- [ ] Quiz funnel: 30-day challenge — revenue-generating funnel from day 1
- [ ] Green Invoice payment integration — Israeli compliance requirement; cannot launch paid programs without it
- [ ] Basic admin panel (approve hosts, manage members) — platform breaks without this
- [ ] Hebrew + English bilingual with RTL — must be in from day 1; non-negotiable for Israeli market
- [ ] Push + email notifications — session-critical; without this RSVP rates drop to zero
- [ ] PWA shell — mobile-first delivery

### Add After Validation (v1.x)

Features to add once core engagement pattern is confirmed.

- [ ] User ratings and reviews — add when sessions have happened and there's real data to review
- [ ] Quiz funnel: private workshops / corporate — add when challenge funnel is converting; validates the second product line
- [ ] WhatsApp notification channel — add if push notification open rates are below 15%
- [ ] IG feed embed + social proof section — add when there's community photo content to show
- [ ] Share-to-WhatsApp buttons on events — add at same time as social proof; amplifies network effect
- [ ] SEO city landing pages (TLV, Kfar Saba, etc.) — add when content strategy is ready; takes 3-6 months to rank

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Skill-based matching algorithm — defer until 200+ active profiles with populated skills checklists
- [ ] Waitlist management for oversubscribed jams — defer until jams are actually filling up
- [ ] Corporate workshop management portal — defer; first validate demand through quiz funnel
- [ ] Multi-city expansion beyond Israel — defer; local density first

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| User auth + profile + skills | HIGH | LOW | P1 |
| Partner search + filters | HIGH | LOW | P1 |
| Jam board + RSVP | HIGH | MEDIUM | P1 |
| Quiz funnel (30-day challenge) | HIGH | MEDIUM | P1 |
| Green Invoice payment | HIGH | MEDIUM | P1 |
| Hebrew RTL + bilingual | HIGH | MEDIUM | P1 |
| Admin panel | HIGH | MEDIUM | P1 |
| Push + email notifications | HIGH | MEDIUM | P1 |
| 1:1 messaging | HIGH | HIGH | P1 |
| PWA | MEDIUM | MEDIUM | P1 |
| User ratings / reviews | MEDIUM | MEDIUM | P2 |
| Quiz funnel (workshops) | MEDIUM | LOW | P2 |
| WhatsApp notifications | MEDIUM | MEDIUM | P2 |
| IG feed embed | MEDIUM | LOW | P2 |
| Social proof + share buttons | MEDIUM | LOW | P2 |
| SEO city landing pages | HIGH | MEDIUM | P2 |
| Skill matching algorithm | HIGH | HIGH | P3 |
| Corporate booking portal | MEDIUM | HIGH | P3 |
| Multi-city expansion | HIGH | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add after v1 validation
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | AcroYoga.org App | AcroRoots | AcroWorld App | Our Approach |
|---------|-----------------|-----------|---------------|--------------|
| Partner search | Yes (community map) | Manual instructor matching | Unknown | Yes — filter by role, level, city, skills |
| Moves library | Yes (hundreds, filterable) | No | Unknown | Skills checklist (not full library); link to external video resources |
| Event discovery | Yes (global, calendar view) | Events page (static) | Unknown | Jam board; Israel-local; host-posted with approval |
| Messaging | Yes (direct messages) | No | Unknown | Yes — 1:1 in-platform |
| Ratings / reviews | Not found | Not found | Not found | Yes — after-session reviews; differentiator in trust layer |
| Quiz funnels | No | No | No | Yes — primary acquisition differentiator |
| Hebrew / RTL | No | No | No | Yes — built-in from day 1; only local Israeli platform |
| Payment / invoicing | Course payments only | No self-serve | Unknown | Green Invoice integrated; Israeli VAT compliant |
| WhatsApp integration | No | No | No | Yes — WA notifications + share buttons |
| PWA | No | No | No | Yes — mobile-first delivery |
| Admin approval | No (open community) | Instructor-managed | Unknown | Yes — host approval, member moderation |

**Gap summary:** No existing platform is Hebrew-native, Israel-local, or has quiz funnels + payment + invoicing integrated. The closest competitor (AcroYoga.org app) is English-only, global, and course-focused — not a community coordination tool for local practitioners.

---

## Sources

- [AcroYoga.org Community](https://www.acroyoga.org/community) — competitor feature baseline
- [AcroRoots](https://www.acroroots.com/) — competitor event/matching model
- [AcroWorld App Store listing](https://apps.apple.com/us/app/acroworld/id1633240146) — app competitor
- [RacketPal sports partner app](https://apps.apple.com/us/app/racketpal-find-sport-partners/id1453817491) — sports matching pattern reference (phone verification, leaderboards, community chat)
- [Smatch — Sport Buddies Around](https://apps.apple.com/us/app/smatch-sport-buddies-around/id1172257171) — sports matching filter patterns (sport, skill, availability, radius)
- [ScoreApp quiz funnel platform](https://www.scoreapp.com/) — quiz funnel conversion benchmarks
- [Advanced Quiz Funnel Tactics 2025 — Playerence](https://playerence.com/advanced-quiz-funnel-strategy/) — 5-20% conversion rate benchmark; conditional logic best practices
- [Sharetribe MVP marketplace guide](https://www.sharetribe.com/academy/how-to-build-a-minimum-viable-platform/) — marketplace MVP patterns
- [RTL language SEO and UX optimization — GtechMe](https://www.gtechme.com/insights/right-to-left-seo-and-ux-optimization-guide/) — Hebrew SEO + RTL implementation requirements
- [WhatsApp vs email vs push engagement 2025 — Pushwoosh](https://www.pushwoosh.com/blog/email-whatsapp-marketing/) — channel performance benchmarks (WA 99% open rate, push 20%, email 2%)
- [Content moderation best practices 2025 — Superstaff](https://superstaff.com/blog/content-moderation-best-practices/) — moderation anti-pattern warnings

---
*Feature research for: Acroyoga Academy Israel community platform*
*Researched: 2026-03-31*
