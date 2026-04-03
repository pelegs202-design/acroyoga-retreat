import { Resend } from "resend";
import { createHmac, timingSafeEqual } from "crypto";
import type { ReactElement } from "react";

// ─── Resend client ───

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

if (!resend) {
  console.warn("[email] RESEND_API_KEY not set — email sending disabled");
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "AcroHavura <shai@acroretreat.co.il>";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://acrohavura.com";

// ─── Unsubscribe token helpers ───

/**
 * Generates an HMAC-SHA256 token for one-click unsubscribe.
 * Uses UNSUBSCRIBE_SECRET if set, falls back to CRON_SECRET, then a static fallback.
 */
export function generateUnsubToken(userId: string): string {
  const secret =
    process.env.UNSUBSCRIBE_SECRET ??
    process.env.CRON_SECRET ??
    "CHANGE_ME_UNSUBSCRIBE";
  const hmac = createHmac("sha256", secret);
  hmac.update(userId);
  return hmac.digest("base64url");
}

/**
 * Verifies an unsubscribe token for a given userId.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyUnsubToken(token: string, userId: string): boolean {
  const expected = generateUnsubToken(userId);
  try {
    return timingSafeEqual(
      Buffer.from(token, "base64url"),
      Buffer.from(expected, "base64url"),
    );
  } catch {
    return false;
  }
}

// ─── Email types ───

interface BaseEmailOptions {
  to: string;
  subject: string;
  react: ReactElement;
  scheduledAt?: string;
}

interface MarketingEmailOptions extends BaseEmailOptions {
  unsubToken: string;
  uid: string;
  tags?: Array<{ name: string; value: string }>;
}

// ─── sendTransactionalEmail ───

/**
 * Send a transactional email (confirmations, password resets, reminders).
 * Always sends regardless of marketing preference.
 * No unsubscribe headers.
 */
export async function sendTransactionalEmail(
  opts: BaseEmailOptions,
): Promise<{ id?: string; error?: string }> {
  if (!resend) {
    console.warn(`[email] Skipping transactional email to ${opts.to} — RESEND_API_KEY not set`);
    return { error: "RESEND_API_KEY not configured" };
  }

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: opts.to,
    subject: opts.subject,
    react: opts.react,
    ...(opts.scheduledAt ? { scheduledAt: opts.scheduledAt } : {}),
  });

  if (error) {
    console.error("[email] Transactional send failed:", error);
    return { error: error.message };
  }

  return { id: data?.id };
}

// ─── sendMarketingEmail ───

/**
 * Send a marketing email with List-Unsubscribe headers (RFC 8058 compliant).
 * Callers must check emailMarketing preference before calling.
 */
export async function sendMarketingEmail(
  opts: MarketingEmailOptions,
): Promise<{ id?: string; error?: string }> {
  if (!resend) {
    console.warn(`[email] Skipping marketing email to ${opts.to} — RESEND_API_KEY not set`);
    return { error: "RESEND_API_KEY not configured" };
  }

  const unsubUrl = `${APP_URL}/api/unsubscribe?token=${opts.unsubToken}&uid=${opts.uid}`;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: opts.to,
    subject: opts.subject,
    react: opts.react,
    headers: {
      "List-Unsubscribe": `<${unsubUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    tags: opts.tags,
    ...(opts.scheduledAt ? { scheduledAt: opts.scheduledAt } : {}),
  });

  if (error) {
    console.error("[email] Marketing send failed:", error);
    return { error: error.message };
  }

  return { id: data?.id };
}

// ─── buildUnsubUrl ───

/** Build the unsubscribe URL for inclusion in email footers. */
export function buildUnsubUrl(userId: string): string {
  const token = generateUnsubToken(userId);
  return `${APP_URL}/api/unsubscribe?token=${token}&uid=${userId}`;
}
