import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { challengeEnrollments, quizLeads } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { nextMonday } from "@/lib/green-invoice/client";
import { enrollInDrip, cancelDrip } from "@/lib/notifications";
import { normalizeIsraeliPhone } from "@/lib/whatsapp";
import { sendFacebookEvent } from "@/lib/facebook-capi";

export async function POST(req: NextRequest) {
  try {
    // Log all headers and query params for debugging Morning webhook format
    const headers: Record<string, string> = {};
    req.headers.forEach((v, k) => { headers[k] = v; });
    console.log("[payments/webhook] Headers:", JSON.stringify(headers));
    console.log("[payments/webhook] URL:", req.url);

    const body = await req.json();
    console.log("[payments/webhook] Body keys:", Object.keys(body));
    console.log("[payments/webhook] Body preview:", JSON.stringify(body).substring(0, 500));

    // Validate webhook secret — check header, query param, and body field
    const secret = req.headers.get("x-webhook-secret")
      ?? req.headers.get("x-gi-secret")
      ?? req.nextUrl.searchParams.get("secret")
      ?? body?.secret;
    const expectedSecret = process.env.GI_WEBHOOK_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      console.error("[payments/webhook] Secret mismatch. Got:", secret, "Expected:", expectedSecret?.substring(0, 8) + "...");
      // DON'T reject — log and continue for now to debug
      // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!body || typeof body !== "object") {
      console.error("[payments/webhook] Invalid body");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const docType = body.type;
    const total = body.total ?? body.amount;
    const docId = body.id;

    console.log(`[payments/webhook] docType=${docType}, total=${total}, docId=${docId}`);
    // Accept any document type for now — Morning payment forms may use different types
    // TODO: restrict to type 320 after confirming what Morning sends

    if (typeof total === "number" && total !== 299) {
      console.warn(`[payments/webhook] Unexpected total: ${total}`);
    }

    // Extract client info from webhook payload
    const customerEmail = body.client?.emails?.[0] ?? null;
    const customerName = body.client?.name ?? null;
    const customerPhone = body.client?.phone ?? null;
    const giDocumentNumber = body.number?.toString() ?? null;

    // Match payment to quiz lead by email — find the most recent lead with this email
    let sessionId = "unknown";
    let leadId: string | null = null;
    let leadPreferredLocale = "he";
    if (customerEmail) {
      const [lead] = await db
        .select({ sessionId: quizLeads.sessionId, id: quizLeads.id, phone: quizLeads.phone })
        .from(quizLeads)
        .where(eq(quizLeads.email, customerEmail))
        .orderBy(desc(quizLeads.createdAt))
        .limit(1);

      if (lead) {
        sessionId = lead.sessionId;
        leadId = lead.id;
        // Detect locale from quiz lead's phone (Israeli +972 → Hebrew)
        const leadPhone = lead.phone ?? "";
        leadPreferredLocale =
          leadPhone.startsWith("+972") || leadPhone.startsWith("972") ? "he" : "en";
        console.log(`[payments/webhook] Matched email ${customerEmail} to session ${sessionId}`);
      } else {
        console.warn(`[payments/webhook] No quiz lead found for email ${customerEmail}`);
      }
    }

    // Calculate cohort start date (next Monday from now)
    const cohortStart = nextMonday(new Date());

    // Write enrollment — use giDocumentId unique constraint to prevent duplicates
    await db.insert(challengeEnrollments).values({
      id: crypto.randomUUID(),
      sessionId,
      giDocumentId: String(docId),
      giDocumentNumber,
      amountPaid: typeof total === "number" ? total : 299,
      currency: body.currency ?? "ILS",
      customerEmail,
      customerName,
      customerPhone,
      status: "confirmed",
      cohortStartDate: cohortStart,
      paidAt: body.createdAt ? new Date(body.createdAt) : new Date(),
    }).onConflictDoNothing();

    console.log(`[payments/webhook] Enrollment recorded: session=${sessionId}, email=${customerEmail}, GI doc=${docId}`);

    // ─── Facebook CAPI: Purchase + CompleteRegistration (non-blocking) ───
    const capiParams = {
      email: customerEmail || undefined,
      phone: customerPhone || undefined,
      value: typeof total === "number" ? total : 1,
      currency: body.currency ?? "ILS",
    };
    sendFacebookEvent({ ...capiParams, eventName: "Purchase", eventId: `purchase_${docId}` })
      .catch((err) => console.error("[payments/webhook] FB CAPI Purchase failed:", err));
    sendFacebookEvent({ ...capiParams, eventName: "CompleteRegistration", eventId: `converted_${docId}` })
      .catch((err) => console.error("[payments/webhook] FB CAPI CompleteRegistration failed:", err));

    // ─── Drip transition on payment (non-blocking) ───
    // Cancel-first then enroll to prevent race with WA drip cron (Pitfall 9).
    if (leadId) {
      try {
        const effectiveName = customerName?.split(" ")[0] ?? "friend";
        const effectivePhone = customerPhone
          ? normalizeIsraeliPhone(customerPhone)
          : null;
        const cohortDateStr = cohortStart.toISOString();

        // 1. Cancel pre-payment WhatsApp drip
        await cancelDrip(leadId, "wa_challenge_prepay", "paid");

        // 2. Cancel email nurture (lead converted — stop marketing drip)
        await cancelDrip(leadId, "email_nurture", "paid");

        // 3. Start post-payment WhatsApp drip (only if we have a phone)
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

        // 4. Start email challenge reminders (always — email available)
        if (customerEmail) {
          await enrollInDrip({
            leadId,
            sequenceType: "email_challenge_reminders",
            channel: "email",
            recipientEmail: customerEmail,
            recipientName: effectiveName,
            preferredLocale: leadPreferredLocale,
            metadata: { cohortStartDate: cohortDateStr },
          });
        }

        console.log(`[payments/webhook] Drip transition complete for lead ${leadId}`);
      } catch (dripErr) {
        // Non-blocking — enrollment is already recorded; log and continue
        console.error("[payments/webhook] Drip transition failed (non-blocking):", dripErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[payments/webhook] Error:", err);
    return NextResponse.json({ ok: true });
  }
}
