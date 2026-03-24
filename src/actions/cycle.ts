'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-utils';
import { logAudit } from '@/lib/privacy/audit';

export async function addCycleEntry(data: {
  date: string;
  cycleDay: number;
  phase: string;
  flowIntensity?: number;
  pain?: number;
  notes?: string;
}) {
  const user = await getAuthUser();
  const entry = await prisma.cycleEntry.create({
    data: {
      userId: user.id,
      date: data.date,
      cycleDay: data.cycleDay,
      phase: data.phase,
      flowIntensity: data.flowIntensity ?? 0,
      pain: data.pain ?? 0,
      notes: data.notes ?? '',
    },
  });

  await logAudit({ userId: user.id, action: 'create', entity: 'cycle', entityId: entry.id });
  return entry;
}

export async function getCycleByDateRange(startDate: string, endDate: string) {
  const user = await getAuthUser();
  return prisma.cycleEntry.findMany({
    where: { userId: user.id, date: { gte: startDate, lte: endDate } },
    orderBy: { date: 'asc' },
  });
}

export async function getRecentCycle(days: number = 30) {
  const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];
  return getCycleByDateRange(startDate, endDate + '\uffff');
}
