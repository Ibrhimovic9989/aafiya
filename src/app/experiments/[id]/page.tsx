'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Experiment, SymptomEntry } from '@/lib/db';
import { getExperiment, updateExperiment } from '@/actions/experiments';
import { getSymptomsByDateRange } from '@/actions/symptoms';
import { pairedTTest, cohensD, mean, generateConclusion } from '@/lib/statistics';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';

export default function ExperimentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [baselineData, setBaselineData] = useState<number[]>([]);
  const [interventionData, setInterventionData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    async function load() {
      const exp = await getExperiment(id);
      if (!exp) {
        setLoading(false);
        return;
      }
      setExperiment(exp);

      // Load symptom data for experiment period
      const symptoms = await getSymptomsByDateRange(exp.startDate, exp.endDate);

      symptoms.sort((a: any, b: any) => a.date.localeCompare(b.date));

      const startDate = new Date(exp.startDate).getTime();
      const baselineEnd = startDate + exp.baselineDays * 86400000;

      const baseline: number[] = [];
      const intervention: number[] = [];

      for (const s of symptoms) {
        const d = new Date(s.date).getTime();
        if (d < baselineEnd) {
          baseline.push(s.hbiScore);
        } else {
          intervention.push(s.hbiScore);
        }
      }

      setBaselineData(baseline);
      setInterventionData(intervention);

      // Auto-update status based on time
      const now = Date.now();
      if (exp.status === 'baseline' && now >= baselineEnd) {
        await updateExperiment(id, { status: 'intervention' });
        exp.status = 'intervention';
      }
      if (exp.status === 'intervention' && now >= new Date(exp.endDate).getTime()) {
        await updateExperiment(id, { status: 'analysis' });
        exp.status = 'analysis';
      }

      setExperiment({ ...exp });
      setLoading(false);
    }
    load();
  }, [id]);

  async function runAnalysis() {
    if (!experiment || baselineData.length < 3 || interventionData.length < 3) return;
    setAnalyzing(true);

    const test = pairedTTest(baselineData, interventionData);
    const effect = cohensD(baselineData, interventionData);
    const conclusion = generateConclusion(experiment.title, baselineData, interventionData);
    const baselineAvg = mean(baselineData);
    const interventionAvg = mean(interventionData);
    const pctChange = baselineAvg !== 0
      ? Math.round(((interventionAvg - baselineAvg) / baselineAvg) * 10000) / 100
      : 0;

    const result = {
      baselineAvgSymptoms: Math.round(baselineAvg * 100) / 100,
      interventionAvgSymptoms: Math.round(interventionAvg * 100) / 100,
      percentChange: pctChange,
      statisticalSignificance: test.significant,
      pValue: test.pValue,
      effectSize: effect.d,
      conclusion,
    };

    await updateExperiment(id, { status: 'completed', result });
    setExperiment(prev => prev ? { ...prev, status: 'completed', result } : null);
    setAnalyzing(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
        <Card padding="lg" className="text-center">
          <p className="text-text-secondary">Experiment not found.</p>
          <Link href="/experiments" className="text-sm text-accent mt-2 inline-block">Back to experiments</Link>
        </Card>
      </div>
    );
  }

  const startDate = new Date(experiment.startDate).getTime();
  const baselineEnd = startDate + experiment.baselineDays * 86400000;
  const endDate = new Date(experiment.endDate).getTime();
  const now = Date.now();

  const totalDays = experiment.baselineDays + experiment.interventionDays;
  const elapsed = Math.max(0, Math.min(totalDays, Math.floor((now - startDate) / 86400000)));
  const progressPct = Math.round((elapsed / totalDays) * 100);
  const baselinePct = (experiment.baselineDays / totalDays) * 100;

  const chartData = [
    { name: 'Baseline', value: mean(baselineData), count: baselineData.length },
    { name: 'Intervention', value: mean(interventionData), count: interventionData.length },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/experiments" className="p-1 rounded-lg hover:bg-bg-secondary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-text-primary">{experiment.title}</h1>
          <p className="text-[11px] text-text-secondary">{experiment.hypothesis}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Progress */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-text-primary">Progress</p>
            <Badge variant={
              experiment.status === 'baseline' ? 'info' :
              experiment.status === 'intervention' ? 'success' :
              experiment.status === 'completed' ? 'neutral' : 'warning'
            }>
              {experiment.status === 'baseline' ? 'Baseline Phase' :
               experiment.status === 'intervention' ? 'Intervention Phase' :
               experiment.status === 'analysis' ? 'Ready to Analyze' : 'Completed'}
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="relative h-3 rounded-full bg-bg-secondary overflow-hidden mb-2">
            <div
              className="absolute top-0 left-0 h-full bg-[#7C3AED]/20 rounded-l-full"
              style={{ width: `${baselinePct}%` }}
            />
            <div
              className="absolute top-0 h-full bg-accent/20 rounded-r-full"
              style={{ left: `${baselinePct}%`, width: `${100 - baselinePct}%` }}
            />
            <div
              className="absolute top-0 left-0 h-full bg-[#7C3AED] rounded-full transition-all"
              style={{ width: `${Math.min(progressPct, baselinePct)}%` }}
            />
            {progressPct > baselinePct && (
              <div
                className="absolute top-0 h-full bg-accent rounded-r-full transition-all"
                style={{ left: `${baselinePct}%`, width: `${progressPct - baselinePct}%` }}
              />
            )}
          </div>

          <div className="flex justify-between text-[10px] text-text-secondary">
            <span>Day {elapsed} of {totalDays}</span>
            <span>{progressPct}% complete</span>
          </div>

          <div className="flex gap-4 mt-3 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#7C3AED]" /> Baseline ({experiment.baselineDays}d)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent" /> Intervention ({experiment.interventionDays}d)
            </span>
          </div>
        </Card>

        {/* Data Collection Status */}
        <Card padding="md">
          <p className="text-sm font-semibold text-text-primary mb-2">Data Collection</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-lg bg-[#7C3AED]/5 border border-[#7C3AED]/10">
              <p className="text-xl font-semibold text-[#7C3AED]">{baselineData.length}</p>
              <p className="text-[10px] text-text-secondary">Baseline entries</p>
              {baselineData.length > 0 && (
                <p className="text-[10px] text-[#7C3AED] mt-0.5">Avg HBI: {mean(baselineData).toFixed(1)}</p>
              )}
            </div>
            <div className="text-center p-3 rounded-lg bg-accent/5 border border-accent/10">
              <p className="text-xl font-semibold text-accent">{interventionData.length}</p>
              <p className="text-[10px] text-text-secondary">Intervention entries</p>
              {interventionData.length > 0 && (
                <p className="text-[10px] text-accent mt-0.5">Avg HBI: {mean(interventionData).toFixed(1)}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Analysis Button */}
        {experiment.status === 'analysis' && (
          <Button
            fullWidth
            size="lg"
            onClick={runAnalysis}
            disabled={baselineData.length < 3 || interventionData.length < 3 || analyzing}
          >
            {analyzing ? 'Analyzing...' : 'Run Analysis'}
          </Button>
        )}

        {(baselineData.length < 3 || interventionData.length < 3) && experiment.status === 'analysis' && (
          <Card padding="sm" className="bg-[#F97316]/10 border border-[#F97316]/20">
            <p className="text-xs text-[#F97316]">
              Need at least 3 entries in each phase for statistical analysis.
              Baseline: {baselineData.length}/3, Intervention: {interventionData.length}/3.
            </p>
          </Card>
        )}

        {/* Results */}
        {experiment.result && (
          <>
            {/* Before/After Chart */}
            <Card padding="md">
              <p className="text-sm font-semibold text-text-primary mb-3">Before vs After</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E6" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E6', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(value: any) => [Number(value).toFixed(2), 'Avg HBI']}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      <Cell fill="#7C3AED" />
                      <Cell fill="#10A37F" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Stats */}
            <Card padding="md">
              <p className="text-sm font-semibold text-text-primary mb-3">Statistical Results</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-secondary">Mean Change</span>
                  <span className={`text-sm font-semibold ${experiment.result.percentChange < 0 ? 'text-accent' : 'text-[#F97316]'}`}>
                    {experiment.result.percentChange > 0 ? '+' : ''}{experiment.result.percentChange}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-secondary">P-value</span>
                  <Badge variant={experiment.result.statisticalSignificance ? 'success' : 'neutral'}>
                    p = {experiment.result.pValue}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-secondary">Effect Size (Cohen&apos;s d)</span>
                  <span className="text-sm font-semibold text-text-primary">{experiment.result.effectSize}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-secondary">Baseline Avg</span>
                  <span className="text-sm text-text-primary">{experiment.result.baselineAvgSymptoms}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-secondary">Intervention Avg</span>
                  <span className="text-sm text-text-primary">{experiment.result.interventionAvgSymptoms}</span>
                </div>
              </div>
            </Card>

            {/* Conclusion */}
            <Card padding="md" className="bg-bg-secondary border border-border">
              <p className="text-sm font-semibold text-accent mb-1">Conclusion</p>
              <p className="text-xs text-text-primary leading-relaxed">{experiment.result.conclusion}</p>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
