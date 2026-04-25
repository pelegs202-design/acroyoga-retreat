import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { challengeEnrollments } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { checkNewPaymentSince } from "@/lib/green-invoice/client";
import { sendFacebookEvent } from "@/lib/facebook-capi";

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

  // Check if there's a recent "unknown" enrollment created AFTER checkout opened
  // Only link enrollments from the last 10 minutes to avoid matching old ones
  if (since) {
    const sinceDate = new Date(since);
    const [recentUnknown] = await db
      .select({ id: challengeEnrollments.id })
      .from(challengeEnrollments)
      .where(and(
        eq(challengeEnrollments.sessionId, "unknown"),
        gt(challengeEnrollments.paidAt, sinceDate),
      ))
      .limit(1);

    if (recentUnknown) {
      await db
        .update(challengeEnrollments)
        .set({ sessionId })
        .where(eq(challengeEnrollments.id, recentUnknown.id));
      return NextResponse.json({ paid: true, source: "webhook-linked" });
    }
  }

  // Check Morning API — was a new document created since checkout opened?
  if (!since) {
    return NextResponse.json({ paid: false });
  }

  try {
    const sinceDate = new Date(since);
    const result = await checkNewPaymentSince(sinceDate);
    if (result.paid) {
      const { doc } = result;
      // Record this as an enrollment so we don't match it again for another session
      try {
        await db.insert(challengeEnrollments).values({
          id: crypto.randomUUID(),
          sessionId,
          giDocumentId: doc.id,
          amountPaid: doc.amount,
          currency: doc.currency,
          customerEmail: doc.email,
          status: "confirmed",
          cohortStartDate: new Date(),
          paidAt: doc.createdAt,
        }).onConflictDoNothing();
      } catch { /* ignore duplicate */ }

      // Fire Facebook CAPI Purchase. event_id matches the webhook's pattern
      // (`purchase_${docId}`) so Meta dedups if the webhook also fires later.
      // Non-blocking — polling response should not stall on Graph API.
      sendFacebookEvent({
        eventName: "Purchase",
        eventId: `purchase_${doc.id}`,
        email: doc.email ?? undefined,
        value: doc.amount,
        currency: doc.currency,
      }).catch((err) =>
        console.error("[payments/status] FB CAPI Purchase failed:", err),
      );
    }
    return NextResponse.json({ paid: result.paid, source: result.paid ? "morning-api" : null });
  } catch (err) {
    console.error("[payments/status] GI check failed:", err);
    return NextResponse.json({ paid: false });
  }
}
