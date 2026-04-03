import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  jamSessions,
  jamAttendees,
  user,
  notificationPreferences,
  challengeEnrollments,
  quizLeads,
} from "@/lib/db/schema";
import { and, desc, eq, gte, lt } from "drizzle-orm";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";
import { sendTransactionalEmail } from "@/lib/email";
import SessionReminder from "@/lib/email/templates/SessionReminder";
import { createElement } from "react";

export const runtime = "nodejs";

// ─── GET /api/cron/jam-reminders ───
//
// Runs twice daily (Vercel cron schedule in vercel.json):
//   05:00 UTC = 08:00 Israel → "morning of" reminder (sessions today)
//   15:00 UTC = 18:00 Israel → "day before" reminder  (sessions tomorrow)
//
// Channel overlap is intentional: both WhatsApp AND email always send.

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
  const utcHour = now.getUTCHours();

  // Determine reminder window based on current UTC hour
  // ~05 UTC (08:00 IL) → morning-of (sessions TODAY)
  // ~15 UTC (18:00 IL) → day-before (sessions TOMORROW)
  const isEveReminder = utcHour >= 12; // 15:00 UTC is afternoon → day-before
  const targetDate = new Date(now);
  if (isEveReminder) {
    // Remind about sessions tomorrow
    targetDate.setUTCDate(targetDate.getUTCDate() + 1);
  }
  // else: remind about sessions today (targetDate = now)

  // Target day window: from 00:00 to 23:59:59 UTC on the target date
  const dayStart = new Date(
    Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate(),
      0,
      0,
      0,
    ),
  );
  const dayEnd = new Date(
    Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate(),
      23,
      59,
      59,
    ),
  );

  // Query jam sessions scheduled on the target date
  let sessions: (typeof jamSessions.$inferSelect)[];
  try {
    sessions = await db
      .select()
      .from(jamSessions)
      .where(
        and(
          gte(jamSessions.scheduledAt, dayStart),
          lt(jamSessions.scheduledAt, dayEnd),
        ),
      );
  } catch (err) {
    console.error("[jam-reminders] DB query failed:", err);
    return NextResponse.json({ error: "DB query failed" }, { status: 200 });
  }

  if (sessions.length === 0) {
    return NextResponse.json({ processed: 0, sent: 0, errors: 0 });
  }

  let sent = 0;
  let errors = 0;

  for (const jam of sessions) {
    // Get confirmed attendees for this jam
    const attendees = await db
      .select({
        userId: jamAttendees.userId,
        status: jamAttendees.status,
      })
      .from(jamAttendees)
      .where(
        and(
          eq(jamAttendees.jamId, jam.id),
          eq(jamAttendees.status, "confirmed"),
        ),
      )
      .catch(() => []);

    for (const attendee of attendees) {
      try {
        // Fetch user details
        const [attendeeUser] = await db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            preferredLocale: user.preferredLocale,
          })
          .from(user)
          .where(eq(user.id, attendee.userId))
          .limit(1);

        if (!attendeeUser) continue;

        // Check notification preferences
        const prefs = await db.query.notificationPreferences
          .findFirst({ where: eq(notificationPreferences.userId, attendee.userId) })
          .catch(() => null);

        const whatsappEnabled = prefs?.whatsappEnabled ?? true;

        const locale = (attendeeUser.preferredLocale === "en" ? "en" : "he") as
          | "he"
          | "en";
        const firstName = attendeeUser.name.split(" ")[0] ?? attendeeUser.name;

        // Format session date/time
        const sessionDateObj = new Date(jam.scheduledAt);
        const sessionDate = sessionDateObj.toLocaleDateString(
          locale === "he" ? "he-IL" : "en-GB",
          { weekday: "long", year: "numeric", month: "long", day: "numeric" },
        );
        const sessionTime = sessionDateObj.toLocaleTimeString(
          locale === "he" ? "he-IL" : "en-GB",
          { hour: "2-digit", minute: "2-digit", hour12: false },
        );
        const location = jam.location;

        // ─── WhatsApp reminder ───
        if (whatsappEnabled) {
          // Look up phone from challengeEnrollments (paid) or quizLeads (quiz taker) by email
          const waTemplateName =
            locale === "he"
              ? isEveReminder
                ? "session_reminder_eve_he"
                : "session_reminder_morning_he"
              : isEveReminder
                ? "session_reminder_eve_en"
                : "session_reminder_morning_en";

          // Primary: most recent confirmed enrollment for this email
          let userPhone: string | null | undefined;
          const [enrollmentRow] = await db
            .select({ customerPhone: challengeEnrollments.customerPhone })
            .from(challengeEnrollments)
            .where(
              and(
                eq(challengeEnrollments.customerEmail, attendeeUser.email),
                eq(challengeEnrollments.status, "confirmed"),
              ),
            )
            .orderBy(desc(challengeEnrollments.paidAt))
            .limit(1)
            .catch(() => []);
          userPhone = enrollmentRow?.customerPhone;

          // Fallback: most recent quiz lead for this email
          if (!userPhone) {
            const [leadRow] = await db
              .select({ phone: quizLeads.phone })
              .from(quizLeads)
              .where(eq(quizLeads.email, attendeeUser.email))
              .orderBy(desc(quizLeads.createdAt))
              .limit(1)
              .catch(() => []);
            userPhone = leadRow?.phone;
          }

          if (userPhone) {
            await sendWhatsAppTemplate({
              to: userPhone,
              templateName: waTemplateName,
              languageCode: locale === "he" ? "he" : "en_US",
              bodyParams: [firstName, sessionDate, sessionTime, location],
            }).catch((err) => {
              console.error(
                `[jam-reminders] WhatsApp send failed for user ${attendeeUser.id}:`,
                err,
              );
            });
          }
        }

        // ─── Email reminder ───
        // Always send email — channel overlap intentional per locked decision.
        const emailSubject =
          locale === "he"
            ? isEveReminder
              ? `מחר ב-${sessionTime} — מוכן לאתגר?`
              : `היום ב-${sessionTime} — הגיע הזמן!`
            : isEveReminder
              ? `Tomorrow at ${sessionTime} — ready?`
              : `Today at ${sessionTime} — it's time!`;

        const reactEl = createElement(SessionReminder, {
          name: firstName,
          sessionDate,
          sessionTime,
          city: location,
          isEve: isEveReminder,
          locale,
        });

        await sendTransactionalEmail({
          to: attendeeUser.email,
          subject: emailSubject,
          react: reactEl,
        }).catch((err) => {
          console.error(
            `[jam-reminders] Email send failed for user ${attendeeUser.id}:`,
            err,
          );
        });

        sent++;
      } catch (err) {
        console.error(
          `[jam-reminders] Error processing attendee ${attendee.userId} for jam ${jam.id}:`,
          err,
        );
        errors++;
      }
    }
  }

  return NextResponse.json({
    processed: sessions.length,
    sent,
    errors,
  });
}
