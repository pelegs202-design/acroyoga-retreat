import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { reviews, user, jamAttendees } from '@/lib/db/schema';
import { eq, and, gt, inArray } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { revieweeId, thumbsUp, comment } = body;

  // Validate revieweeId
  if (typeof revieweeId !== 'string') {
    return NextResponse.json({ error: 'revieweeId is required' }, { status: 400 });
  }

  // Cannot review yourself
  if (revieweeId === session.user.id) {
    return NextResponse.json({ error: 'Cannot review yourself' }, { status: 400 });
  }

  // Validate thumbsUp
  if (typeof thumbsUp !== 'boolean') {
    return NextResponse.json({ error: 'thumbsUp must be a boolean' }, { status: 400 });
  }

  // Validate comment (optional, max 200 chars)
  if (comment !== undefined && comment !== null) {
    if (typeof comment !== 'string' || comment.length > 200) {
      return NextResponse.json({ error: 'Comment must be under 200 characters' }, { status: 400 });
    }
  }

  // Verify reviewee exists
  const [reviewee] = await db.select({ id: user.id }).from(user).where(eq(user.id, revieweeId)).limit(1);
  if (!reviewee) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check for duplicate review within last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [existing] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(
      and(
        eq(reviews.reviewerId, session.user.id),
        eq(reviews.revieweeId, revieweeId),
        gt(reviews.createdAt, thirtyDaysAgo),
      )
    )
    .limit(1);

  if (existing) {
    return NextResponse.json({ error: 'Already reviewed this partner recently' }, { status: 409 });
  }

  // Phase 4: Real jam attendance check — both users must have attended the same jam as 'confirmed'
  const myJamIds = db
    .select({ jamId: jamAttendees.jamId })
    .from(jamAttendees)
    .where(
      and(
        eq(jamAttendees.userId, session.user.id),
        eq(jamAttendees.status, 'confirmed'),
      )
    );

  const [sharedJam] = await db
    .select({ id: jamAttendees.id })
    .from(jamAttendees)
    .where(
      and(
        eq(jamAttendees.userId, revieweeId),
        eq(jamAttendees.status, 'confirmed'),
        inArray(jamAttendees.jamId, myJamIds),
      )
    )
    .limit(1);

  const canReview = !!sharedJam;
  if (!canReview) {
    return NextResponse.json({ error: 'Must attend a jam together first' }, { status: 403 });
  }

  // Insert review
  await db.insert(reviews).values({
    id: randomUUID(),
    reviewerId: session.user.id,
    revieweeId,
    thumbsUp,
    comment: (comment as string | undefined) ?? null,
    jamSessionId: null, // Stub — will be populated in Phase 4
  });

  return NextResponse.json({ ok: true });
}
