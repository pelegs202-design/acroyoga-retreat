import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { quizEvents } from "@/lib/db/schema";

const bodySchema = z.object({
  sessionId: z.string().min(1),
  quizType: z.string().min(1),
  questionId: z.string().min(1),
  eventType: z.enum(["view", "answer", "abandon"]),
  answer: z.string().optional(),
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

  const { sessionId, quizType, questionId, eventType, answer } = parsed.data;

  try {
    await db.insert(quizEvents).values({
      id: crypto.randomUUID(),
      sessionId,
      quizType,
      questionId,
      eventType,
      answer: answer ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to save event" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
