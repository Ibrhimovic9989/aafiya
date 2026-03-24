'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createExperiment } from '@/actions/experiments';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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

function NewExperimentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [variable, setVariable] = useState('');
  const [baselineDays, setBaselineDays] = useState(14);
  const [interventionDays, setInterventionDays] = useState(14);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const templateIdx = searchParams.get('template');
    if (templateIdx !== null) {
      const idx = parseInt(templateIdx);
      if (templates[idx]) {
        setTitle(templates[idx].title);
        setHypothesis(templates[idx].hypothesis);
        setVariable(templates[idx].variable);
      }
    }
  }, [searchParams]);

  function applyTemplate(idx: number) {
    setTitle(templates[idx].title);
    setHypothesis(templates[idx].hypothesis);
    setVariable(templates[idx].variable);
  }

  async function handleStart() {
    if (!title.trim() || !hypothesis.trim() || !variable.trim()) return;
    setSaving(true);

    const startDate = new Date().toISOString().split('T')[0];
    const totalDays = baselineDays + interventionDays;
    const endDate = new Date(Date.now() + totalDays * 86400000).toISOString().split('T')[0];

    await createExperiment({
      title: title.trim(),
      hypothesis: hypothesis.trim(),
      variable: variable.trim(),
      startDate,
      endDate,
      baselineDays,
      interventionDays,
      status: 'baseline',
    });

    router.push('/experiments');
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/experiments" className="p-1 rounded-lg hover:bg-bg-secondary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-xl font-semibold text-text-primary">New Experiment</h1>
      </div>

      {/* Templates */}
      <div className="mb-6">
        <p className="text-sm font-medium text-text-primary mb-2">Quick Start Templates</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {templates.map((t, i) => (
            <button
              key={i}
              onClick={() => applyTemplate(i)}
              className="flex-shrink-0 px-3 py-2 rounded-lg bg-bg-secondary border border-border text-accent text-xs font-medium hover:bg-accent/5 transition-colors"
            >
              {t.variable}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <Card padding="md">
          <label className="block text-sm font-medium text-text-primary mb-1">
            Experiment Title
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Does removing dairy reduce my HBI?"
            className="w-full px-3 py-2 rounded-lg bg-bg-secondary text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent/30"
          />
        </Card>

        <Card padding="md">
          <label className="block text-sm font-medium text-text-primary mb-1">
            Hypothesis
          </label>
          <textarea
            value={hypothesis}
            onChange={e => setHypothesis(e.target.value)}
            placeholder="What do you expect to happen?"
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-bg-secondary text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent/30 resize-none"
          />
        </Card>

        <Card padding="md">
          <label className="block text-sm font-medium text-text-primary mb-1">
            Variable Being Tested
          </label>
          <input
            type="text"
            value={variable}
            onChange={e => setVariable(e.target.value)}
            placeholder="e.g., Dairy intake, Bedtime, Stress"
            className="w-full px-3 py-2 rounded-lg bg-bg-secondary text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent/30"
          />
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card padding="md">
            <label className="block text-sm font-medium text-text-primary mb-1">
              Baseline Days
            </label>
            <input
              type="number"
              value={baselineDays}
              onChange={e => setBaselineDays(Math.max(3, parseInt(e.target.value) || 14))}
              min={3}
              max={60}
              className="w-full px-3 py-2 rounded-lg bg-bg-secondary text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent/30"
            />
          </Card>
          <Card padding="md">
            <label className="block text-sm font-medium text-text-primary mb-1">
              Intervention Days
            </label>
            <input
              type="number"
              value={interventionDays}
              onChange={e => setInterventionDays(Math.max(3, parseInt(e.target.value) || 14))}
              min={3}
              max={60}
              className="w-full px-3 py-2 rounded-lg bg-bg-secondary text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent/30"
            />
          </Card>
        </div>

        <Card padding="sm" className="bg-bg-secondary border border-border">
          <p className="text-[11px] text-accent">
            Total duration: {baselineDays + interventionDays} days. First {baselineDays} days you&apos;ll log your normal routine (baseline),
            then {interventionDays} days with the change (intervention). Results are analyzed using paired t-test and Cohen&apos;s d.
          </p>
        </Card>

        <Button
          fullWidth
          size="lg"
          onClick={handleStart}
          disabled={!title.trim() || !hypothesis.trim() || !variable.trim() || saving}
        >
          {saving ? 'Starting...' : 'Start Experiment'}
        </Button>
      </div>
    </div>
  );
}

export default function NewExperimentPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-text-secondary">Loading...</div>}>
      <NewExperimentContent />
    </Suspense>
  );
}
