import { db } from "@/lib/db";
import { quizLeads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { calculateResult, getPersonalizedFears, calculateFitScore } from "./result-calculator";
import type { ResultArchetype } from "./result-calculator";

export interface SessionResult {
  lead: { name: string; email: string; city: string | null; quizType: string };
  result: ResultArchetype;
  personalizedFears: Array<{ en: string; he: string }>;
  fitScore: number;
}

export async function getSessionResult(sessionId: string): Promise<SessionResult | null> {
  const rows = await db
    .select()
    .from(quizLeads)
    .where(eq(quizLeads.sessionId, sessionId))
    .limit(1);

  if (!rows.length) return null;

  const lead = rows[0];
  let answers: Record<string, string> = {};
  try {
    answers = JSON.parse(lead.answers) as Record<string, string>;
  } catch {
    return null;
  }

  return {
    lead: { name: lead.name, email: lead.email, city: lead.city, quizType: lead.quizType },
    result: calculateResult(answers),
    personalizedFears: getPersonalizedFears(answers),
    fitScore: calculateFitScore(answers),
  };
}
