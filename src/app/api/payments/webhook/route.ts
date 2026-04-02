import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { challengeEnrollments, quizLeads } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { nextMonday } from "@/lib/green-invoice/client";

export async function POST(req: NextRequest) {
  try {
    // Validate webhook secret from Green Invoice dashboard
    const secret = req.headers.get("x-webhook-secret") ?? req.nextUrl.searchParams.get("secret");
    const expectedSecret = process.env.GI_WEBHOOK_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      console.error("[payments/webhook] Invalid webhook secret");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

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
    }

    // Extract client info from webhook payload
    const customerEmail = body.client?.emails?.[0] ?? null;
    const customerName = body.client?.name ?? null;
    const customerPhone = body.client?.phone ?? null;
    const giDocumentNumber = body.number?.toString() ?? null;

    // Match payment to quiz lead by email — find the most recent lead with this email
    let sessionId = "unknown";
    if (customerEmail) {
      const [lead] = await db
        .select({ sessionId: quizLeads.sessionId })
        .from(quizLeads)
        .where(eq(quizLeads.email, customerEmail))
        .orderBy(desc(quizLeads.createdAt))
        .limit(1);

      if (lead) {
        sessionId = lead.sessionId;
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

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[payments/webhook] Error:", err);
    return NextResponse.json({ ok: true });
  }
}
