import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user, jamSessions, jamAttendees } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/admin-guard';
import { writeAuditLog } from '@/lib/admin-audit';
import { queuePushNotification } from '@/lib/notifications';
import { eq, and, gt } from 'drizzle-orm';
import { z } from 'zod';

const patchSchema = z.object({
  action: z.enum(['approve', 'suspend', 'grant-host', 'revoke-host']),
});

// PATCH /api/admin/members/[id] — Approve, suspend, grant-host, or revoke-host
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

  const { action } = parsed.data;
  const adminEmail = session!.user.email;

  // Verify target user exists
  const [targetUser] = await db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user)
    .where(eq(user.id, id))
    .limit(1);

  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (action === 'approve') {
    await db.update(user).set({ status: 'active' }).where(eq(user.id, id));
    await writeAuditLog(adminEmail, 'approve_member', 'user', id);
    return NextResponse.json({ success: true });
  }

  if (action === 'suspend') {
    await db.update(user).set({ status: 'suspended' }).where(eq(user.id, id));
    await writeAuditLog(adminEmail, 'suspend_member', 'user', id);
    return NextResponse.json({ success: true });
  }

  if (action === 'grant-host') {
    await db.update(user).set({ isJamHost: true }).where(eq(user.id, id));
    await writeAuditLog(adminEmail, 'grant_host', 'user', id);
    return NextResponse.json({ success: true });
  }

  if (action === 'revoke-host') {
    // 1. Remove host status
    await db.update(user).set({ isJamHost: false }).where(eq(user.id, id));

    // 2. Find all future jams hosted by this user
    const now = new Date();
    const futureJams = await db
      .select({ id: jamSessions.id, location: jamSessions.location })
      .from(jamSessions)
      .where(and(eq(jamSessions.hostId, id), gt(jamSessions.scheduledAt, now)));

    let cancelledJamsCount = 0;
    let notifiedAttendeesCount = 0;

    for (const jam of futureJams) {
      // 3. Find all confirmed attendees
      const confirmedAttendees = await db
        .select({ userId: jamAttendees.userId })
        .from(jamAttendees)
        .where(and(eq(jamAttendees.jamId, jam.id), eq(jamAttendees.status, 'confirmed')));

      // 4. Cancel all attendees
      await db
        .update(jamAttendees)
        .set({ status: 'cancelled' })
        .where(eq(jamAttendees.jamId, jam.id));

      // 5. Notify each confirmed attendee
      for (const attendee of confirmedAttendees) {
        await queuePushNotification(
          attendee.userId,
          'jam_rsvp',
          'Jam cancelled',
          `The jam at ${jam.location} was cancelled`,
          '/jams',
        );
        notifiedAttendeesCount++;
      }

      cancelledJamsCount++;
    }

    await writeAuditLog(adminEmail, 'revoke_host', 'user', id, {
      cancelledJams: cancelledJamsCount,
      notifiedAttendees: notifiedAttendeesCount,
    });

    return NextResponse.json({ success: true, cancelledJams: cancelledJamsCount, notifiedAttendees: notifiedAttendeesCount });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

// DELETE /api/admin/members/[id] — Delete a user account
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, error } = await getAdminSession();
  if (error) return error;

  const { id } = await params;
  const adminEmail = session!.user.email;

  // Get user info before deletion for audit record
  const [targetUser] = await db
    .select({ name: user.name, email: user.email })
    .from(user)
    .where(eq(user.id, id))
    .limit(1);

  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Write audit log before deletion (so we preserve the user email/name)
  await writeAuditLog(adminEmail, 'delete_member', 'user', id, {
    deletedUserName: targetUser.name,
    deletedUserEmail: targetUser.email,
  });

  // Delete the user — cascades to sessions, accounts, jams, etc. via ON DELETE CASCADE
  await db.delete(user).where(eq(user.id, id));

  return NextResponse.json({ success: true });
}
