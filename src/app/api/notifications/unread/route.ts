/**
 * Get unread in-app notifications for the current user.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUnreadNotifications, markNotificationRead } from '@/lib/notifications';

export const runtime = 'nodejs';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notifications = await getUnreadNotifications(session.user.id);
  return NextResponse.json(notifications);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { notificationId } = await req.json();
  if (!notificationId) {
    return NextResponse.json({ error: 'Missing notificationId' }, { status: 400 });
  }

  await markNotificationRead(notificationId, session.user.id);
  return NextResponse.json({ ok: true });
}
