import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { quizLeads } from "@/lib/db/schema";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const WorkshopPayloadSchema = z.object({
  sessionId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  answers: z.object({
    "group-type": z.string().min(1),
    "group-details": z.string().min(1),
    "preferred-dates": z.string().optional().default(""),
    "special-requests": z.string().optional().default(""),
  }),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = WorkshopPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { sessionId, name, email, phone, answers } = parsed.data;

  // Insert lead into DB
  try {
    await db.insert(quizLeads).values({
      id: crypto.randomUUID(),
      sessionId,
      quizType: "workshop",
      name,
      email,
      phone,
      answers: JSON.stringify(answers),
      resultType: null,
      city: null,
    });
  } catch (err) {
    // 23505 = unique violation — duplicate session ID, already saved
    const pgErr = err as { code?: string };
    if (pgErr?.code !== "23505") {
      console.error("[quiz/workshop] DB insert error:", err);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    // Duplicate — fall through, still send email
  }

  // Send owner notification email (non-blocking — lead is already saved)
  if (resend) {
    resend.emails
      .send({
        from: "AcroHavura <noreply@acrohavura.com>",
        to: process.env.OWNER_EMAIL ?? "shai@acrohavura.com",
        subject: `New Workshop Inquiry from ${name}`,
        html: `<h2>New Workshop Inquiry</h2>
               <p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Phone:</strong> ${phone}</p>
               <p><strong>Group Type:</strong> ${answers["group-type"] ?? "N/A"}</p>
               <p><strong>Group Size:</strong> ${answers["group-details"] ?? "N/A"}</p>
               <p><strong>Preferred Dates:</strong> ${answers["preferred-dates"] || "Not specified"}</p>
               <p><strong>Special Requests:</strong> ${answers["special-requests"] || "None"}</p>
               <p><em>Reply directly to this email or contact via WhatsApp.</em></p>`,
      })
      .catch((err) => {
        // Email failure is non-blocking — lead is already saved
        console.error("[quiz/workshop] Resend error:", err);
      });
  }

  // TODO: Phase 7 — WhatsApp notification

  return NextResponse.json({ ok: true });
}
