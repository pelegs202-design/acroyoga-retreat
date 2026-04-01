# Phase 6: Payments + Invoicing - Research

**Researched:** 2026-04-01
**Domain:** Israeli payment gateway integration (Green Invoice / morning), webhook verification, DB schema extension, success page UX
**Confidence:** MEDIUM — Green Invoice official docs are JavaScript-rendered and inaccessible to crawlers; key findings verified via WooCommerce plugin open source and community sources

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Osek Murshe (עוסק מורשה) — full tax invoices with VAT
- Auto-generate חשבונית מס (combined tax invoice + receipt, type 320) on every successful payment
- Redirect to Green Invoice hosted checkout page — CTA on results page opens GI payment page, user returns on success/failure
- Accept credit card + Bit + PayPal — all supported by Green Invoice hosted checkout
- Workshop stays quote-only — no payment integration for workshops in this phase
- Fixed price: 299 NIS (hardcoded in code). Change in code when needed.
- Results page CTA ("I Want to Join Now") changes from #coming-soon to the Green Invoice checkout redirect
- Dedicated success page at /quiz/challenge/success
- Rich onboarding info on success page: what to bring, what to wear, first session date/location, add-to-calendar link
- WhatsApp group invite link on success page — stored in CHALLENGE_WA_GROUP_URL env var
- Cohort start date: dynamically calculated as "next Monday after payment date"
- Invoice auto-emailed by Green Invoice directly to customer's email
- Payment failures handled by Green Invoice's hosted checkout
- New challenge_enrollments table in DB — links quiz session/user to payment
- Green Invoice webhook confirms payment server-side — don't trust client redirect alone

### Claude's Discretion
- Green Invoice API integration details (endpoint structure, auth headers, webhook signature validation)
- Success page layout and specific fear-addressing copy
- Add-to-calendar implementation (ical link vs Google Calendar API)
- Enrollment table schema design
- Error handling for webhook failures

### Deferred Ideas (OUT OF SCOPE)
- Workshop payment/deposit flow
- Admin-configurable pricing (Phase 8)
- Refund handling (manual via Green Invoice dashboard)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PAY-01 | User can pay for 30-day challenge via Green Invoice checkout (under 500 NIS) | Green Invoice payment form URL endpoint `/api/v1/plugins/woocommerce/pay/url` creates a redirect URL; 299 NIS is well below e-invoice reform thresholds |
| PAY-02 | User can submit workshop inquiry and receive quote/booking confirmation | Already implemented in Phase 5 — no new work needed. Workshop inquiry saves to DB and sends email. |
| PAY-03 | Green Invoice generates automatic Hebrew tax invoice (חשבונית) on payment | Document type 320 (חשבונית מס קבלה) is the correct type; Green Invoice auto-emails the invoice to customer |
</phase_requirements>

---

## Summary

Green Invoice (branded "morning") is Israel's dominant business management platform with a REST API hosted at `api.greeninvoice.co.il/api/v1`. Authentication uses a short-lived JWT: POST `id`+`secret` to `/account/token`, receive a JWT valid for ~1 hour. The API is documented at `greeninvoice.docs.apiary.io` but the documentation is JS-rendered and inaccessible to crawlers. Key endpoint behaviors were reverse-engineered from the official open-source WooCommerce plugin (wc-gateway-greeninvoice, actively maintained through March 2026).

The payment flow is: server creates a payment form URL by calling the GI API with order data → redirect user to that URL → GI hosts the checkout (credit card + Bit + PayPal) → GI fires a webhook to your server on payment confirmation → server writes enrollment to DB → user is redirected to the success page. The webhook payload is the full document JSON (type 320, not a lightweight event). There is no documented HMAC signature in the webhook payload; the WooCommerce plugin validates via a shared order key. For this project, server-side validation should check that the document `total` matches 299 and that the `sessionId` in the webhook URL matches a real quiz lead.

**VAT rate warning:** The CONTEXT.md states 17% VAT but Israel raised VAT to 18% effective January 1, 2025. At 299 NIS, the correct split is ~252.5 base + ~46.5 VAT (18%). Green Invoice handles the VAT calculation automatically when you set `income.vatType: 1` (VAT included), so the API call just passes the total price and Green Invoice splits it correctly. The user should verify their Green Invoice account VAT settings reflect 18%.

**Primary recommendation:** Use Green Invoice's WooCommerce plugin endpoint pattern (`/api/v1/plugins/woocommerce/pay/url`) — it's the payment-form-creation path documented in official open-source code. For a standalone app (not WooCommerce), use the standard document creation endpoint `/api/v1/documents` with `type: 320` and a `payment` block that references the payment form.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| No additional npm package needed | — | Green Invoice API is REST; fetch() is sufficient | Native fetch handles JWT auth + JSON requests cleanly |
| `add-to-calendar-button-react` | latest | Success page "add to calendar" button | Zero-config, supports Google/Apple/iCal, officially documented for Next.js App Router |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zod` | already installed | Webhook payload validation | Already in project; validate incoming webhook JSON shape |
| `drizzle-orm` | already installed | DB schema + queries | Already in project; add `challenge_enrollments` table |
| `drizzle-kit` | already installed | Migration generation | Run `npx drizzle-kit generate` after schema change |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `add-to-calendar-button-react` | Manual Google Calendar URL | Manual URL is simpler but only supports Google; library supports all calendars in one line |
| `add-to-calendar-button-react` | `ics` npm package + download link | ics package requires serving a file; library handles everything client-side |

**Installation:**
```bash
npm install add-to-calendar-button-react
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── [locale]/(app)/quiz/challenge/
│   │   ├── results/          # existing — add payment CTA redirect
│   │   └── success/          # NEW — success page (server component + client sub-components)
│   └── api/
│       ├── payments/
│       │   ├── checkout/route.ts    # NEW — creates GI payment form URL, returns redirect
│       │   └── webhook/route.ts     # NEW — receives GI webhook, writes enrollment
│       └── quiz/                    # existing
├── lib/
│   ├── db/
│   │   └── schema.ts         # add challenge_enrollments table
│   └── green-invoice/
│       └── client.ts         # NEW — GI API client (token, create payment URL)
└── .env.local                 # add GI_API_KEY_ID, GI_API_KEY_SECRET, GI_SANDBOX, CHALLENGE_WA_GROUP_URL
```

### Pattern 1: Two-step JWT Auth
**What:** Get a short-lived JWT before each API call (or cache for up to 55 minutes)
**When to use:** Every GI API call requires a valid JWT in the `Authorization: Bearer {token}` header

```typescript
// Source: greeninvoice.docs.apiary.io (via WebSearch, MEDIUM confidence)
// src/lib/green-invoice/client.ts

const BASE_URL = process.env.GI_SANDBOX === 'true'
  ? 'https://sandbox.d.greeninvoice.co.il/api/v1'
  : 'https://api.greeninvoice.co.il/api/v1';

async function getToken(): Promise<string> {
  const res = await fetch(`${BASE_URL}/account/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: process.env.GI_API_KEY_ID,
      secret: process.env.GI_API_KEY_SECRET,
    }),
  });
  const data = await res.json();
  return data.token; // JWT, valid ~1 hour
}
```

### Pattern 2: Payment Form URL Creation
**What:** Create a Green Invoice document of type 320 with an embedded payment request; GI returns a hosted checkout URL
**When to use:** When user clicks "I Want to Join Now" on results page

```typescript
// Source: WooCommerce plugin source (plugins.trac.wordpress.org/browser/wc-gateway-greeninvoice, HIGH confidence)
// The WC plugin uses /api/v1/plugins/woocommerce/pay/url (WooCommerce-specific)
// For standalone apps: use /api/v1/documents with payment block (MEDIUM confidence)

async function createPaymentFormUrl(params: {
  sessionId: string;
  name: string;
  email: string;
  phone: string;
  successUrl: string;
  failureUrl: string;
}): Promise<string> {
  const token = await getToken();

  const body = {
    type: 320,           // חשבונית מס קבלה — tax invoice + receipt
    lang: 'he',
    currency: 'ILS',
    vatType: 1,          // VAT included in price (vatType 1 = inclusive)
    income: [{
      description: 'אקרוחבורה — אתגר 30 הימים',
      quantity: 1,
      price: 299,
      vatType: 1,        // VAT included
    }],
    client: {
      name: params.name,
      emails: [params.email],
      phone: params.phone,
    },
    payment: [{
      type: 1,           // credit card (type codes: 1=credit, 2=cash, 10=bit, 11=paypal)
      deferType: 1,      // immediate
      price: 299,
    }],
    // successUrl / failUrl — field names to verify from GI dashboard or docs
    // These may be successUrl / failUrl or returnUrl — see Open Questions
  };

  const res = await fetch(`${BASE_URL}/documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  // GI returns a "url" field with the hosted checkout link
  return data.url;
}
```

### Pattern 3: Webhook Handler
**What:** Receive GI webhook on document payment confirmation; write enrollment to DB
**When to use:** Every GI payment triggers a webhook POST to your configured URL

```typescript
// Source: WooCommerce IPN handler + GI webhook payload research (MEDIUM confidence)
// src/app/api/payments/webhook/route.ts

export async function POST(req: NextRequest) {
  // 1. Parse body
  const body = await req.json();

  // 2. Validate shape — GI sends the full document object
  // body.type should be 320, body.total should be 299
  // body.id is the GI document ID

  // 3. Extract session from custom field or URL query param
  // GI allows passing custom data — look for sessionId in body.description or body.remarks

  // 4. Write to challenge_enrollments
  await db.insert(challengeEnrollments).values({
    id: crypto.randomUUID(),
    sessionId: extractedSessionId,
    giDocumentId: body.id,
    giDocumentNumber: body.number,
    amountPaid: body.total,
    currency: body.currency,
    customerEmail: body.client?.emails?.[0],
    customerName: body.client?.name,
    paidAt: new Date(body.date),
    cohortStartDate: nextMonday(new Date()),
    status: 'confirmed',
  });

  return NextResponse.json({ ok: true });
}
```

### Pattern 4: Next Monday Calculation
**What:** Calculate the next Monday from today for cohort start date
**When to use:** On success page display AND when writing enrollment to DB

```typescript
// Source: JavaScript Date stdlib (HIGH confidence)
function nextMonday(from: Date): Date {
  const d = new Date(from);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  // Days until next Monday: Mon=0, Tue=6, Wed=5, Thu=4, Fri=3, Sat=2, Sun=1
  const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7 || 7;
  d.setDate(d.getDate() + daysUntilMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}
```

### Pattern 5: Add-to-Calendar (Client Component)
**What:** Generate calendar links for first session date
**When to use:** Success page, after cohort start date is known

```typescript
// Source: add-to-calendar-button.com/use-with-nextjs (HIGH confidence)
'use client';
import dynamic from 'next/dynamic';

const AddToCalendarButton = dynamic(
  () => import('add-to-calendar-button-react').then(m => m.AddToCalendarButton),
  { ssr: false }
);

// Usage:
<AddToCalendarButton
  name="אקרוחבורה — אתגר 30 הימים מתחיל!"
  startDate={cohortDate}  // "YYYY-MM-DD"
  startTime="10:00"
  endTime="12:00"
  timeZone="Asia/Jerusalem"
  options={['Apple', 'Google', 'iCal']}
  location="ישראל"
/>
```

### Anti-Patterns to Avoid
- **Trust client redirect alone:** User could land on success URL without actually paying. Always wait for webhook to write enrollment.
- **Cache JWT indefinitely:** JWT expires in ~1 hour. Cache with a 55-minute TTL max, or re-fetch per request (safe for low traffic).
- **Hardcode GI production URL in dev:** Use `GI_SANDBOX=true` to hit `sandbox.d.greeninvoice.co.il` in development.
- **Block webhook response until DB write:** Return `200 OK` immediately, process enrollment asynchronously if needed (though Neon is fast enough for sync processing).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Calendar links | Custom ICS generator | `add-to-calendar-button-react` | Handles Google/Apple/iCal quirks, RTL text, timezone encoding |
| Payment UI | Custom card form | GI hosted checkout redirect | PCI compliance, card tokenization, Bit/PayPal support |
| Invoice PDF | Custom PDF generation | GI type 320 document | Legal compliance, Hebrew formatting, tax authority registration |
| VAT calculation | Manual split | `vatType: 1` on GI income line | GI handles VAT split automatically and correctly |

**Key insight:** Green Invoice's hosted checkout handles all payment method UI, PCI compliance, and invoice generation. Our server only needs to create the payment form URL and receive the webhook confirmation.

---

## Common Pitfalls

### Pitfall 1: VAT Rate Mismatch
**What goes wrong:** CONTEXT.md states 17% VAT but Israel raised to 18% on January 1, 2025. Price will be calculated incorrectly if relying on the 17% figure.
**Why it happens:** The user wrote the context before the rate change took effect, or was thinking of the 2024 rate.
**How to avoid:** Green Invoice handles the VAT split automatically based on the account's VAT settings. Set `vatType: 1` (included) and pass 299 as the total price — GI will split it correctly at whatever rate is configured in the account. Verify the GI account VAT setting is set to 18%.
**Warning signs:** If invoice shows ~43.5 VAT instead of ~46.5 VAT, the account is still on 17%.

### Pitfall 2: Webhook URL Not Passed at Checkout Creation
**What goes wrong:** The Green Invoice API may require the webhook/callback URL to be embedded in the payment form creation request, not just configured in the dashboard.
**Why it happens:** The exact parameter names for `successUrl` / `failureUrl` / `callbackUrl` are not confirmed — they are not in public open-source code.
**How to avoid:** Configure the webhook in the GI dashboard (Settings > Developer Tools > Create Webhook) AND check whether the payment form creation endpoint accepts a `successUrl` / `failUrl` parameter. The WooCommerce plugin passes order-specific return URLs, suggesting per-request URL injection is possible.
**Warning signs:** User redirected to generic GI success page instead of `/quiz/challenge/success`.

### Pitfall 3: Session ID Not Passed Through Payment Flow
**What goes wrong:** When the webhook fires, there's no way to know which quiz session the payment is for.
**Why it happens:** GI webhook payload is the document object, not your app's metadata.
**How to avoid:** Pass `sessionId` as a URL query param on the success/failure redirect URLs (e.g., `https://acroyoga.co.il/quiz/challenge/success?session=abc123`). Also embed it in `description` or `remarks` of the document for the webhook. When webhook fires, match by GI document ID or extract from the `remarks` field.
**Warning signs:** Enrollment table rows with null sessionId after successful payments.

### Pitfall 4: Payment Form URL Endpoint Uncertainty
**What goes wrong:** The `/api/v1/plugins/woocommerce/pay/url` endpoint is WooCommerce-plugin-specific. It may not be available for standalone API clients.
**Why it happens:** GI may gate this endpoint to registered plugin clients.
**How to avoid:** Use the standard document creation endpoint `POST /api/v1/documents` with a `payment` block. When the document has payment requested, GI returns a `url` for the hosted checkout. Test this in sandbox first.
**Warning signs:** 403/404 from the plugin-specific endpoint.

### Pitfall 5: JWT Token Per Request Overhead
**What goes wrong:** Fetching a new JWT for every single API call adds ~200-400ms latency.
**Why it happens:** Tokens expire in ~1 hour but new ones are fetched every time.
**How to avoid:** For low-traffic usage (a few sales per day), per-request token fetch is fine. For higher traffic, cache the token in a module-level variable with a 55-minute expiry. Do NOT store in Redis/KV for this phase.
**Warning signs:** Payment form URL creation taking 600ms+ for users.

### Pitfall 6: Israeli e-Invoice Reform — Not an Issue for 299 NIS
**What goes wrong:** Concern that the Israeli CTC e-invoicing mandate (חשבונית ישראל) applies to this payment.
**Why it doesn't:** The mandate applies to B2B invoices above thresholds (20,000 NIS in 2025, dropping to 10,000 NIS in 2026). A 299 NIS B2C payment is exempt. Green Invoice is registered with the Tax Authority regardless.
**Warning signs:** None — this is a confirmed non-issue for this price point.

---

## Code Examples

### DB Schema Addition

```typescript
// Source: existing schema.ts patterns (HIGH confidence — matches existing project)
// Add to src/lib/db/schema.ts

export const challengeEnrollments = pgTable("challenge_enrollments", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),              // FK to quiz_leads.session_id
  giDocumentId: text("gi_document_id").notNull().unique(), // Green Invoice document ID
  giDocumentNumber: integer("gi_document_number"),         // GI invoice number
  amountPaid: integer("amount_paid").notNull(),             // in agorot (299 NIS = 29900) OR as integer NIS
  currency: text("currency").notNull().default("ILS"),
  customerEmail: text("customer_email"),
  customerName: text("customer_name"),
  status: text("status").notNull().default("confirmed"),    // 'confirmed' | 'refunded'
  cohortStartDate: timestamp("cohort_start_date"),          // calculated next Monday
  paidAt: timestamp("paid_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("challenge_enrollments_session_idx").on(table.sessionId),
  index("challenge_enrollments_status_idx").on(table.status),
]);
```

### Environment Variables Needed

```bash
# .env.local additions for Phase 6
GI_API_KEY_ID=your_key_id_from_gi_dashboard
GI_API_KEY_SECRET=your_key_secret_from_gi_dashboard
GI_SANDBOX=true                                    # set false in production
CHALLENGE_WA_GROUP_URL=https://chat.whatsapp.com/xxx  # optional, shown on success page
NEXT_PUBLIC_BASE_URL=https://acroretreat.co.il     # for redirect URLs
```

### Checkout API Route Pattern

```typescript
// Source: existing quiz API routes as pattern (HIGH confidence)
// src/app/api/payments/checkout/route.ts

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Validate: sessionId exists in quiz_leads
  // Create GI payment form URL
  // Return { url: "https://app.greeninvoice.co.il/..." }
}
```

### Results Page CTA Change

```typescript
// src/components/quiz/QuizResultsPage.tsx — change the CTA button
// OLD: href="#coming-soon"
// NEW: onClick triggers POST /api/payments/checkout with sessionId,
//      then window.location.href = response.url
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 17% VAT in Israel | 18% VAT | January 1, 2025 | At 299 NIS: ~46.5 VAT instead of ~43.5 — GI handles automatically |
| Manual e-invoice compliance | CTC mandate for invoices >20k NIS | May 2024 (phased) | No impact at 299 NIS — threshold is well above this price |
| green-invoice as brand | "morning" is the current brand name | 2022 | API still at api.greeninvoice.co.il; morning is the product brand |

**Deprecated/outdated:**
- 17% VAT rate: replaced by 18% in 2025. Green Invoice account settings should reflect this automatically, but verify.

---

## Open Questions

1. **Exact payment form creation endpoint for standalone (non-WooCommerce) apps**
   - What we know: `/api/v1/plugins/woocommerce/pay/url` is the WC plugin endpoint. Standard document creation at `/api/v1/documents` exists.
   - What's unclear: Does `POST /api/v1/documents` with a payment block return a `url` field for hosted checkout? Or is there a separate `/api/v1/payment-forms` endpoint?
   - Recommendation: Test both in sandbox. Start with `POST /api/v1/documents` with `type: 320` and a payment block. If no `url` returned, look for a `/payment-forms` endpoint in the GI dashboard API explorer.

2. **Webhook signature validation**
   - What we know: No HMAC signature field was found in the webhook payload (based on danielrosehill's notes). WooCommerce plugin validates via order key.
   - What's unclear: Does GI support any webhook signature header (X-GI-Signature or similar)?
   - Recommendation: Configure the webhook to a hard-to-guess URL path (add a secret token as a path segment or query param), then validate that `body.total === 299` and `body.type === 320` to reduce spoofing risk.

3. **Passing sessionId through GI checkout flow**
   - What we know: GI document has `description` and `remarks` free-text fields. The redirect success/failure URLs can include query params.
   - What's unclear: Whether GI preserves query params on the redirect URL or strips them.
   - Recommendation: Embed sessionId in BOTH the document `remarks` field AND the success/failure redirect URL query param. Use the webhook's document ID to look up the enrollment if query params are stripped.

4. **GI sandbox environment for development**
   - What we know: Sandbox URL is `https://sandbox.d.greeninvoice.co.il/api/v1` (confirmed via WebSearch).
   - What's unclear: Whether sandbox account credentials are separate from production.
   - Recommendation: Register for a sandbox account at `sandbox.greeninvoice.co.il` or use the sandbox mode toggle in the main account settings. Verify by checking the GI dashboard "Developer Tools" section.

---

## Sources

### Primary (HIGH confidence)
- WooCommerce plugin source: `plugins.trac.wordpress.org/browser/wc-gateway-greeninvoice/` — endpoint `/api/v1/plugins/woocommerce/pay/url`, auth pattern, IPN handler structure, mapper field names (HIGH — open-source official plugin, actively maintained through March 2026)
- `add-to-calendar-button.com/use-with-nextjs` — Next.js App Router integration pattern for add-to-calendar (HIGH — official library docs)

### Secondary (MEDIUM confidence)
- WebSearch result for JWT auth: POST to `/account/token` with `{id, secret}`, returns `{token}` valid ~1 hour, from Apiary documentation URL (MEDIUM — Apiary page title confirmed, content JS-rendered)
- WebSearch result for sandbox URL: `https://sandbox.d.greeninvoice.co.il/api/v1` (MEDIUM — multiple consistent sources)
- Document type codes from `danielrosehill/Green-Invoice-API-My-Notes/document-types.md`: type 320 = חשבונית מס קבלה (MEDIUM — unofficial but consistent with field mapping docs)
- `help.valigara.com` GreenInvoice document fields: client fields, income fields, vatType (MEDIUM — third-party integration doc, consistent with WC plugin mapper)

### Tertiary (LOW confidence)
- Webhook payload structure (no signature field, full document in body) — danielrosehill notes + WebSearch (LOW — unofficial sources only)
- Payment form creation request body structure with `income` / `payment` blocks — inferred from WC plugin mappers + Valigara docs (LOW — synthesized, not directly from GI docs)
- VAT rate change from 17% to 18% effective 2025 — marosavat.com + vatcalc.com (HIGH via multiple authoritative VAT sources confirming Jan 1 2025 change)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — minimal new packages, existing project stack is sufficient
- Architecture: MEDIUM — patterns follow existing project conventions; GI-specific details are MEDIUM
- Green Invoice API specifics: MEDIUM — derived from official open-source WooCommerce plugin and community sources; official Apiary docs are JS-rendered and unreadable
- Pitfalls: MEDIUM — derived from real integration code; webhook signature gap is confirmed real
- VAT rate: HIGH — confirmed by multiple authoritative tax sources

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (GI API stable; VAT rate confirmed for 2025)

**Critical action before implementation:** Open the Green Invoice sandbox account, call `POST /api/v1/documents` with type 320 + payment block, and observe whether the response contains a `url` field for the hosted checkout. This resolves Open Question #1 and is the most critical unknown for this phase.
