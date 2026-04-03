import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  pushQueue,
  pushSubscriptions,
  notificationPreferences,
} from '@/lib/db/schema';
import { eq, isNull, lte, or, and } from 'drizzle-orm';
import { sendPushToUser } from '@/lib/push';
import type { PushPayload } from '@/lib/push';

export const runtime = 'nodejs';

// Israel time helper — fixed UTC+3 offset (summer months, primary operating window)
function israelHour(): number {
  const now = new Date();
  const israelMs = now.getTime() + 3 * 60 * 60 * 1000;
  return new Date(israelMs).getUTCHours();
}

function isInQuietHours(start: number, end: number): boolean {
  const hour = israelHour();
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end; // overnight window e.g. 22:00-08:00
}

// GET /api/cron/push-batch — Flushes pending push queue (called every 5 min by Vercel cron)
export async function GET(request: NextRequest) {
  // Bearer token guard — must match CRON_SECRET env var
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  let sentCount = 0;

  try {
    // Fetch pending items: unsent AND (not held OR held_until has passed)
    const pending = await db
      .select()
      .from(pushQueue)
      .where(
        and(
          isNull(pushQueue.sentAt),
          or(isNull(pushQueue.heldUntil), lte(pushQueue.heldUntil, now)),
        ),
      )
      .limit(100);

    if (pending.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    // Group by userId + eventType for batching
    type QueueRow = (typeof pending)[number];
    const groups = new Map<string, QueueRow[]>();

    for (const item of pending) {
      const key = `${item.userId}::${item.eventType}`;
      const existing = groups.get(key);
      if (existing) {
        existing.push(item);
      } else {
        groups.set(key, [item]);
      }
    }

    for (const [, items] of groups) {
      if (items.length === 0) continue;

      const first = items[0];
      const userId = first.userId;

      // Check notification preferences — skip if push is disabled
      let pushEnabled = true;
      let prefQuietStart = 22;
      let prefQuietEnd = 8;

      try {
        const prefs = await db.query.notificationPreferences.findFirst({
          where: eq(notificationPreferences.userId, userId),
        });
        if (prefs) {
          pushEnabled = prefs.pushEnabled;
          prefQuietStart = prefs.quietHoursStart;
          prefQuietEnd = prefs.quietHoursEnd;
        }
      } catch (err) {
        console.error('[push-batch] Failed to load prefs for user', userId, err);
      }

      if (!pushEnabled) {
        // Mark as sent so they don't re-queue
        for (const item of items) {
          await db
            .update(pushQueue)
            .set({ sentAt: now })
            .where(eq(pushQueue.id, item.id));
        }
        continue;
      }

      // Belt-and-suspenders quiet hours re-check (queuePushNotification already sets heldUntil)
      if (isInQuietHours(prefQuietStart, prefQuietEnd)) {
        // Skip — leave held items for the next cron run after quiet period ends
        continue;
      }

      // Build the final notification payload (with batching collapse)
      let payload: PushPayload;

      if (items.length > 1 && first.eventType === 'new_message') {
        payload = {
          title: `${items.length} new messages`,
          body: 'You have unread messages',
          url: '/messages',
        };
      } else if (items.length > 1 && first.eventType === 'jam_rsvp') {
        payload = {
          title: `${items.length} jam updates`,
          body: 'Check your jam activity',
          url: '/jams',
        };
      } else {
        // Single item or non-batchable event type — use original payload
        payload = {
          title: first.title,
          body: first.body,
          url: first.deepLink,
        };
      }

      // Fetch push subscriptions for this user
      let subs: Array<{ id: string; endpoint: string; p256dh: string; auth: string }> = [];
      try {
        subs = await db
          .select({
            id: pushSubscriptions.id,
            endpoint: pushSubscriptions.endpoint,
            p256dh: pushSubscriptions.p256dh,
            auth: pushSubscriptions.auth,
          })
          .from(pushSubscriptions)
          .where(eq(pushSubscriptions.userId, userId));
      } catch (err) {
        console.error('[push-batch] Failed to load subscriptions for user', userId, err);
      }

      // Send to each subscription
      for (const sub of subs) {
        try {
          await sendPushToUser(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            payload,
          );
          sentCount++;
        } catch (err: unknown) {
          const error = err as { code?: string; message?: string };
          if (error.code === 'SUBSCRIPTION_EXPIRED') {
            // Delete expired subscription — push service returns 410
            try {
              await db
                .delete(pushSubscriptions)
                .where(eq(pushSubscriptions.id, sub.id));
            } catch (delErr) {
              console.error('[push-batch] Failed to delete expired subscription', sub.id, delErr);
            }
          } else {
            console.error('[push-batch] sendPushToUser error for sub', sub.id, err);
          }
        }
      }

      // Mark all batched rows as sent
      for (const item of items) {
        try {
          await db
            .update(pushQueue)
            .set({ sentAt: now })
            .where(eq(pushQueue.id, item.id));
        } catch (err) {
          console.error('[push-batch] Failed to mark item as sent', item.id, err);
        }
      }
    }
  } catch (err) {
    // Never throw — cron must return 200 to prevent Vercel retry storms
    console.error('[push-batch] Unexpected error:', err);
  }

  return NextResponse.json({ sent: sentCount });
}
