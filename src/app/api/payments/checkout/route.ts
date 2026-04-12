import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizLeads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendFacebookEvent } from "@/lib/facebook-capi";

// Morning payment form link — created in dashboard, fixed for 30-day challenge
const MORNING_PAYMENT_URL = process.env.MORNING_PAYMENT_URL || "https://morning-sale.page/acroyoga";

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

    // Send InitiateCheckout via CAPI (non-blocking)
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      undefined;
    const clientUserAgent = req.headers.get("user-agent") || undefined;

    sendFacebookEvent({
      eventName: "InitiateCheckout",
      email: lead.email,
      phone: lead.phone,
      value: 99,
      currency: "ILS",
      eventId: `checkout_${sessionId}`,
      sourceUrl: `https://acroyoga-academy.vercel.app/he/quiz/challenge/checkout?session=${sessionId}`,
      clientIp,
      clientUserAgent,
    }).catch((err) => {
      console.error("[payments/checkout] CAPI InitiateCheckout error:", err);
    });

    // Return the Morning payment form URL
    // The webhook handles enrollment after payment confirmation
    return NextResponse.json({ ok: true, url: MORNING_PAYMENT_URL });
  } catch (err: unknown) {
    console.error("[payments/checkout] Error:", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
