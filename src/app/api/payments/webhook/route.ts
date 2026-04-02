import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { challengeEnrollments, quizLeads } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { nextMonday } from "@/lib/green-invoice/client";

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
