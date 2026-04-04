import { NextRequest, NextResponse } from "next/server";
import { getSessionResult } from "@/lib/quiz/get-session-result";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
  }

  const data = await getSessionResult(sessionId);
  if (!data) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    lead: {
      name: data.lead.name,
      city: data.lead.city,
      quizType: data.lead.quizType,
    },
    result: data.result,
    personalizedFears: data.personalizedFears,
    fitScore: data.fitScore,
  });
}
