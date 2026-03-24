'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-utils';
import { logAudit } from '@/lib/privacy/audit';

export async function addSleepEntry(data: {
  date: string;
  bedtime: string;
  wakeTime: string;
  duration: number;
  quality: number;
  socialJetLagMinutes?: number;
  circadianScore?: number;
  targetBedtime?: string;
  metTarget?: boolean;
}) {
  const user = await getAuthUser();
  const entry = await prisma.sleepEntry.create({
    data: {
      userId: user.id,
      date: data.date,
      bedtime: data.bedtime,
      wakeTime: data.wakeTime,
      duration: data.duration,
      quality: data.quality,
      socialJetLagMinutes: data.socialJetLagMinutes ?? 0,
      circadianScore: data.circadianScore ?? 0,
      targetBedtime: data.targetBedtime ?? '22:00',
      metTarget: data.metTarget ?? false,
    },
  });

  await logAudit({ userId: user.id, action: 'create', entity: 'sleep', entityId: entry.id });
  return entry;
}

export async function getSleepByDateRange(startDate: string, endDate: string) {
  const user = await getAuthUser();
  return prisma.sleepEntry.findMany({
    where: { userId: user.id, date: { gte: startDate, lte: endDate } },
    orderBy: { date: 'asc' },
  });
}

export async function getRecentSleep(days: number = 7) {
  const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];
  return getSleepByDateRange(startDate, endDate + '\uffff');
}
