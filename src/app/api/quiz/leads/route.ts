import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { quizLeads } from "@/lib/db/schema";
import { enrollInDrip } from "@/lib/notifications";
import { normalizeIsraeliPhone } from "@/lib/whatsapp";
import { nextMonday } from "@/lib/green-invoice/client";
import { sendFacebookEvent } from "@/lib/facebook-capi";

const bodySchema = z.object({
  sessionId: z.string().min(1),
  quizType: z.enum(["challenge", "workshop"]),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/, "Phone must include country code, e.g. +972541234567"),
  answers: z.string().min(1),
  resultType: z.string().optional(),
  city: z.string().optional(),
  fbclid: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation error" },
      { status: 422 },
    );
  }

  const { sessionId, quizType, name, email, phone, answers, resultType, city, fbclid } = parsed.data;

  // Ensure answers is a valid JSON string
  const answersStr = typeof answers === "string" ? answers : JSON.stringify(answers);

  let leadId: string;
  try {
    leadId = crypto.randomUUID();
    await db.insert(quizLeads).values({
      id: leadId,
      sessionId,
      quizType,
      name,
      email,
      phone,
      answers: answersStr,
      resultType: resultType ?? null,
      city: city ?? null,
    });
  } catch (err: unknown) {
    // Idempotent: if sessionId already exists (unique constraint), return ok
    const pgErr = err as { code?: string };
    if (pgErr?.code === "23505") {
      return NextResponse.json({ ok: true, sessionId });
    }
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }

  // ─── Facebook CAPI: Lead event (non-blocking) ───
  sendFacebookEvent({
    eventName: "Lead",
    email,
    phone,
    fbclid: fbclid || undefined,
    eventId: `lead_${sessionId}`,
  }).catch((err) => console.error("[quiz/leads] FB CAPI Lead failed:", err));

  // ─── Drip enrollment (non-blocking) ───
  // Detect locale from phone country code (+972 = Hebrew, otherwise English)
  const detectedLocale = phone.startsWith("+972") || phone.startsWith("972") ? "he" : "en";
  const firstName = name.split(" ")[0] ?? name;
  const normalizedPhone = normalizeIsraeliPhone(phone);

  try {
    if (quizType === "challenge") {
      // Enroll in WhatsApp warm-up drip
      const nextCohortDate = nextMonday(new Date());
      await enrollInDrip({
        leadId,
        sequenceType: "wa_challenge_prepay",
        channel: "whatsapp",
        recipientPhone: normalizedPhone,
        recipientName: firstName,
        preferredLocale: detectedLocale,
        metadata: { cohortStartDate: nextCohortDate.toISOString() },
      });

      // Also enroll in email nurture
      await enrollInDrip({
        leadId,
        sequenceType: "email_nurture",
        channel: "email",
        recipientEmail: email,
        recipientName: firstName,
        preferredLocale: detectedLocale,
        metadata: { archetype: resultType ?? "Explorer" },
      });
    } else if (quizType === "workshop") {
      // Enroll in WhatsApp workshop drip (3-message sequence)
      await enrollInDrip({
        leadId,
        sequenceType: "wa_workshop",
        channel: "whatsapp",
        recipientPhone: normalizedPhone,
        recipientName: firstName,
        preferredLocale: detectedLocale,
      });
    }
  } catch (err) {
    // Non-blocking — log and continue; lead is already saved
    console.error("[quiz/leads] Drip enrollment failed (non-blocking):", err);
  }

  return NextResponse.json({ ok: true, sessionId });
}
