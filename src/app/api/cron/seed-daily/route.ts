// Cron endpoint: Seed daily check-in tasks for all active users.
// Called once per day at 00:05 UTC by Supabase pg_cron.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DAILY_SCHEDULE } from '@/lib/schedule';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const todayStart = new Date(`${today}T00:00:00`);
  const results = { usersProcessed: 0, tasksCreated: 0 };

  try {
    const users = await prisma.userProfile.findMany({
      where: { notificationsEnabled: true },
      select: {
        userId: true,
        reminderLeadMinutes: true,
      },
    });

    for (const { userId, reminderLeadMinutes } of users) {
      // Check what's already scheduled today for this user
      const existing = await prisma.scheduledTask.findMany({
        where: {
          userId,
          type: 'checkin_reminder',
          scheduledFor: { gte: todayStart },
        },
        select: { checkinId: true },
      });
      const existingIds = new Set(existing.map((t) => t.checkinId));

      const leadMinutes = reminderLeadMinutes ?? 15;
      const tasksToCreate: any[] = [];

      for (const item of DAILY_SCHEDULE) {
        if (existingIds.has(item.id)) continue;

        const scheduledDate = new Date(
          `${today}T${String(item.windowStart).padStart(2, '0')}:00:00`
        );
        scheduledDate.setMinutes(scheduledDate.getMinutes() - leadMinutes);

        tasksToCreate.push({
          userId,
          type: 'checkin_reminder',
          checkinId: item.id,
          title: item.label,
          body: item.aafiyaPrompt,
          priority: item.priority,
          scheduledFor: scheduledDate,
        });
      }

      if (tasksToCreate.length > 0) {
        await prisma.scheduledTask.createMany({ data: tasksToCreate });
        results.tasksCreated += tasksToCreate.length;
      }
      results.usersProcessed++;
    }

    return NextResponse.json({
      ok: true,
      timestamp: now.toISOString(),
      ...results,
    });
  } catch (err: any) {
    console.error('[cron/seed-daily] Fatal error:', err);
    return NextResponse.json(
      { error: 'Internal error', message: err.message },
      { status: 500 }
    );
  }
}
