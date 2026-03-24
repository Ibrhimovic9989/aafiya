import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { taskId } = await req.json();
  if (!taskId) {
    return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
  }

  await prisma.scheduledTask.updateMany({
    where: { id: taskId, userId: session.user.id },
    data: { status: 'dismissed', completedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
