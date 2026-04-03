import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { jamSessions, jamAttendees, user } from '@/lib/db/schema';
import { eq, and, inArray, asc, count } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { Resend } from 'resend';
import { queuePushNotification } from '@/lib/notifications';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? 'AcroHavura <noreply@acro.academy>';

const CANCEL_LOCK_MS = 4 * 60 * 60 * 1000; // 4 hours in ms

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: jamId } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { action } = body;
  if (action !== 'join' && action !== 'cancel') {
    return NextResponse.json({ error: 'action must be "join" or "cancel"' }, { status: 400 });
  }

  // Verify jam exists
  const [jam] = await db
    .select({
      id: jamSessions.id,
      scheduledAt: jamSessions.scheduledAt,
      capacity: jamSessions.capacity,
      hostId: jamSessions.hostId,
      location: jamSessions.location,
    })
    .from(jamSessions)
    .where(eq(jamSessions.id, jamId))
    .limit(1);

  if (!jam) {
    return NextResponse.json({ error: 'Jam not found' }, { status: 404 });
  }

  // ─── JOIN ────────────────────────────────────────────────────────────────────

  if (action === 'join') {
    // Check for existing active RSVP
    const [existing] = await db
      .select({ id: jamAttendees.id, status: jamAttendees.status })
      .from(jamAttendees)
      .where(
        and(
          eq(jamAttendees.jamId, jamId),
          eq(jamAttendees.userId, session.user.id),
          inArray(jamAttendees.status, ['confirmed', 'waitlist']),
        ),
      )
      .limit(1);

    if (existing) {
      return NextResponse.json({ error: 'Already RSVPed' }, { status: 409 });
    }

    // Race-safe capacity check: count confirmed, decide status, insert
    // The unique constraint on (jamId, userId) is the final safety net.
    const [{ confirmedCount }] = await db
      .select({ confirmedCount: count(jamAttendees.id) })
      .from(jamAttendees)
      .where(
        and(eq(jamAttendees.jamId, jamId), eq(jamAttendees.status, 'confirmed')),
      );

    const status: 'confirmed' | 'waitlist' =
      confirmedCount < jam.capacity ? 'confirmed' : 'waitlist';

    try {
      await db.insert(jamAttendees).values({
        id: randomUUID(),
        jamId,
        userId: session.user.id,
        status,
        joinedAt: new Date(),
      });
    } catch (err: unknown) {
      // PostgreSQL unique violation code '23505'
      const pgErr = err as { code?: string };
      if (pgErr?.code === '23505') {
        return NextResponse.json({ error: 'Already RSVPed' }, { status: 409 });
      }
      throw err;
    }

    // Queue push for jam host (non-blocking)
    try {
      const joiningUserId = session.user.id;
      // Fetch joining user's name and preferred locale
      const [joiningUser] = await db
        .select({ name: user.name, preferredLocale: user.preferredLocale })
        .from(user)
        .where(eq(user.id, joiningUserId))
        .limit(1);

      const joinerName = joiningUser?.name ?? 'Someone';
      const jamDateStr = formatDate(jam.scheduledAt);
      const locale = joiningUser?.preferredLocale ?? 'he';

      const hostTitle =
        locale === 'he'
          ? `${joinerName} הצטרף לג'ם שלך`
          : `${joinerName} joined your jam`;
      const hostBody =
        locale === 'he'
          ? `RSVP חדש ל-${jamDateStr} ב-${jam.location}`
          : `New RSVP for ${jamDateStr} at ${jam.location}`;

      // Only notify host if they're not the one joining
      if (jam.hostId !== joiningUserId) {
        await queuePushNotification(
          jam.hostId,
          'jam_rsvp',
          hostTitle,
          hostBody,
          `/jams/${jamId}`,
          `jam_${jamId}`,
        );
      }
    } catch (err) {
      console.error('[rsvp] Failed to queue push for host:', err);
      // Non-blocking — RSVP is already stored
    }

    return NextResponse.json({ status });
  }

  // ─── CANCEL ──────────────────────────────────────────────────────────────────

  // Find the user's active RSVP
  const [rsvp] = await db
    .select({ id: jamAttendees.id, status: jamAttendees.status })
    .from(jamAttendees)
    .where(
      and(
        eq(jamAttendees.jamId, jamId),
        eq(jamAttendees.userId, session.user.id),
        inArray(jamAttendees.status, ['confirmed', 'waitlist']),
      ),
    )
    .limit(1);

  if (!rsvp) {
    return NextResponse.json({ error: 'No RSVP found' }, { status: 404 });
  }

  // 4-hour cancellation lock (server-side only)
  if (Date.now() > new Date(jam.scheduledAt).getTime() - CANCEL_LOCK_MS) {
    return NextResponse.json(
      { error: 'Cannot cancel within 4 hours of jam start' },
      { status: 403 },
    );
  }

  // Mark the RSVP as cancelled
  await db
    .update(jamAttendees)
    .set({ status: 'cancelled' })
    .where(eq(jamAttendees.id, rsvp.id));

  // FIFO waitlist promotion (only if the cancelled user was confirmed)
  let promoted = false;

  if (rsvp.status === 'confirmed') {
    const [nextInLine] = await db
      .select({ id: jamAttendees.id, userId: jamAttendees.userId })
      .from(jamAttendees)
      .where(
        and(eq(jamAttendees.jamId, jamId), eq(jamAttendees.status, 'waitlist')),
      )
      .orderBy(asc(jamAttendees.joinedAt))
      .limit(1);

    if (nextInLine) {
      // Promote the waitlisted user to confirmed
      await db
        .update(jamAttendees)
        .set({ status: 'confirmed' })
        .where(eq(jamAttendees.id, nextInLine.id));

      promoted = true;

      // Fetch promoted user details (needed for both email and push)
      const [promotedUser] = await db
        .select({ email: user.email, name: user.name, preferredLocale: user.preferredLocale })
        .from(user)
        .where(eq(user.id, nextInLine.userId))
        .limit(1);

      // Send promotion email (non-blocking on failure)
      if (resend) {
        if (promotedUser) {
          try {
            await resend.emails.send({
              from: FROM_EMAIL,
              to: promotedUser.email,
              subject: 'A spot opened up for you!',
              text: `Great news ${promotedUser.name} — a spot opened in the jam on ${formatDate(jam.scheduledAt)}. You're confirmed!`,
            });
          } catch (err) {
            console.error('[rsvp] Failed to send promotion email:', err);
            // User is already confirmed in DB — email failure is non-blocking
          }
        }
      } else {
        console.warn('[rsvp] RESEND_API_KEY not set — skipping promotion email');
      }

      // Queue push notification for promoted user (non-blocking)
      try {
        const locale = promotedUser?.preferredLocale ?? 'he';
        const jamDateStr = formatDate(jam.scheduledAt);
        const promTitle = locale === 'he' ? 'קיבלת מקום!' : "You're in!";
        const promBody =
          locale === 'he'
            ? `נפתח מקום ב-${jamDateStr} ב-${jam.location}`
            : `A spot opened up for ${jamDateStr} at ${jam.location}`;

        await queuePushNotification(
          nextInLine.userId,
          'jam_rsvp',
          promTitle,
          promBody,
          `/jams/${jamId}`,
        );
      } catch (err) {
        console.error('[rsvp] Failed to queue push for promoted user:', err);
        // Non-blocking — promotion is already stored
      }
    }
  }

  return NextResponse.json({ status: 'cancelled', promoted });
}
