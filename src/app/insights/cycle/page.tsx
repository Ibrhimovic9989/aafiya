'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CycleEntry, SymptomEntry } from '@/lib/db';
import { getSymptomsByDateRange } from '@/actions/symptoms';
import { getCycleByDateRange } from '@/actions/cycle';
import { getProfile } from '@/actions/profile';
import { PHASE_COLORS, PHASE_LABELS, CyclePhase, getPhaseFromDay } from '@/lib/cyclePhase';
import { mean } from '@/lib/statistics';
import { useCondition } from '@/lib/useCondition';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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

interface PhaseData {
  phase: CyclePhase;
  label: string;
  avgScore: number;
  count: number;
  color: string;
}

interface CycleInsight {
  phaseData: PhaseData[];
  worstPhase: string;
  bestPhase: string;
  hasEnoughData: boolean;
  totalSymptoms: number;
  totalCycle: number;
}

export default function CycleCorrelationPage() {
  const { profile: conditionProfile } = useCondition();
  const scoreName = conditionProfile.scoring.name;
  const [insight, setInsight] = useState<CycleInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split('T')[0];
      const threeMonthsAgo = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];

      const [symptoms, cycle, profile] = await Promise.all([
        getSymptomsByDateRange(threeMonthsAgo, today + '\uffff'),
        getCycleByDateRange(threeMonthsAgo, today + '\uffff'),
        getProfile(),
      ]);

      if (cycle.length === 0 && symptoms.length === 0) {
        setInsight({ phaseData: [], worstPhase: '', bestPhase: '', hasEnoughData: false, totalSymptoms: 0, totalCycle: 0 });
        setLoading(false);
        return;
      }

      // Build symptom lookup by date
      const symptomByDate = new Map<string, number>();
      for (const s of symptoms) {
        symptomByDate.set(s.date, (s as any).activityScore ?? s.hbiScore);
      }

      // Group scores by cycle phase
      const phaseScores: Record<CyclePhase, number[]> = {
        menstrual: [],
        follicular: [],
        ovulatory: [],
        luteal: [],
      };

      // Use cycle entries to map dates to phases
      for (const c of cycle) {
        const score = symptomByDate.get(c.date);
        if (score !== undefined) {
          phaseScores[c.phase as CyclePhase]?.push(score);
        }
      }

      // If cycle data is sparse, also use profile data to infer phases
      if (profile?.cycleStartDate) {
        for (const s of symptoms) {
          // Only if not already covered by cycle entries
          const alreadyCovered = cycle.some((c: any) => c.date === s.date);
          if (!alreadyCovered) {
            const start = new Date(profile.cycleStartDate);
            const current = new Date(s.date);
            const diffDays = Math.floor((current.getTime() - start.getTime()) / (86400000));
            const cycleDay = (diffDays % (profile.cycleLength || 28)) + 1;
            const phase = getPhaseFromDay(cycleDay, profile.cycleLength || 28);
            phaseScores[phase].push((s as any).activityScore ?? s.hbiScore);
          }
        }
      }

      const phases: CyclePhase[] = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
      const phaseData: PhaseData[] = phases.map(phase => ({
        phase,
        label: PHASE_LABELS[phase],
        avgScore: phaseScores[phase].length > 0 ? mean(phaseScores[phase]) : 0,
        count: phaseScores[phase].length,
        color: PHASE_COLORS[phase],
      }));

      const withData = phaseData.filter(p => p.count > 0);
      const worstPhase = withData.length > 0 ? withData.reduce((a, b) => a.avgScore > b.avgScore ? a : b).label : '';
      const bestPhase = withData.length > 0 ? withData.reduce((a, b) => a.avgScore < b.avgScore ? a : b).label : '';
      const hasEnoughData = withData.length >= 2 && withData.some(p => p.count >= 3);

      setInsight({
        phaseData,
        worstPhase,
        bestPhase,
        hasEnoughData,
        totalSymptoms: symptoms.length,
        totalCycle: cycle.length,
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
        <h1 className="text-xl font-semibold text-text-primary">Cycle Correlation</h1>
      </div>

      {!insight || (insight.totalCycle === 0 && insight.totalSymptoms === 0) ? (
        <Card padding="lg" className="text-center">
          <p className="text-text-secondary">
            No cycle or symptom data yet. Log your cycle and how you feel to see how your phases affect your wellbeing.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Research Context */}
          <Card padding="md" className="bg-bg-secondary border border-border">
            <p className="text-xs text-[#7C3AED] font-medium mb-1">Research Context</p>
            <p className="text-[11px] text-text-primary leading-relaxed">
              Research shows that many women experience changes in how they feel during different cycle phases.
              The premenstrual phase can sometimes bring increased discomfort, nausea, and tummy aches.
            </p>
          </Card>

          {/* Phase Chart */}
          {insight.phaseData.some(p => p.count > 0) && (
            <Card padding="md">
              <p className="text-sm font-semibold text-text-primary mb-3">Average {scoreName} by Cycle Phase</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={insight.phaseData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E6" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E6', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(value: any) => [Number(value).toFixed(1), `Avg ${scoreName}`]}
                    />
                    <Bar dataKey="avgScore" radius={[6, 6, 0, 0]}>
                      {insight.phaseData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-3">
                {insight.phaseData.map(p => (
                  <div key={p.phase} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-[10px] text-text-secondary">
                      {p.label} ({p.count} days)
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Findings */}
          {insight.hasEnoughData && (
            <Card padding="md">
              <p className="text-sm font-semibold text-text-primary mb-3">Your Findings</p>
              <div className="space-y-3">
                {insight.worstPhase && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#F97316] mt-1.5 flex-shrink-0" />
                    <p className="text-sm text-text-primary">
                      Your worst phase is <span className="font-semibold">{insight.worstPhase}</span> with the highest average score.
                    </p>
                  </div>
                )}
                {insight.bestPhase && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                    <p className="text-sm text-text-primary">
                      Your best phase is <span className="font-semibold">{insight.bestPhase}</span> with the lowest average score.
                    </p>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#7C3AED] mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-text-primary">
                    Consider planning lighter meals and extra rest during your {insight.worstPhase || 'menstrual'} phase.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {!insight.hasEnoughData && (
            <Card padding="md" className="bg-bg-secondary border border-border">
              <p className="text-xs text-accent">
                Keep logging symptoms alongside your cycle for at least 2-3 full cycles to generate personalized findings.
                You have {insight.totalSymptoms} symptom entries and {insight.totalCycle} cycle entries so far.
              </p>
            </Card>
          )}

          {/* Phase Details */}
          <Card padding="md">
            <p className="text-sm font-semibold text-text-primary mb-3">Phase Details</p>
            <div className="space-y-3">
              {insight.phaseData.map(p => (
                <div key={p.phase} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-sm text-text-primary">{p.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary">{p.count} days</span>
                    <Badge variant={p.avgScore >= 8 ? 'danger' : p.avgScore >= 5 ? 'warning' : 'success'}>
                      {p.count > 0 ? `${scoreName} ${p.avgScore.toFixed(1)}` : 'No data'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
