'use client';

import { useState, useEffect } from 'react';
import { usePushNotifications } from '@/lib/usePushNotifications';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const PROMPTED_KEY = 'aafiya-notif-prompted';
const SNOOZE_DAYS = 7;

export function NotificationPrompt() {
  const { supported, permission, subscribe, loading } = usePushNotifications();
  const [visible, setVisible] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (loading || !supported) return;

    // Already granted or explicitly denied by the browser
    if (permission === 'granted') return;

    // Check if user has completed onboarding
    // We read the profile from the ConditionProvider context indirectly,
    // but the simplest reliable check is reading the stored profile
    // The onboarding page sets this flag, so we check localStorage
    const prompted = localStorage.getItem(PROMPTED_KEY);
    if (prompted) {
      const snoozedAt = parseInt(prompted, 10);
      const daysSince = (Date.now() - snoozedAt) / (1000 * 60 * 60 * 24);
      if (daysSince < SNOOZE_DAYS) return;
    }

    setVisible(true);
  }, [loading, supported, permission]);

  async function handleEnable() {
    setSubscribing(true);
    try {
      await subscribe();
      setVisible(false);
    } catch (err) {
      console.error('[NotificationPrompt] Subscribe failed:', err);
      // If permission was denied, hide the prompt and save the snooze
      localStorage.setItem(PROMPTED_KEY, String(Date.now()));
      setVisible(false);
    } finally {
      setSubscribing(false);
    }
  }

  function handleDismiss() {
    localStorage.setItem(PROMPTED_KEY, String(Date.now()));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="max-w-lg mx-auto px-4 pt-3">
      <Card padding="md" className="border-accent/20">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent"
            >
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary mb-0.5">
              Stay on track
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Enable notifications to get gentle reminders for check-ins,
              medication, and more.
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleEnable} disabled={subscribing}>
                {subscribing ? 'Enabling...' : 'Enable'}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Not now
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
