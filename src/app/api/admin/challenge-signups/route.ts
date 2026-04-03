import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { challengeEnrollments, quizLeads } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/admin-guard';
import { eq, desc } from 'drizzle-orm';

// GET /api/admin/challenge-signups — Returns all challenge enrollments joined with quiz archetype
export async function GET() {
  const { error } = await getAdminSession();
  if (error) return error;

  const signups = await db
    .select({
      enrollmentId: challengeEnrollments.id,
      customerName: challengeEnrollments.customerName,
      customerEmail: challengeEnrollments.customerEmail,
      customerPhone: challengeEnrollments.customerPhone,
      amountPaid: challengeEnrollments.amountPaid,
      status: challengeEnrollments.status,
      paidAt: challengeEnrollments.paidAt,
      cohortStartDate: challengeEnrollments.cohortStartDate,
      archetype: quizLeads.resultType,
    })
    .from(challengeEnrollments)
    .leftJoin(quizLeads, eq(quizLeads.sessionId, challengeEnrollments.sessionId))
    .orderBy(desc(challengeEnrollments.paidAt));

  return NextResponse.json({ signups });
}
