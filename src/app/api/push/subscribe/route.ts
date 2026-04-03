import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { pushSubscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// POST /api/push/subscribe — Store or refresh a browser push subscription
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { endpoint, p256dh, auth: authKey } = body;

  if (typeof endpoint !== 'string' || endpoint.trim().length === 0) {
    return NextResponse.json({ error: 'endpoint is required' }, { status: 400 });
  }
  if (typeof p256dh !== 'string' || p256dh.trim().length === 0) {
    return NextResponse.json({ error: 'p256dh is required' }, { status: 400 });
  }
  if (typeof authKey !== 'string' || authKey.trim().length === 0) {
    return NextResponse.json({ error: 'auth is required' }, { status: 400 });
  }

  const userAgent = request.headers.get('user-agent') ?? null;
  const userId = session.user.id;

  // Upsert: insert or update if subscription endpoint already exists
  await db
    .insert(pushSubscriptions)
    .values({
      id: nanoid(),
      userId,
      endpoint: endpoint.trim(),
      p256dh: p256dh.trim(),
      auth: authKey.trim(),
      userAgent,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        p256dh: p256dh.trim(),
        auth: authKey.trim(),
        userAgent,
        userId,
      },
    });

  return NextResponse.json({ ok: true }, { status: 201 });
}
