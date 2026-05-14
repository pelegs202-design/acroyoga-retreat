import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { classBookings } from "@/lib/db/schema";
import { getAdminSession } from "@/lib/admin-guard";
import { sql, inArray, isNotNull } from "drizzle-orm";

/**
 * GET /api/admin/funnel/lp
 *
 * Per-LP-variant rollups for the A/B/C split test readout.
 *
 * Returns counts of: created bookings (any status), paid+completed,
 * refunded, attended class 1 (firstAttendedAt set). Revenue is the
 * sum of amount_paid over paid+completed.
 *
 * CPL / CPA require ad spend, which we don't store; the admin page
 * accepts a manual spend value per variant and computes the metric
 * client-side.
 */
export async function GET() {
  const { error } = await getAdminSession();
  if (error) return error;

  // Single aggregate over all bookings, grouped by lp_variant.
  // null lp_variant → "unknown" bucket (legacy / no-source bookings).
  const rows = await db
    .select({
      lpVariant: classBookings.lpVariant,
      created: sql<number>`count(*)::int`,
      paid: sql<number>`count(*) filter (where ${classBookings.status} in ('paid','completed','refunded'))::int`,
      completed: sql<number>`count(*) filter (where ${classBookings.status} = 'completed')::int`,
      refunded: sql<number>`count(*) filter (where ${classBookings.status} = 'refunded')::int`,
      attended: sql<number>`count(*) filter (where ${classBookings.firstAttendedAt} is not null)::int`,
      revenue: sql<number>`coalesce(sum(${classBookings.amountPaid}) filter (where ${classBookings.status} in ('paid','completed')), 0)::int`,
    })
    .from(classBookings)
    .groupBy(classBookings.lpVariant);

  // Direct vs quiz path split (per variant) — secondary readout
  const pathRows = await db
    .select({
      lpVariant: classBookings.lpVariant,
      lpPath: classBookings.lpPath,
      created: sql<number>`count(*)::int`,
      paid: sql<number>`count(*) filter (where ${classBookings.status} in ('paid','completed','refunded'))::int`,
    })
    .from(classBookings)
    .where(inArray(classBookings.status, ["pending", "paid", "completed", "refunded", "cancelled"]))
    .groupBy(classBookings.lpVariant, classBookings.lpPath);

  const variants: Record<string, {
    created: number;
    paid: number;
    completed: number;
    refunded: number;
    attended: number;
    revenue: number;
    purchaseRate: number;
    refundRate: number;
    attendanceRate: number;
  }> = {};

  for (const r of rows) {
    const key = r.lpVariant ?? "unknown";
    const created = Number(r.created) || 0;
    const paid = Number(r.paid) || 0;
    const refunded = Number(r.refunded) || 0;
    const attended = Number(r.attended) || 0;
    variants[key] = {
      created,
      paid,
      completed: Number(r.completed) || 0,
      refunded,
      attended,
      revenue: Number(r.revenue) || 0,
      purchaseRate: created > 0 ? Math.round((paid / created) * 100) : 0,
      refundRate: paid > 0 ? Math.round((refunded / paid) * 100) : 0,
      attendanceRate: paid > 0 ? Math.round((attended / paid) * 100) : 0,
    };
  }

  const byPath: Record<string, { direct: { created: number; paid: number }; quiz: { created: number; paid: number } }> = {};
  for (const r of pathRows) {
    const key = r.lpVariant ?? "unknown";
    if (!byPath[key]) byPath[key] = { direct: { created: 0, paid: 0 }, quiz: { created: 0, paid: 0 } };
    const path = r.lpPath === "quiz" ? "quiz" : "direct";
    byPath[key][path].created = Number(r.created) || 0;
    byPath[key][path].paid = Number(r.paid) || 0;
  }

  // Surface attendance-not-marked count separately — operational signal
  const [attendanceDebt] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(classBookings)
    .where(sql`${classBookings.status} = 'paid' and ${classBookings.firstAttendedAt} is null and ${classBookings.paidAt} < now() - interval '24 hours'`);

  // Refund-eligible right now (paid + attended + within 48h)
  const [refundEligible] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(classBookings)
    .where(sql`${classBookings.status} = 'paid' and ${classBookings.firstAttendedAt} is not null and ${classBookings.firstAttendedAt} > now() - interval '48 hours'`);

  // Make sure shape/flex/reset always appear even if no bookings yet
  for (const v of ["shape", "flex", "reset"]) {
    if (!variants[v]) {
      variants[v] = {
        created: 0, paid: 0, completed: 0, refunded: 0, attended: 0, revenue: 0,
        purchaseRate: 0, refundRate: 0, attendanceRate: 0,
      };
    }
    if (!byPath[v]) byPath[v] = { direct: { created: 0, paid: 0 }, quiz: { created: 0, paid: 0 } };
  }

  return NextResponse.json({
    variants,
    byPath,
    ops: {
      attendanceDebt: Number(attendanceDebt?.count ?? 0),
      refundEligibleNow: Number(refundEligible?.count ?? 0),
    },
  });
}
