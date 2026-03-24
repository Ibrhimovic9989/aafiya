'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-utils';

export async function saveFlareRisk(data: {
  date: string;
  score: number;
  level: string;
  factors: any[];
  recommendation: string;
}) {
  const user = await getAuthUser();
  return prisma.flareRiskEntry.create({
    data: {
      userId: user.id,
      date: data.date,
      score: data.score,
      level: data.level,
      factors: data.factors,
      recommendation: data.recommendation,
    },
  });
}

export async function getFlareRiskByDateRange(startDate: string, endDate: string) {
  const user = await getAuthUser();
  const entries = await prisma.flareRiskEntry.findMany({
    where: { userId: user.id, date: { gte: startDate, lte: endDate } },
    orderBy: { date: 'desc' },
  });
  return entries.map((e: any) => ({
    ...e,
    level: e.level as 'low' | 'watch' | 'elevated' | 'high',
    factors: e.factors as any[],
  }));
}
