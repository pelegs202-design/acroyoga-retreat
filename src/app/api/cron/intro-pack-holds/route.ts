import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { classBookings } from "@/lib/db/schema";
import { and, eq, lt, isNotNull } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * GET /api/cron/intro-pack-holds
 *
 * Cancels expired soft-holds. Runs every 5 minutes via vercel.json.
 *
 * Sets status='cancelled' on any classBookings row where:
 *   status = 'pending' AND expires_at < now()
 *
 * Soft-holds are inserted by /api/payments/intro-pack/create with a
 * 10-minute expiry. If the user abandons checkout, this cron releases
 * the slot capacity so other users can book it.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();

  const cancelled = await db
    .update(classBookings)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(classBookings.status, "pending"),
        isNotNull(classBookings.expiresAt),
        lt(classBookings.expiresAt, now),
      ),
    )
    .returning({ id: classBookings.id });

  return NextResponse.json({ ok: true, cancelled: cancelled.length });
}
