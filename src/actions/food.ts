'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-utils';
import { encryptFields, decryptFields } from '@/lib/privacy/encryption';
import { logAudit } from '@/lib/privacy/audit';

export async function addFoodEntry(data: {
  date: string;
  timestamp: number;
  mealType: string;
  description?: string;
  skipped?: boolean;
  foodItems?: any[];
  compounds?: any;
  mealRisk?: string | null;
  firstMealTime?: string;
  lastMealTime?: string;
  notes?: string;
}) {
  const user = await getAuthUser();
  const encrypted = encryptFields({ description: data.description || '' }, ['description']);

  const entry = await prisma.foodEntry.create({
    data: {
      userId: user.id,
      date: data.date,
      timestamp: BigInt(data.timestamp),
      mealType: data.mealType,
      description: encrypted.description,
      skipped: data.skipped ?? false,
      foodItems: data.foodItems ?? [],
      compounds: data.compounds ?? undefined,
      mealRisk: data.mealRisk ?? undefined,
      firstMealTime: data.firstMealTime,
      lastMealTime: data.lastMealTime,
      notes: data.notes ?? '',
    },
  });

  await logAudit({ userId: user.id, action: 'create', entity: 'food', entityId: entry.id });
  return serializeEntry(decryptFields(entry, ['description']));
}

export async function getFoodByDateRange(startDate: string, endDate: string) {
  const user = await getAuthUser();
  const entries = await prisma.foodEntry.findMany({
    where: { userId: user.id, date: { gte: startDate, lte: endDate } },
    orderBy: { date: 'asc' },
  });
  return entries.map((e: any) => serializeEntry(decryptFields(e, ['description'])));
}

export async function getRecentFood(days: number = 7) {
  const user = await getAuthUser();
  const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];
  return getFoodByDateRange(startDate, endDate + '\uffff');
}

function serializeEntry(entry: any) {
  return {
    ...entry,
    timestamp: Number(entry.timestamp),
    mealType: entry.mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    mealRisk: entry.mealRisk as 'low' | 'medium' | 'high' | null,
    foodItems: entry.foodItems as any[],
    compounds: entry.compounds as any,
  };
}
