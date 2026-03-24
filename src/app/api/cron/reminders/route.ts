// Cron endpoint: Process pending reminders
// Called every 5 minutes by Supabase pg_cron via pg_net.
// Security: Protected by CRON_SECRET header.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushToUser, sendInAppNotification, isQuietHours } from '@/lib/notifications';

export const runtime = 'nodejs';
export const maxDuration = 30; // seconds

// pg_net uses http_post, but also support GET for manual testing
export async function POST(req: NextRequest) { return handler(req); }
export async function GET(req: NextRequest) { return handler(req); }

async function handler(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const results = { processed: 0, sent: 0, skipped: 0, failed: 0, expired: 0 };

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

      // Check quiet hours
      if (isQuietHours(
        profile.quietHoursStart ?? '23:00',
        profile.quietHoursEnd ?? '07:00',
        now
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

      // Check max attempts
      if (task.attempts >= task.maxAttempts) {
        await prisma.scheduledTask.update({
          where: { id: task.id },
          data: { status: 'failed' },
        });
        results.failed++;
        continue;
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

          await sendPushToUser(task.userId, {
            title: task.title,
            body: task.body,
            tag: tagMap[task.type] ?? task.id,
            url: getTaskUrl(task.type, task.checkinId),
          });
        }

        // Update task status
        await prisma.scheduledTask.update({
          where: { id: task.id },
          data: {
            status: 'sent',
            attempts: task.attempts + 1,
            lastAttempt: now,
            completedAt: now,
          },
        });

        results.sent++;

        // Handle recurrence — create next occurrence
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
