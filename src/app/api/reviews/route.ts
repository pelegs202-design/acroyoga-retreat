import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { reviews, user } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
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

  // TODO Phase 4: Replace with real jam attendance check
  // Stub: canReview always returns true in Phase 3
  const canReview = true;
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
