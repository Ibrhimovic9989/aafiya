'use client';

import { useEffect } from 'react';

/**
 * Registers the push notification service worker on mount.
 * Only runs in production or when NEXT_PUBLIC_ENABLE_SW is set.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const isProduction = process.env.NODE_ENV === 'production';
    const isExplicitlyEnabled = process.env.NEXT_PUBLIC_ENABLE_SW === 'true';

    if (!isProduction && !isExplicitlyEnabled) return;

    navigator.serviceWorker
      .register('/sw-push.js')
      .then((registration) => {
        console.log('[SW] Push service worker registered:', registration.scope);
      })
      .catch((err) => {
        console.error('[SW] Push service worker registration failed:', err);
      });
  }, []);

  return null;
}
