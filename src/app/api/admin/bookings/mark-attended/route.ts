import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { classBookings } from "@/lib/db/schema";
import { getAdminSession } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/admin-audit";
import { eq, sql } from "drizzle-orm";

/**
 * POST /api/admin/bookings/mark-attended
 *
 * Body: { bookingId, attendedAt? }
 *
 * Sets first_attended_at if not already set (anchor for the 48-h guarantee
 * window), increments classes_used. If classes_used reaches 3, status flips
 * to 'completed'.
 */
export async function POST(req: NextRequest) {
  const { session, error } = await getAdminSession();
  if (error || !session) return error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { bookingId?: string; attendedAt?: string };
  const bookingId = body.bookingId?.trim();
  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
  }
  const attendedAt = body.attendedAt ? new Date(body.attendedAt) : new Date();

  const [existing] = await db
    .select()
    .from(classBookings)
    .where(eq(classBookings.id, bookingId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (existing.status !== "paid" && existing.status !== "completed") {
    return NextResponse.json(
      { error: `Cannot mark attended on booking with status '${existing.status}'` },
      { status: 409 },
    );
  }

  const newClassesUsed = (existing.classesUsed ?? 0) + 1;
  const setFirstAttendedAt = existing.firstAttendedAt === null;

  const updateValues: Record<string, unknown> = {
    classesUsed: newClassesUsed,
  };
  if (setFirstAttendedAt) updateValues.firstAttendedAt = attendedAt;
  if (newClassesUsed >= 3) updateValues.status = "completed";

  await db
    .update(classBookings)
    .set(updateValues)
    .where(eq(classBookings.id, bookingId));

  await writeAuditLog(
    session.user.email,
    "mark_attended",
    "class_booking",
    bookingId,
    {
      attendedAt: attendedAt.toISOString(),
      classesUsed: newClassesUsed,
      setFirstAttendedAt,
    },
  );

  return NextResponse.json({
    ok: true,
    bookingId,
    classesUsed: newClassesUsed,
    firstAttendedAtSet: setFirstAttendedAt,
    completed: newClassesUsed >= 3,
  });
}
