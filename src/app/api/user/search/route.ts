import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { and, eq, ilike, ne, isNotNull, or } from 'drizzle-orm';

// GET /api/user/search?q=... — Search members by name for NewMessagePicker
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim() ?? '';

  if (q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const results = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
    })
    .from(user)
    .where(
      and(
        isNotNull(user.tosAcceptedAt),
        ne(user.id, session.user.id),
        eq(user.status, 'active'),
        or(
          ilike(user.name, `%${q}%`),
        )
      )
    )
    .limit(20);

  return NextResponse.json({ users: results });
}
