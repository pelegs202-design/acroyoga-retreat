import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { classSlots, classBookings } from "@/lib/db/schema";
import { and, eq, gt, sql, inArray } from "drizzle-orm";

/**
 * GET /api/lp/slots
 *
 * Returns the next ~14 active future slots with live capacity remaining.
 * Used by <SlotCapacityWidget> on the LPs and on /lp/checkout.
 *
 * Capacity = slot.capacity − count(bookings WHERE status IN ('pending','paid'))
 */
export async function GET() {
  const now = new Date();

  // 1. Fetch upcoming active slots
  const slots = await db
    .select()
    .from(classSlots)
    .where(and(eq(classSlots.active, true), gt(classSlots.date, now)))
    .orderBy(classSlots.date)
    .limit(14);

  if (slots.length === 0) {
    return NextResponse.json({ slots: [] });
  }

  // 2. Count holding/paid bookings per slot
  const slotIds = slots.map((s) => s.id);
  const usage = await db
    .select({
      slotId: classBookings.slotId,
      taken: sql<number>`count(*)::int`,
    })
    .from(classBookings)
    .where(
      and(
        inArray(classBookings.slotId, slotIds),
        inArray(classBookings.status, ["pending", "paid"]),
      ),
    )
    .groupBy(classBookings.slotId);

  const takenBySlot = new Map(usage.map((u) => [u.slotId, Number(u.taken) || 0]));

  const enriched = slots.map((s) => {
    const taken = takenBySlot.get(s.id) ?? 0;
    const remaining = Math.max(0, s.capacity - taken);
    return {
      id: s.id,
      date: s.date.toISOString(),
      capacity: s.capacity,
      remaining,
      labelHe: s.labelHe,
      labelEn: s.labelEn,
      location: s.location,
    };
  });

  return NextResponse.json({ slots: enriched });
}
