import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workshopBookings } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/admin-guard';
import { writeAuditLog } from '@/lib/admin-audit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const patchSchema = z.object({
  contactStatus: z.enum(['new', 'contacted', 'confirmed', 'cancelled']),
  adminNotes: z.string().optional(),
});

// PATCH /api/admin/workshop-bookings/[id] — Upsert contact status for a workshop lead
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, error } = await getAdminSession();
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { contactStatus, adminNotes } = parsed.data;
  const adminEmail = session!.user.email;

  // Upsert: insert or update the booking row for this lead
  await db
    .insert(workshopBookings)
    .values({
      id: crypto.randomUUID(),
      leadId: id,
      contactStatus,
      adminNotes: adminNotes ?? null,
    })
    .onConflictDoUpdate({
      target: workshopBookings.leadId,
      set: {
        contactStatus,
        adminNotes: adminNotes ?? null,
        updatedAt: new Date(),
      },
    });

  await writeAuditLog(adminEmail, 'update_workshop_status', 'workshop_booking', id, {
    contactStatus,
  });

  return NextResponse.json({ success: true });
}
