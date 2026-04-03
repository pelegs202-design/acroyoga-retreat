import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dripEnrollments } from "@/lib/db/schema";
import { and, eq, isNull, lte } from "drizzle-orm";
import { DRIP_SEQUENCES } from "@/lib/notifications/drip-sequences";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";

export const runtime = "nodejs";

// ─── Constants ───

const BATCH_SIZE = 50;
const RETRY_DELAY_MS = 60 * 60 * 1000; // 1 hour on error
const MAX_CONSECUTIVE_FAILURES = 3;

// Meta opt-out error code returned when number has replied STOP
const WA_OPTED_OUT_ERROR_CODE = 131026;

// ─── GET /api/cron/whatsapp-drip ───

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

  // Query due WhatsApp drip enrollments
  let dueEnrollments: (typeof dripEnrollments.$inferSelect)[];
  try {
    dueEnrollments = await db
      .select()
      .from(dripEnrollments)
      .where(
        and(
          eq(dripEnrollments.channel, "whatsapp"),
          lte(dripEnrollments.nextFireAt, now),
          isNull(dripEnrollments.completedAt),
          isNull(dripEnrollments.cancelledAt),
        ),
      )
      .limit(BATCH_SIZE);
  } catch (err) {
    console.error("[whatsapp-drip] DB query failed:", err);
    return NextResponse.json({ error: "DB query failed" }, { status: 200 });
  }

  let sent = 0;
  let errors = 0;

  for (const enrollment of dueEnrollments) {
    try {
      await processEnrollment(enrollment, now);
      sent++;
    } catch (err) {
      console.error(`[whatsapp-drip] Failed enrollment ${enrollment.id}:`, err);
      errors++;
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
    recipientPhone,
    recipientName,
    preferredLocale,
    metadata: metadataRaw,
  } = enrollment;

  if (!recipientPhone) {
    console.warn(`[whatsapp-drip] No recipientPhone for enrollment ${id} — skipping`);
    return;
  }

  const metadata = metadataRaw
    ? (JSON.parse(metadataRaw) as Record<string, unknown>)
    : {};

  // ─── Expiry check for wa_challenge_prepay ───
  // If cohort start date has passed and enrollment is still active, send missed-it message.
  if (sequenceType === "wa_challenge_prepay" && metadata.cohortStartDate) {
    const cohortStart = new Date(metadata.cohortStartDate as string);
    if (cohortStart < now) {
      const sequence = DRIP_SEQUENCES[sequenceType];
      if (sequence) {
        // Last template in sequence is the "missed-it" message
        const lastTemplate = sequence.templates[sequence.templates.length - 1];
        const languageCode = preferredLocale === "he" ? "he" : "en_US";
        try {
          await sendWhatsAppTemplate({
            to: recipientPhone,
            templateName: lastTemplate.templateName,
            languageCode,
            bodyParams: [recipientName],
          });
        } catch (err) {
          console.error(`[whatsapp-drip] Missed-it send failed for ${id}:`, err);
        }
      }
      // Mark as completed with reason expired
      await db
        .update(dripEnrollments)
        .set({ completedAt: now, cancelledAt: now, cancelReason: "expired" })
        .where(eq(dripEnrollments.id, id));
      return;
    }
  }

  // ─── Determine template to send ───

  const sequence = DRIP_SEQUENCES[sequenceType];
  if (!sequence) {
    console.warn(`[whatsapp-drip] Unknown sequence type: ${sequenceType} for enrollment ${id}`);
    return;
  }

  const stepIndex = Math.min(currentStep, sequence.templates.length - 1);
  const template = sequence.templates[stepIndex];
  if (!template) {
    console.warn(`[whatsapp-drip] No template at step ${stepIndex} for sequence ${sequenceType}`);
    return;
  }

  // Language code: 'he' for Hebrew, 'en_US' for English
  const languageCode = preferredLocale === "he" ? "he" : "en_US";

  // Body params: first name personalization + any extra params from metadata
  const bodyParams: string[] = [recipientName];

  // Add cohort start date if metadata has it (for templates that show the date)
  if (metadata.cohortStartDate && typeof metadata.cohortStartDate === "string") {
    const dateStr = new Date(metadata.cohortStartDate).toLocaleDateString(
      preferredLocale === "he" ? "he-IL" : "en-GB",
      { day: "numeric", month: "long", year: "numeric" },
    );
    bodyParams.push(dateStr);
  }

  // ─── Send the WhatsApp template ───

  try {
    await sendWhatsAppTemplate({
      to: recipientPhone,
      templateName: template.templateName,
      languageCode,
      bodyParams,
    });
  } catch (err: unknown) {
    const errorStr = String(err);
    const errBody = errorStr.includes("{") ? errorStr : "";

    // Check for Meta opt-out error (number replied STOP)
    if (
      errorStr.includes(`"${WA_OPTED_OUT_ERROR_CODE}"`) ||
      errorStr.includes(`${WA_OPTED_OUT_ERROR_CODE}`)
    ) {
      console.warn(`[whatsapp-drip] Number opted out for enrollment ${id} — cancelling`);
      await db
        .update(dripEnrollments)
        .set({ cancelledAt: now, cancelReason: "opted_out" })
        .where(eq(dripEnrollments.id, id));
      return;
    }

    // Track consecutive failures via metadata
    const consecutiveFailures = ((metadata.consecutiveFailures as number) ?? 0) + 1;

    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      console.error(
        `[whatsapp-drip] ${MAX_CONSECUTIVE_FAILURES} consecutive failures for enrollment ${id} — cancelling`,
      );
      await db
        .update(dripEnrollments)
        .set({ cancelledAt: now, cancelReason: "error" })
        .where(eq(dripEnrollments.id, id));
      return;
    }

    // Retry in 1 hour with updated failure count
    const updatedMetadata = JSON.stringify({
      ...metadata,
      consecutiveFailures,
      lastError: errBody.substring(0, 200),
    });

    await db
      .update(dripEnrollments)
      .set({
        nextFireAt: new Date(Date.now() + RETRY_DELAY_MS),
        metadata: updatedMetadata,
      })
      .where(eq(dripEnrollments.id, id));

    throw new Error(`WhatsApp send failed (attempt ${consecutiveFailures}): ${err}`);
  }

  // ─── Success: advance step ───

  // Reset consecutive failure count on success
  const cleanMetadata = { ...metadata };
  delete cleanMetadata.consecutiveFailures;
  delete cleanMetadata.lastError;

  const nextStep = currentStep + 1;

  if (nextStep >= totalSteps) {
    // Sequence complete
    await db
      .update(dripEnrollments)
      .set({
        currentStep: nextStep,
        completedAt: now,
        nextFireAt: null,
        metadata: JSON.stringify(cleanMetadata),
      })
      .where(eq(dripEnrollments.id, id));
  } else {
    // Advance to next step — fire at tomorrow 19:00 Israel time (16:00 UTC) + spacingDays
    const spacingDays = sequence.spacingDays[nextStep] ?? 1;
    const prevSpacingDays = sequence.spacingDays[currentStep] ?? 0;
    const daysUntilNext = spacingDays - prevSpacingDays;

    const nextFireAt = computeNextFireAt(now, Math.max(daysUntilNext, 1));

    await db
      .update(dripEnrollments)
      .set({
        currentStep: nextStep,
        nextFireAt,
        metadata: JSON.stringify(cleanMetadata),
      })
      .where(eq(dripEnrollments.id, id));
  }
}

// ─── computeNextFireAt ───

/**
 * Compute the next fire time for a WhatsApp step.
 * Always fires at 19:00 Israel time (16:00 UTC in summer), N days from now.
 */
function computeNextFireAt(from: Date, daysAhead: number): Date {
  const next = new Date(from);
  next.setUTCDate(next.getUTCDate() + daysAhead);
  next.setUTCHours(16, 0, 0, 0); // 19:00 Israel = 16:00 UTC (summer +3)
  // If today is the same day and we've already passed 16:00 UTC, push to next day
  const sameDay =
    next.getUTCDate() === from.getUTCDate() &&
    next.getUTCMonth() === from.getUTCMonth() &&
    next.getUTCFullYear() === from.getUTCFullYear();
  if (sameDay && next <= from) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next;
}
