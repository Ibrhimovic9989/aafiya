'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-utils';
import { encryptFields, decryptFields } from '@/lib/privacy/encryption';
import { logAudit } from '@/lib/privacy/audit';

export async function addMoodEntry(data: {
  date: string;
  timestamp: number;
  mood?: number;
  energy?: number;
  stress?: number;
  anxiety?: number;
  notes?: string;
}) {
  const user = await getAuthUser();
  const encrypted = encryptFields({ notes: data.notes || '' }, ['notes']);

  const entry = await prisma.moodEntry.create({
    data: {
      userId: user.id,
      date: data.date,
      timestamp: BigInt(data.timestamp),
      mood: data.mood ?? 5,
      energy: data.energy ?? 5,
      stress: data.stress ?? 3,
      anxiety: data.anxiety ?? 3,
      notes: encrypted.notes,
    },
  });

  await logAudit({ userId: user.id, action: 'create', entity: 'mood', entityId: entry.id });
  return { ...entry, timestamp: Number(entry.timestamp), notes: data.notes || '' };
}

export async function getMoodByDateRange(startDate: string, endDate: string) {
  const user = await getAuthUser();
  const entries = await prisma.moodEntry.findMany({
    where: { userId: user.id, date: { gte: startDate, lte: endDate } },
    orderBy: { date: 'asc' },
  });
  return entries.map((e: any) => ({
    ...decryptFields(e, ['notes']),
    timestamp: Number(e.timestamp),
  }));
}

export async function getRecentMood(days: number = 7) {
  const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];
  return getMoodByDateRange(startDate, endDate + '\uffff');
}
