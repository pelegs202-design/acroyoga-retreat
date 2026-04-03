import { db } from "@/lib/db";
import {
  pushQueue,
  dripEnrollments,
  notificationPreferences,
} from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { DRIP_SEQUENCES } from "./drip-sequences";
import { nanoid } from "nanoid";

// ─── Israel timezone helper ───

/** Returns the current Israel wall-clock hour (UTC+3 in summer, UTC+2 in winter).
 * For the purpose of quiet-hours gating we use a fixed +3 offset (summer time)
 * since the app primarily operates in those months. */
function israelHour(): number {
  const now = new Date();
  const israelMs = now.getTime() + 3 * 60 * 60 * 1000;
  return new Date(israelMs).getUTCHours();
}

/**
 * Returns the next Date at which quietHoursEnd will occur in Israel time.
 * E.g. if quietHoursEnd=8 and it is currently 23:00 IL time, returns tomorrow 08:00 IL.
 */
function nextQuietEnd(quietHoursEnd: number): Date {
  const now = new Date();
  // next occurrence of quietHoursEnd in Israel time
  const israelMs = now.getTime() + 3 * 60 * 60 * 1000;
  const ilDate = new Date(israelMs);
  const ilHour = ilDate.getUTCHours();

  const targetMs = new Date(
    Date.UTC(
      ilDate.getUTCFullYear(),
      ilDate.getUTCMonth(),
      ilDate.getUTCDate(),
      quietHoursEnd,
      0,
      0,
    )
  ).getTime() - 3 * 60 * 60 * 1000; // convert back to UTC

  const candidate = new Date(targetMs);
  if (ilHour >= quietHoursEnd) {
    // already past today's quiet end — schedule for tomorrow
    candidate.setUTCDate(candidate.getUTCDate() + 1);
  }
  return candidate;
}

// ─── isInQuietHours ───

function isInQuietHours(start: number, end: number): boolean {
  const hour = israelHour();
  if (start < end) {
    // e.g. 09:00-17:00
    return hour >= start && hour < end;
  }
  // overnight window, e.g. 22:00-08:00
  return hour >= start || hour < end;
}

// ─── queuePushNotification ───

export async function queuePushNotification(
  userId: string,
  eventType: string,
  title: string,
  body: string,
  deepLink: string,
  batchKey?: string,
): Promise<void> {
  // Load the user's notification preferences (may not exist — fallback to defaults)
  const prefs = await db.query.notificationPreferences
    .findFirst({ where: eq(notificationPreferences.userId, userId) })
    .catch(() => null);

  const quietStart = prefs?.quietHoursStart ?? 22;
  const quietEnd = prefs?.quietHoursEnd ?? 8;

  let heldUntil: Date | null = null;
  if (isInQuietHours(quietStart, quietEnd)) {
    heldUntil = nextQuietEnd(quietEnd);
  }

  await db.insert(pushQueue).values({
    id: nanoid(),
    userId,
    eventType,
    title,
    body,
    deepLink,
    batchKey: batchKey ?? null,
    heldUntil,
  });
}

// ─── enrollInDrip ───

export interface EnrollInDripOptions {
  leadId: string;
  userId?: string;
  sequenceType: string;
  channel: "whatsapp" | "email";
  recipientPhone?: string;
  recipientEmail?: string;
  recipientName: string;
  preferredLocale?: string;
  metadata?: Record<string, unknown>;
}

export async function enrollInDrip(opts: EnrollInDripOptions): Promise<void> {
  const sequence = DRIP_SEQUENCES[opts.sequenceType];
  if (!sequence) {
    throw new Error(`Unknown drip sequence type: ${opts.sequenceType}`);
  }

  // Calculate initial nextFireAt
  // WA sequences: tomorrow at 19:00 Israel time (16:00 UTC in summer)
  // Email confirmations (step 0 of email sequences): send almost immediately — 5 min from now
  let nextFireAt: Date;

  const isEmail = opts.channel === "email";
  const step0SpacingDays = sequence.spacingDays[0] ?? 0;

  if (isEmail && step0SpacingDays === 0) {
    // Email confirmation — fire in 5 minutes
    nextFireAt = new Date(Date.now() + 5 * 60 * 1000);
  } else {
    // WA sequences or email sequences with initial delay
    // Base: tomorrow at 19:00 Israel time = 16:00 UTC
    const now = new Date();
    const tomorrowUTC = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1 + step0SpacingDays,
        16, // 19:00 Israel = 16:00 UTC
        0,
        0,
      ),
    );
    nextFireAt = tomorrowUTC;
  }

  await db.insert(dripEnrollments).values({
    id: nanoid(),
    leadId: opts.leadId,
    userId: opts.userId ?? null,
    sequenceType: opts.sequenceType,
    channel: opts.channel,
    recipientPhone: opts.recipientPhone ?? null,
    recipientEmail: opts.recipientEmail ?? null,
    recipientName: opts.recipientName,
    preferredLocale: opts.preferredLocale ?? "he",
    currentStep: 0,
    totalSteps: sequence.steps,
    nextFireAt,
    metadata: opts.metadata ? JSON.stringify(opts.metadata) : null,
  });
}

// ─── cancelDrip ───

export async function cancelDrip(
  leadId: string,
  sequenceType: string,
  reason: string,
): Promise<void> {
  await db
    .update(dripEnrollments)
    .set({
      cancelledAt: new Date(),
      cancelReason: reason,
    })
    .where(
      and(
        eq(dripEnrollments.leadId, leadId),
        eq(dripEnrollments.sequenceType, sequenceType),
        isNull(dripEnrollments.cancelledAt),
        isNull(dripEnrollments.completedAt),
      ),
    );
}
