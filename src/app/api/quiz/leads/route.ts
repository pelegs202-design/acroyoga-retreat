import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { quizLeads } from "@/lib/db/schema";

const bodySchema = z.object({
  sessionId: z.string().min(1),
  quizType: z.enum(["challenge", "workshop"]),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/, "Phone must include country code, e.g. +972541234567"),
  answers: z.string().min(1),
  resultType: z.string().optional(),
  city: z.string().optional(),
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

  const { sessionId, quizType, name, email, phone, answers, resultType, city } = parsed.data;

  // Ensure answers is a valid JSON string
  const answersStr = typeof answers === "string" ? answers : JSON.stringify(answers);

  try {
    await db.insert(quizLeads).values({
      id: crypto.randomUUID(),
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

  return NextResponse.json({ ok: true, sessionId });
}
