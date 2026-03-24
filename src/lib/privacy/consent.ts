import { prisma } from '@/lib/prisma';
export { CONSENT_PURPOSES, CONSENT_DESCRIPTIONS, type ConsentPurpose } from './constants'
import { CONSENT_PURPOSES, CONSENT_DESCRIPTIONS, type ConsentPurpose } from './constants';

export async function getConsents(userId: string): Promise<Record<ConsentPurpose, boolean>> {
  const records = await prisma.consentRecord.findMany({
    where: { userId, revokedAt: null },
    orderBy: { grantedAt: 'desc' },
  });

  const consents: Record<string, boolean> = {};
  for (const purpose of CONSENT_PURPOSES) {
    const latest = records.find(r => r.purpose === purpose);
    consents[purpose] = latest?.granted ?? false;
  }
  return consents as Record<ConsentPurpose, boolean>;
}

export async function hasRequiredConsents(userId: string): Promise<boolean> {
  const consents = await getConsents(userId);
  return CONSENT_PURPOSES
    .filter(p => CONSENT_DESCRIPTIONS[p].required)
    .every(p => consents[p]);
}

export async function grantConsent(
  userId: string,
  purpose: ConsentPurpose,
  meta?: { ipAddress?: string; userAgent?: string }
): Promise<void> {
  // Revoke any existing consent for this purpose
  await prisma.consentRecord.updateMany({
    where: { userId, purpose, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await prisma.consentRecord.create({
    data: {
      userId,
      purpose,
      granted: true,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    },
  });
}

export async function revokeConsent(
  userId: string,
  purpose: ConsentPurpose
): Promise<void> {
  await prisma.consentRecord.updateMany({
    where: { userId, purpose, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await prisma.consentRecord.create({
    data: {
      userId,
      purpose,
      granted: false,
    },
  });
}

export async function grantAllConsents(
  userId: string,
  purposes: ConsentPurpose[],
  meta?: { ipAddress?: string; userAgent?: string }
): Promise<void> {
  for (const purpose of purposes) {
    await grantConsent(userId, purpose, meta);
  }
}
