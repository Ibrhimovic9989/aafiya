import { prisma } from '@/lib/prisma';

export type AuditAction = 'create' | 'read' | 'update' | 'delete' | 'export' | 'login' | 'consent_change';

export async function logAudit(params: {
  userId: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (err) {
    // Audit logging should never block the main operation
    console.error('Audit log failed:', err);
  }
}

export async function getAuditLogs(
  userId: string,
  options?: { action?: AuditAction; entity?: string; limit?: number; offset?: number }
) {
  return prisma.auditLog.findMany({
    where: {
      userId,
      ...(options?.action && { action: options.action }),
      ...(options?.entity && { entity: options.entity }),
    },
    orderBy: { timestamp: 'desc' },
    take: options?.limit ?? 100,
    skip: options?.offset ?? 0,
  });
}
