# Paid Intro Pack Split Test — Design Spec

**Date:** 2026-05-14
**Status:** Approved (design phase) — pending spec review before plan
**Owner:** Shay

## 1. Problem & Goal

AcroHavura's current funnel converts visitors to a **free trial class** booked via a quiz. We want to:

1. **Move people to self-serve sign up and pay** quickly, without human intervention.
2. **Test which physical/lifestyle pain** Acro most credibly solves for Israeli prospects — to inform creative and copy going forward.

The current free-trial funnel stays live; this spec defines a **parallel, paid funnel** that runs as an A/B/C creative + landing-page test.

## 2. Offer

**3-class intro pack — ₪149**, with a money-back guarantee after class 1 if not for them.

Rationale (locked during brainstorming):
- 3 classes maps to the real acro activation threshold (one class is not enough to feel the click).
- ₪149 supports higher CPL/CPA in ads than a free trial; filters tire-kickers.
- The guarantee removes risk and matches Israeli market sensitivity to commitments.

## 3. Three Landing Pages — One Pain Each

Each LP targets one pain hypothesis:

| Slug | Pain | Hypothesis |
|---|---|---|
| `/lp/shape` | Weight / body composition (B1) | "Get in shape without the gym" pulls highest-volume female-coded fitness intent. |
| `/lp/flex` | Back/desk pain → flexibility (B2) | Desk-job entry pain with flexibility as the outcome is the most universally-Israeli framing of B2. |
| `/lp/reset` | Burnout / mental shutoff (M1) | "90 minutes where your head shuts off" pulls high-LTV wellness intent. |

**Audience target:** Israeli, primarily women 25–40, primarily Hebrew. English locale also fully supported.

### 3.1 Pain rationale and lead copy

#### `/lp/shape` — Weight / body composition
- **Hebrew headline:** "להיכנס לכושר ולהתחטב — בלי חדר כושר, בלי דיאטה, בלי לשנוא את זה"
- **English headline:** "Get In Shape — Without the Gym, Without a Diet, Without Hating It"
- **Hebrew sub (loss-framed):** "כל שבוע שעובר בלי שינוי — זה עוד שבוע שתסתכל/י על התמונה הזו ותגיד/י 'אולי בחודש הבא'."
- **3 outcome bullets:**
  - "שורפים ~500 קלוריות לשיעור" — defensible per-session aerobic estimate
  - Lean visible muscle (shoulders/arms/core) in 4 weeks of 2x/week
  - You actually show up because it's fun — that's why it works when the gym didn't
- **Pain-specific FAQ:** "I've tried the gym and quit — how is this different?" / "How much weight can I realistically lose?"

#### `/lp/flex` — Back/desk pain & flexibility
- **Hebrew headline:** "תפסיק/י לכאוב מהמחשב — תפתח/י את הגב, הירכיים והכתפיים"
- **English headline:** "Stop Hurting From Your Desk — Open Your Back, Hips, and Shoulders"
- **Hebrew sub (loss-framed):** "כל יום של ישיבה זה עוד יום שהגב, הירכיים והכתפיים מתקצרים. בגיל 40 זה כבר לא מתהפך."
- **3 outcome bullets:**
  - Hips & hamstrings open progressively each session (assisted stretching a flyer can't do alone)
  - Shoulder & upper-back mobility for bases (counteracts desk hunch)
  - "רוב המתחילים מוסיפים 12-18 ס״מ בהשתפלות-קדמית תוך 4 שבועות" — specific, modest, defensible
- **Pain-specific FAQ:** "I'm completely stiff — am I going to embarrass myself?" / "I already do yoga, how is this different?"

#### `/lp/reset` — Burnout / mental reset
- **Hebrew headline:** "שעה וחצי שבהן הראש נכבה — והעולם מחכה בחוץ"
- **English headline:** "90 Minutes Where Your Head Shuts Off — and the World Waits Outside"
- **Hebrew sub (loss-framed):** "כמה זמן עבר מאז שהיה לך שעה וחצי שבהן באמת לא חשבת על כלום?"
- **3 outcome bullets:**
  - Forced presence: you literally cannot think about email while upside down
  - Touch + trust regulates the nervous system better than another yoga class
  - Leave lighter than you came — 48h where your shoulders aren't at your ears
- **Pain-specific FAQ:** "Is this therapy?" / "I'm wiped after work — will I have energy for this?"

### 3.2 Shared LP skeleton (used by all three LPs)

Each page has the same section order, with content hand-tuned per pain. This keeps the A/B/C test isolating *content*, not structure.

1. **Hero cluster** (above the fold on mobile):
   - Pain-specific hero photo or video
   - Gain-framed headline + loss-framed subhead
   - **Earliest available slot widget** — e.g., "יום שני 18:30 · 3 מקומות נשארו"
   - **Primary CTA** (first-person): "אני בפנים — 149 ₪" / "I'm In — Claim My Spot ₪149"
   - **MoneyBackBadge** — "סיכון אפס · החזר כספי מלא אחרי שיעור 1"
2. **3 outcome bullets** — pain-specific
3. **Social proof reel** — 3–5 short videos, pain-tagged
4. **3 photo testimonials** — pain-matched, named, with cities
5. **How it works** — 3 steps: pay → pick first class → show up
6. **Offer box** (`<IntroPackOffer>`) — ₪149 / 3 classes / guarantee, with the price + risk-reversal cluster repeated
7. **Optional quiz affordance** — collapsible: "מתלבטים? עשו את הקוויז (90 שניות)" — routes to existing quiz with `lp_variant` tag
8. **FAQ** — 6 questions, 1–2 pain-specific
9. **Final CTA** — repeat hero cluster

### 3.3 Israeli-market adaptations

These are baked into every LP:

- **Language register:** Casual, second-person, gendered (את/ה). Hebrew slang where it lands.
- **Price display:** "149 ₪" (shekel sign after, no decimals).
- **Subscription anxiety:** Display "תשלום חד-פעמי · ללא התחייבות" near every CTA.
- **Payment options:** Bit / PayBox surfaced alongside credit card if Morning supports them (verify during implementation).
- **WhatsApp support:** Phone + WhatsApp prominent in hero and footer. Many Israelis WhatsApp before paying — design *for* that, not against it.
- **Photos:** Identifiable Israeli faces in the target demographic. No diverse-stock-photo aesthetic.
- **Urgency:** Only real per-slot capacity numbers — never fake countdowns.
- **RTL:** Verified on every new component.
- **No mention of current events.** The existing testimonial nodding to "בתקופה הזו" stays as-is — that's enough.

## 4. Psychological Trigger System

Applied uniformly across all three LPs; *content* of each trigger varies by pain.

### 4.1 Loss-framed support copy
Gain-framed headline paired with a loss-framed subhead (research: loss aversion is ~2× more powerful than gain). See per-LP subheads in §3.1.

### 4.2 First-person CTAs (90% lift in tested A/B's)
- Body copy: "you/your"
- Button copy: "I/my"
- Primary CTA: "אני בפנים — 149 ₪" / "I'm In — Claim My Spot ₪149"
- Quiz CTA: "תראו לי איזה אקרו-טייפ אני (90 שניות)"

### 4.3 Authentic scarcity — real per-slot capacity
- Each trial slot has a hard cap (matches the studio's actual room capacity, default 8).
- Slot widget shows "X מקומות נשארו" — number is live from booking data.
- Filled slots render crossed out: ~~יום שני 18:30 — מלא~~.
- **No fake countdowns. No artificial urgency. Ever.** This is the constraint that makes scarcity work in Israel.

### 4.4 Risk reversal placed where hesitation lives
The MoneyBackBadge appears in **three locations**:
1. Hero — small badge adjacent to the price
2. Offer box — full one-liner: "לא התאהבת אחרי השיעור הראשון? החזר כספי מלא, בלי שאלות. סיכון אפס."
3. Final CTA — repeat the badge

Phrasing: **"סיכון אפס" / "Zero Risk"** outperforms "money-back guarantee" alone — names the buyer's actual feeling.

### 4.5 Social proof as named specifics
- Named testimonials with photos + cities (תל אביב / כפר סבא / רמת גן land in this market).
- Recent-activity surface: "7 אנשים נרשמו השבוע" — *only if real*, sourced from `leads` table.
- Existing stat: "0 פציעות ב-527 בוגרים" — keep.
- Authority badge: founder credentials if credibly claimable.

### 4.6 Commitment escalation (Cialdini)
- Quiz path = a 90-second commitment that lifts subsequent conversion via foot-in-the-door.
- "Pick your date" step happens **before** payment — once they've mentally committed to a Monday slot, the ₪149 is the smaller follow-through.

### 4.7 Specificity over vague claims
- "~500 קלוריות לשיעור," "12-18 ס״מ בהשתפלות-קדמית תוך 4 שבועות," "96% מסיימים את 3 השיעורים"
- All numbers must be defensible — no marketing inflation.

### 4.8 Above-the-fold mobile cluster
Hero on mobile = a single decision-ready block:
```
[Hero photo/video — pain-specific]
[Headline — gain frame]
[Loss-framed subhead]
[Earliest slot — "יום שני 18:30, 3 מקומות נשארו"]
[Big primary CTA — "אני בפנים — 149 ₪"]
[MoneyBackBadge — "סיכון אפס · החזר כספי אחרי שיעור 1"]
```
Everything below the fold is for the unsure. The hero is the page.

### 4.9 Friction reduction
- Bit / PayBox alongside credit card (if Morning supports — verify during implementation)
- Returning visitors get pre-filled name/phone from prior quiz/checkout sessions
- No account creation before payment — guest checkout, optional account on the success page

### 4.10 Explicit non-goals (deliberately excluded)
- ❌ Fake countdown timers
- ❌ Bonus stacking / "limited bonuses for the first 50 people"
- ❌ Exit-intent discount popups

Research consensus: these erode trust with skeptical audiences and burn long-term brand. Wrong fit for AcroHavura.

## 5. Architecture

### 5.1 Routes (new)

All new routes under existing `[locale]/(public)` group:
- `/lp/shape`
- `/lp/flex`
- `/lp/reset`
- `/lp/checkout?source=lp_<pain>[_quiz]&slot=<slotId>` — shared checkout for all three LPs
- `/lp/checkout/success?session=<id>`

### 5.2 Shared components (new)

- `<IntroPackOffer>` — the price/duration/guarantee box, with CTA. Used on all three LPs and in the offer-box section.
- `<MoneyBackBadge>` — small reusable badge for the three placements above.
- `<SlotCapacityWidget>` — fetches live slot availability, displays earliest available with "X left," crosses out full slots, links to checkout with `?slot=<slotId>`. Used on every LP (in the hero cluster) and inside the checkout page (when user clicks "שנה" to change slot).

The checkout logic itself lives in the `/lp/checkout` page — no separate `IntroPackCheckout` component. The page composes `<SlotCapacityWidget>`, a name/phone form, the Morning iframe wrapper, and `<MoneyBackBadge>` directly.

### 5.3 Reused (no changes required)

- `QuizEngine` — embedded behind the optional collapsible affordance on each LP, routes its completion to the same checkout with `?source=lp_<pain>_quiz`.
- `ReelsCarousel` — populated with pain-tagged reels per LP.
- Morning iframe + polling pattern from `quiz/challenge` flow.
- Meta CAPI Purchase event (extended with `lp_variant` param).
- Resend email confirmation.
- `add-to-calendar-button-react` on the success page.
- PostHog + GA4 instrumentation (extended with `lp_variant` / `lp_path` params).

### 5.4 Legacy state

- `/quiz/challenge/*` funnel stays live alongside the new LPs. Decision to retire it (or not) is deferred until the new test produces a winner.
- `/quiz/challenge/checkout` stays deprecated (already redirects). The new checkout lives at `/lp/checkout` — clean separation from "challenge" naming.

## 6. Data Model

### 6.1 New Drizzle tables

```ts
// class_slots: the studio's actual schedule
class_slots
  id              (uuid, pk)
  date            (timestamp, indexed)
  capacity        (int, default 8)
  label_he        (text)
  label_en        (text)
  location        (text)
  active          (boolean, default true)
  created_at      (timestamp)

// class_bookings: a customer's intro-pack purchase + slot for class 1
class_bookings
  id                    (uuid, pk)
  slot_id               (uuid, fk → class_slots.id)
  lead_id               (uuid, fk → leads.id)
  payment_id            (text, Morning payment ref)
  payment_session_id    (text, indexed — used for polling)
  status                (enum: pending | paid | cancelled | refunded | completed)
  classes_used          (int, default 0)
  first_attended_at     (timestamp, nullable — anchor for the guarantee window)
  created_at            (timestamp)
  expires_at            (timestamp, nullable — for soft-hold expiration)
  refunded_at           (timestamp, nullable)
```

Seed `class_slots` with the existing 6 weekly slots:
- Mon 18:30, Mon 19:45, Wed 18:30, Wed 19:45 (capacity 8 each)
- Fri 13:30, Sat 13:30 (capacity 8 each)

Rolling 4-week window of future slots seeded on a cron.

### 6.2 Soft-hold mechanism

When a user lands on `/lp/checkout` with a selected slot, we insert a `class_bookings` row with `status='pending'` and `expires_at = now() + 10 minutes`.

- If the user completes payment within 10 min → `status='paid'`, `expires_at=null`.
- If they abandon → a cron job at minute granularity expires the row (sets `status='cancelled'`), freeing the slot capacity.
- Capacity calculation: `slot.capacity - count(bookings where slot_id=X and status in ('pending', 'paid'))`.

**Hold renewal on long sessions:** If a user sits on the checkout page past their 10-minute hold (e.g., they walked away), the polling endpoint detects the expired hold on the next poll. If the slot still has free capacity, it silently recreates a fresh pending row and continues. If the slot has filled in the gap, the page surfaces an error and forces re-selection. Without this, users hit a confusing "your slot expired" mid-payment.

**Lead row contract:** `class_bookings.lead_id` is required. For the **direct path**, the lead row is created when the user submits the name + WhatsApp phone form on `/lp/checkout` (Section 7.1 step 2). For the **quiz path**, a lead row already exists (created by the quiz). The checkout looks up the lead by session ID and reuses it.

### 6.3 Capacity edge cases

- **Slot fills during their checkout:** at payment-detection time, recheck capacity. If overflowed (their pending row already counted but a race occurred), refund automatically and route them to next-available with an apologetic WhatsApp.
- **Slot fills mid-page-load on LP:** capacity widget refreshes on mount; if a user clicks a slot that filled in the gap, the checkout page rejects and forces re-selection.

## 7. Checkout Flow

### 7.1 Step sequence (single page, progressive)

1. **Slot confirmation strip** at top — "השיעור הראשון שלך: יום שני 12.5 ב-18:30 · אקרוסטודיו תל אביב" with "שנה" link to reopen slot picker.
2. **Name + WhatsApp phone** — two fields. Pre-filled if user came via quiz path (data from `leads` table by session ID).
3. **Payment** — Morning iframe in-page. If Morning supports them, Bit/PayBox buttons visible above the iframe.
4. **Guarantee reminder** inline under the price: "סיכון אפס. החזר כספי מלא אחרי שיעור 1 אם זה לא בשבילך."

No account creation in this flow. Account/login is offered on the success page after payment, with skip option.

### 7.2 Morning payment + polling

Reuses the existing pattern (per CLAUDE.md: webhook unreliable, polling works):

- **`POST /api/payments/intro-pack/create`** — creates Morning payment link for ₪149, returns it + `paymentSessionId`. Inserts pending `class_bookings` row.
- **`GET /api/payments/intro-pack/status?session=<id>`** — server polls Morning's `/documents/search` for a doc with `externalId === paymentSessionId`. Client polls this endpoint every 3s for up to 10 minutes.
- On detection → flip `status='paid'`, fire Meta CAPI Purchase event (extending pattern from commit `b3669bf`), redirect to `/lp/checkout/success`.

### 7.3 Polling timeout fallback

If client polls for 10 minutes with no payment detected:
- Page shows "We'll confirm by WhatsApp within 1 hour — your seat is held."
- Admin gets a Slack/email notification to manually verify in Morning.
- Booking stays `pending` until admin resolves.

### 7.4 Success page (`/lp/checkout/success?session=<id>`)

1. Confirmation: "סגרת את המקום! יום שני 12.5 ב-18:30"
2. Add-to-calendar button (`add-to-calendar-button-react`)
3. What to bring: בגדים נוחים, בקבוק מים, להגיע 10 דק' לפני
4. WhatsApp confirmation message: "שלחנו לך הודעה ב-WhatsApp עם כל הפרטים. שאלות? כתוב/י לנו לכאן" + click-to-WhatsApp button
5. Soft account creation: "צור/י סיסמה כדי לראות את ההזמנה שלך בעתיד" — optional, with skip

## 8. Guarantee Operations

### 8.1 Promise

"Money back, no questions asked, within **48 hours of class 1**, if it's not for you."

### 8.2 Anchor: attended-class-1 (locked decision)

The 48-hour clock starts when `class_bookings.first_attended_at` is set. This **prevents no-show abuse** — customers who never attend can't claim a refund. Tradeoff: requires the studio to consistently use the "mark attended" admin tool after every class.

### 8.3 Eligibility rules

- Must have attended class 1 (`first_attended_at IS NOT NULL`)
- Refund request received **within 48h** of `first_attended_at`
- One refund per customer per intro-pack purchase
- Refund issued within 5 business days

### 8.4 Refund flow

1. Customer sends WhatsApp/email: "אני רוצה החזר" or similar
2. Admin opens `/admin/refunds` (existing pattern), finds the booking, presses **Issue Refund**
3. `POST /api/admin/refunds/issue` — flips `status='refunded'`, sets `refunded_at`, logs to PostHog
4. Actual money refund: if Morning's API supports programmatic refunds, automated. If not, admin does it in Morning's UI and the endpoint just marks the booking — verify during implementation.
5. **No win-back attempts at refund time.** That's the promise.

### 8.5 Operational dependency (launch blocker)

The "mark attended" admin tool **must be in use from day 1 of launch**. Without it, the guarantee policy has no anchor date, and the refund mechanic breaks. New endpoint: `POST /api/admin/bookings/mark-attended` — admin marks attendance after each class.

A daily Slack/email digest of "yesterday's bookings that need attendance marked" prevents drift.

### 8.6 Out-of-policy cases

- Refund requested after class 2 or 3: handled case-by-case manually, no automated path
- Refund requested before attending class 1: not eligible — direct them to reschedule
- Refund requested >48h after class 1: not eligible — direct to feedback channel

## 9. Admin Tooling

### 9.1 New endpoints

- `POST /api/admin/bookings/mark-attended` — sets `first_attended_at` on a booking, takes `bookingId` and optional `attendedAt` timestamp (defaults to now)
- `POST /api/admin/refunds/issue` — flips booking to `refunded`, logs to PostHog
- `GET /api/admin/bookings` — list with filters: slot, status, date range, refund-eligible

### 9.2 New admin pages

- `/admin/bookings` — list view with status filters and inline "mark attended" / "issue refund" buttons
- `/admin/funnel/lp` — the A/B/C readout (see §10.2)

### 9.3 Daily ops digest

A daily email (Resend, via cron) to the studio admin listing:
- Bookings from yesterday's classes that need attendance marked
- Refund-eligible bookings (within 48h window) — heads-up to expect possible requests

## 10. Analytics & A/B Test Readout

### 10.1 Event taxonomy

Each event carries `lp_variant ∈ {shape, flex, reset}` and `lp_path ∈ {direct, quiz}` as session-scoped properties. Events fire to PostHog + Meta CAPI (where appropriate) + GA4.

**`lp_path` semantics:** Set at checkout-start time, not at first LP view. If a user views `/lp/shape` directly, abandons, returns later and takes the optional quiz, then completes checkout — `lp_path = quiz`. This matches how purchase attribution should work: it reflects the route the buyer actually took to convert.

**Funnel events (in order):**
1. `lp_view` — page mount, once per session
2. `lp_cta_click` — primary CTA tapped above the fold
3. `slot_select` — user picked a class slot. Carries `slot_select_location ∈ {lp_hero, checkout}` so we can distinguish first-pick from change-pick.
4. `checkout_start` — landed on `/lp/checkout`
5. `checkout_payment_iframe_loaded` — Morning iframe rendered
6. `checkout_payment_detected` — polling found the Morning doc
7. `purchase` — booking marked `paid` (primary success metric; fires Meta CAPI Purchase + GA4 purchase)
8. `refund_requested` — guarantee invoked (cohort-quality readout)

**Secondary events:**
- `quiz_start`, `quiz_complete` — existing; add `lp_variant` tag
- `scroll_depth` (25/50/75/100) — port pattern from `challenge/page.tsx`
- `time_on_page` — port pattern from `challenge/page.tsx`
- `slot_capacity_seen` — what number the user saw at slot select (e.g., "3 left") — tests whether scarcity intensity correlates with conversion

### 10.2 Funnel readout view (`/admin/funnel/lp`)

A single admin page built with existing `recharts` showing, per `lp_variant`:

| LP | Views | CTA Click % | Slot Select % | Checkout Start % | Purchase % | CPL | CPA | Refund % | Attendance % |
|---|---|---|---|---|---|---|---|---|---|

Derived numbers per LP:
- Direct vs quiz path purchase rate
- First-class attendance rate (paid → attended) — quality signal

### 10.3 Decision rule (locked)

- Per-LP budget: **~₪600 ad spend**
- Primary metric: **CPA** (cost per ₪149 purchase)
- Tiebreaker if two LPs within 15% CPA: **attendance rate at class 1**
- **Early-cut rule:** Kill the worst LP when its CPA is >2× the best LP's CPA after ≥ ₪400 spend each (stops the bleeding)
- **Full-cut rule:** Cut all losers when all three have spent ≥ ₪600

### 10.4 Meta attribution

Each LP gets its own ad set in Ads Manager with:
- Unique UTM params (`utm_source=meta&utm_medium=cpc&utm_campaign=intro_pack&utm_content=lp_<pain>`)
- Pixel + CAPI firing `purchase` event with `lp_variant` as custom param
- Deduplication on `event_id` (existing pattern, ensure new events carry it)

### 10.5 Post-test cohort tracking

After the test ends, every purchaser is tagged with their winning-LP-variant. We then track over 30+ days:
- Intro-pack → ongoing membership conversion rate, by LP
- LTV by LP variant

This answers the long-tail question: does the cheapest CPA LP also bring the highest-quality customer?

### 10.6 Privacy / compliance

- No new PII captured beyond what's already in `leads` (name + phone).
- Existing consent banner verified to fire before PostHog `identify`.
- Refund data flagged sensitive — admin-only.

## 11. Build Sequence

### Phase A — Foundation (must come first)
- Drizzle migration: `class_slots`, `class_bookings` + seed initial slots
- `IntroPackOffer`, `MoneyBackBadge`, `SlotCapacityWidget` components
- `/api/payments/intro-pack/{create,status}` routes
- Soft-hold expiration cron job
- Admin endpoints: `mark-attended`, `issue-refund`
- Admin pages: `/admin/bookings`, `/admin/funnel/lp` (skeleton)

### Phase B — Checkout flow (depends on A)
- `/lp/checkout` page
- `/lp/checkout/success` page
- E2E test: pick slot → pay → success → DB state correct

### Phase C — Three landing pages (parallel after B)
- `/lp/shape`, `/lp/flex`, `/lp/reset`
- Hero cluster above the fold per the spec
- Hand-tuned pain-specific copy, testimonials, reels, FAQ
- Optional quiz affordance lower on each page
- **Full Hebrew + English parity per LP**

### Phase D — Instrumentation (parallel with C)
- Add `lp_variant` / `lp_path` to all relevant existing PostHog/CAPI/GA4 events
- Add new events: `slot_select`, `slot_capacity_seen`, `refund_requested`
- Build the funnel readout view in `/admin/funnel/lp`
- Verify Meta CAPI dedupe with new params

### Phase E — Photos & go-live prep
- Source/shoot 4–6 photos per LP, tagged in `public/lp-photos/<pain>/`
- Verify Bit/PayBox availability in Morning — flag if missing
- Operational dry-run: book → pay → refund → attend → mark attended
- Verify mobile above-the-fold cluster renders correctly RTL
- Set up Meta ad sets (3 ad sets, 3 creatives, per-LP UTM params)

### Phase F — Launch & monitor
- Three ad sets live at ~₪200 daily spend each (~3 days to ₪600/LP)
- Check funnel daily; apply early-cut rule if triggered
- After ₪600/LP (or early cut), declare winner, scale that LP, retire others
- Decide whether to retire `/quiz/challenge` free-trial funnel based on winner's economics

## 12. Constraints, Risks & Open Items

### 12.1 Implementation-time constraints

- **Next.js 16 is non-standard** (per `AGENTS.md`) — the implementation plan must reference `node_modules/next/dist/docs/` before scaffolding routes, not training-data assumptions.
- **Morning programmatic refunds** — TBD whether Morning's API supports refund issuance. If not, the admin endpoint marks `refunded` and the actual refund is manual in Morning's UI.
- **Bit / PayBox in Morning** — TBD whether available. If not, credit card only; spec stays valid.

### 12.2 Risks

- **Risk:** "Mark attended" admin tool falls out of use, breaking the guarantee anchor.
  **Mitigation:** Daily ops digest naming bookings that need attendance marked; on-screen "needs attendance" badge on `/admin/bookings`.
- **Risk:** Slot capacity becomes stale (e.g., walk-ins not counted).
  **Mitigation:** `class_bookings` is the single source of truth; walk-ins must be entered via admin to count against capacity.
- **Risk:** A pain-specific LP that wins on CPA brings low-quality (high-refund or low-attendance) customers.
  **Mitigation:** Tiebreaker rule uses attendance % at class 1; post-test 30-day cohort tracking validates LTV before scaling spend.
- **Risk:** Race condition where two users pay for the last slot simultaneously.
  **Mitigation:** Re-check capacity at payment-detection time; auto-refund + reroute the loser of the race; transactional row insert prevents over-allocation.
- **Risk:** Meta CAPI `Purchase` events fired by both the legacy free-trial funnel (commit `b3669bf` fires Purchase on a free booking) and the new ₪149 funnel could confuse Meta's optimization and create dirty attribution.
  **Mitigation:** Audit the existing free-trial Purchase event during Phase A — either retire it (Purchase should not fire on a free conversion), downgrade it to `Lead`, or tag both events with distinct `content_category` so Meta can separate them. The new ₪149 Purchase events use `content_category='intro_pack'` for clarity.
- **Risk:** VAT handling. Israel has 17% VAT. If Morning is not set up to make ₪149 VAT-inclusive, revenue per sale drops by ~₪22 and break-even math shifts.
  **Mitigation:** Phase E checklist includes verifying Morning's VAT configuration on the ₪149 product; one-line sanity check during dry-run.

### 12.3 Out of scope for this spec

- Retiring or rebuilding the `/quiz/challenge` free-trial funnel
- Membership upsell flow after class 3 (future enhancement)
- Multi-region expansion beyond the studio's current locations
- Changing Morning's VAT setup (we verify but don't reconfigure)

## 13. Success Criteria

This spec succeeds when:

1. A new visitor lands on `/lp/<pain>` from a Meta ad and can complete payment in **under 90 seconds** without human intervention.
2. The funnel readout at `/admin/funnel/lp` shows a clean per-LP comparison of CPA, refund rate, and class-1 attendance.
3. At least one LP returns a CPA that justifies continued ad spend. Honest break-even math (refresh during Phase E with real numbers):
   - Gross revenue per sale: ₪149
   - Minus VAT (17% if inclusive): ~₪127 net
   - Minus Morning fee (~2.5–3%): ~₪123
   - Minus class-delivery cost (teacher pay × 3 sessions, studio overhead per attendee): TBD — biggest variable
   - Minus expected refund cost (~10–20% of buyers): TBD
   - **Target CPA: ≤ ₪55–65** depending on per-class delivery cost — confirm before launch.
4. The guarantee can be invoked by a customer via WhatsApp and processed by an admin in <2 minutes of effort.

---

**Next step:** invoke writing-plans skill to produce the implementation plan.
