'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import type { SymptomEntry, SleepEntry, FoodEntry, MedicationEntry, CycleEntry, Experiment, UserProfile } from '@/lib/db';
import { getProfile } from '@/actions/profile';
import { getSymptomsByDateRange } from '@/actions/symptoms';
import { getSleepByDateRange } from '@/actions/sleep';
import { getFoodByDateRange } from '@/actions/food';
import { getMedicationsByDateRange } from '@/actions/medications';
import { getCycleByDateRange } from '@/actions/cycle';
import { getExperiments } from '@/actions/experiments';
import { getHBISeverity, getHBILabel, estimateCDAI } from '@/lib/scoring';
import { mean } from '@/lib/statistics';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type DateRange = '2weeks' | '1month' | '3months' | 'custom';

interface ReportData {
  dateRange: string;
  hbi: { avg: number; min: number; max: number; entries: number; severity: string };
  cdai: { avg: number; min: number; max: number };
  medAdherence: { pct: number; taken: number; total: number };
  sleep: { avgCircadian: number; avgDuration: number; avgJetLag: number; entries: number };
  triggers: { highRisk: number; total: number; topCompounds: string[] };
  cycle: { entries: number; worstPhase: string } | null;
  experiments: { title: string; result: string; significant: boolean }[];
  profile: UserProfile | null;
}

export default function ReportPage() {
  const [range, setRange] = useState<DateRange>('1month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  function getDateRange(): [string, string] {
    const end = new Date().toISOString().split('T')[0];
    if (range === 'custom' && customStart && customEnd) {
      return [customStart, customEnd];
    }
    const days = range === '2weeks' ? 14 : range === '1month' ? 30 : 90;
    const start = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    return [start, end];
  }

  async function generateReport() {
    setLoading(true);
    const [start, end] = getDateRange();

    const [symptoms, sleep, food, meds, cycle, experiments, profile] = await Promise.all([
      getSymptomsByDateRange(start, end),
      getSleepByDateRange(start, end),
      getFoodByDateRange(start, end),
      getMedicationsByDateRange(start, end),
      getCycleByDateRange(start, end),
      getExperiments(),
      getProfile(),
    ]);

    // HBI
    const hbiScores = symptoms.map((s: any) => s.hbiScore);
    const hbiAvg = hbiScores.length > 0 ? mean(hbiScores) : 0;
    const hbiMin = hbiScores.length > 0 ? Math.min(...hbiScores) : 0;
    const hbiMax = hbiScores.length > 0 ? Math.max(...hbiScores) : 0;

    // CDAI
    const cdaiScores = hbiScores.map((h: any) => estimateCDAI(h));
    const cdaiAvg = cdaiScores.length > 0 ? mean(cdaiScores) : 0;

    // Medication adherence
    const medTaken = meds.filter((m: any) => m.taken).length;
    const medPct = meds.length > 0 ? (medTaken / meds.length) * 100 : 0;

    // Sleep
    const avgCircadian = sleep.length > 0 ? mean(sleep.map((s: any) => s.circadianScore)) : 0;
    const avgDuration = sleep.length > 0 ? mean(sleep.map((s: any) => s.duration)) : 0;
    const avgJetLag = sleep.length > 0 ? mean(sleep.map((s: any) => s.socialJetLagMinutes)) : 0;

    // Food triggers
    const highRisk = food.filter((f: any) => f.mealRisk === 'high').length;
    const compoundMap = new Map<string, number>();
    for (const f of food) {
      if (f.compounds?.riskCompounds) {
        for (const rc of f.compounds.riskCompounds) {
          if (rc.direction === 'flare') {
            compoundMap.set(rc.name, (compoundMap.get(rc.name) || 0) + 1);
          }
        }
      }
    }
    const topCompounds = Array.from(compoundMap.entries())
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]: any) => name);

    // Cycle
    let cycleData = null;
    if (cycle.length > 0) {
      const phaseHBI: Record<string, number[]> = {};
      const symptomByDate = new Map<string, number>(symptoms.map((s: any) => [s.date, s.hbiScore]));
      for (const c of cycle) {
        const hbi = symptomByDate.get((c as any).date);
        if (hbi !== undefined) {
          if (!phaseHBI[(c as any).phase]) phaseHBI[(c as any).phase] = [];
          phaseHBI[(c as any).phase].push(hbi);
        }
      }
      const worst = Object.entries(phaseHBI)
        .map(([phase, scores]: [any, any]) => ({ phase, avg: mean(scores) }))
        .sort((a: any, b: any) => b.avg - a.avg)[0];
      cycleData = { entries: cycle.length, worstPhase: worst?.phase || 'N/A' };
    }

    // Experiments
    const completedExps = experiments
      .filter((e: any) => e.result)
      .map((e: any) => ({
        title: e.title,
        result: e.result!.conclusion.substring(0, 120) + '...',
        significant: e.result!.statisticalSignificance,
      }));

    setReport({
      dateRange: `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`,
      hbi: { avg: hbiAvg, min: hbiMin, max: hbiMax, entries: symptoms.length, severity: getHBILabel(getHBISeverity(hbiAvg)) },
      cdai: { avg: cdaiAvg, min: cdaiScores.length > 0 ? Math.min(...cdaiScores) : 0, max: cdaiScores.length > 0 ? Math.max(...cdaiScores) : 0 },
      medAdherence: { pct: medPct, taken: medTaken, total: meds.length },
      sleep: { avgCircadian, avgDuration, avgJetLag, entries: sleep.length },
      triggers: { highRisk, total: food.length, topCompounds },
      cycle: cycleData,
      experiments: completedExps,
      profile,
    });
    setLoading(false);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 print:hidden">
        <Link href="/more" className="p-1 rounded-lg hover:bg-bg-secondary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-xl font-semibold text-text-primary">Doctor Report</h1>
      </div>

      {/* Date Range Selector */}
      <div className="space-y-3 mb-6 print:hidden">
        <div className="flex gap-2 flex-wrap">
          {([
            ['2weeks', 'Last 2 Weeks'],
            ['1month', 'Last Month'],
            ['3months', 'Last 3 Months'],
            ['custom', 'Custom'],
          ] as [DateRange, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                range === key
                  ? 'bg-accent text-white'
                  : 'bg-bg-secondary text-text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {range === 'custom' && (
          <div className="flex gap-2">
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-bg-secondary border border-border text-sm text-text-primary outline-none"
            />
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-bg-secondary border border-border text-sm text-text-primary outline-none"
            />
          </div>
        )}

        <Button fullWidth onClick={generateReport} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>

      {/* Report Content */}
      {report && (
        <div ref={reportRef} className="space-y-4">
          {/* Print Header */}
          <div className="hidden print:block mb-4">
            <h1 className="text-xl font-semibold">Aafiya - Health Report</h1>
            {report.profile && <p className="text-sm">Patient: {report.profile.name}</p>}
            <p className="text-sm text-gray-500">{report.dateRange}</p>
          </div>

          <Card padding="md">
            <p className="text-xs text-text-secondary mb-1">Report Period</p>
            <p className="text-sm font-semibold text-text-primary">{report.dateRange}</p>
          </Card>

          {/* HBI Summary */}
          <Card padding="md">
            <p className="text-sm font-semibold text-text-primary mb-3">HBI Trend Summary</p>
            <div className="grid grid-cols-3 gap-3 mb-2">
              <div className="text-center">
                <p className="text-xs text-text-secondary">Average</p>
                <p className="text-xl font-semibold text-text-primary">{report.hbi.avg.toFixed(1)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-secondary">Min</p>
                <p className="text-xl font-semibold text-accent">{report.hbi.min}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-secondary">Max</p>
                <p className="text-xl font-semibold text-[#F97316]">{report.hbi.max}</p>
              </div>
            </div>
            <p className="text-xs text-text-secondary">
              {report.hbi.entries} entries | Average severity: {report.hbi.severity}
            </p>
          </Card>

          {/* CDAI */}
          <Card padding="md">
            <p className="text-sm font-semibold text-text-primary mb-2">CDAI Estimates</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-xs text-text-secondary">Average</p>
                <p className="text-lg font-semibold text-text-primary">{report.cdai.avg.toFixed(0)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-secondary">Min</p>
                <p className="text-lg font-semibold text-accent">{report.cdai.min}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-secondary">Max</p>
                <p className="text-lg font-semibold text-[#F97316]">{report.cdai.max}</p>
              </div>
            </div>
            <p className="text-[10px] text-text-tertiary mt-2">Estimated from HBI using regression: CDAI = 100 + 13 x HBI</p>
          </Card>

          {/* Medication Adherence */}
          <Card padding="md">
            <p className="text-sm font-semibold text-text-primary mb-2">Medication Adherence</p>
            {report.medAdherence.total > 0 ? (
              <>
                <div className="flex items-center gap-3">
                  <p className={`text-2xl font-semibold ${report.medAdherence.pct >= 90 ? 'text-accent' : report.medAdherence.pct >= 70 ? 'text-[#F59E0B]' : 'text-[#F97316]'}`}>
                    {report.medAdherence.pct.toFixed(0)}%
                  </p>
                  <p className="text-xs text-text-secondary">
                    {report.medAdherence.taken} of {report.medAdherence.total} doses taken
                  </p>
                </div>
              </>
            ) : (
              <p className="text-xs text-text-secondary">No medication data logged</p>
            )}
          </Card>

          {/* Sleep */}
          <Card padding="md">
            <p className="text-sm font-semibold text-text-primary mb-2">Sleep Analysis</p>
            {report.sleep.entries > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-xs text-text-secondary">Circadian</p>
                  <p className="text-lg font-semibold text-[#7C3AED]">{report.sleep.avgCircadian.toFixed(0)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-secondary">Avg Sleep</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {Math.floor(report.sleep.avgDuration / 60)}h {Math.round(report.sleep.avgDuration % 60)}m
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-secondary">Jet Lag</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {(report.sleep.avgJetLag / 60).toFixed(1)}h
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-secondary">No sleep data logged</p>
            )}
          </Card>

          {/* Food Triggers */}
          <Card padding="md">
            <p className="text-sm font-semibold text-text-primary mb-2">Food Triggers</p>
            {report.triggers.total > 0 ? (
              <>
                <p className="text-xs text-text-secondary mb-2">
                  {report.triggers.highRisk} high-risk meals out of {report.triggers.total} logged
                </p>
                {report.triggers.topCompounds.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {report.triggers.topCompounds.map((c, i) => (
                      <Badge key={i} variant="warning">{c}</Badge>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-text-secondary">No food data logged</p>
            )}
          </Card>

          {/* Cycle */}
          {report.cycle && (
            <Card padding="md">
              <p className="text-sm font-semibold text-text-primary mb-2">Cycle Correlation</p>
              <p className="text-xs text-text-secondary">
                {report.cycle.entries} entries. Worst phase: {report.cycle.worstPhase}.
              </p>
            </Card>
          )}

          {/* Experiments */}
          {report.experiments.length > 0 && (
            <Card padding="md">
              <p className="text-sm font-semibold text-text-primary mb-2">Experiment Results</p>
              <div className="space-y-2">
                {report.experiments.map((exp, i) => (
                  <div key={i} className="border-b border-border pb-2 last:border-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-text-primary">{exp.title}</p>
                      <Badge variant={exp.significant ? 'success' : 'neutral'}>
                        {exp.significant ? 'Significant' : 'Not significant'}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-text-secondary mt-0.5">{exp.result}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Print Button */}
          <div className="print:hidden">
            <Button fullWidth variant="secondary" onClick={handlePrint}>
              Print / Save as PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
