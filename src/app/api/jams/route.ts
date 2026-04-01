import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { jamSessions, jamAttendees, user } from '@/lib/db/schema';
import { eq, gt, lte, and, ilike, sql, count } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const VALID_LEVELS = ['beginner', 'intermediate', 'advanced', 'all'] as const;
type JamLevel = (typeof VALID_LEVELS)[number];

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const city = searchParams.get('city') ?? undefined;
  const level = searchParams.get('level') ?? undefined;
  const includePast = searchParams.get('past') === 'true';

  const now = new Date();

  // Build shared filter conditions
  const baseConditions = [];
  if (level && level !== 'all') {
    baseConditions.push(eq(jamSessions.level, level));
  }
  if (city) {
    baseConditions.push(ilike(jamSessions.location, `%${city}%`));
  }

  // Query confirmed attendee counts per jam as a subquery
  const confirmedCounts = db
    .select({
      jamId: jamAttendees.jamId,
      confirmedCount: count(jamAttendees.id).as('confirmed_count'),
    })
    .from(jamAttendees)
    .where(eq(jamAttendees.status, 'confirmed'))
    .groupBy(jamAttendees.jamId)
    .as('confirmed_counts');

  // Query current user's RSVPs for all jams
  const userRsvps = await db
    .select({ jamId: jamAttendees.jamId, status: jamAttendees.status })
    .from(jamAttendees)
    .where(eq(jamAttendees.userId, session.user.id));

  const rsvpMap = new Map(userRsvps.map((r) => [r.jamId, r.status]));

  // Fetch upcoming jams
  const upcomingJams = await db
    .select({
      id: jamSessions.id,
      scheduledAt: jamSessions.scheduledAt,
      location: jamSessions.location,
      capacity: jamSessions.capacity,
      level: jamSessions.level,
      notes: jamSessions.notes,
      hostId: jamSessions.hostId,
      hostName: user.name,
      hostImage: user.image,
      confirmedCount: sql<number>`coalesce(${confirmedCounts.confirmedCount}, 0)`,
    })
    .from(jamSessions)
    .leftJoin(user, eq(jamSessions.hostId, user.id))
    .leftJoin(confirmedCounts, eq(jamSessions.id, confirmedCounts.jamId))
    .where(and(gt(jamSessions.scheduledAt, now), ...baseConditions))
    .orderBy(jamSessions.scheduledAt);

  const upcoming = upcomingJams.map((jam) => ({
    ...jam,
    userRsvpStatus: rsvpMap.get(jam.id) ?? null,
  }));

  // Fetch past jams if requested
  let past: typeof upcoming = [];
  if (includePast) {
    const pastJams = await db
      .select({
        id: jamSessions.id,
        scheduledAt: jamSessions.scheduledAt,
        location: jamSessions.location,
        capacity: jamSessions.capacity,
        level: jamSessions.level,
        notes: jamSessions.notes,
        hostId: jamSessions.hostId,
        hostName: user.name,
        hostImage: user.image,
        confirmedCount: sql<number>`coalesce(${confirmedCounts.confirmedCount}, 0)`,
      })
      .from(jamSessions)
      .leftJoin(user, eq(jamSessions.hostId, user.id))
      .leftJoin(confirmedCounts, eq(jamSessions.id, confirmedCounts.jamId))
      .where(and(lte(jamSessions.scheduledAt, now), ...baseConditions))
      .orderBy(jamSessions.scheduledAt);

    past = pastJams.map((jam) => ({
      ...jam,
      userRsvpStatus: rsvpMap.get(jam.id) ?? null,
    }));
  }

  return NextResponse.json({ upcoming, past });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check isJamHost flag
  const [currentUser] = await db
    .select({ isJamHost: user.isJamHost })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!currentUser?.isJamHost) {
    return NextResponse.json({ error: 'Only approved hosts can create jams' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { scheduledAt, location, capacity, level, notes } = body;

  // Validate scheduledAt
  if (typeof scheduledAt !== 'string' || !scheduledAt) {
    return NextResponse.json({ error: 'scheduledAt is required' }, { status: 400 });
  }
  const scheduledDate = new Date(scheduledAt);
  if (isNaN(scheduledDate.getTime())) {
    return NextResponse.json({ error: 'scheduledAt must be a valid date' }, { status: 400 });
  }
  if (scheduledDate <= new Date()) {
    return NextResponse.json({ error: 'scheduledAt must be in the future' }, { status: 400 });
  }

  // Validate location
  if (typeof location !== 'string' || location.length < 1 || location.length > 200) {
    return NextResponse.json({ error: 'location is required (1-200 chars)' }, { status: 400 });
  }

  // Validate capacity
  if (typeof capacity !== 'number' || !Number.isInteger(capacity) || capacity < 1 || capacity > 100) {
    return NextResponse.json({ error: 'capacity must be an integer between 1 and 100' }, { status: 400 });
  }

  // Validate level
  if (typeof level !== 'string' || !(VALID_LEVELS as readonly string[]).includes(level)) {
    return NextResponse.json(
      { error: `level must be one of: ${VALID_LEVELS.join(', ')}` },
      { status: 400 },
    );
  }

  // Validate notes (optional)
  if (notes !== undefined && notes !== null) {
    if (typeof notes !== 'string' || notes.length > 500) {
      return NextResponse.json({ error: 'notes must be under 500 characters' }, { status: 400 });
    }
  }

  const newJam = {
    id: randomUUID(),
    hostId: session.user.id,
    scheduledAt: scheduledDate,
    location: location as string,
    capacity: capacity as number,
    level: level as JamLevel,
    notes: (notes as string | undefined) ?? null,
  };

  await db.insert(jamSessions).values(newJam);

  return NextResponse.json(newJam, { status: 201 });
}
