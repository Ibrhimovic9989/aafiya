import { prisma } from '@/lib/prisma';
import { decryptFields } from './encryption';
import { logAudit } from './audit';

/** GDPR Article 15 — Right of Access: Export all user data as JSON */
export async function exportUserData(userId: string): Promise<Record<string, any>> {
  await logAudit({ userId, action: 'export', entity: 'all', details: 'Full data export requested' });

  const [
    profile,
    symptoms,
    food,
    sleep,
    medications,
    cycle,
    mood,
    experiments,
    flareRisks,
    chatMessages,
    triggers,
    predictionFeedback,
    learnedWeights,
    insights,
    consents,
    auditLogs,
  ] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.symptomEntry.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
    prisma.foodEntry.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
    prisma.sleepEntry.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
    prisma.medicationEntry.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
    prisma.cycleEntry.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
    prisma.moodEntry.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
    prisma.experiment.findMany({ where: { userId } }),
    prisma.flareRiskEntry.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
    prisma.chatMessage.findMany({ where: { userId }, orderBy: { timestamp: 'desc' } }),
    prisma.personalTrigger.findMany({ where: { userId } }),
    prisma.predictionFeedback.findMany({ where: { userId } }),
    prisma.learnedWeights.findUnique({ where: { userId } }),
    prisma.personalInsight.findMany({ where: { userId } }),
    prisma.consentRecord.findMany({ where: { userId }, orderBy: { grantedAt: 'desc' } }),
    prisma.auditLog.findMany({ where: { userId }, orderBy: { timestamp: 'desc' }, take: 1000 }),
  ]);

  // Decrypt sensitive fields before export
  const decryptedProfile = profile ? decryptFields(profile, ['diagnosis', 'doctorName', 'doctorContact']) : null;
  const decryptedChat = chatMessages.map(m => decryptFields(m, ['content']));
  const decryptedFood = food.map(f => decryptFields(f, ['description']));
  const decryptedMeds = medications.map(m => decryptFields(m, ['medication']));
  const decryptedMood = mood.map(m => decryptFields(m, ['notes']));

  return {
    exportDate: new Date().toISOString(),
    exportVersion: '1.0',
    dataController: 'Aafiya Health App',
    profile: decryptedProfile,
    symptoms,
    food: decryptedFood,
    sleep,
    medications: decryptedMeds,
    cycle,
    mood: decryptedMood,
    experiments,
    flareRisks,
    chatMessages: decryptedChat,
    triggers,
    predictionFeedback,
    learnedWeights,
    insights,
    consents,
    auditLogs,
  };
}

/** GDPR Article 17 — Right to Erasure: Delete all user data */
export async function deleteAllUserData(userId: string): Promise<void> {
  await logAudit({ userId, action: 'delete', entity: 'all', details: 'Full data deletion requested (Right to Erasure)' });

  // Delete in order to respect foreign key constraints
  await prisma.$transaction([
    prisma.auditLog.deleteMany({ where: { userId } }),
    prisma.consentRecord.deleteMany({ where: { userId } }),
    prisma.personalInsight.deleteMany({ where: { userId } }),
    prisma.learnedWeights.deleteMany({ where: { userId } }),
    prisma.predictionFeedback.deleteMany({ where: { userId } }),
    prisma.personalTrigger.deleteMany({ where: { userId } }),
    prisma.chatMessage.deleteMany({ where: { userId } }),
    prisma.flareRiskEntry.deleteMany({ where: { userId } }),
    prisma.experiment.deleteMany({ where: { userId } }),
    prisma.moodEntry.deleteMany({ where: { userId } }),
    prisma.cycleEntry.deleteMany({ where: { userId } }),
    prisma.medicationEntry.deleteMany({ where: { userId } }),
    prisma.sleepEntry.deleteMany({ where: { userId } }),
    prisma.foodEntry.deleteMany({ where: { userId } }),
    prisma.symptomEntry.deleteMany({ where: { userId } }),
    prisma.userProfile.deleteMany({ where: { userId } }),
    prisma.session.deleteMany({ where: { userId } }),
    prisma.account.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);
}

/** GDPR Article 16 — Right to Rectification: handled by normal update operations */

/** Data retention: get data older than retention period */
export async function getDataRetentionStats(userId: string): Promise<{
  totalRecords: number;
  oldestDate: string | null;
  newestDate: string | null;
}> {
  const [symptoms, food, sleep] = await Promise.all([
    prisma.symptomEntry.aggregate({ where: { userId }, _count: true, _min: { date: true }, _max: { date: true } }),
    prisma.foodEntry.aggregate({ where: { userId }, _count: true, _min: { date: true }, _max: { date: true } }),
    prisma.sleepEntry.aggregate({ where: { userId }, _count: true, _min: { date: true }, _max: { date: true } }),
  ]);

  const total = (symptoms._count || 0) + (food._count || 0) + (sleep._count || 0);
  const dates = [symptoms._min.date, food._min.date, sleep._min.date].filter(Boolean) as string[];
  const maxDates = [symptoms._max.date, food._max.date, sleep._max.date].filter(Boolean) as string[];

  return {
    totalRecords: total,
    oldestDate: dates.length > 0 ? dates.sort()[0] : null,
    newestDate: maxDates.length > 0 ? maxDates.sort().reverse()[0] : null,
  };
}
