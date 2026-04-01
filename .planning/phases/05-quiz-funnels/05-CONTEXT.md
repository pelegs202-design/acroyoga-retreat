# Phase 5: Quiz Funnels - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Two quiz funnels: a 30-day challenge quiz (10-12 steps, visual, branching) and a shorter workshop inquiry quiz (2-3 steps). Both lead to personalized results pages. Combined entry page at /quiz where users choose their path. Open to anyone (no sign-in required). Contact info collected at end. Leads stored in DB. Payment integration is Phase 6 — this phase builds the funnel up to the CTA button.

</domain>

<decisions>
## Implementation Decisions

### Challenge quiz flow
- Goal: qualify & excite — assess their level, build excitement, personalize the pitch
- 10-12 steps with meaningful conditional branching (beginners get different questions than advanced)
- Question types: city selection (TLV/Kfar Saba), experience level, goals & motivation
- Visual card answers (image/icon + text) for all options — engaging, playful
- Slide animations between steps (Framer Motion left/right transitions)
- Open to anyone — NO sign-in required
- Contact info collected at the end: name, email, phone (international format with country code)
- Progress saved to localStorage — resume where they left off
- Claude writes all quiz content (questions, options, results text) in both Hebrew and English
- Entry points: homepage CTA, dedicated /quiz URL, dashboard prompt for logged-in users
- Research directive: investigate high-converting quiz funnel patterns before planning

### Workshop inquiry quiz
- 2-3 multi-step flow (same visual style as challenge quiz)
- Workshop types: couples, friends/groups, corporate events, bachelorette/birthday
- Fields: group type, group size, preferred dates, name, email, phone, special requests
- After submission: show advantages/USP page — NOT a loading animation, show immediately
- Advantages to highlight: experienced instructors, customized to group, fun & memorable, all equipment provided, social vibe, small groups, outdoor, parties
- Claude writes the advantages page content in both languages
- Pricing: quote manually per inquiry ("We'll send you a personalized quote")
- Inquiry stored in DB + email notification to owner + WhatsApp notification (stub for Phase 7)
- Phone: international format same as challenge quiz
- Combined entry page at /quiz — user picks "30-day challenge" or "Private workshop"

### Results & CTA page (challenge)
- Fake loading/processing animation before revealing results — creates perceived value
- Personalized results show: level assessment, strengths & growth areas, challenge recommendation, social proof
- Radar/spider chart showing current level AND potential level after the challenge ("here's where you are → here's where you could be")
- CTA: talk about benefits they'll gain based on their specific assessment
- Price shown: 299 NIS (early bird), regular 499 NIS — with crossed-out price anchoring
- Urgency elements: limited spots remaining, next start date, early bird discount
- Use quiz answers to identify fears/objections and address them directly on the results page
- FAQ section below the CTA
- CTA button links to payment page (Phase 6) — show placeholder/coming-soon for now
- Results page has unique shareable URL per result — users can share their assessment
- Social proof: pull real testimonials from acroretreat.co.il

### Tracking & analytics
- DB events table: store per-step completions AND full quiz answers for all users
- GA4 custom events per step: measurement ID G-BCPEPDR543
- Meta Pixel events per step: scrape Pixel ID from www.acroretreat.co.il
- Dedicated leads table in DB — store all quiz completions (name, email, phone, quiz type, answers) even if they don't pay
- Partial quiz sessions tracked in DB for funnel analysis
- GA4 + Meta Pixel enable retargeting audiences for drop-offs (people who started but didn't finish)

### Claude's Discretion
- Exact quiz questions, answer options, and branching logic
- Radar chart implementation (library choice or custom SVG)
- Fake loading animation design and timing
- FAQ content
- Fear/objection identification logic based on quiz answers
- How "limited spots" counter works (real count or display-only)
- Visual card design for quiz options
- How partial sessions are stored in DB vs localStorage

</decisions>

<specifics>
## Specific Ideas

- The fake loading before results is a psychological tool — "analyzing your assessment..." with a progress animation makes the results feel more valuable
- The radar chart showing current vs potential is a powerful selling visual — overlay two shapes (current in neutral, potential in pink)
- Fear addressing: if someone selected "beginner" and "never tried before," show "Don't worry — 80% of our students start as complete beginners" on the results page
- Testimonials from acroretreat.co.il add real social proof — not AI-generated placeholder text
- The combined /quiz entry page should make both options feel equally valid — no hierarchy between challenge and workshop
- Price anchoring (299 vs crossed-out 499) is a conversion standard — research best practices for Israeli market

</specifics>

<deferred>
## Deferred Ideas

- Payment processing — Phase 6 (CTA links to placeholder for now)
- WhatsApp notification on workshop inquiry — Phase 7 stub
- Email nurture sequence for non-converting leads — Phase 7
- A/B testing different quiz flows — future optimization
- Video testimonials on results page — future enhancement

</deferred>

---

*Phase: 05-quiz-funnels*
*Context gathered: 2026-04-01*
