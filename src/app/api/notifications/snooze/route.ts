import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { taskId, minutes = 30 } = await req.json();
  if (!taskId) {
    return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
  }

  const snoozedUntil = new Date(Date.now() + minutes * 60 * 1000);

  await prisma.scheduledTask.updateMany({
    where: { id: taskId, userId: session.user.id },
    data: { status: 'snoozed', snoozedUntil },
  });

  return NextResponse.json({ ok: true, snoozedUntil });
}
