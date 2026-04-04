import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizLeads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { calculateResult, getPersonalizedFears, calculateFitScore } from "@/lib/quiz/result-calculator";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
  }

  const rows = await db
    .select()
    .from(quizLeads)
    .where(eq(quizLeads.sessionId, sessionId))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const lead = rows[0];

  let answers: Record<string, string> = {};
  try {
    answers = JSON.parse(lead.answers) as Record<string, string>;
  } catch {
    return NextResponse.json({ error: "Invalid answer data" }, { status: 500 });
  }

  const result = calculateResult(answers);
  const personalizedFears = getPersonalizedFears(answers);
  const fitScore = calculateFitScore(answers);

  return NextResponse.json({
    ok: true,
    lead: {
      name: lead.name,
      city: lead.city,
      quizType: lead.quizType,
    },
    result,
    personalizedFears,
    fitScore,
  });
}
