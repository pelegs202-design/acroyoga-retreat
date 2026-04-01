import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET /api/messages/unread — Total unread conversation count for header badge
// This endpoint is polled every 5-10 seconds — optimized as a single SQL query
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  // Count distinct conversations where the user has unread messages:
  // - User must be a participant
  // - There's at least one message from the other person
  // - That message was sent after the user's lastReadAt (or they've never read the conversation)
  const result = await db.execute(sql`
    SELECT COUNT(DISTINCT c.id) as count
    FROM conversations c
    INNER JOIN direct_messages dm ON dm.conversation_id = c.id
    LEFT JOIN conversation_reads cr
      ON cr.conversation_id = c.id AND cr.user_id = ${userId}
    WHERE (c.participant_a = ${userId} OR c.participant_b = ${userId})
      AND dm.sender_id != ${userId}
      AND (cr.last_read_at IS NULL OR dm.sent_at > cr.last_read_at)
  `);

  // Neon HTTP driver returns { rows: [{ count: "N" }] }
  const rows = result.rows as Array<Record<string, unknown>>;
  const rawCount = rows[0]?.count ?? 0;
  const unreadCount = parseInt(String(rawCount), 10) || 0;

  return NextResponse.json({ unreadCount });
}
