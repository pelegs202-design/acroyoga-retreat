import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminAuditLog } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/admin-guard';
import { desc } from 'drizzle-orm';

// GET /api/admin/audit-log — Returns all admin audit log entries
export async function GET() {
  const { error } = await getAdminSession();
  if (error) return error;

  const entries = await db
    .select({
      id: adminAuditLog.id,
      adminEmail: adminAuditLog.adminEmail,
      action: adminAuditLog.action,
      targetType: adminAuditLog.targetType,
      targetId: adminAuditLog.targetId,
      metadata: adminAuditLog.metadata,
      performedAt: adminAuditLog.performedAt,
    })
    .from(adminAuditLog)
    .orderBy(desc(adminAuditLog.performedAt));

  return NextResponse.json({ entries });
}
