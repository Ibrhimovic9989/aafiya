// Cron endpoint: Generate follow-up tasks
// Runs every 2 hours, checks health events for all users
// and creates dynamic follow-up tasks.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateEventFollowUps } from '@/actions/tasks';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) { return handler(req); }
export async function GET(req: NextRequest) { return handler(req); }

async function handler(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const results = { usersProcessed: 0, followUpsCreated: 0 };

  try {
    // Get all users who have profiles (active users)
    const users = await prisma.userProfile.findMany({
      where: { notificationsEnabled: true },
      select: { userId: true },
    });

    for (const { userId } of users) {
      try {
        const followUps = await generateEventFollowUps(userId);
        results.followUpsCreated += followUps.length;
        results.usersProcessed++;
      } catch (err) {
        console.error(`[cron/followups] Error for user ${userId}:`, err);
      }
    }

    return NextResponse.json({
      ok: true,
      timestamp: now.toISOString(),
      ...results,
    });
  } catch (err: any) {
    console.error('[cron/followups] Fatal error:', err);
    return NextResponse.json(
      { error: 'Internal error', message: err.message },
      { status: 500 }
    );
  }
}
