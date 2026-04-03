import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { conversations, directMessages, conversationReads, user } from '@/lib/db/schema';
import { eq, and, desc, lt } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { queuePushNotification } from '@/lib/notifications';

type RouteContext = { params: Promise<{ conversationId: string }> };

// GET /api/messages/[conversationId] — Fetch paginated message history and mark as read
export async function GET(request: NextRequest, { params }: RouteContext) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { conversationId } = await params;
  const userId = session.user.id;

  // Verify conversation exists and user is a participant
  const [conversation] = await db
    .select({
      id: conversations.id,
      participantA: conversations.participantA,
      participantB: conversations.participantB,
    })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  if (conversation.participantA !== userId && conversation.participantB !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Parse pagination query params
  const url = new URL(request.url);
  const before = url.searchParams.get('before'); // ISO timestamp for cursor-based pagination
  const limitParam = url.searchParams.get('limit');
  const parsedLimit = Math.min(Math.max(parseInt(limitParam ?? '50', 10) || 50, 1), 100);

  // Build conditions for query
  const conditions: ReturnType<typeof eq>[] = [eq(directMessages.conversationId, conversationId)];
  if (before) {
    const beforeDate = new Date(before);
    if (!isNaN(beforeDate.getTime())) {
      conditions.push(lt(directMessages.sentAt, beforeDate));
    }
  }

  // Fetch messages (newest first, then reverse for display)
  const messages = await db
    .select({
      id: directMessages.id,
      senderId: directMessages.senderId,
      text: directMessages.text,
      sentAt: directMessages.sentAt,
    })
    .from(directMessages)
    .where(and(...conditions))
    .orderBy(desc(directMessages.sentAt))
    .limit(parsedLimit);

  // Reverse so oldest is first (chronological display — newest at bottom)
  const orderedMessages = [...messages].reverse();

  // Mark conversation as read for this user (upsert conversationReads)
  const [existingRead] = await db
    .select({ id: conversationReads.id })
    .from(conversationReads)
    .where(
      and(
        eq(conversationReads.conversationId, conversationId),
        eq(conversationReads.userId, userId),
      )
    )
    .limit(1);

  if (existingRead) {
    await db
      .update(conversationReads)
      .set({ lastReadAt: new Date() })
      .where(
        and(
          eq(conversationReads.conversationId, conversationId),
          eq(conversationReads.userId, userId),
        )
      );
  } else {
    await db.insert(conversationReads).values({
      id: randomUUID(),
      conversationId,
      userId,
      lastReadAt: new Date(),
    });
  }

  return NextResponse.json({
    messages: orderedMessages,
    hasMore: messages.length === parsedLimit,
  });
}

// POST /api/messages/[conversationId] — Send a message in an existing conversation
export async function POST(request: NextRequest, { params }: RouteContext) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { conversationId } = await params;
  const userId = session.user.id;

  // Verify conversation exists and user is a participant
  const [conversation] = await db
    .select({
      id: conversations.id,
      participantA: conversations.participantA,
      participantB: conversations.participantB,
    })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  if (conversation.participantA !== userId && conversation.participantB !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Parse and validate body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { text } = body;

  if (typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }
  if (text.length > 2000) {
    return NextResponse.json({ error: 'text must be 2000 characters or fewer' }, { status: 400 });
  }

  // Insert the message
  const messageId = randomUUID();
  const now = new Date();

  await db.insert(directMessages).values({
    id: messageId,
    conversationId,
    senderId: userId,
    text: text.trim(),
    sentAt: now,
  });

  // Update conversation's lastMessageAt
  await db
    .update(conversations)
    .set({ lastMessageAt: now })
    .where(eq(conversations.id, conversationId));

  // Queue push notification for the recipient (non-blocking)
  try {
    const recipientId =
      conversation.participantA === userId
        ? conversation.participantB
        : conversation.participantA;

    // Look up sender's name for the notification body
    const [sender] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    const senderName = sender?.name ?? 'Someone';
    await queuePushNotification(
      recipientId,
      'new_message',
      `New message from ${senderName}`,
      text.trim().substring(0, 100),
      `/messages/${conversationId}`,
      `msg_${conversationId}`,
    );
  } catch (err) {
    console.error('[messages] Failed to queue push notification:', err);
    // Non-blocking — message is already stored
  }

  // Mark sender as read (up to their own message — they've obviously seen it)
  const [existingRead] = await db
    .select({ id: conversationReads.id })
    .from(conversationReads)
    .where(
      and(
        eq(conversationReads.conversationId, conversationId),
        eq(conversationReads.userId, userId),
      )
    )
    .limit(1);

  if (existingRead) {
    await db
      .update(conversationReads)
      .set({ lastReadAt: now })
      .where(
        and(
          eq(conversationReads.conversationId, conversationId),
          eq(conversationReads.userId, userId),
        )
      );
  } else {
    await db.insert(conversationReads).values({
      id: randomUUID(),
      conversationId,
      userId,
      lastReadAt: now,
    });
  }

  return NextResponse.json(
    { id: messageId, senderId: userId, text: text.trim(), sentAt: now },
    { status: 201 }
  );
}
