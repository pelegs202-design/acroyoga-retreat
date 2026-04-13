import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizLeads, quizEvents, challengeEnrollments } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin-guard";

export async function GET() {
  const { error } = await getAdminSession();
  if (error) return error;

  // Run all 8 queries concurrently
  const [
    [sessionsStarted],
    [leadsSubmitted],
    [paymentsMade],
    questionCounts,
    answerDist,
    stepTimings,
    archetypes,
    recentLeads,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(distinct session_id)` }).from(quizEvents).where(eq(quizEvents.quizType, "challenge")),
    db.select({ count: sql<number>`count(*)` }).from(quizLeads).where(eq(quizLeads.quizType, "challenge")),
    db.select({ count: sql<number>`count(*)`, revenue: sql<number>`coalesce(sum(amount_paid), 0)` }).from(challengeEnrollments).where(eq(challengeEnrollments.status, "confirmed")),
    db.select({ questionId: quizEvents.questionId, sessions: sql<number>`count(distinct session_id)` }).from(quizEvents).where(eq(quizEvents.quizType, "challenge")).groupBy(quizEvents.questionId),
    db.select({ questionId: quizEvents.questionId, answer: quizEvents.answer, count: sql<number>`count(*)` }).from(quizEvents).where(eq(quizEvents.quizType, "challenge")).groupBy(quizEvents.questionId, quizEvents.answer),
    db.execute(sql`
      WITH step_gaps AS (
        SELECT session_id, question_id, created_at,
          LAG(created_at) OVER (PARTITION BY session_id ORDER BY created_at) AS prev_at
        FROM quiz_events WHERE quiz_type = 'challenge'
      )
      SELECT question_id,
        ROUND(AVG(EXTRACT(EPOCH FROM (created_at - prev_at))))::int AS avg_seconds,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (created_at - prev_at))))::int AS median_seconds,
        MAX(EXTRACT(EPOCH FROM (created_at - prev_at)))::int AS max_seconds,
        COUNT(*) AS sample_size
      FROM step_gaps WHERE prev_at IS NOT NULL
      GROUP BY question_id ORDER BY MIN(created_at)
    `),
    db.select({ resultType: quizLeads.resultType, count: sql<number>`count(*)` }).from(quizLeads).where(eq(quizLeads.quizType, "challenge")).groupBy(quizLeads.resultType),
    db.select({ name: quizLeads.name, email: quizLeads.email, phone: quizLeads.phone, answers: quizLeads.answers, resultType: quizLeads.resultType, city: quizLeads.city, createdAt: quizLeads.createdAt, sessionId: quizLeads.sessionId }).from(quizLeads).where(eq(quizLeads.quizType, "challenge")).orderBy(desc(quizLeads.createdAt)).limit(20),
  ]);

  // Build question order for funnel
  const questionOrder = [
    "superpower", "movie-role", "experience",
    "city", "commitment", "availability", "dream-outcome",
    "biggest-fear", "fitness",
  ];

  const questionCountMap: Record<string, number> = {};
  questionCounts.forEach((q) => {
    questionCountMap[q.questionId] = Number(q.sessions);
  });

  const funnel = questionOrder.map((qId, i) => ({
    questionId: qId,
    sessions: questionCountMap[qId] ?? 0,
    dropOff:
      i > 0
        ? questionCountMap[questionOrder[i - 1]]
          ? Math.round(
              ((questionCountMap[questionOrder[i - 1]] -
                (questionCountMap[qId] ?? 0)) /
                questionCountMap[questionOrder[i - 1]]) *
                100
            )
          : 0
        : 0,
  }));

  // Answer distribution grouped by question
  const answersByQuestion: Record<string, Array<{ answer: string; count: number }>> = {};
  answerDist.forEach((a) => {
    if (!answersByQuestion[a.questionId]) answersByQuestion[a.questionId] = [];
    answersByQuestion[a.questionId].push({ answer: a.answer ?? "null", count: Number(a.count) });
  });

  return NextResponse.json({
    overview: {
      sessionsStarted: Number(sessionsStarted?.count ?? 0),
      leadsSubmitted: Number(leadsSubmitted?.count ?? 0),
      paymentsMade: Number(paymentsMade?.count ?? 0),
      revenue: Number(paymentsMade?.revenue ?? 0),
      quizCompletionRate:
        Number(sessionsStarted?.count) > 0
          ? Math.round((Number(leadsSubmitted?.count ?? 0) / Number(sessionsStarted?.count)) * 100)
          : 0,
      paymentConversionRate:
        Number(leadsSubmitted?.count) > 0
          ? Math.round((Number(paymentsMade?.count ?? 0) / Number(leadsSubmitted?.count ?? 1)) * 100)
          : 0,
    },
    funnel,
    answersByQuestion,
    stepTimings: stepTimings.rows,
    archetypes: archetypes.map((a) => ({ type: a.resultType, count: Number(a.count) })),
    recentLeads: recentLeads.map((l) => ({
      ...l,
      answers: (() => { try { return JSON.parse(l.answers); } catch { return {}; } })(),
    })),
  });
}
