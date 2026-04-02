import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizLeads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Morning payment form link — created in dashboard, fixed for 30-day challenge
const MORNING_PAYMENT_URL = process.env.MORNING_PAYMENT_URL || "https://mrng.to/c1Syv3Bh2l";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body as { sessionId?: string };

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

    // Return the Morning payment form URL
    // The webhook handles enrollment after payment confirmation
    return NextResponse.json({ ok: true, url: MORNING_PAYMENT_URL });
  } catch (err: unknown) {
    console.error("[payments/checkout] Error:", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
