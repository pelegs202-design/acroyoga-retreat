/**
 * Facebook Conversions API (CAPI) — server-side event reporting.
 *
 * Sends Lead and Purchase events directly to Facebook, bypassing browser
 * cookie limitations (Safari ITP). This ensures 100% attribution accuracy
 * for Facebook/Instagram ad conversions.
 *
 * Pixel ID: 1646755465782002
 */

import crypto from "crypto";

const PIXEL_ID = "1646755465782002";
const ACCESS_TOKEN = process.env.FB_CAPI_ACCESS_TOKEN;
const API_VERSION = "v21.0";

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

interface CAPIEventParams {
  eventName: "Lead" | "Purchase" | "InitiateCheckout" | "CompleteRegistration";
  email?: string;
  phone?: string;
  fbclid?: string;
  fbp?: string;
  value?: number;
  currency?: string;
  sourceUrl?: string;
  eventId?: string;
}

export async function sendFacebookEvent(params: CAPIEventParams): Promise<void> {
  if (!ACCESS_TOKEN) {
    console.warn("[fb-capi] No FB_CAPI_ACCESS_TOKEN set, skipping");
    return;
  }

  const userData: Record<string, unknown> = {};
  if (params.email) userData.em = [sha256(params.email)];
  if (params.phone) {
    const phone = params.phone.replace(/[\s\-()]/g, "");
    userData.ph = [sha256(phone)];
  }
  if (params.fbclid) userData.fbc = `fb.1.${Date.now()}.${params.fbclid}`;
  if (params.fbp) userData.fbp = params.fbp;

  const eventData: Record<string, unknown> = {
    event_name: params.eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    user_data: userData,
  };

  if (params.eventId) {
    eventData.event_id = params.eventId;
  }

  if (params.sourceUrl) {
    eventData.event_source_url = params.sourceUrl;
  }

  if (params.value !== undefined) {
    eventData.custom_data = {
      value: params.value,
      currency: params.currency || "ILS",
    };
  }

  const payload = {
    data: [eventData],
  };

  try {
    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[fb-capi] ${params.eventName} failed (${res.status}):`, text);
    } else {
      const data = await res.json();
      console.log(`[fb-capi] ${params.eventName} sent:`, data);
    }
  } catch (err) {
    console.error(`[fb-capi] ${params.eventName} error:`, err);
  }
}
