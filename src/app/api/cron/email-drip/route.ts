import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dripEnrollments, notificationPreferences } from "@/lib/db/schema";
import { and, eq, isNull, lte } from "drizzle-orm";
import { DRIP_SEQUENCES } from "@/lib/notifications/drip-sequences";
import {
  sendMarketingEmail,
  sendTransactionalEmail,
  generateUnsubToken,
  buildUnsubUrl,
} from "@/lib/email";
import NurtureStep from "@/lib/email/templates/NurtureStep";
import SessionReminder from "@/lib/email/templates/SessionReminder";
import CompletionCertificate from "@/lib/email/templates/CompletionCertificate";
import { createElement } from "react";

export const runtime = "nodejs";

// ─── Constants ───

const NURTURE_CYCLE_START = 6; // step index to wrap back to after step 12
const RETRY_DELAY_MS = 60 * 60 * 1000; // 1 hour on Resend error
const BATCH_SIZE = 50;

// ─── GET /api/cron/email-drip ───

export async function GET(request: NextRequest) {
  // Verify CRON_SECRET bearer token
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();

  // Query due email drip enrollments
  let dueEnrollments: (typeof dripEnrollments.$inferSelect)[];
  try {
    dueEnrollments = await db
      .select()
      .from(dripEnrollments)
      .where(
        and(
          eq(dripEnrollments.channel, "email"),
          lte(dripEnrollments.nextFireAt, now),
          isNull(dripEnrollments.completedAt),
          isNull(dripEnrollments.cancelledAt),
        ),
      )
      .limit(BATCH_SIZE);
  } catch (err) {
    console.error("[email-drip] DB query failed:", err);
    return NextResponse.json({ error: "DB query failed" }, { status: 200 });
  }

  let sent = 0;
  let errors = 0;

  for (const enrollment of dueEnrollments) {
    try {
      await processEnrollment(enrollment, now);
      sent++;
    } catch (err) {
      console.error(
        `[email-drip] Failed enrollment ${enrollment.id}:`,
        err,
      );
      errors++;

      // Retry in 1 hour — do NOT fail the cron
      try {
        await db
          .update(dripEnrollments)
          .set({ nextFireAt: new Date(Date.now() + RETRY_DELAY_MS) })
          .where(eq(dripEnrollments.id, enrollment.id));
      } catch (updateErr) {
        console.error("[email-drip] Retry update failed:", updateErr);
      }
    }
  }

  return NextResponse.json({
    processed: dueEnrollments.length,
    sent,
    errors,
  });
}

// ─── processEnrollment ───

async function processEnrollment(
  enrollment: typeof dripEnrollments.$inferSelect,
  now: Date,
): Promise<void> {
  const {
    id,
    sequenceType,
    currentStep,
    totalSteps,
    recipientEmail,
    recipientName,
    preferredLocale,
    userId,
    metadata: metadataRaw,
  } = enrollment;

  if (!recipientEmail) {
    console.warn(`[email-drip] No recipientEmail for enrollment ${id} — skipping`);
    return;
  }

  const locale = (preferredLocale === "en" ? "en" : "he") as "he" | "en";
  const metadata = metadataRaw ? (JSON.parse(metadataRaw) as Record<string, unknown>) : {};

  // Check marketing preference for nurture sequences (transactional always sends)
  const isMarketing = sequenceType === "email_nurture";
  if (isMarketing && userId) {
    const prefs = await db.query.notificationPreferences
      .findFirst({ where: eq(notificationPreferences.userId, userId) })
      .catch(() => null);

    if (prefs && !prefs.emailMarketing) {
      // User unsubscribed — cancel this enrollment silently
      await db
        .update(dripEnrollments)
        .set({ cancelledAt: now, cancelReason: "opted_out" })
        .where(eq(dripEnrollments.id, id));
      return;
    }
  }

  const sequence = DRIP_SEQUENCES[sequenceType];
  if (!sequence) {
    console.warn(`[email-drip] Unknown sequence type: ${sequenceType} for enrollment ${id}`);
    return;
  }

  // Build email based on sequence type
  let emailResult: { id?: string; error?: string };

  if (sequenceType === "email_nurture") {
    emailResult = await sendNurtureEmail({
      enrollment,
      currentStep,
      recipientEmail,
      recipientName,
      locale,
      userId,
      metadata,
      archetype: (metadata.archetype as string) ?? "Explorer",
    });
  } else if (sequenceType === "email_challenge_reminders") {
    emailResult = await sendChallengeReminderEmail({
      enrollment,
      currentStep,
      totalSteps,
      recipientEmail,
      recipientName,
      locale,
      metadata,
      now,
    });
  } else {
    console.warn(`[email-drip] Unhandled email sequence type: ${sequenceType}`);
    return;
  }

  if (emailResult.error) {
    throw new Error(emailResult.error);
  }

  // Advance step and compute next fire time
  const nextStep = currentStep + 1;
  await advanceEnrollment({ id, sequenceType, nextStep, totalSteps, now, metadata });
}

// ─── sendNurtureEmail ───

interface NurtureEmailArgs {
  enrollment: typeof dripEnrollments.$inferSelect;
  currentStep: number;
  recipientEmail: string;
  recipientName: string;
  locale: "he" | "en";
  userId: string | null;
  metadata: Record<string, unknown>;
  archetype: string;
}

async function sendNurtureEmail(args: NurtureEmailArgs) {
  const {
    currentStep,
    recipientEmail,
    recipientName,
    locale,
    userId,
    archetype,
  } = args;

  const sequence = DRIP_SEQUENCES.email_nurture;
  const stepIndex = Math.min(currentStep, sequence.templates.length - 1);
  const subject =
    sequence.templates[stepIndex]?.subject ??
    (locale === "he" ? "עדכון מ-AcroHavura" : "Update from AcroHavura");

  const unsubUrl = userId
    ? buildUnsubUrl(userId)
    : "#"; // fallback if no user id (lead-only)

  const unsubToken = userId ? generateUnsubToken(userId) : "";

  const reactEl = createElement(NurtureStep, {
    name: recipientName,
    archetype,
    stepNumber: currentStep + 1, // 1-indexed for template
    locale,
    unsubUrl,
  });

  if (userId) {
    return sendMarketingEmail({
      to: recipientEmail,
      subject,
      react: reactEl,
      unsubToken,
      uid: userId,
      tags: [
        { name: "sequence", value: "email_nurture" },
        { name: "step", value: String(currentStep + 1) },
      ],
    });
  } else {
    // Lead without user account — still send marketing, use fallback token
    return sendMarketingEmail({
      to: recipientEmail,
      subject,
      react: reactEl,
      unsubToken: "no-user",
      uid: "no-user",
      tags: [
        { name: "sequence", value: "email_nurture" },
        { name: "step", value: String(currentStep + 1) },
      ],
    });
  }
}

// ─── sendChallengeReminderEmail ───

interface ReminderEmailArgs {
  enrollment: typeof dripEnrollments.$inferSelect;
  currentStep: number;
  totalSteps: number;
  recipientEmail: string;
  recipientName: string;
  locale: "he" | "en";
  metadata: Record<string, unknown>;
  now: Date;
}

async function sendChallengeReminderEmail(args: ReminderEmailArgs) {
  const {
    currentStep,
    totalSteps,
    recipientEmail,
    recipientName,
    locale,
    metadata,
    now,
    enrollment,
  } = args;

  const sequence = DRIP_SEQUENCES.email_challenge_reminders;
  const stepIndex = Math.min(currentStep, sequence.templates.length - 1);

  const isFinalStep = currentStep >= totalSteps - 1;

  // Send completion certificate on the very last step
  if (isFinalStep) {
    const subject = locale === "he"
      ? "סיימת את האתגר! 🏆"
      : "You completed the challenge! 🏆";

    const reactEl = createElement(CompletionCertificate, {
      name: recipientName,
      completionDate: now.toISOString(),
      locale,
    });

    return sendTransactionalEmail({ to: recipientEmail, subject, react: reactEl });
  }

  // Determine reminder variant: even steps = day-before, odd = morning-of
  const isEve = stepIndex % 2 === 0;

  const cohortStartDate = (metadata.cohortStartDate as string) ?? new Date().toISOString();
  const sessionDateObj = computeSessionDate(cohortStartDate, stepIndex);
  const sessionDate = sessionDateObj.toLocaleDateString(
    locale === "he" ? "he-IL" : "en-GB",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" },
  );
  const sessionTime = isEve ? "18:00" : "08:00";
  const city = (metadata.city as string) ?? "ישראל";

  const templateStep = sequence.templates[stepIndex];
  const subject =
    templateStep?.subject ??
    (locale === "he" ? "תזכורת לאתגר" : "Challenge reminder");

  const reactEl = createElement(SessionReminder, {
    name: recipientName,
    sessionDate,
    sessionTime,
    city,
    isEve,
    locale,
  });

  return sendTransactionalEmail({ to: recipientEmail, subject, react: reactEl });
}

// ─── computeSessionDate ───

/**
 * Compute the session date based on cohort start and step index.
 * Steps come in pairs (day-before + morning-of) per session.
 * Session N starts at cohortStartDate + N*7 days.
 */
function computeSessionDate(cohortStartDate: string, stepIndex: number): Date {
  const sessionNumber = Math.floor(stepIndex / 2);
  const start = new Date(cohortStartDate);
  start.setDate(start.getDate() + sessionNumber * 7);
  return start;
}

// ─── advanceEnrollment ───

interface AdvanceArgs {
  id: string;
  sequenceType: string;
  nextStep: number;
  totalSteps: number;
  now: Date;
  metadata: Record<string, unknown>;
}

async function advanceEnrollment({
  id,
  sequenceType,
  nextStep,
  totalSteps,
  now,
}: AdvanceArgs): Promise<void> {
  if (sequenceType === "email_nurture") {
    // Nurture NEVER completes — cycles through steps 6-12 forever after finishing
    const wrappedStep = nextStep >= totalSteps ? NURTURE_CYCLE_START : nextStep;
    const daysUntilNext = wrappedStep < 5 ? 7 : 14; // weekly for steps 0-4, bi-weekly after
    const nextFireAt = new Date(now.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);

    await db
      .update(dripEnrollments)
      .set({
        currentStep: wrappedStep,
        nextFireAt,
        // completedAt intentionally NOT set — nurture never stops
      })
      .where(eq(dripEnrollments.id, id));
  } else if (sequenceType === "email_challenge_reminders") {
    if (nextStep >= totalSteps) {
      // Final step sent — mark complete
      await db
        .update(dripEnrollments)
        .set({ currentStep: nextStep, completedAt: now, nextFireAt: null })
        .where(eq(dripEnrollments.id, id));
    } else {
      // Advance: alternate day-before (18:00 Israel) and morning-of (08:00 Israel)
      const isNextEve = nextStep % 2 === 0;
      const nextFireAt = computeNextReminderFireAt(now, isNextEve);

      await db
        .update(dripEnrollments)
        .set({ currentStep: nextStep, nextFireAt })
        .where(eq(dripEnrollments.id, id));
    }
  } else {
    // Generic advance: 7 days from now
    const nextFireAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    await db
      .update(dripEnrollments)
      .set({ currentStep: nextStep, nextFireAt })
      .where(eq(dripEnrollments.id, id));
  }
}

// ─── computeNextReminderFireAt ───

/**
 * Day-before reminder fires at 18:00 Israel time (15:00 UTC in summer).
 * Morning-of reminder fires at 08:00 Israel time (05:00 UTC in summer).
 */
function computeNextReminderFireAt(from: Date, isEve: boolean): Date {
  // Find the next occurrence of target hour in Israel time (UTC+3 summer)
  const targetHourIL = isEve ? 18 : 8;
  const targetHourUTC = targetHourIL - 3; // UTC+3 offset

  const candidate = new Date(from);
  candidate.setUTCHours(targetHourUTC, 0, 0, 0);

  // If we've already passed that time today, advance to next day
  if (candidate <= from) {
    candidate.setUTCDate(candidate.getUTCDate() + 1);
  }

  return candidate;
}
