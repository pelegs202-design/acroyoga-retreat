import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { classBookings } from "@/lib/db/schema";
import { getAdminSession } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/admin-audit";
import { eq } from "drizzle-orm";

const REFUND_WINDOW_HOURS = 48;

/**
 * POST /api/admin/refunds/issue
 *
 * Body: { bookingId, force? }
 *
 * Marks a booking as refunded after policy checks:
 *   - status must be 'paid' or 'completed'
 *   - first_attended_at must be set (no-show abuse protection)
 *   - now() <= first_attended_at + 48 hours
 *   - not already refunded
 *
 * Pass force=true to override (logged in audit metadata).
 *
 * Does NOT issue the actual money refund — that's manual in the GI
 * dashboard. This endpoint records the policy decision and updates the
 * booking row so attendance + funnel reports stay correct.
 */
export async function POST(req: NextRequest) {
  const { session, error } = await getAdminSession();
  if (error || !session) return error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { bookingId?: string; force?: boolean };
  const bookingId = body.bookingId?.trim();
  const force = body.force === true;
  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(classBookings)
    .where(eq(classBookings.id, bookingId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (existing.status === "refunded") {
    return NextResponse.json({ error: "Already refunded" }, { status: 409 });
  }
  if (existing.status !== "paid" && existing.status !== "completed") {
    return NextResponse.json(
      { error: `Cannot refund booking with status '${existing.status}'` },
      { status: 409 },
    );
  }

  // Policy checks (skippable via force=true)
  const policyViolations: string[] = [];
  if (!existing.firstAttendedAt) {
    policyViolations.push("first_attended_at not set — class 1 must be attended first");
  } else {
    const windowEnd = existing.firstAttendedAt.getTime() + REFUND_WINDOW_HOURS * 60 * 60 * 1000;
    if (Date.now() > windowEnd) {
      policyViolations.push(`outside ${REFUND_WINDOW_HOURS}-hour window since class 1`);
    }
  }
  if (policyViolations.length > 0 && !force) {
    return NextResponse.json(
      { error: "Policy violation", violations: policyViolations },
      { status: 400 },
    );
  }

  const now = new Date();
  await db
    .update(classBookings)
    .set({ status: "refunded", refundedAt: now })
    .where(eq(classBookings.id, bookingId));

  await writeAuditLog(
    session.user.email,
    "issue_refund",
    "class_booking",
    bookingId,
    {
      refundedAt: now.toISOString(),
      forced: force && policyViolations.length > 0,
      policyViolations: policyViolations.length > 0 ? policyViolations : undefined,
      amountPaid: existing.amountPaid,
      giDocumentId: existing.giDocumentId,
    },
  );

  return NextResponse.json({
    ok: true,
    bookingId,
    refundedAt: now.toISOString(),
    note: "Booking marked refunded. Issue the actual money refund manually in the Green Invoice dashboard.",
  });
}
