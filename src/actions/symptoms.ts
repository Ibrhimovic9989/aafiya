'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-utils';
import { logAudit } from '@/lib/privacy/audit';

export async function addSymptom(data: {
  date: string;
  timestamp: number;
  conditionId?: string;
  generalWellbeing?: number;
  painLevel?: number;
  fatigue?: number;
  fever?: boolean;
  complications?: string[];
  activityScore?: number;
  secondaryScore?: number;
  scoringComponents?: Record<string, number>;
  painLocation?: string;
  liquidStools?: number;
  abdominalMass?: number;
  bowelFrequency?: number;
  bristolScale?: number;
  blood?: string;
  urgency?: number;
  nausea?: number;
  jointPain?: number;
  morningStiffness?: number;
  swollenJoints?: number;
  tenderJoints?: number;
  skinSeverity?: number;
  bodyAreaAffected?: number;
  itching?: number;
  numbnessTingling?: number;
  visionIssues?: number;
  balanceIssues?: number;
  cognitiveFunction?: number;
  coldSensitivity?: number;
  weightChange?: number;
  bloodSugar?: number;
  insulinDoses?: number;
  hbiScore?: number;
  cdaiEstimate?: number;
}) {
  const user = await getAuthUser();
  const entry = await prisma.symptomEntry.create({
    data: {
      userId: user.id,
      date: data.date,
      timestamp: BigInt(data.timestamp),
      conditionId: data.conditionId,
      generalWellbeing: data.generalWellbeing ?? 0,
      painLevel: data.painLevel ?? 0,
      fatigue: data.fatigue ?? 0,
      fever: data.fever ?? false,
      complications: data.complications ?? [],
      activityScore: data.activityScore,
      secondaryScore: data.secondaryScore,
      scoringComponents: data.scoringComponents ?? undefined,
      painLocation: data.painLocation,
      liquidStools: data.liquidStools,
      abdominalMass: data.abdominalMass,
      bowelFrequency: data.bowelFrequency,
      bristolScale: data.bristolScale,
      blood: data.blood,
      urgency: data.urgency,
      nausea: data.nausea,
      jointPain: data.jointPain,
      morningStiffness: data.morningStiffness,
      swollenJoints: data.swollenJoints,
      tenderJoints: data.tenderJoints,
      skinSeverity: data.skinSeverity,
      bodyAreaAffected: data.bodyAreaAffected,
      itching: data.itching,
      numbnessTingling: data.numbnessTingling,
      visionIssues: data.visionIssues,
      balanceIssues: data.balanceIssues,
      cognitiveFunction: data.cognitiveFunction,
      coldSensitivity: data.coldSensitivity,
      weightChange: data.weightChange,
      bloodSugar: data.bloodSugar,
      insulinDoses: data.insulinDoses,
      hbiScore: data.hbiScore ?? 0,
      cdaiEstimate: data.cdaiEstimate ?? 0,
    },
  });

  await logAudit({ userId: user.id, action: 'create', entity: 'symptoms', entityId: entry.id });
  return serializeEntry(entry);
}

export async function getSymptomsByDateRange(startDate: string, endDate: string) {
  const user = await getAuthUser();
  const entries = await prisma.symptomEntry.findMany({
    where: { userId: user.id, date: { gte: startDate, lte: endDate } },
    orderBy: { date: 'asc' },
  });
  return entries.map(serializeEntry);
}

export async function getSymptomsByTimestamp(startDate: string, endDate: string) {
  const user = await getAuthUser();
  const entries = await prisma.symptomEntry.findMany({
    where: { userId: user.id, date: { gte: startDate, lte: endDate } },
    orderBy: { timestamp: 'desc' },
  });
  return entries.map(serializeEntry);
}

export async function getRecentSymptoms(days: number = 7) {
  const user = await getAuthUser();
  const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];
  return getSymptomsByDateRange(startDate, endDate + '\uffff');
}

// Serialize BigInt to number for JSON transport
function serializeEntry(entry: any) {
  return {
    ...entry,
    timestamp: Number(entry.timestamp),
  };
}
