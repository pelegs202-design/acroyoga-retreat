import { db } from '@/lib/db';
import { adminAuditLog } from '@/lib/db/schema';

export async function writeAuditLog(
  adminEmail: string,
  action: string,
  targetType: string,
  targetId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await db.insert(adminAuditLog).values({
    id: crypto.randomUUID(),
    adminEmail,
    action,
    targetType,
    targetId,
    metadata: metadata ? JSON.stringify(metadata) : null,
    performedAt: new Date(),
  });
}
