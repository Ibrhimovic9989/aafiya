'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-utils';
import { logAudit } from '@/lib/privacy/audit';

export async function createExperiment(data: {
  title: string;
  hypothesis: string;
  variable: string;
  startDate: string;
  endDate: string;
  baselineDays: number;
  interventionDays: number;
  status?: string;
}) {
  const user = await getAuthUser();
  const experiment = await prisma.experiment.create({
    data: {
      userId: user.id,
      title: data.title,
      hypothesis: data.hypothesis,
      variable: data.variable,
      startDate: data.startDate,
      endDate: data.endDate,
      baselineDays: data.baselineDays,
      interventionDays: data.interventionDays,
      status: data.status ?? 'baseline',
    },
  });

  await logAudit({ userId: user.id, action: 'create', entity: 'experiments', entityId: experiment.id });
  return serializeExperiment(experiment);
}

export async function getExperiments() {
  const user = await getAuthUser();
  const exps = await prisma.experiment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  return exps.map(serializeExperiment);
}

export async function getExperiment(id: string) {
  const user = await getAuthUser();
  const exp = await prisma.experiment.findFirst({
    where: { id, userId: user.id },
  });
  return exp ? serializeExperiment(exp) : null;
}

function serializeExperiment(exp: any) {
  return {
    ...exp,
    status: exp.status as 'baseline' | 'intervention' | 'analysis' | 'completed',
    result: exp.result as any,
  };
}

export async function updateExperiment(id: string, data: { status?: string; result?: any }) {
  const user = await getAuthUser();
  // Verify ownership
  const existing = await prisma.experiment.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error('Experiment not found');

  const updated = await prisma.experiment.update({
    where: { id },
    data,
  });

  await logAudit({ userId: user.id, action: 'update', entity: 'experiments', entityId: id });
  return serializeExperiment(updated);
}
