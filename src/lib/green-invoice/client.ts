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

/**
 * Search for recent paid documents by customer email.
 * Returns true if a document was created in the last 10 minutes for this email.
 */
export async function checkPaymentByEmail(email: string): Promise<boolean> {
  const token = await getToken();

  // Search documents created in the last 10 minutes for this email
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  const res = await fetch(`${GI_BASE_URL}/documents/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      page: 1,
      pageSize: 1,
      sort: 'createdAt',
      direction: 'desc',
      type: [320, 305, 400, 100], // invoice types: tax invoice receipt, receipt, etc.
      fromDate: tenMinutesAgo.toISOString().split('T')[0],
      toDate: new Date().toISOString().split('T')[0],
      client: {
        emails: [email],
      },
    }),
  });

  if (!res.ok) {
    console.error(`[GI] Document search failed (${res.status}):`, await res.text());
    return false;
  }

  const data = await res.json();
  // data.items should be an array of documents
  const items = data.items ?? data.docs ?? [];
  return items.length > 0;
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
    payment: [{
      type: 3,              // Payment type 3 = payment request (hosted checkout)
      price: 299,
      currency: 'ILS',
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD today
    }],
    remarks: `sessionId:${params.sessionId}`,  // Embed sessionId for webhook extraction
    successUrl,
    failUrl: failureUrl,
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
