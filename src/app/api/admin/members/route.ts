import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/admin-guard';
import { desc } from 'drizzle-orm';

// GET /api/admin/members — Returns all users for admin member management table
export async function GET() {
  const { error } = await getAdminSession();
  if (error) return error;

  const members = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      city: user.city,
      role: user.role,
      level: user.level,
      status: user.status,
      isJamHost: user.isJamHost,
      image: user.image,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt));

  return NextResponse.json({ members });
}
