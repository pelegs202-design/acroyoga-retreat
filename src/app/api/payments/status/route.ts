import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizLeads, challengeEnrollments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkPaymentByEmail } from "@/lib/green-invoice/client";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session");
  const since = req.nextUrl.searchParams.get("since"); // ISO timestamp — only find payments after this time

  if (!sessionId) {
    return NextResponse.json({ paid: false });
  }

  // First check if we already recorded enrollment (from webhook)
  const [enrollment] = await db
    .select({ id: challengeEnrollments.id })
    .from(challengeEnrollments)
    .where(eq(challengeEnrollments.sessionId, sessionId))
    .limit(1);

  if (enrollment) {
    return NextResponse.json({ paid: true, source: "webhook" });
  }

  // If no enrollment yet, check Morning API for recent payment by email
  const [lead] = await db
    .select({ email: quizLeads.email })
    .from(quizLeads)
    .where(eq(quizLeads.sessionId, sessionId))
    .limit(1);

  if (!lead) {
    return NextResponse.json({ paid: false });
  }

  try {
    const sinceDate = since ? new Date(since) : new Date();
    const paid = await checkPaymentByEmail(lead.email, sinceDate);
    return NextResponse.json({ paid, source: paid ? "morning-api" : null });
  } catch (err) {
    console.error("[payments/status] GI check failed:", err);
    return NextResponse.json({ paid: false });
  }
}
