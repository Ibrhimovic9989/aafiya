// Cron endpoint: Seed daily check-in tasks for all active users.
// Called once per day at 00:05 UTC by Supabase pg_cron.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DAILY_SCHEDULE } from '@/lib/schedule';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Convert a local hour (e.g. 8 for 8:00 AM) in a given IANA timezone
 * to a UTC Date for today.
 *
 * Example: localHourToUTC(8, 'Asia/Kolkata') on 2026-03-25
 * -> 2026-03-25T02:30:00.000Z  (8:00 AM IST = 2:30 AM UTC)
 */
function localHourToUTC(localHour: number, timezone: string, leadMinutes: number): Date {
  // Build a reference date in UTC for "today"
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

  // Create a date string that represents the desired local time
  // We use a formatter to figure out the timezone offset
  const localDateStr = `${todayStr}T${String(localHour).padStart(2, '0')}:00:00`;

  // Parse as if UTC, then adjust by the timezone offset
  // Use Intl to get the offset for this timezone at this date
  const tempDate = new Date(`${todayStr}T12:00:00Z`); // noon UTC as reference
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(tempDate);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value ?? '0';

  // Reconstruct what the local time looks like for the reference UTC time
  const localAtRef = new Date(
    `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}:${getPart('second')}Z`
  );

  // The offset in ms = local representation (treated as UTC) - actual UTC
  const offsetMs = localAtRef.getTime() - tempDate.getTime();

  // Now create the target local time as a Date, and subtract the offset to get UTC
  const localTarget = new Date(`${localDateStr}Z`);
  const utcTarget = new Date(localTarget.getTime() - offsetMs);

  // Apply lead minutes
  utcTarget.setMinutes(utcTarget.getMinutes() - leadMinutes);

  return utcTarget;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const todayStart = new Date(`${today}T00:00:00Z`);
  const results = { usersProcessed: 0, tasksCreated: 0 };

  try {
    const users = await prisma.userProfile.findMany({
      where: { notificationsEnabled: true },
      select: {
        userId: true,
        reminderLeadMinutes: true,
        timezone: true,
      },
    });

    for (const { userId, reminderLeadMinutes, timezone } of users) {
      // Check what's already scheduled today for this user
      const existing = await prisma.scheduledTask.findMany({
        where: {
          userId,
          type: 'checkin_reminder',
          scheduledFor: { gte: todayStart },
        },
        select: { checkinId: true },
      });
      const existingIds = new Set(existing.map((t: any) => t.checkinId));

      const leadMinutes = reminderLeadMinutes ?? 15;
      const userTimezone = timezone || 'UTC';
      const tasksToCreate: any[] = [];

      for (const item of DAILY_SCHEDULE) {
        if (existingIds.has(item.id)) continue;

        // Convert the user's local window start hour to UTC
        const scheduledDate = localHourToUTC(item.windowStart, userTimezone, leadMinutes);

        tasksToCreate.push({
          userId,
          type: 'checkin_reminder',
          checkinId: item.id,
          title: item.label,
          body: item.aafiyaPrompt,
          priority: item.priority,
          scheduledFor: scheduledDate,
          timezone: userTimezone,
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
