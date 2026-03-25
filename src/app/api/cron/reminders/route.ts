// Cron endpoint: Process pending reminders with persistent reminder loops.
// Called every 5 minutes by Supabase pg_cron via pg_net.
// Security: Protected by CRON_SECRET header.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DAILY_SCHEDULE } from '@/lib/schedule';
import { sendPushToUser, sendInAppNotification, isQuietHours } from '@/lib/notifications';

export const runtime = 'nodejs';
export const maxDuration = 30; // seconds

// pg_net uses http_post, but also support GET for manual testing
export async function POST(req: NextRequest) { return handler(req); }
export async function GET(req: NextRequest) { return handler(req); }

/**
 * Check if a check-in has been completed for a given user/checkinId today.
 * Queries the database directly (no auth session needed — this is a cron job).
 */
async function isCheckinComplete(
  userId: string,
  checkinId: string,
  today: string
): Promise<boolean> {
  // Find the schedule item to determine its category
  const scheduleItem = DAILY_SCHEDULE.find(s => s.id === checkinId);
  if (!scheduleItem) return true; // unknown check-in — treat as complete

  switch (scheduleItem.category) {
    case 'symptom': {
      const count = await prisma.symptomEntry.count({
        where: { userId, date: today },
      });
      return count > 0;
    }
    case 'food': {
      // Check if the specific meal type has been logged
      // checkinId maps: breakfast -> 'breakfast', lunch -> 'lunch', etc.
      const mealType = checkinId; // 'breakfast', 'lunch', 'dinner', 'snack'
      const count = await prisma.foodEntry.count({
        where: { userId, date: today, mealType },
      });
      return count > 0;
    }
    case 'sleep': {
      const count = await prisma.sleepEntry.count({
        where: { userId, date: today },
      });
      return count > 0;
    }
    case 'meds': {
      // Check if meds have been taken for the appropriate time of day
      const entries = await prisma.medicationEntry.findMany({
        where: { userId, date: today, taken: true },
        select: { time: true },
      });
      if (checkinId === 'morning_meds') {
        return entries.some(m => {
          const hour = parseInt(m.time?.split(':')[0] || '0');
          return hour < 14;
        });
      }
      if (checkinId === 'evening_meds') {
        return entries.some(m => {
          const hour = parseInt(m.time?.split(':')[0] || '0');
          return hour >= 14;
        });
      }
      return entries.length > 0;
    }
    case 'mood': {
      const count = await prisma.moodEntry.count({
        where: { userId, date: today },
      });
      return count > 0;
    }
    default:
      return false;
  }
}

async function handler(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const results = { processed: 0, sent: 0, skipped: 0, failed: 0, expired: 0, followups: 0 };

  try {
    // Find all due tasks: pending + scheduled time has passed
    // Also include snoozed tasks whose snooze period ended
    const dueTasks = await prisma.scheduledTask.findMany({
      where: {
        OR: [
          { status: 'pending', scheduledFor: { lte: now } },
          { status: 'snoozed', snoozedUntil: { lte: now } },
        ],
      },
      include: {
        user: {
          include: {
            profile: {
              select: {
                notificationsEnabled: true,
                pushEnabled: true,
                quietHoursStart: true,
                quietHoursEnd: true,
                timezone: true,
              },
            },
          },
        },
      },
      take: 100, // Process in batches
      orderBy: { scheduledFor: 'asc' },
    });

    for (const task of dueTasks) {
      results.processed++;
      const profile = task.user.profile;

      // Skip if notifications disabled
      if (!profile?.notificationsEnabled) {
        results.skipped++;
        continue;
      }

      // Check quiet hours — must compare against user's LOCAL time, not UTC
      const userTz = profile.timezone || 'UTC';
      const userLocalTime = new Date(now.toLocaleString('en-US', { timeZone: userTz }));
      if (isQuietHours(
        profile.quietHoursStart ?? '23:00',
        profile.quietHoursEnd ?? '07:00',
        userLocalTime
      )) {
        results.skipped++;
        continue;
      }

      // Check if task is expired (more than 6 hours past schedule for checkins)
      if (task.type === 'checkin_reminder') {
        const hoursLate = (now.getTime() - task.scheduledFor.getTime()) / (1000 * 60 * 60);
        if (hoursLate > 6) {
          await prisma.scheduledTask.update({
            where: { id: task.id },
            data: { status: 'expired' },
          });
          results.expired++;
          continue;
        }
      }

      // Check max attempts — after max, mark as expired
      if (task.attempts >= task.maxAttempts) {
        await prisma.scheduledTask.update({
          where: { id: task.id },
          data: { status: 'expired' },
        });
        results.expired++;
        continue;
      }

      // For checkin_reminder tasks, check if the check-in was already completed
      if (task.type === 'checkin_reminder' && task.checkinId) {
        const completed = await isCheckinComplete(task.userId, task.checkinId, today);
        if (completed) {
          // Mark as completed — no need to remind
          await prisma.scheduledTask.update({
            where: { id: task.id },
            data: { status: 'sent', completedAt: now },
          });
          results.skipped++;
          continue;
        }
      }

      // Send notification
      try {
        // Always send in-app notification
        await sendInAppNotification(task.userId, task.title, task.body, task.id);

        // Send push if enabled
        if (profile.pushEnabled) {
          const tagMap: Record<string, string> = {
            checkin_reminder: `checkin-${task.checkinId}`,
            followup: `followup-${task.id}`,
            medication_reminder: `med-${task.id}`,
            experiment_check: `exp-${task.id}`,
          };

          const pushResult = await sendPushToUser(task.userId, {
            title: task.title,
            body: task.body,
            tag: tagMap[task.type] ?? task.id,
            url: getTaskUrl(task.type, task.checkinId),
          });
          console.log(`[cron/reminders] Push for task ${task.id}: sent=${pushResult.sent}, failed=${pushResult.failed}`);
        } else {
          console.log(`[cron/reminders] Push disabled for user ${task.userId}`);
        }

        const newAttempts = task.attempts + 1;

        // For checkin_reminder tasks: create a follow-up if under maxAttempts
        if (task.type === 'checkin_reminder' && task.checkinId && newAttempts < task.maxAttempts) {
          // Mark current task as sent but NOT completed
          await prisma.scheduledTask.update({
            where: { id: task.id },
            data: {
              status: 'sent',
              attempts: newAttempts,
              lastAttempt: now,
              // No completedAt — the check-in hasn't been done yet
            },
          });

          // Get the shorter reminder text for the follow-up
          const scheduleItem = DAILY_SCHEDULE.find(s => s.id === task.checkinId);
          const reminderBody = scheduleItem?.aafiyaReminder ?? task.body;

          // Create a follow-up task 30 minutes from now
          const followUpTime = new Date(now.getTime() + 30 * 60 * 1000);
          await prisma.scheduledTask.create({
            data: {
              userId: task.userId,
              type: 'checkin_reminder',
              checkinId: task.checkinId,
              title: task.title,
              body: reminderBody,
              priority: task.priority,
              scheduledFor: followUpTime,
              timezone: task.timezone,
              attempts: newAttempts, // carry forward attempt count
              maxAttempts: task.maxAttempts,
              parentTaskId: task.parentTaskId ?? task.id,
              triggerEvent: 'followup_reminder',
            },
          });
          results.followups++;
        } else {
          // Non-checkin tasks OR max attempts reached: mark as fully sent/completed
          await prisma.scheduledTask.update({
            where: { id: task.id },
            data: {
              status: 'sent',
              attempts: newAttempts,
              lastAttempt: now,
              completedAt: now,
            },
          });
        }

        results.sent++;

        // Handle recurrence — create next occurrence (for recurring tasks, not checkin follow-ups)
        if (task.recurrence) {
          const nextDate = getNextRecurrence(task.scheduledFor, task.recurrence);
          if (!task.recurrenceEnd || nextDate <= task.recurrenceEnd) {
            await prisma.scheduledTask.create({
              data: {
                userId: task.userId,
                type: task.type,
                checkinId: task.checkinId,
                title: task.title,
                body: task.body,
                priority: task.priority,
                scheduledFor: nextDate,
                timezone: task.timezone,
                recurrence: task.recurrence,
                cronExpr: task.cronExpr,
                recurrenceEnd: task.recurrenceEnd,
                triggerEvent: task.triggerEvent,
                triggerData: task.triggerData ?? undefined,
              },
            });
          }
        }
      } catch (err) {
        console.error(`[cron/reminders] Failed to process task ${task.id}:`, err);
        await prisma.scheduledTask.update({
          where: { id: task.id },
          data: {
            attempts: task.attempts + 1,
            lastAttempt: now,
          },
        });
        results.failed++;
      }
    }

    return NextResponse.json({
      ok: true,
      timestamp: now.toISOString(),
      ...results,
    });
  } catch (err: any) {
    console.error('[cron/reminders] Fatal error:', err);
    return NextResponse.json(
      { error: 'Internal error', message: err.message },
      { status: 500 }
    );
  }
}

function getTaskUrl(type: string, checkinId?: string | null): string {
  const categoryMap: Record<string, string> = {
    morning_sleep: '/log/sleep',
    morning_meds: '/log/meds',
    evening_meds: '/log/meds',
    morning_mood: '/log/mood',
    breakfast: '/log/food',
    lunch: '/log/food',
    dinner: '/log/food',
    snack: '/log/food',
    afternoon_checkin: '/log/symptoms',
    daily_checkin: '/log/symptoms',
  };

  if (type === 'checkin_reminder' && checkinId) {
    return categoryMap[checkinId] ?? '/log';
  }
  if (type === 'medication_reminder') return '/log/meds';
  if (type === 'experiment_check') return '/experiments';
  if (type === 'followup') return '/';
  return '/';
}

function getNextRecurrence(current: Date, recurrence: string): Date {
  const next = new Date(current);
  switch (recurrence) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    default:
      // For custom_cron, just default to daily
      next.setDate(next.getDate() + 1);
      break;
  }
  return next;
}
