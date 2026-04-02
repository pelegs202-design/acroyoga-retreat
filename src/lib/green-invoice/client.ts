const GI_BASE_URL = process.env.GI_SANDBOX === 'true'
  ? 'https://sandbox.d.greeninvoice.co.il/api/v1'
  : 'https://api.greeninvoice.co.il/api/v1';

// Module-level token cache (per-request in serverless is fine for low traffic)
let cachedToken: { jwt: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  // Return cached if still valid (55-min buffer on ~60-min expiry)
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.jwt;
  }

  const res = await fetch(`${GI_BASE_URL}/account/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: process.env.GI_API_KEY_ID,
      secret: process.env.GI_API_KEY_SECRET,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GI auth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  cachedToken = {
    jwt: data.token,
    expiresAt: Date.now() + 55 * 60 * 1000, // 55 minutes
  };
  return data.token;
}

/** Calculate next Monday from a given date */
export function nextMonday(from: Date): Date {
  const d = new Date(from);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7 || 7;
  d.setDate(d.getDate() + daysUntilMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

interface CheckoutParams {
  sessionId: string;
  name: string;
  email: string;
  phone: string;
  locale: string;
}

/**
 * Create a Green Invoice payment form URL for the 30-day challenge.
 * Returns the hosted checkout URL where the user completes payment.
 *
 * Per user decision: 299 NIS fixed price, vatType 1 (VAT included),
 * document type 320 (חשבונית מס קבלה).
 */
export async function createCheckoutUrl(params: CheckoutParams): Promise<string> {
  const token = await getToken();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const successUrl = `${baseUrl}/${params.locale}/quiz/challenge/success?session=${params.sessionId}`;
  const failureUrl = `${baseUrl}/${params.locale}/quiz/challenge/results?session=${params.sessionId}&payment=failed`;

  const body = {
    type: 320,            // חשבונית מס קבלה
    lang: 'he',
    currency: 'ILS',
    vatType: 1,           // VAT included in price — GI calculates split automatically
    income: [{
      catalogNum: 'CHALLENGE-30D',
      description: 'אקרוחבורה — אתגר 30 הימים',
      quantity: 1,
      price: 299,
      currency: 'ILS',
      vatType: 1,
    }],
    client: {
      name: params.name,
      emails: [params.email],
      phone: params.phone,
    },
    remarks: `sessionId:${params.sessionId}`,  // Embed sessionId for webhook extraction
    successUrl,
    failUrl: failureUrl,
    // Payment method types accepted: credit card (1), Bit (10), PayPal (11)
    // These are configured in GI dashboard payment form settings
  };

  const res = await fetch(`${GI_BASE_URL}/documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GI document creation failed (${res.status}): ${errText}`);
  }

  const data = await res.json();

  // GI returns a url field for the hosted checkout when payment is pending
  if (!data.url) {
    // Fallback: some GI API versions return paymentUrl or the document's payment link
    const paymentUrl = data.paymentUrl || data.url;
    if (!paymentUrl) {
      throw new Error('GI did not return a payment URL. Response: ' + JSON.stringify(data).substring(0, 500));
    }
    return paymentUrl;
  }

  return data.url;
}
