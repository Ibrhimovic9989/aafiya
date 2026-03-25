'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-utils';
import { DAILY_SCHEDULE, type CheckinItem } from '@/lib/schedule';

// ── Types ────────────────────────────────────────────────────────

export type TaskType =
  | 'checkin_reminder'
  | 'followup'
  | 'medication_reminder'
  | 'experiment_check'
  | 'custom';

export type TaskStatus = 'pending' | 'sent' | 'snoozed' | 'dismissed' | 'expired' | 'failed';

export interface ScheduledTaskData {
  type: TaskType;
  checkinId?: string;
  title: string;
  body?: string;
  priority?: 'high' | 'medium' | 'low';
  scheduledFor: Date;
  recurrence?: 'daily' | 'weekly' | 'custom_cron';
  cronExpr?: string;
  recurrenceEnd?: Date;
  triggerEvent?: string;
  triggerData?: Record<string, any>;
  parentTaskId?: string;
}

// ── CRUD ─────────────────────────────────────────────────────────

export async function createTask(data: ScheduledTaskData) {
  const user = await getAuthUser();
  return prisma.scheduledTask.create({
    data: {
      userId: user.id,
      type: data.type,
      checkinId: data.checkinId,
      title: data.title,
      body: data.body ?? '',
      priority: data.priority ?? 'medium',
      scheduledFor: data.scheduledFor,
      recurrence: data.recurrence,
      cronExpr: data.cronExpr,
      recurrenceEnd: data.recurrenceEnd,
      triggerEvent: data.triggerEvent,
      triggerData: data.triggerData,
      parentTaskId: data.parentTaskId,
    },
  });
}

export async function getUserTasks(status?: TaskStatus) {
  const user = await getAuthUser();
  return prisma.scheduledTask.findMany({
    where: {
      userId: user.id,
      ...(status ? { status } : {}),
    },
    orderBy: { scheduledFor: 'asc' },
  });
}

export async function snoozeTask(taskId: string, snoozeMinutes: number) {
  const user = await getAuthUser();
  const snoozedUntil = new Date(Date.now() + snoozeMinutes * 60 * 1000);
  return prisma.scheduledTask.update({
    where: { id: taskId, userId: user.id },
    data: { status: 'snoozed', snoozedUntil },
  });
}

export async function dismissTask(taskId: string) {
  const user = await getAuthUser();
  return prisma.scheduledTask.update({
    where: { id: taskId, userId: user.id },
    data: { status: 'dismissed', completedAt: new Date() },
  });
}

export async function completeTask(taskId: string) {
  const user = await getAuthUser();
  return prisma.scheduledTask.update({
    where: { id: taskId, userId: user.id },
    data: { status: 'sent', completedAt: new Date() },
  });
}

// ── Daily Schedule Seeding ──────────────────────────────────────

/**
 * Generate today's scheduled tasks from DAILY_SCHEDULE.
 * Called once per day (by cron or on first app open).
 * Idempotent — skips items already scheduled for today.
 */
export async function seedDailyTasks() {
  const user = await getAuthUser();
  const today = new Date().toISOString().split('T')[0];
  const todayStart = new Date(`${today}T00:00:00`);

  // Check what's already scheduled today
  const existing = await prisma.scheduledTask.findMany({
    where: {
      userId: user.id,
      type: 'checkin_reminder',
      scheduledFor: { gte: todayStart },
    },
    select: { checkinId: true },
  });
  const existingIds = new Set(existing.map((t: any) => t.checkinId));

  // Get user profile for timezone/preferences
  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    select: {
      notificationsEnabled: true,
      reminderLeadMinutes: true,
      quietHoursStart: true,
      quietHoursEnd: true,
    },
  });

  if (!profile?.notificationsEnabled) return [];

  const leadMinutes = profile.reminderLeadMinutes ?? 15;
  const tasksToCreate: any[] = [];

  for (const item of DAILY_SCHEDULE) {
    if (existingIds.has(item.id)) continue;

    // Schedule at windowStart minus lead time
    const scheduledHour = item.windowStart;
    const scheduledDate = new Date(`${today}T${String(scheduledHour).padStart(2, '0')}:00:00`);
    scheduledDate.setMinutes(scheduledDate.getMinutes() - leadMinutes);

    // Skip if already past the window end
    const windowEnd = new Date(`${today}T${String(item.windowEnd).padStart(2, '0')}:00:00`);
    if (new Date() > windowEnd) continue;

    tasksToCreate.push({
      userId: user.id,
      type: 'checkin_reminder' as const,
      checkinId: item.id,
      title: item.label,
      body: item.aafiyaPrompt,
      priority: item.priority,
      scheduledFor: scheduledDate,
    });
  }

  if (tasksToCreate.length === 0) return [];

  await prisma.scheduledTask.createMany({ data: tasksToCreate });
  return tasksToCreate;
}

// ── Follow-up Generation ────────────────────────────────────────

/**
 * Create follow-up tasks based on health events.
 * Called after symptom logging, flare risk changes, etc.
 */
export async function createFollowUp(params: {
  triggerEvent: string;
  triggerData?: Record<string, any>;
  delayMinutes: number;
  title: string;
  body: string;
  priority?: 'high' | 'medium' | 'low';
}) {
  const user = await getAuthUser();
  const scheduledFor = new Date(Date.now() + params.delayMinutes * 60 * 1000);

  return prisma.scheduledTask.create({
    data: {
      userId: user.id,
      type: 'followup',
      title: params.title,
      body: params.body,
      priority: params.priority ?? 'medium',
      scheduledFor,
      triggerEvent: params.triggerEvent,
      triggerData: params.triggerData,
    },
  });
}

/**
 * Auto-generate follow-ups from recent health events.
 * Called by the cron job after processing reminders.
 */
export async function generateEventFollowUps(userId: string) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Check for high flare risk → schedule a check-in 4 hours later
  const latestFlare = await prisma.flareRiskEntry.findFirst({
    where: { userId, date: today },
    orderBy: { createdAt: 'desc' },
  });

  const followUps: any[] = [];

  if (latestFlare && latestFlare.score >= 60) {
    // Check if we already have a followup for this
    const existingFollowUp = await prisma.scheduledTask.findFirst({
      where: {
        userId,
        type: 'followup',
        triggerEvent: 'flare_risk_high',
        scheduledFor: { gte: now },
        status: 'pending',
      },
    });

    if (!existingFollowUp) {
      followUps.push({
        userId,
        type: 'followup',
        title: 'Flare risk check-in',
        body: `Your flare risk is ${latestFlare.score}/100. How are you feeling now? Any changes since earlier?`,
        priority: 'high',
        scheduledFor: new Date(now.getTime() + 4 * 60 * 60 * 1000),
        triggerEvent: 'flare_risk_high',
        triggerData: { score: latestFlare.score, level: latestFlare.level },
      });
    }
  }

  // Check for missed medications → remind 1 hour later
  const todayMeds = await prisma.medicationEntry.findMany({
    where: { userId, date: today, taken: false },
  });

  for (const med of todayMeds) {
    const existingMedFollowUp = await prisma.scheduledTask.findFirst({
      where: {
        userId,
        type: 'medication_reminder',
        triggerEvent: 'missed_medication',
        triggerData: { path: ['medicationId'], equals: med.id },
        status: 'pending',
      },
    });

    if (!existingMedFollowUp) {
      followUps.push({
        userId,
        type: 'medication_reminder',
        title: `Medication reminder: ${med.medication}`,
        body: `You haven't taken ${med.medication} yet today. Don't forget!`,
        priority: 'high',
        scheduledFor: new Date(now.getTime() + 60 * 60 * 1000),
        triggerEvent: 'missed_medication',
        triggerData: { medicationId: med.id, medication: med.medication },
      });
    }
  }

  // Check active experiments → daily reminder
  const activeExperiments = await prisma.experiment.findMany({
    where: { userId, status: { in: ['baseline', 'intervention'] } },
  });

  for (const exp of activeExperiments) {
    const existingExpTask = await prisma.scheduledTask.findFirst({
      where: {
        userId,
        type: 'experiment_check',
        triggerData: { path: ['experimentId'], equals: exp.id },
        scheduledFor: { gte: new Date(`${today}T00:00:00`) },
        status: 'pending',
      },
    });

    if (!existingExpTask) {
      followUps.push({
        userId,
        type: 'experiment_check',
        title: `Experiment: ${exp.title}`,
        body: `You're in the ${exp.status} phase of "${exp.title}". Remember to log your data consistently!`,
        priority: 'medium',
        scheduledFor: new Date(`${today}T20:00:00`), // Evening reminder
        triggerEvent: 'experiment_active',
        triggerData: { experimentId: exp.id, phase: exp.status },
      });
    }
  }

  if (followUps.length > 0) {
    await prisma.scheduledTask.createMany({ data: followUps });
  }

  return followUps;
}

// ── Immediate Medication Task Seeding ────────────────────────────

/**
 * Create medication reminder tasks for today whenever timings are updated.
 * Called from the settings page after saving new medication timings.
 * This ensures tasks exist even if seed-daily already ran for the day.
 */
export async function seedMedicationTasksNow(
  medTimings: { name: string; times: string[] }[]
) {
  const user = await getAuthUser();
  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    select: { timezone: true, notificationsEnabled: true },
  });

  if (!profile?.notificationsEnabled) return { created: 0 };

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const todayStart = new Date(`${todayStr}T00:00:00Z`);
  const userTz = profile.timezone || 'UTC';

  // Check existing med tasks for today
  const existing = await prisma.scheduledTask.findMany({
    where: {
      userId: user.id,
      type: 'medication_reminder',
      scheduledFor: { gte: todayStart },
    },
    select: { checkinId: true },
  });
  const existingIds = new Set(existing.map((t: any) => t.checkinId));

  const tasksToCreate: any[] = [];

  for (const med of medTimings) {
    for (const time of med.times) {
      const medTaskId = `med_${med.name}_${time}`;
      if (existingIds.has(medTaskId)) continue;

      const scheduledDate = localTimeToUTC(time, userTz);

      // Skip if the time already passed
      if (scheduledDate <= now) continue;

      tasksToCreate.push({
        userId: user.id,
        type: 'medication_reminder',
        checkinId: medTaskId,
        title: `Take ${med.name}`,
        body: `Time to take your ${med.name} (scheduled for ${time})`,
        priority: 'high',
        scheduledFor: scheduledDate,
        timezone: userTz,
        maxAttempts: 2,
      });
    }
  }

  if (tasksToCreate.length > 0) {
    await prisma.scheduledTask.createMany({ data: tasksToCreate });
  }

  return { created: tasksToCreate.length };
}

/**
 * Convert a local time string "HH:mm" in a given timezone to a UTC Date for today.
 */
function localTimeToUTC(localTime: string, timezone: string): Date {
  const [hourStr, minStr] = localTime.split(':');
  const hour = parseInt(hourStr || '0');
  const minute = parseInt(minStr || '0');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const localDateStr = `${todayStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

  const tempDate = new Date(`${todayStr}T12:00:00Z`);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(tempDate);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value ?? '0';

  const localAtRef = new Date(
    `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}:${getPart('second')}Z`
  );

  const offsetMs = localAtRef.getTime() - tempDate.getTime();
  const localTarget = new Date(`${localDateStr}Z`);
  return new Date(localTarget.getTime() - offsetMs);
}

// ── Notification Preferences ────────────────────────────────────

export async function getNotificationPreferences() {
  const user = await getAuthUser();
  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    select: {
      notificationsEnabled: true,
      pushEnabled: true,
      emailDigest: true,
      quietHoursStart: true,
      quietHoursEnd: true,
      reminderLeadMinutes: true,
    },
  });
  return profile;
}

export async function updateNotificationPreferences(data: {
  notificationsEnabled?: boolean;
  pushEnabled?: boolean;
  emailDigest?: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  reminderLeadMinutes?: number;
}) {
  const user = await getAuthUser();
  return prisma.userProfile.update({
    where: { userId: user.id },
    data,
  });
}
