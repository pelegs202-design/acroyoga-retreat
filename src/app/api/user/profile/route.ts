import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/user/profile?id=... — Fetch a single user's basic profile info
// Used by NewMessagePicker to prefill a recipient when coming from a profile page
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const id = url.searchParams.get('id')?.trim();

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const [member] = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
    })
    .from(user)
    .where(eq(user.id, id))
    .limit(1);

  if (!member) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user: member });
}
