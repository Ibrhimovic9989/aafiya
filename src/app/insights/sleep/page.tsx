'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SleepEntry, UserProfile } from '@/lib/db';
import { getSleepByDateRange } from '@/actions/sleep';
import { getProfile } from '@/actions/profile';
import { calculateCircadianScore, calculateSocialJetLag, getCircadianInsight, getProgressiveBedtimeTarget } from '@/lib/circadian';
import { mean } from '@/lib/statistics';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';

interface SleepStats {
  circadianTrend: { date: string; label: string; score: number }[];
  avgJetLag: number;
  avgCircadian: number;
  bedtimes: { date: string; label: string; minutes: number }[];
  weekTarget: string;
  weekActualAvg: string;
  insight: string;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  let min = h * 60 + m;
  if (h < 12) min += 24 * 60; // normalize for display
  return min;
}

function minutesToLabel(minutes: number): string {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

export default function SleepAnalysisPage() {
  const [stats, setStats] = useState<SleepStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

      const [sleep, profile] = await Promise.all([
        getSleepByDateRange(monthAgo, today + '\uffff'),
        getProfile(),
      ]);

      if (sleep.length === 0) {
        setStats(null);
        setLoading(false);
        return;
      }
      const targetBedtime = profile?.targetBedtime || '22:00';
      const targetWakeTime = profile?.targetWakeTime || '07:00';

      sleep.sort((a, b) => a.date.localeCompare(b.date));

      const circadianTrend = sleep.map(s => ({
        date: s.date,
        label: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: s.circadianScore,
      }));

      const avgJetLag = mean(sleep.map(s => s.socialJetLagMinutes));
      const avgCircadian = mean(sleep.map(s => s.circadianScore));

      const bedtimes = sleep.map(s => ({
        date: s.date,
        label: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        minutes: timeToMinutes(s.bedtime),
      }));

      // This week's data
      const thisWeekSleep = sleep.filter(s => s.date >= weekAgo);
      const weekActualBedtimes = thisWeekSleep.map(s => timeToMinutes(s.bedtime));
      const weekActualAvgMin = weekActualBedtimes.length > 0 ? mean(weekActualBedtimes) : 0;

      // Calculate weeks since first entry for progressive target
      const firstDate = new Date(sleep[0].date);
      const weeksElapsed = Math.floor((Date.now() - firstDate.getTime()) / (7 * 86400000));
      const avgBedtimeStr = sleep.length > 0 ? sleep[Math.floor(sleep.length / 2)].bedtime : '02:00';
      const weekTarget = getProgressiveBedtimeTarget(avgBedtimeStr, targetBedtime, weeksElapsed);

      const insight = getCircadianInsight(avgCircadian, avgJetLag);

      setStats({
        circadianTrend,
        avgJetLag,
        avgCircadian,
        bedtimes,
        weekTarget,
        weekActualAvg: minutesToLabel(weekActualAvgMin),
        insight,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/insights" className="p-1 rounded-lg hover:bg-bg-secondary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-xl font-semibold text-text-primary">Sleep Analysis</h1>
      </div>

      {!stats ? (
        <Card padding="lg" className="text-center">
          <p className="text-text-secondary">No sleep data yet. Log your sleep to see circadian rhythm analysis.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <Card padding="md" className="text-center">
              <p className="text-xs text-text-secondary">Circadian Score</p>
              <p className={`text-2xl font-semibold mt-1 ${
                stats.avgCircadian >= 70 ? 'text-accent' : stats.avgCircadian >= 40 ? 'text-[#F59E0B]' : 'text-[#F97316]'
              }`}>
                {stats.avgCircadian.toFixed(0)}%
              </p>
            </Card>
            <Card padding="md" className="text-center">
              <p className="text-xs text-text-secondary">Avg Social Jet Lag</p>
              <p className={`text-2xl font-semibold mt-1 ${
                stats.avgJetLag <= 60 ? 'text-accent' : stats.avgJetLag <= 180 ? 'text-[#F59E0B]' : 'text-[#F97316]'
              }`}>
                {(stats.avgJetLag / 60).toFixed(1)}h
              </p>
            </Card>
          </div>

          {/* Circadian Score Trend */}
          <Card padding="md">
            <p className="text-sm font-semibold text-text-primary mb-3">Circadian Score Trend</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.circadianTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E6" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94A3B8' }} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E6', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: any) => [`${value}%`, 'Circadian Score']}
                  />
                  <Line type="monotone" dataKey="score" stroke="#10A37F" strokeWidth={2} dot={{ fill: '#10A37F', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Bedtime Consistency */}
          <Card padding="md">
            <p className="text-sm font-semibold text-text-primary mb-3">Bedtime Consistency</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E6" />
                  <XAxis
                    dataKey="label"
                    type="category"
                    allowDuplicatedCategory={false}
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    dataKey="minutes"
                    type="number"
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    tickFormatter={(v: any) => minutesToLabel(Number(v))}
                    domain={['auto', 'auto']}
                    reversed
                  />
                  <ZAxis range={[40, 40]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E6', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: any) => [minutesToLabel(Number(value)), 'Bedtime']}
                  />
                  <Scatter data={stats.bedtimes} fill="#7C3AED" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Weekly Progress */}
          <Card padding="md">
            <p className="text-sm font-semibold text-text-primary mb-3">This Week&apos;s Progress</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-text-secondary uppercase tracking-wide">Target Bedtime</p>
                <p className="text-lg font-semibold text-accent mt-0.5">{stats.weekTarget}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-secondary uppercase tracking-wide">Actual Average</p>
                <p className="text-lg font-semibold text-[#7C3AED] mt-0.5">{stats.weekActualAvg}</p>
              </div>
            </div>
          </Card>

          {/* Insight */}
          <Card padding="md" className="bg-bg-secondary border border-border">
            <p className="text-sm font-medium text-accent mb-1">Circadian Insight</p>
            <p className="text-xs text-text-primary leading-relaxed">{stats.insight}</p>
          </Card>
        </div>
      )}
    </div>
  );
}
