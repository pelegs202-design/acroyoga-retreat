import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { notificationPreferences, dripEnrollments } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

const DEFAULTS = {
  pushEnabled: true,
  emailMarketing: true,
  whatsappEnabled: true,
  quietHoursStart: 22,
  quietHoursEnd: 8,
};

// GET /api/notifications/preferences — Returns preferences for authenticated user
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  const [prefs] = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  if (!prefs) {
    return NextResponse.json({ userId, ...DEFAULTS });
  }

  return NextResponse.json({
    userId: prefs.userId,
    pushEnabled: prefs.pushEnabled,
    emailMarketing: prefs.emailMarketing,
    whatsappEnabled: prefs.whatsappEnabled,
    quietHoursStart: prefs.quietHoursStart,
    quietHoursEnd: prefs.quietHoursEnd,
  });
}

// PATCH /api/notifications/preferences — Partially update preferences
export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate incoming fields
  const patch: Partial<{
    pushEnabled: boolean;
    emailMarketing: boolean;
    whatsappEnabled: boolean;
    quietHoursStart: number;
    quietHoursEnd: number;
  }> = {};

  if ('pushEnabled' in body) {
    if (typeof body.pushEnabled !== 'boolean')
      return NextResponse.json({ error: 'pushEnabled must be boolean' }, { status: 400 });
    patch.pushEnabled = body.pushEnabled;
  }
  if ('emailMarketing' in body) {
    if (typeof body.emailMarketing !== 'boolean')
      return NextResponse.json({ error: 'emailMarketing must be boolean' }, { status: 400 });
    patch.emailMarketing = body.emailMarketing;
  }
  if ('whatsappEnabled' in body) {
    if (typeof body.whatsappEnabled !== 'boolean')
      return NextResponse.json({ error: 'whatsappEnabled must be boolean' }, { status: 400 });
    patch.whatsappEnabled = body.whatsappEnabled;
  }
  if ('quietHoursStart' in body) {
    const v = body.quietHoursStart;
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > 23)
      return NextResponse.json({ error: 'quietHoursStart must be integer 0-23' }, { status: 400 });
    patch.quietHoursStart = v;
  }
  if ('quietHoursEnd' in body) {
    const v = body.quietHoursEnd;
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > 23)
      return NextResponse.json({ error: 'quietHoursEnd must be integer 0-23' }, { status: 400 });
    patch.quietHoursEnd = v;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  // Upsert preferences (insert defaults merged with patch if no row, update if exists)
  await db
    .insert(notificationPreferences)
    .values({
      userId,
      ...DEFAULTS,
      ...patch,
    })
    .onConflictDoUpdate({
      target: notificationPreferences.userId,
      set: patch,
    });

  // Side effect: WhatsApp opt-out cancels active drip enrollments for this user
  if (patch.whatsappEnabled === false) {
    await db
      .update(dripEnrollments)
      .set({
        cancelledAt: new Date(),
        cancelReason: 'opted_out',
      })
      .where(
        and(
          eq(dripEnrollments.userId, userId),
          eq(dripEnrollments.channel, 'whatsapp'),
          isNull(dripEnrollments.cancelledAt),
        ),
      );
  }

  return NextResponse.json({ ok: true });
}
