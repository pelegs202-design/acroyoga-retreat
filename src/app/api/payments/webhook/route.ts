import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { challengeEnrollments } from "@/lib/db/schema";
import { nextMonday } from "@/lib/green-invoice/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic validation — GI sends the full document object
    // Validate document type is 320 (חשבונית מס קבלה) and amount is 299
    if (!body || typeof body !== "object") {
      console.error("[payments/webhook] Invalid body");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const docType = body.type;
    const total = body.total ?? body.amount;
    const docId = body.id;

    if (docType !== 320) {
      console.warn(`[payments/webhook] Unexpected document type: ${docType}`);
      return NextResponse.json({ ok: true }); // Acknowledge but ignore non-invoice webhooks
    }

    if (typeof total === "number" && total !== 299) {
      console.warn(`[payments/webhook] Unexpected total: ${total}`);
      // Still process — amount mismatch could be a discount scenario. Log for review.
    }

    // Extract sessionId from remarks field (format: "sessionId:abc123")
    let sessionId: string | null = null;
    if (typeof body.remarks === "string") {
      const match = body.remarks.match(/sessionId:([^\s,]+)/);
      if (match) sessionId = match[1];
    }

    if (!sessionId) {
      console.error("[payments/webhook] Could not extract sessionId from remarks:", body.remarks);
      // Still write enrollment with null sessionId — better to record payment than lose it
    }

    // Extract client info
    const customerEmail = body.client?.emails?.[0] ?? null;
    const customerName = body.client?.name ?? null;
    const customerPhone = body.client?.phone ?? null;
    const giDocumentNumber = body.number?.toString() ?? null;

    // Calculate cohort start date (next Monday from now)
    const cohortStart = nextMonday(new Date());

    // Write enrollment — use giDocumentId unique constraint to prevent duplicates
    await db.insert(challengeEnrollments).values({
      id: crypto.randomUUID(),
      sessionId: sessionId ?? "unknown",
      giDocumentId: String(docId),
      giDocumentNumber: giDocumentNumber,
      amountPaid: typeof total === "number" ? total : 299,
      currency: body.currency ?? "ILS",
      customerEmail,
      customerName,
      customerPhone,
      status: "confirmed",
      cohortStartDate: cohortStart,
      paidAt: body.createdAt ? new Date(body.createdAt) : new Date(),
    }).onConflictDoNothing(); // Idempotent — GI may retry webhooks

    console.log(`[payments/webhook] Enrollment recorded for session ${sessionId}, GI doc ${docId}`);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[payments/webhook] Error:", err);
    // Return 200 even on error to prevent GI from retrying indefinitely
    // The error is logged for manual investigation
    return NextResponse.json({ ok: true });
  }
}
