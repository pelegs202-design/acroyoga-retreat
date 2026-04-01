# Phase 6: Payments + Invoicing - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Users pay for the 30-day challenge through a compliant Israeli checkout (Green Invoice) that automatically issues a Hebrew tax invoice. Workshop inquiries remain quote-only (no payment). Payment connects to existing quiz results page CTA.

</domain>

<decisions>
## Implementation Decisions

### Business Entity & Tax
- Osek Murshe (עוסק מורשה) — full tax invoices with 17% VAT
- Auto-generate חשבונית מס (combined tax invoice + receipt) on every successful payment — one document, simplest flow
- 299 NIS is VAT-inclusive (299 total = ~255.5 base + ~43.5 VAT)
- Green Invoice account already exists with API credentials

### Payment Flow & Pricing
- Redirect to Green Invoice hosted checkout page — CTA on results page opens GI payment page, user returns on success/failure
- Accept credit card + Bit + PayPal — maximum conversion (all supported by Green Invoice hosted checkout)
- Workshop stays quote-only — no payment integration for workshops in this phase. Inquiry flow from Phase 5 stays as-is.
- Fixed price: 299 NIS (hardcoded, not admin-configurable). Change in code when needed.
- Results page CTA ("I Want to Join Now") changes from #coming-soon to the Green Invoice checkout redirect

### Post-Payment Experience
- Dedicated success page at /quiz/challenge/success — addresses common fears, warms up the lead
- Rich onboarding info on success page: what to bring, what to wear, first session date/location, add-to-calendar link
- WhatsApp group invite link on success page — stored in CHALLENGE_WA_GROUP_URL env var (user sets when ready)
- Cohort start date: dynamically calculated as "next Monday after payment date" — creates urgency, new cohorts open weekly but user doesn't know that
- Invoice auto-emailed by Green Invoice directly to customer's email — no custom email needed from our side
- Payment failures handled by Green Invoice's hosted checkout — user stays on their page until success or abandons
- New challenge_enrollments table in DB — links quiz session/user to payment, enables Phase 8 admin view
- Green Invoice webhook confirms payment server-side — don't trust client redirect alone

### Claude's Discretion
- Green Invoice API integration details (endpoint structure, auth headers, webhook signature validation)
- Success page layout and specific fear-addressing copy
- Add-to-calendar implementation (ical link vs Google Calendar API)
- Enrollment table schema design
- Error handling for webhook failures

</decisions>

<specifics>
## Specific Ideas

- Success page should "warm up the lead" — address fears like "will I be able to do this?" similar to how the results page addresses fears
- "Every week a new cohort is opened, however they don't know that" — the UI should present a single upcoming start date (next Monday) to create urgency
- The flow is: Quiz Results → CTA button → Green Invoice checkout → Webhook confirms → Success page with onboarding
- Results page already shows "299 NIS" with crossed-out "499 NIS" and "Only 4 spots left" — keep this anchoring

</specifics>

<deferred>
## Deferred Ideas

- Workshop payment/deposit flow — could be a future addition but workshops stay manual-quote for now
- Admin-configurable pricing — Phase 8 admin panel could add this
- Refund handling — handle manually via Green Invoice dashboard for now

</deferred>

---

*Phase: 06-payments-invoicing*
*Context gathered: 2026-04-01*
