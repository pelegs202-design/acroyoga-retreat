import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizLeads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendFacebookEvent } from "@/lib/facebook-capi";

const VALID_DAYS = ["mon", "wed", "fri", "sat"];

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { sessionId?: string; day?: string };

  if (!body.sessionId || !body.day || !VALID_DAYS.includes(body.day)) {
    return NextResponse.json({ error: "Invalid sessionId or day" }, { status: 400 });
  }

  try {
    // Update the quiz lead with their chosen class day
    const updated = await db
      .update(quizLeads)
      .set({ firstClassDay: body.day })
      .where(eq(quizLeads.sessionId, body.sessionId))
      .returning({ id: quizLeads.id, email: quizLeads.email, phone: quizLeads.phone });

    if (updated.length === 0) {
      return NextResponse.json({ error: "No lead found" }, { status: 404 });
    }

    // Fire CompleteRegistration CAPI event (the signal Facebook optimizes for)
    const lead = updated[0];
    sendFacebookEvent({
      eventName: "CompleteRegistration",
      email: lead.email,
      phone: lead.phone,
      eventId: `reg_${body.sessionId}`,
    }).catch((err) => {
      console.error("[first-class] CAPI CompleteRegistration failed:", err);
    });

    return NextResponse.json({ ok: true, day: body.day });
  } catch (err) {
    console.error("[first-class] Failed to save:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
