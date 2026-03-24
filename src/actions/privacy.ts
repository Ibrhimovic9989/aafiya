'use server';

import { getAuthUser } from '@/lib/auth-utils';
import { getConsents, grantAllConsents, revokeConsent, hasRequiredConsents, type ConsentPurpose } from '@/lib/privacy/consent';
import { exportUserData, deleteAllUserData, getDataRetentionStats } from '@/lib/privacy/gdpr';
import { getAuditLogs } from '@/lib/privacy/audit';

export async function getConsentsAction() {
  const user = await getAuthUser();
  return getConsents(user.id);
}

export async function hasRequiredConsentsAction() {
  const user = await getAuthUser();
  return hasRequiredConsents(user.id);
}

export async function grantConsentsAction(purposes: ConsentPurpose[]) {
  const user = await getAuthUser();
  await grantAllConsents(user.id, purposes);
}

export async function revokeConsentAction(purpose: ConsentPurpose) {
  const user = await getAuthUser();
  await revokeConsent(user.id, purpose);
}

export async function exportDataAction() {
  const user = await getAuthUser();
  return exportUserData(user.id);
}

export async function deleteAccountAction() {
  const user = await getAuthUser();
  await deleteAllUserData(user.id);
}

export async function getDataStatsAction() {
  const user = await getAuthUser();
  return getDataRetentionStats(user.id);
}

export async function getAuditLogsAction(limit: number = 50) {
  const user = await getAuthUser();
  const logs = await getAuditLogs(user.id, { limit });
  return logs.map((l: any) => ({ ...l, timestamp: l.timestamp.toISOString() }));
}
