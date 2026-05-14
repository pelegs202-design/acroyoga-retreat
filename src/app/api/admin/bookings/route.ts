import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { classBookings, classSlots, quizLeads } from "@/lib/db/schema";
import { getAdminSession } from "@/lib/admin-guard";
import { and, eq, gte, lte, desc, isNotNull, sql } from "drizzle-orm";

/**
 * GET /api/admin/bookings
 *
 * Query params (all optional):
 *   slotId, status, dateFrom (ISO), dateTo (ISO), refundEligible=true
 *
 * Returns bookings joined with slot label + lead name/phone.
 */
export async function GET(req: NextRequest) {
  const { error } = await getAdminSession();
  if (error) return error;

  const sp = req.nextUrl.searchParams;
  const slotId = sp.get("slotId");
  const status = sp.get("status");
  const dateFrom = sp.get("dateFrom");
  const dateTo = sp.get("dateTo");
  const refundEligible = sp.get("refundEligible") === "true";

  const conditions = [];
  if (slotId) conditions.push(eq(classBookings.slotId, slotId));
  if (status) conditions.push(eq(classBookings.status, status));
  if (dateFrom) conditions.push(gte(classSlots.date, new Date(dateFrom)));
  if (dateTo) conditions.push(lte(classSlots.date, new Date(dateTo)));
  if (refundEligible) {
    // attended within last 48h, status='paid'
    conditions.push(eq(classBookings.status, "paid"));
    conditions.push(isNotNull(classBookings.firstAttendedAt));
    conditions.push(gte(classBookings.firstAttendedAt, sql`now() - interval '48 hours'`));
  }

  const rows = await db
    .select({
      id: classBookings.id,
      slotId: classBookings.slotId,
      slotDate: classSlots.date,
      slotLabelHe: classSlots.labelHe,
      slotLabelEn: classSlots.labelEn,
      slotLocation: classSlots.location,
      leadId: classBookings.leadId,
      leadName: quizLeads.name,
      leadPhone: quizLeads.phone,
      leadEmail: quizLeads.email,
      status: classBookings.status,
      classesUsed: classBookings.classesUsed,
      firstAttendedAt: classBookings.firstAttendedAt,
      lpVariant: classBookings.lpVariant,
      lpPath: classBookings.lpPath,
      amountPaid: classBookings.amountPaid,
      paidAt: classBookings.paidAt,
      refundedAt: classBookings.refundedAt,
      createdAt: classBookings.createdAt,
    })
    .from(classBookings)
    .innerJoin(classSlots, eq(classBookings.slotId, classSlots.id))
    .innerJoin(quizLeads, eq(classBookings.leadId, quizLeads.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(classBookings.createdAt))
    .limit(500);

  return NextResponse.json({ bookings: rows });
}
