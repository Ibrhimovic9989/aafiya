/**
 * Web Push Notification Service
 *
 * Handles sending push notifications to subscribed browsers/devices.
 * Uses the Web Push protocol (VAPID).
 *
 * Setup:
 * 1. Generate VAPID keys: npx web-push generate-vapid-keys
 * 2. Add to .env.local:
 *    NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
 *    VAPID_PRIVATE_KEY=...
 *    VAPID_SUBJECT=mailto:your@email.com
 */

import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

// Configure VAPID (only if keys are present — graceful degradation)
const vapidConfigured =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY &&
  process.env.VAPID_SUBJECT;

if (vapidConfigured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;       // Collapse notifications with same tag
  url?: string;       // URL to open on click
  data?: Record<string, any>;
}

/**
 * Send push notification to all active subscriptions for a user.
 * Returns number of successful sends.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  if (!vapidConfigured) {
    console.warn('[notifications] VAPID not configured — skipping push');
    return { sent: 0, failed: 0 };
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId, active: true },
  });

  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon ?? '/icons/icon-192x192.png',
    badge: payload.badge ?? '/icons/badge-72x72.png',
    tag: payload.tag,
    data: {
      url: payload.url ?? '/',
      ...payload.data,
    },
  });

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        notificationPayload,
        { TTL: 60 * 60 } // 1 hour TTL
      );
      sent++;

      // Log successful delivery
      await prisma.notificationLog.create({
        data: {
          userId,
          channel: 'push',
          title: payload.title,
          body: payload.body,
          status: 'sent',
        },
      });
    } catch (err: any) {
      failed++;

      // If subscription expired or invalid (410 Gone, 404), deactivate it
      if (err.statusCode === 410 || err.statusCode === 404) {
        await prisma.pushSubscription.update({
          where: { id: sub.id },
          data: { active: false },
        });
      }

      await prisma.notificationLog.create({
        data: {
          userId,
          channel: 'push',
          title: payload.title,
          body: payload.body,
          status: 'failed',
          errorMsg: err.message?.substring(0, 500),
        },
      });
    }
  }

  return { sent, failed };
}

/**
 * Send in-app notification (just logs it — UI polls for these).
 */
export async function sendInAppNotification(
  userId: string,
  title: string,
  body: string,
  taskId?: string
) {
  return prisma.notificationLog.create({
    data: {
      userId,
      taskId,
      channel: 'in_app',
      title,
      body,
      status: 'sent',
    },
  });
}

/**
 * Check if current time is within user's quiet hours.
 */
export function isQuietHours(
  quietStart: string,
  quietEnd: string,
  now: Date = new Date()
): boolean {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = quietStart.split(':').map(Number);
  const [endH, endM] = quietEnd.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Handle overnight quiet hours (e.g., 23:00 - 07:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * Get unread in-app notifications for a user.
 */
export async function getUnreadNotifications(userId: string) {
  return prisma.notificationLog.findMany({
    where: {
      userId,
      channel: 'in_app',
      readAt: null,
    },
    orderBy: { sentAt: 'desc' },
    take: 20,
  });
}

/**
 * Mark notification as read.
 */
export async function markNotificationRead(notificationId: string, userId: string) {
  return prisma.notificationLog.update({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  });
}
