/**
 * Lightweight Gmail notification sender for Vercel serverless.
 * Uses OAuth2 refresh token to send emails from pelegs202@gmail.com.
 * Env vars: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN
 */

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const NOTIFY_EMAIL = "pelegs202@gmail.com";

async function getAccessToken(): Promise<string | null> {
  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
    console.warn("[gmail-notify] Missing GMAIL_* env vars, skipping");
    return null;
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GMAIL_CLIENT_ID,
      client_secret: GMAIL_CLIENT_SECRET,
      refresh_token: GMAIL_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    console.error("[gmail-notify] Token refresh failed:", await res.text());
    return null;
  }

  const data = await res.json();
  return data.access_token;
}

function buildRawEmail(subject: string, htmlBody: string): string {
  const headers = [
    `From: AcroHavura <${NOTIFY_EMAIL}>`,
    `To: ${NOTIFY_EMAIL}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    htmlBody,
  ].join("\r\n");

  return Buffer.from(headers)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function notifyNewLead(lead: {
  name: string;
  email: string;
  phone: string;
  archetype?: string;
  fear?: string;
  commitment?: string;
  experience?: string;
}): Promise<void> {
  const accessToken = await getAccessToken();
  if (!accessToken) return;

  const phone = lead.phone.replace("+", "").replace(/[-\s]/g, "");
  const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(
    `היי ${lead.name.split(" ")[0]}! ראיתי שמילאת את השאלון של אקרוחבורה. רציתי לשאול אם את/ה מעוניין/ת להצטרף לאתגר 30 הימים? אני שי, המדריך - אשמח לענות על כל שאלה!`
  )}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px;">
      <h2 style="color: #F472B6; margin: 0;">New Lead: ${lead.name}</h2>
      <table style="margin-top: 12px; font-size: 14px;">
        <tr><td style="padding: 4px 12px 4px 0; color: #999;">Email</td><td>${lead.email}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #999;">Phone</td><td><a href="${waLink}" style="color: #25D366; font-weight: bold;">${lead.phone}</a></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #999;">Archetype</td><td>${lead.archetype || "-"}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #999;">Experience</td><td>${lead.experience || "-"}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #999;">Commitment</td><td>${lead.commitment || "-"}/week</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #999;">Fear</td><td>${lead.fear || "-"}</td></tr>
      </table>
      <p style="margin-top: 16px;"><a href="${waLink}" style="display: inline-block; background: #25D366; color: white; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 8px;">WhatsApp ${lead.name.split(" ")[0]}</a></p>
    </div>
  `;

  const subject = `New Lead: ${lead.name} (${lead.archetype || "quiz"})`;
  const raw = buildRawEmail(subject, html);

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    console.error("[gmail-notify] Send failed:", await res.text());
  } else {
    console.log(`[gmail-notify] Lead notification sent for ${lead.name}`);
  }
}
