'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Experiment } from '@/lib/db';
import { getExperiments } from '@/actions/experiments';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const statusConfig: Record<string, { variant: 'info' | 'success' | 'neutral' | 'warning'; label: string }> = {
  baseline: { variant: 'info', label: 'Baseline' },
  intervention: { variant: 'success', label: 'Intervention' },
  analysis: { variant: 'warning', label: 'Analyzing' },
  completed: { variant: 'neutral', label: 'Completed' },
};

const templates = [
  {
    title: 'Does removing dairy reduce my HBI?',
    hypothesis: 'Removing dairy products will lower my average HBI score',
    variable: 'Dairy intake',
  },
  {
    title: 'Does sleeping 1 hour earlier reduce next-day pain?',
    hypothesis: 'Going to bed 1 hour earlier will reduce my next-day pain levels',
    variable: 'Bedtime',
  },
  {
    title: 'Does stress >7 predict a flare within 48 hours?',
    hypothesis: 'Days with stress level above 7 are followed by higher HBI within 48 hours',
    variable: 'Stress level',
  },
];

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const all = await getExperiments();
      all.sort((a: any, b: any) => b.startDate.localeCompare(a.startDate));
      setExperiments(all);
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

  function getProgress(exp: Experiment): number {
    const start = new Date(exp.startDate).getTime();
    const end = new Date(exp.endDate).getTime();
    const now = Date.now();
    if (now >= end) return 100;
    if (now <= start) return 0;
    return Math.round(((now - start) / (end - start)) * 100);
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-1 rounded-lg hover:bg-bg-secondary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-xl font-semibold text-text-primary">Experiments</h1>
        </div>
        <Link href="/experiments/new">
          <Button size="sm">New Experiment</Button>
        </Link>
      </div>

      {experiments.length === 0 ? (
        <div className="space-y-6">
          <Card padding="lg" className="text-center">
            <div className="w-14 h-14 mx-auto rounded-xl bg-bg-secondary flex items-center justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
              </svg>
            </div>
            <p className="text-sm text-text-primary font-medium">No experiments yet</p>
            <p className="text-xs text-text-secondary mt-1">
              Run N-of-1 trials to discover what works for your body. Start with a suggestion below.
            </p>
          </Card>

          <div>
            <p className="text-sm font-semibold text-text-primary mb-3">Suggested Experiments</p>
            <div className="space-y-2">
              {templates.map((t, i) => (
                <Link key={i} href={`/experiments/new?template=${i}`}>
                  <Card padding="md" className="hover:shadow-sm transition-shadow mb-2">
                    <p className="text-sm font-medium text-text-primary">{t.title}</p>
                    <p className="text-[11px] text-text-secondary mt-0.5">Variable: {t.variable}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {experiments.map((exp: any) => {
            const config = statusConfig[exp.status] || statusConfig.completed;
            const progress = getProgress(exp);
            return (
              <Link key={exp.id} href={`/experiments/${exp.id}`}>
                <Card padding="md" className="hover:shadow-sm transition-shadow mb-2">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-text-primary flex-1 pr-2">{exp.title}</p>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                  <p className="text-[11px] text-text-secondary mb-2">{exp.hypothesis}</p>
                  {exp.status !== 'completed' && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-text-secondary">{progress}%</span>
                    </div>
                  )}
                  {exp.result && (
                    <p className="text-[11px] text-accent mt-1">
                      {exp.result.statisticalSignificance ? 'Significant result' : 'Not significant'} (p={exp.result.pValue})
                    </p>
                  )}
                </Card>
              </Link>
            );
          })}

          <div className="pt-4">
            <p className="text-xs text-text-secondary mb-2">Try another experiment</p>
            {templates.slice(0, 2).map((t, i) => (
              <Link key={i} href={`/experiments/new?template=${i}`}>
                <Card padding="sm" className="hover:shadow-sm transition-shadow mb-2">
                  <p className="text-xs font-medium text-accent">{t.title}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
