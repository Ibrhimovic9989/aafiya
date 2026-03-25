'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUser, getAuthUserOptional } from '@/lib/auth-utils';
import { encryptFields, decryptFields } from '@/lib/privacy/encryption';
import { logAudit } from '@/lib/privacy/audit';
import type { ConditionId } from '@/lib/conditions/types';

const ENCRYPTED_FIELDS = ['diagnosis', 'doctorName', 'doctorContact'] as const;

function serializeProfile(profile: any) {
  return {
    ...profile,
    conditionId: profile.conditionId as ConditionId,
    medications: Array.isArray(profile.medications)
      ? profile.medications as string[]
      : typeof profile.medications === 'string'
        ? JSON.parse(profile.medications)
        : [],
    medicationTimings: Array.isArray(profile.medicationTimings)
      ? profile.medicationTimings
      : typeof profile.medicationTimings === 'string'
        ? JSON.parse(profile.medicationTimings)
        : [],
  };
}

export async function getProfile() {
  const user = await getAuthUser();
  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return null;
  return serializeProfile(decryptFields(profile, [...ENCRYPTED_FIELDS]));
}

/** Safe version that returns null if not authenticated (no throw) */
export async function getProfileSafe() {
  const user = await getAuthUserOptional();
  if (!user?.id) return null;
  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return null;
  return serializeProfile(decryptFields(profile, [...ENCRYPTED_FIELDS]));
}

export async function upsertProfile(data: {
  name?: string;
  conditionId?: string;
  diagnosis?: string;
  diseaseLocation?: string;
  medications?: string[];
  targetBedtime?: string;
  targetWakeTime?: string;
  cycleStartDate?: string;
  cycleLength?: number;
  doctorName?: string;
  doctorContact?: string;
  onboardingComplete?: boolean;
  trackCycle?: boolean;
  gender?: string;
  medicationTimings?: { name: string; times: string[] }[];
  timezone?: string;
}) {
  const user = await getAuthUser();
  const encrypted = encryptFields(
    { ...data } as any,
    [...ENCRYPTED_FIELDS]
  );

  // Convert arrays to JSON for Prisma
  const profileData = {
    ...encrypted,
    medications: data.medications ? JSON.stringify(data.medications) : undefined,
    medicationTimings: data.medicationTimings ? JSON.stringify(data.medicationTimings) : undefined,
  };

  const profile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: profileData,
    create: {
      userId: user.id,
      ...profileData,
      medications: data.medications ? data.medications : [],
    },
  });

  await logAudit({ userId: user.id, action: 'update', entity: 'profile', entityId: profile.id });
  return serializeProfile(decryptFields(profile, [...ENCRYPTED_FIELDS]));
}

export async function updateProfile(data: Record<string, any>) {
  const user = await getAuthUser();
  const existing = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!existing) throw new Error('Profile not found');

  const encrypted = encryptFields(data as any, [...ENCRYPTED_FIELDS]);
  const profile = await prisma.userProfile.update({
    where: { userId: user.id },
    data: encrypted,
  });

  await logAudit({ userId: user.id, action: 'update', entity: 'profile', entityId: profile.id });
  return serializeProfile(decryptFields(profile, [...ENCRYPTED_FIELDS]));
}
