import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { conversations, directMessages, conversationReads, user } from '@/lib/db/schema';
import { or, eq, desc, and, inArray } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// GET /api/messages — List user's conversations with last message preview and unread status
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  // Fetch all conversations where the user is a participant
  const convos = await db
    .select({
      id: conversations.id,
      participantA: conversations.participantA,
      participantB: conversations.participantB,
      lastMessageAt: conversations.lastMessageAt,
      createdAt: conversations.createdAt,
    })
    .from(conversations)
    .where(
      or(
        eq(conversations.participantA, userId),
        eq(conversations.participantB, userId),
      )
    )
    .orderBy(desc(conversations.lastMessageAt));

  if (convos.length === 0) {
    return NextResponse.json({ conversations: [] });
  }

  // Collect the "other" participant IDs for batch lookup
  const otherUserIds = convos.map((c) =>
    c.participantA === userId ? c.participantB : c.participantA
  );

  // Batch-fetch other participants' details
  const otherUsers = await db
    .select({ id: user.id, name: user.name, image: user.image })
    .from(user)
    .where(inArray(user.id, otherUserIds));

  const otherUserMap = new Map(otherUsers.map((u) => [u.id, u]));

  // Fetch the last message for each conversation
  const convoIds = convos.map((c) => c.id);

  // For each conversation, get the most recent message
  const lastMessages = await db
    .select({
      id: directMessages.id,
      conversationId: directMessages.conversationId,
      senderId: directMessages.senderId,
      text: directMessages.text,
      sentAt: directMessages.sentAt,
    })
    .from(directMessages)
    .where(inArray(directMessages.conversationId, convoIds))
    .orderBy(desc(directMessages.sentAt));

  // Build a map: conversationId -> first (most recent) message
  const lastMessageMap = new Map<string, typeof lastMessages[number]>();
  for (const msg of lastMessages) {
    if (!lastMessageMap.has(msg.conversationId)) {
      lastMessageMap.set(msg.conversationId, msg);
    }
  }

  // Fetch conversation reads for the current user
  const reads = await db
    .select({
      conversationId: conversationReads.conversationId,
      lastReadAt: conversationReads.lastReadAt,
    })
    .from(conversationReads)
    .where(
      and(
        inArray(conversationReads.conversationId, convoIds),
        eq(conversationReads.userId, userId),
      )
    );

  const readMap = new Map(reads.map((r) => [r.conversationId, r.lastReadAt]));

  // Build the response shape
  const result = convos.map((c) => {
    const otherId = c.participantA === userId ? c.participantB : c.participantA;
    const otherUser = otherUserMap.get(otherId) ?? { id: otherId, name: 'Unknown', image: null };
    const lastMsg = lastMessageMap.get(c.id) ?? null;
    const lastReadAt = readMap.get(c.id) ?? null;

    // Unread if: never opened OR last message is after last read
    const hasUnread =
      lastMsg !== null &&
      lastMsg.senderId !== userId &&
      (lastReadAt === null || lastMsg.sentAt > lastReadAt);

    return {
      id: c.id,
      otherUser: {
        id: otherUser.id,
        name: otherUser.name,
        image: otherUser.image,
      },
      lastMessage: lastMsg
        ? {
            text: lastMsg.text,
            sentAt: lastMsg.sentAt,
            senderId: lastMsg.senderId,
          }
        : null,
      hasUnread,
      lastMessageAt: c.lastMessageAt,
    };
  });

  return NextResponse.json({ conversations: result });
}

// POST /api/messages — Start a new conversation (send first message, creates conversation lazily)
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { recipientId, text } = body;

  // Validate recipientId
  if (typeof recipientId !== 'string' || !recipientId.trim()) {
    return NextResponse.json({ error: 'recipientId is required' }, { status: 400 });
  }

  // Validate text
  if (typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }
  if (text.length > 2000) {
    return NextResponse.json({ error: 'text must be 2000 characters or fewer' }, { status: 400 });
  }

  // Cannot message yourself
  if (recipientId === session.user.id) {
    return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });
  }

  // Verify recipient exists
  const [recipient] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, recipientId))
    .limit(1);

  if (!recipient) {
    return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
  }

  // Deterministic participant ordering: always sort so A < B
  const [a, b] = [session.user.id, recipientId].sort();

  // Check if conversation already exists
  let [existing] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(and(eq(conversations.participantA, a), eq(conversations.participantB, b)))
    .limit(1);

  let conversationId: string;

  if (existing) {
    conversationId = existing.id;
  } else {
    // Create conversation lazily
    conversationId = randomUUID();
    try {
      await db.insert(conversations).values({
        id: conversationId,
        participantA: a,
        participantB: b,
        lastMessageAt: new Date(),
      });
    } catch (err: unknown) {
      // Handle unique constraint violation (race condition — another request created it first)
      const pgErr = err as { code?: string };
      if (pgErr.code === '23505') {
        // Re-fetch the conversation that was created by the concurrent request
        const [refetched] = await db
          .select({ id: conversations.id })
          .from(conversations)
          .where(and(eq(conversations.participantA, a), eq(conversations.participantB, b)))
          .limit(1);
        if (!refetched) {
          return NextResponse.json({ error: 'Failed to create or find conversation' }, { status: 500 });
        }
        conversationId = refetched.id;
      } else {
        throw err;
      }
    }
  }

  // Insert the message
  const messageId = randomUUID();
  const now = new Date();

  await db.insert(directMessages).values({
    id: messageId,
    conversationId,
    senderId: session.user.id,
    text: text.trim(),
    sentAt: now,
  });

  // Update conversation's lastMessageAt
  await db
    .update(conversations)
    .set({ lastMessageAt: now })
    .where(eq(conversations.id, conversationId));

  return NextResponse.json({ conversationId, messageId }, { status: 201 });
}
