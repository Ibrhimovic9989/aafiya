'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-utils';
import { encryptFields, decryptFields } from '@/lib/privacy/encryption';
import { logAudit } from '@/lib/privacy/audit';

export async function addMedicationEntry(data: {
  date: string;
  medication: string;
  dosage?: string;
  taken?: boolean;
  time?: string;
  notes?: string;
}) {
  const user = await getAuthUser();
  const encrypted = encryptFields({ medication: data.medication }, ['medication']);

  const entry = await prisma.medicationEntry.create({
    data: {
      userId: user.id,
      date: data.date,
      medication: encrypted.medication,
      dosage: data.dosage ?? '',
      taken: data.taken ?? false,
      time: data.time ?? '',
      notes: data.notes ?? '',
    },
  });

  await logAudit({ userId: user.id, action: 'create', entity: 'medications', entityId: entry.id });
  return decryptFields(entry, ['medication']);
}

export async function bulkAddMedications(entries: {
  date: string;
  medication: string;
  dosage: string;
  taken: boolean;
  time: string;
  notes: string;
}[]) {
  const user = await getAuthUser();
  const results = [];
  for (const data of entries) {
    const encrypted = encryptFields({ medication: data.medication }, ['medication']);
    const entry = await prisma.medicationEntry.create({
      data: {
        userId: user.id,
        date: data.date,
        medication: encrypted.medication,
        dosage: data.dosage,
        taken: data.taken,
        time: data.time,
        notes: data.notes,
      },
    });
    results.push(entry);
  }
  await logAudit({ userId: user.id, action: 'create', entity: 'medications', details: `Bulk add ${entries.length} entries` });
  return results.map(e => decryptFields(e, ['medication']));
}

export async function getMedicationsByDateRange(startDate: string, endDate: string) {
  const user = await getAuthUser();
  const entries = await prisma.medicationEntry.findMany({
    where: { userId: user.id, date: { gte: startDate, lte: endDate } },
    orderBy: { date: 'asc' },
  });
  return entries.map(e => decryptFields(e, ['medication']));
}

export async function getRecentMedications(days: number = 7) {
  const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];
  return getMedicationsByDateRange(startDate, endDate + '\uffff');
}
