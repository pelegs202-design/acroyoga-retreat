# Phase 7: Notifications + Automations - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

The platform proactively reaches users at the right moment — push alerts for in-app events, email confirmations/reminders/nurture, and WhatsApp drip sequences — so engagement doesn't depend on users remembering to check the app. This phase covers all three notification channels (push, email, WhatsApp) plus user preference controls.

</domain>

<decisions>
## Implementation Decisions

### Push notification triggers & content
- **Events that fire push:** New direct message, jam RSVP updates (someone joins your jam, waitlist promotion, jam cancelled), new review received, partner activity (new member matching city + role + level)
- **Tone:** Minimal & clean — "New message from Noa", no emoji, straightforward
- **Batching:** Batch if multiple events arrive close together (e.g., 3 messages in 1 min → one push "3 new messages")
- **Quiet hours:** 22:00-08:00 default, hold pushes during night, deliver in morning. User can adjust.
- **Language:** Match user's app language setting (Hebrew or English)
- **Partner activity matching:** City + role + level — precise matching, only notify when new member complements the user
- **Partner activity rate limit:** Max 1 partner-match push per day, even if multiple join
- **Click-through:** Deep link to content — message push → opens that conversation, jam push → opens that jam
- **Permission prompt timing:** After first meaningful action (RSVP to jam or send a message), not on first login

### WhatsApp drip sequence design
- **API:** Official Meta Cloud API (direct Meta integration)
- **Business identity:** Personal feel with business name — messages feel like they're from a person ("אני מאקרוחבורה") on a business number
- **Language:** Match quiz language — if they took quiz in English, WA in English; Hebrew quiz → Hebrew WA
- **Personalization:** Use first name from quiz signup
- **Send time:** Evening 19:00-20:00
- **Unsubscribe:** Reply STOP to opt out — include "שלח/י STOP להפסיק" at bottom of first message
- **Reply behavior:** Continue drip regardless of user replies — replies don't pause or stop the sequence

#### Pre-payment challenge drip (7+ messages)
- **Content arc:** Mix value + urgency — Welcome → tip → testimonial → tip → scarcity/spots → countdown → final push
- **Spacing:** Decreasing gaps — start every 2 days, tighten to daily as challenge start date approaches
- **Expiry:** If challenge start date passes before conversion, stop drip and send missed-it message ("Hey, the challenge started! Next round is in X weeks" with waitlist link)
- **On payment:** Stop pre-payment drip, switch to post-payment drip (different sequence)
- **CTA buttons:** Yes — include quick-reply buttons on templates (e.g., "לפרטים נוספים", "להרשם עכשיו")

#### Post-payment challenge drip (5 messages)
- Congrats → intro to community → prep tips → what to expect → see you tomorrow

#### Challenge session reminders
- Day before at 18:00 + morning of at 08:00 — two reminders per session

#### Workshop inquiry drip (3 messages)
- Confirmation → what to expect → follow-up if no response

### Email sequence strategy
- **Tool:** Resend for everything (transactional + marketing) — already integrated
- **From address:** shai@acroretreat.co.il for all emails
- **Design:** Brutalist brand style — dark background, hot pink accents, Heebo font, bold — matches the app
- **Language:** Match app/quiz language (bilingual templates)
- **Tracking:** Track both opens and clicks
- **Unsubscribe:** One-click unsubscribe from all marketing emails
- **Reminder timing:** Same as WhatsApp — day before 18:00 + morning 08:00
- **Channel overlap:** Both WhatsApp AND email always — redundancy intentional, no fallback logic

#### Challenge signup emails
1. Confirmation email on signup — "You're in! Here's what to expect"
2. Day-before session reminder — "Tomorrow at 18:00 — bring comfortable clothes"
3. Post-session recap — session summary + next session details
4. Completion certificate — styled email + shareable branded image for Instagram/WhatsApp

#### Nurture sequence (leads who didn't convert)
- **Never stop** — email indefinitely until conversion or unsubscribe
- **Initial burst (first month):** Weekly emails — value content + social proof + community highlights
- **Offer strategy:** Value-first for 4 emails, then single discount offer on email 5
- **Personalization:** Reference their quiz archetype result in emails
- **Long-term (after first month):** Biweekly — mix of community highlights + educational tips + next challenge date CTA
- **Content management:** Pre-written rotating templates (10-12 templates that cycle)
- **No cap:** Never stops, biweekly forever until convert or unsub

### Notification preferences & opt-out
- **Settings location:** Inside existing Settings page — add a "Notifications" section
- **Controls:** Per-channel toggles: Push (on/off), Email marketing (on/off), WhatsApp (on/off)
- **Defaults:** Everything ON — push, email, WhatsApp all enabled by default
- **Transactional emails** (confirmations, password resets) always send regardless of marketing toggle

### Claude's Discretion
- Push notification batching window/algorithm
- Exact quiet hours adjustment UI
- WhatsApp template text/copy (content of each drip message)
- Email template HTML/design implementation
- Shareable completion image design
- Cron/scheduling implementation for timed sends
- Database schema for notification preferences and drip state tracking

</decisions>

<specifics>
## Specific Ideas

- WhatsApp messages should feel like they're from a friend in the community, not a corporate bot — "את/ה חלק מהחבורה עכשיו 💪"
- The pre-payment drip arc should create genuine FOMO with decreasing time gaps as start date approaches
- Post-payment drip shifts from "convince" to "prepare and excite"
- Email nurture never stops — the user explicitly wants persistent follow-up until conversion or unsubscribe
- Completion certificate email includes a shareable image optimized for Instagram stories and WhatsApp status

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-notifications-automations*
*Context gathered: 2026-04-03*
