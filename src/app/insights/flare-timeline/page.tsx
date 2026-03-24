'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SymptomEntry } from '@/lib/db';
import { getSymptomsByDateRange } from '@/actions/symptoms';
import { getHBISeverity, getHBILabel, getHBISeverityColor } from '@/lib/scoring';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface ChartPoint {
  date: string;
  label: string;
  hbi: number;
}

export default function FlareTimelinePage() {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [events, setEvents] = useState<{ date: string; text: string; type: 'flare' | 'improvement' | 'info' }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

      const symptoms = await getSymptomsByDateRange(monthAgo, today + '\uffff');

      symptoms.sort((a, b) => a.date.localeCompare(b.date));

      // Group by date, take last entry per day
      const byDate = new Map<string, SymptomEntry>();
      for (const s of symptoms) {
        byDate.set(s.date, s);
      }

      const points: ChartPoint[] = [];
      const notable: typeof events = [];

      const entries = Array.from(byDate.entries()).sort(([a], [b]) => a.localeCompare(b));
      let prevScore: number | null = null;

      for (const [date, entry] of entries) {
        const d = new Date(date);
        points.push({
          date,
          label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          hbi: entry.hbiScore,
        });

        const severity = getHBISeverity(entry.hbiScore);
        if (severity === 'severe') {
          notable.push({ date, text: `Severe flare (HBI: ${entry.hbiScore})`, type: 'flare' });
        } else if (severity === 'moderate' && prevScore !== null && prevScore < 8) {
          notable.push({ date, text: `Entered moderate activity (HBI: ${entry.hbiScore})`, type: 'flare' });
        } else if (prevScore !== null && prevScore >= 8 && entry.hbiScore < 5) {
          notable.push({ date, text: `Returned to remission (HBI: ${entry.hbiScore})`, type: 'improvement' });
        }

        if (entry.complications.length > 0) {
          notable.push({ date, text: `Complications: ${entry.complications.join(', ')}`, type: 'info' });
        }

        prevScore = entry.hbiScore;
      }

      setData(points);
      setEvents(notable);
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
        <h1 className="text-xl font-semibold text-text-primary">Flare Timeline</h1>
      </div>

      {data.length === 0 ? (
        <Card padding="lg" className="text-center">
          <p className="text-text-secondary">No symptom data yet. Log your symptoms to see your HBI trend over time.</p>
        </Card>
      ) : (
        <>
          {/* Chart */}
          <Card padding="md" className="mb-4">
            <p className="text-sm font-semibold text-text-primary mb-3">HBI Score - Last 30 Days</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E6" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E5E6',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [
                      `${value} (${getHBILabel(getHBISeverity(Number(value)))})`,
                      'HBI',
                    ]}
                  />
                  <ReferenceLine y={5} stroke="#10A37F" strokeDasharray="5 5" label={{ value: 'Remission', position: 'right', fontSize: 9, fill: '#10A37F' }} />
                  <ReferenceLine y={8} stroke="#F59E0B" strokeDasharray="5 5" label={{ value: 'Moderate', position: 'right', fontSize: 9, fill: '#F59E0B' }} />
                  <ReferenceLine y={16} stroke="#EF4444" strokeDasharray="5 5" label={{ value: 'Severe', position: 'right', fontSize: 9, fill: '#EF4444' }} />
                  <Line
                    type="monotone"
                    dataKey="hbi"
                    stroke="#10A37F"
                    strokeWidth={2}
                    dot={{ fill: '#10A37F', r: 3 }}
                    activeDot={{ r: 5, fill: '#0D8A6A' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-3 text-[10px] text-text-tertiary">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-accent inline-block" /> Remission (&lt;5)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#F59E0B] inline-block" /> Moderate (8)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block" /> Severe (16)</span>
            </div>
          </Card>

          {/* Notable Events */}
          {events.length > 0 && (
            <Card padding="md">
              <p className="text-sm font-semibold text-text-primary mb-3">Notable Events</p>
              <div className="space-y-2">
                {events.map((evt, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      evt.type === 'flare' ? 'bg-[#F97316]' : evt.type === 'improvement' ? 'bg-accent' : 'bg-[#7C3AED]'
                    }`} />
                    <div>
                      <p className="text-xs text-text-secondary">
                        {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-text-primary">{evt.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
