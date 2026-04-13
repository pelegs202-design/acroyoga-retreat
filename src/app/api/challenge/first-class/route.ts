import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizLeads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendFacebookEvent } from "@/lib/facebook-capi";
import { notifyTrialBooked } from "@/lib/gmail-notify";

const VALID_DAYS = ["mon-early", "mon-late", "wed-early", "wed-late", "fri", "sat"];

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { sessionId?: string; day?: string };

  if (!body.sessionId || !body.day || !VALID_DAYS.includes(body.day)) {
    return NextResponse.json({ error: "Invalid sessionId or day" }, { status: 400 });
  }

  try {
    // Update the quiz lead with their chosen class day
    const updated = await db
      .update(quizLeads)
      .set({ firstClassDay: body.day, leadStatus: "booked" })
      .where(eq(quizLeads.sessionId, body.sessionId))
      .returning({ id: quizLeads.id, name: quizLeads.name, email: quizLeads.email, phone: quizLeads.phone });

    if (updated.length === 0) {
      return NextResponse.json({ error: "No lead found" }, { status: 404 });
    }

    const lead = updated[0];

    // Fire CompleteRegistration CAPI event (the signal Facebook optimizes for)
    sendFacebookEvent({
      eventName: "CompleteRegistration",
      email: lead.email,
      phone: lead.phone,
      eventId: `reg_${body.sessionId}`,
    }).catch((err) => {
      console.error("[first-class] CAPI CompleteRegistration failed:", err);
    });

    // Email Shai with lead details + pre-written WhatsApp messages
    notifyTrialBooked({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      day: body.day!,
      sessionId: body.sessionId!,
    }).catch((err) => {
      console.error("[first-class] Trial booked notification failed:", err);
    });

    return NextResponse.json({ ok: true, day: body.day });
  } catch (err) {
    console.error("[first-class] Failed to save:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
