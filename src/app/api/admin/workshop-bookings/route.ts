import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quizLeads, workshopBookings } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/admin-guard';
import { eq, desc } from 'drizzle-orm';

// GET /api/admin/workshop-bookings — Returns workshop quiz leads joined with booking status
export async function GET() {
  const { error } = await getAdminSession();
  if (error) return error;

  const bookings = await db
    .select({
      id: quizLeads.id,
      name: quizLeads.name,
      email: quizLeads.email,
      phone: quizLeads.phone,
      city: quizLeads.city,
      answers: quizLeads.answers,
      createdAt: quizLeads.createdAt,
      contactStatus: workshopBookings.contactStatus,
      adminNotes: workshopBookings.adminNotes,
    })
    .from(quizLeads)
    .leftJoin(workshopBookings, eq(workshopBookings.leadId, quizLeads.id))
    .where(eq(quizLeads.quizType, 'workshop'))
    .orderBy(desc(quizLeads.createdAt));

  // Normalise: contactStatus defaults to 'new' when no booking row exists yet
  const normalised = bookings.map(b => ({
    ...b,
    contactStatus: b.contactStatus ?? 'new',
  }));

  return NextResponse.json({ bookings: normalised });
}
