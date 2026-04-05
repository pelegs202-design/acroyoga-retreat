import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { challengeEnrollments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkNewPaymentSince } from "@/lib/green-invoice/client";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session");
  const since = req.nextUrl.searchParams.get("since");

  if (!sessionId) {
    return NextResponse.json({ paid: false });
  }

  // First check enrollment table (from webhook)
  const [enrollment] = await db
    .select({ id: challengeEnrollments.id })
    .from(challengeEnrollments)
    .where(eq(challengeEnrollments.sessionId, sessionId))
    .limit(1);

  if (enrollment) {
    return NextResponse.json({ paid: true, source: "webhook" });
  }

  // Also check if there's a recent "unknown" enrollment we can link
  const [unknownEnrollment] = await db
    .select({ id: challengeEnrollments.id })
    .from(challengeEnrollments)
    .where(eq(challengeEnrollments.sessionId, "unknown"))
    .limit(1);

  if (unknownEnrollment) {
    // Link this enrollment to the current session
    await db
      .update(challengeEnrollments)
      .set({ sessionId })
      .where(eq(challengeEnrollments.id, unknownEnrollment.id));
    return NextResponse.json({ paid: true, source: "webhook-linked" });
  }

  // Check Morning API — was ANY new document created since checkout opened?
  if (!since) {
    return NextResponse.json({ paid: false });
  }

  try {
    const sinceDate = new Date(since);
    const paid = await checkNewPaymentSince(sinceDate);
    return NextResponse.json({ paid, source: paid ? "morning-api" : null });
  } catch (err) {
    console.error("[payments/status] GI check failed:", err);
    return NextResponse.json({ paid: false });
  }
}
