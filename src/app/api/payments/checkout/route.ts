import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizLeads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createCheckoutUrl } from "@/lib/green-invoice/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, locale } = body as { sessionId?: string; locale?: string };

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // Validate session exists in quiz_leads
    const [lead] = await db
      .select()
      .from(quizLeads)
      .where(eq(quizLeads.sessionId, sessionId))
      .limit(1);

    if (!lead) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Create GI checkout URL
    const url = await createCheckoutUrl({
      sessionId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      locale: locale || "he",
    });

    return NextResponse.json({ ok: true, url });
  } catch (err: unknown) {
    console.error("[payments/checkout] Error:", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
