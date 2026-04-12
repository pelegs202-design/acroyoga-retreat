import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { challengeEnrollments, quizLeads } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { nextMonday } from "@/lib/green-invoice/client";
import { enrollInDrip, cancelDrip } from "@/lib/notifications";
import { normalizeIsraeliPhone } from "@/lib/whatsapp";
import { sendFacebookEvent } from "@/lib/facebook-capi";
import { sendPaymentConfirmation } from "@/lib/gmail-notify";

/**
 * Extract customer info from webhook payload.
 * Handles both Morning sale-pages format and legacy Green Invoice format.
 */
function extractCustomerInfo(body: Record<string, unknown>) {
  // Try Morning sale-pages/order-paid format first
  // Common fields: customer, client, buyer, contact — try all
  const customer = (body.customer ?? body.client ?? body.buyer ?? body.contact ?? {}) as Record<string, unknown>;
  const order = (body.order ?? body) as Record<string, unknown>;
  const document = (body.document ?? body) as Record<string, unknown>;

  // Email — try multiple paths
  const email =
    (customer.email as string) ??
    (customer.emails as string[])?.[0] ??
    (body.email as string) ??
    (body.customerEmail as string) ??
    (order.email as string) ??
    null;

  // Name — try multiple paths
  const name =
    (customer.name as string) ??
    (body.customerName as string) ??
    (body.name as string) ??
    (order.customerName as string) ??
    null;

  // Phone — try multiple paths
  const phone =
    (customer.phone as string) ??
    (customer.mobile as string) ??
    (body.customerPhone as string) ??
    (body.phone as string) ??
    (order.phone as string) ??
    null;

  // Amount — try multiple paths
  const amount =
    (body.total as number) ??
    (body.amount as number) ??
    (order.total as number) ??
    (order.amount as number) ??
    (body.price as number) ??
    (document.total as number) ??
    null;

  // Document/Order ID — try multiple paths
  const docId =
    (body.id as string) ??
    (body.orderId as string) ??
    (body.orderNumber as string) ??
    (order.id as string) ??
    (document.id as string) ??
    crypto.randomUUID();

  const docNumber =
    (body.number as number)?.toString() ??
    (body.orderNumber as string) ??
    (document.number as number)?.toString() ??
    null;

  const currency =
    (body.currency as string) ??
    (order.currency as string) ??
    "ILS";

  const createdAt =
    (body.createdAt as string) ??
    (body.created_at as string) ??
    (body.paidAt as string) ??
    (order.createdAt as string) ??
    null;

  return { email, name, phone, amount, docId, docNumber, currency, createdAt };
}

export async function POST(req: NextRequest) {
  try {
    // Log everything for debugging
    const headers: Record<string, string> = {};
    req.headers.forEach((v, k) => { headers[k] = v; });
    console.log("[payments/webhook] Headers:", JSON.stringify(headers));

    const rawBody = await req.text();
    console.log("[payments/webhook] Raw body:", rawBody.substring(0, 2000));

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      console.error("[payments/webhook] Failed to parse JSON body");
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    console.log("[payments/webhook] Body keys:", Object.keys(body));
    console.log("[payments/webhook] Event type:", body.event ?? body.type ?? body.action ?? "unknown");

    // Extract customer info (works for both GI and Morning formats)
    const { email, name, phone, amount, docId, docNumber, currency, createdAt } = extractCustomerInfo(body);

    console.log(`[payments/webhook] Extracted: email=${email}, name=${name}, phone=${phone}, amount=${amount}, docId=${docId}`);

    if (!email && !phone && !name) {
      console.warn("[payments/webhook] No customer info found — logging full payload for debugging");
      console.log("[payments/webhook] FULL BODY:", JSON.stringify(body, null, 2));
      // Still return 200 to acknowledge receipt
      return NextResponse.json({ ok: true, warning: "no customer info extracted" });
    }

    // Match payment to quiz lead by email
    let sessionId = "unknown";
    let leadId: string | null = null;
    let leadPreferredLocale = "he";
    if (email) {
      const [lead] = await db
        .select({ sessionId: quizLeads.sessionId, id: quizLeads.id, phone: quizLeads.phone })
        .from(quizLeads)
        .where(eq(quizLeads.email, email))
        .orderBy(desc(quizLeads.createdAt))
        .limit(1);

      if (lead) {
        sessionId = lead.sessionId;
        leadId = lead.id;
        const leadPhone = lead.phone ?? "";
        leadPreferredLocale =
          leadPhone.startsWith("+972") || leadPhone.startsWith("972") ? "he" : "en";
        console.log(`[payments/webhook] Matched email ${email} to session ${sessionId}`);
      } else {
        console.warn(`[payments/webhook] No quiz lead found for email ${email}`);
      }
    }

    // Calculate cohort start date (next Monday from now)
    const cohortStart = nextMonday(new Date());

    // Write enrollment — use docId unique constraint to prevent duplicates
    await db.insert(challengeEnrollments).values({
      id: crypto.randomUUID(),
      sessionId,
      giDocumentId: String(docId),
      giDocumentNumber: docNumber,
      amountPaid: typeof amount === "number" ? amount : 99,
      currency,
      customerEmail: email,
      customerName: name,
      customerPhone: phone,
      status: "confirmed",
      cohortStartDate: cohortStart,
      paidAt: createdAt ? new Date(createdAt) : new Date(),
    }).onConflictDoNothing();

    console.log(`[payments/webhook] Enrollment recorded: session=${sessionId}, email=${email}, docId=${docId}`);

    // ─── Email customer their success page link (non-blocking) ───
    if (email && name) {
      sendPaymentConfirmation({
        customerEmail: email,
        customerName: name,
        sessionId,
      }).catch((err) => {
        console.error("[payments/webhook] Payment confirmation email failed:", err);
      });
    }

    // ─── Facebook CAPI: Purchase + CompleteRegistration (non-blocking) ───
    const capiParams = {
      email: email || undefined,
      phone: phone || undefined,
      value: typeof amount === "number" ? amount : 99,
      currency,
    };
    sendFacebookEvent({ ...capiParams, eventName: "Purchase", eventId: `purchase_${docId}` })
      .catch((err) => console.error("[payments/webhook] FB CAPI Purchase failed:", err));
    sendFacebookEvent({ ...capiParams, eventName: "CompleteRegistration", eventId: `converted_${docId}` })
      .catch((err) => console.error("[payments/webhook] FB CAPI CompleteRegistration failed:", err));

    // ─── Drip transition on payment (non-blocking) ───
    if (leadId) {
      try {
        const effectiveName = name?.split(" ")[0] ?? "friend";
        const effectivePhone = phone
          ? normalizeIsraeliPhone(phone)
          : null;
        const cohortDateStr = cohortStart.toISOString();

        await cancelDrip(leadId, "wa_challenge_prepay", "paid");
        await cancelDrip(leadId, "email_nurture", "paid");

        if (effectivePhone) {
          await enrollInDrip({
            leadId,
            sequenceType: "wa_challenge_postpay",
            channel: "whatsapp",
            recipientPhone: effectivePhone,
            recipientName: effectiveName,
            preferredLocale: leadPreferredLocale,
            metadata: { cohortStartDate: cohortDateStr },
          });
        }

        if (email) {
          await enrollInDrip({
            leadId,
            sequenceType: "email_challenge_reminders",
            channel: "email",
            recipientEmail: email,
            recipientName: effectiveName,
            preferredLocale: leadPreferredLocale,
            metadata: { cohortStartDate: cohortDateStr },
          });
        }

        console.log(`[payments/webhook] Drip transition complete for lead ${leadId}`);
      } catch (dripErr) {
        console.error("[payments/webhook] Drip transition failed (non-blocking):", dripErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[payments/webhook] Error:", err);
    // Always return 200 to prevent Morning from retrying
    return NextResponse.json({ ok: true });
  }
}
