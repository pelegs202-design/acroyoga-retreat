import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizLeads, classSlots, classBookings } from "@/lib/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import {
  checkPaymentByRemarks,
  INTRO_PACK_PRICE_ILS,
} from "@/lib/green-invoice/client";
import { sendFacebookEvent } from "@/lib/facebook-capi";

const SOFT_HOLD_MINUTES = 10;

/**
 * GET /api/payments/intro-pack/status?session=<paymentSessionId>
 *
 * Polled by the /lp/checkout/success page every ~3s until paid or timeout.
 *
 * Behaviour:
 *  - If booking is already 'paid' → { paid: true }
 *  - If booking expired but slot still has room → silently renew hold
 *  - If booking expired and slot full → { paid: false, expired: true }
 *  - Else → ask GI if a doc with matching remarks exists. If yes:
 *      flip to 'paid', fire CAPI Purchase, update lead email.
 */
export async function GET(req: NextRequest) {
  try {
    const paymentSessionId = req.nextUrl.searchParams.get("session");
    if (!paymentSessionId) {
      return NextResponse.json({ paid: false, error: "missing session" }, { status: 400 });
    }

    const [booking] = await db
      .select()
      .from(classBookings)
      .where(eq(classBookings.paymentSessionId, paymentSessionId))
      .limit(1);

    if (!booking) {
      return NextResponse.json({ paid: false, error: "not found" }, { status: 404 });
    }

    // Already paid — short-circuit
    if (booking.status === "paid") {
      return NextResponse.json({ paid: true, source: "db" });
    }
    if (booking.status === "refunded" || booking.status === "cancelled") {
      return NextResponse.json({ paid: false, status: booking.status });
    }

    // ─── Hold renewal: if hold expired but slot still has room, extend it ───
    const now = new Date();
    const expired = booking.expiresAt !== null && booking.expiresAt.getTime() < now.getTime();
    if (expired) {
      const [usageRow] = await db
        .select({ taken: sql<number>`count(*)::int` })
        .from(classBookings)
        .where(
          and(
            eq(classBookings.slotId, booking.slotId),
            inArray(classBookings.status, ["pending", "paid"]),
            sql`${classBookings.id} != ${booking.id}`,
          ),
        );
      const taken = Number(usageRow?.taken ?? 0);
      const [slot] = await db
        .select({ capacity: classSlots.capacity })
        .from(classSlots)
        .where(eq(classSlots.id, booking.slotId))
        .limit(1);
      if (slot && taken < slot.capacity) {
        const renewedExpiresAt = new Date(now.getTime() + SOFT_HOLD_MINUTES * 60 * 1000);
        await db
          .update(classBookings)
          .set({ expiresAt: renewedExpiresAt })
          .where(eq(classBookings.id, booking.id));
      } else {
        return NextResponse.json({ paid: false, expired: true });
      }
    }

    // ─── Poll GI for a matching paid document ───
    const sinceFloor = new Date(booking.createdAt.getTime() - 60 * 1000); // small backdating buffer
    const result = await checkPaymentByRemarks(
      `introPackSession:${paymentSessionId}`,
      sinceFloor,
      INTRO_PACK_PRICE_ILS,
    );

    if (!result.paid) {
      return NextResponse.json({ paid: false });
    }

    const { doc } = result;

    // ─── Flip booking to paid + update lead email + fire CAPI ───
    await db
      .update(classBookings)
      .set({
        status: "paid",
        giDocumentId: doc.id,
        amountPaid: doc.amount,
        paidAt: doc.createdAt,
        expiresAt: null,
      })
      .where(eq(classBookings.id, booking.id));

    if (doc.email) {
      // Replace placeholder email with real one from GI, but only if the
      // lead still has the placeholder — never overwrite a real email
      // (e.g. quiz-path leads who entered their email earlier).
      await db
        .update(quizLeads)
        .set({ email: doc.email })
        .where(
          and(
            eq(quizLeads.id, booking.leadId),
            sql`${quizLeads.email} LIKE '%@unknown.acrohavura'`,
          ),
        );
    }

    // Fire CAPI Purchase (non-blocking)
    sendFacebookEvent({
      eventName: "Purchase",
      email: doc.email ?? undefined,
      value: doc.amount,
      currency: doc.currency,
      eventId: `intropack_purchase_${doc.id}`,
      contentCategory: "intro_pack",
      lpVariant: booking.lpVariant ?? undefined,
      lpPath: booking.lpPath ?? undefined,
    }).catch((err) => {
      console.error("[intro-pack/status] CAPI Purchase failed:", err);
    });

    return NextResponse.json({ paid: true, source: "gi-polling" });
  } catch (err: unknown) {
    console.error("[intro-pack/status] Error:", err);
    return NextResponse.json({ paid: false, error: "internal" }, { status: 500 });
  }
}
