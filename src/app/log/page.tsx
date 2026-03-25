'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRecentSymptoms } from '@/actions/symptoms';
import { getRecentFood } from '@/actions/food';
import { getRecentSleep } from '@/actions/sleep';
import { getRecentMood } from '@/actions/mood';
import { getRecentCycle } from '@/actions/cycle';
import { getRecentMedications } from '@/actions/medications';
import { getProfileSafe } from '@/actions/profile';

interface LogType {
  href: string;
  title: string;
  subtitle: string;
  color: string;
  iconBg: string;
  icon: React.ReactNode;
  table: string;
}

const logTypes: LogType[] = [
  {
    href: '/?checkin=symptoms', title: 'Check-in', subtitle: 'How are you?', color: 'text-accent', iconBg: 'bg-accent', table: 'symptoms',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    href: '/log/food', title: 'Food', subtitle: 'AI compound analysis', color: 'text-red-500', iconBg: 'bg-red-500', table: 'food',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" /></svg>,
  },
  {
    href: '/log/sleep', title: 'Sleep', subtitle: 'Circadian score', color: 'text-violet-600', iconBg: 'bg-violet-600', table: 'sleep',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>,
  },
  {
    href: '/log/mood', title: 'Mood & Energy', subtitle: 'Stress tracking', color: 'text-amber-500', iconBg: 'bg-amber-500', table: 'mood',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></svg>,
  },
  {
    href: '/log/cycle', title: 'Cycle', subtitle: 'Phase tracking', color: 'text-pink-500', iconBg: 'bg-pink-500', table: 'cycle',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l2 2" /></svg>,
  },
  {
    href: '/log/meds', title: 'Medications', subtitle: 'Adherence', color: 'text-accent', iconBg: 'bg-accent', table: 'medications',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 13.5h.008v.008H10.5v-.008zm0-3h.008v.008H10.5V12zm3 3h.008v.008H13.5v-.008zm0-3h.008v.008H13.5V12z" /></svg>,
  },
];

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

export default function LogHubPage() {
  const [lastLogged, setLastLogged] = useState<Record<string, string>>({});
  const [trackCycle, setTrackCycle] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const profile = await getProfileSafe();
      if (profile) setTrackCycle(profile.trackCycle);
    }
    loadProfile();
  }, []);

  useEffect(() => {
    async function loadLastLogged() {
      const results: Record<string, string> = {};
      const fetchers = [
        { name: 'symptoms', fn: () => getRecentSymptoms(1) },
        { name: 'food', fn: () => getRecentFood(1) },
        { name: 'sleep', fn: () => getRecentSleep(1) },
        { name: 'mood', fn: () => getRecentMood(1) },
        { name: 'cycle', fn: () => getRecentCycle(1) },
        { name: 'medications', fn: () => getRecentMedications(1) },
      ] as const;

      await Promise.all(
        fetchers.map(async ({ name, fn }) => {
          try {
            const entries = await fn();
            if (entries.length > 0) results[name] = entries[entries.length - 1].date;
          } catch { /* empty */ }
        })
      );
      setLastLogged(results);
    }
    loadLastLogged();
  }, []);

  return (
    <div className="max-w-md mx-auto px-5 pt-6 pb-28">
      <div className="animate-slide-down mb-6">
        <h1 className="text-xl font-semibold text-text-primary tracking-tight">Log</h1>
        <p className="text-xs text-text-tertiary font-medium mt-0.5">Track your day — Aafiya learns your patterns</p>
      </div>

      <div className="grid grid-cols-2 gap-3 stagger">
        {logTypes.filter(log => trackCycle || log.table !== 'cycle').map(log => (
          <Link key={log.href} href={log.href}>
            <div className="rounded-xl border border-border bg-bg p-4 tap h-full relative overflow-hidden animate-slide-up hover:bg-bg-secondary transition-colors">
              <div className="relative">
                <div className={`w-11 h-11 rounded-lg ${log.iconBg} flex items-center justify-center mb-3`}>
                  {log.icon}
                </div>
                <p className="text-sm font-semibold text-text-primary">{log.title}</p>
                <p className="text-[10px] text-text-tertiary mt-0.5">{log.subtitle}</p>
                {lastLogged[log.table] && (
                  <div className="mt-2 flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-text-quaternary" />
                    <p className="text-[9px] text-text-quaternary font-medium">{timeAgo(lastLogged[log.table])}</p>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
