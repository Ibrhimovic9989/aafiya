'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { FoodEntry, SymptomEntry } from '@/lib/db';
import { getFoodByDateRange } from '@/actions/food';
import { getSymptomsByDateRange } from '@/actions/symptoms';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { mean } from '@/lib/statistics';
import { useCondition } from '@/lib/useCondition';

interface TriggerAnalysis {
  riskCounts: { low: number; medium: number; high: number };
  totalEntries: number;
  topWarnings: { compound: string; count: number }[];
  foodCorrelations: { food: string; avgNextDayScore: number; occurrences: number }[];
}

export default function TriggersPage() {
  const { profile: conditionProfile } = useCondition();
  const scoreName = conditionProfile.scoring.name;
  const [analysis, setAnalysis] = useState<TriggerAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

      const [food, symptoms] = await Promise.all([
        getFoodByDateRange(monthAgo, today + '\uffff'),
        getSymptomsByDateRange(monthAgo, today + '\uffff'),
      ]);

      // Risk counts
      const riskCounts = { low: 0, medium: 0, high: 0 };
      for (const f of food) {
        if (f.mealRisk === 'low') riskCounts.low++;
        else if (f.mealRisk === 'medium') riskCounts.medium++;
        else if (f.mealRisk === 'high') riskCounts.high++;
      }

      // Top risk compounds
      const warningMap = new Map<string, number>();
      for (const f of food) {
        if (f.compounds?.riskCompounds) {
          for (const rc of f.compounds.riskCompounds) {
            if (rc.direction === 'flare') {
              warningMap.set(rc.name, (warningMap.get(rc.name) || 0) + 1);
            }
          }
        }
      }
      const topWarnings = Array.from(warningMap.entries())
        .map(([compound, count]: [any, any]) => ({ compound, count }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 8);

      // Food-HBI correlation (if enough data)
      const foodCorrelations: TriggerAnalysis['foodCorrelations'] = [];
      if (food.length > 10) {
        // Build symptom lookup by date
        const symptomByDate = new Map<string, number>();
        for (const s of symptoms) {
          symptomByDate.set(s.date, (s as any).activityScore ?? s.hbiScore);
        }

        // Group foods by description, find next-day score
        const foodScoreMap = new Map<string, number[]>();
        for (const f of food) {
          const nextDay = new Date(new Date(f.date).getTime() + 86400000).toISOString().split('T')[0];
          const nextDayScore = symptomByDate.get(nextDay);
          if (nextDayScore !== undefined) {
            const key = f.description.toLowerCase().trim();
            if (!foodScoreMap.has(key)) foodScoreMap.set(key, []);
            foodScoreMap.get(key)!.push(nextDayScore);
          }
        }

        for (const [food, scores] of foodScoreMap.entries()) {
          if (scores.length >= 2) {
            foodCorrelations.push({
              food,
              avgNextDayScore: mean(scores),
              occurrences: scores.length,
            });
          }
        }

        foodCorrelations.sort((a: any, b: any) => b.avgNextDayScore - a.avgNextDayScore);
      }

      setAnalysis({
        riskCounts,
        totalEntries: food.length,
        topWarnings,
        foodCorrelations: foodCorrelations.slice(0, 10),
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
        <h1 className="text-xl font-semibold text-text-primary">Food Triggers</h1>
      </div>

      {!analysis || analysis.totalEntries === 0 ? (
        <Card padding="lg" className="text-center">
          <p className="text-text-secondary">No food data yet. Log your meals to discover which foods may trigger flares.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Risk Breakdown */}
          <Card padding="md">
            <p className="text-sm font-semibold text-text-primary mb-3">Meal Risk Breakdown</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-semibold text-accent">{analysis.riskCounts.low}</p>
                <p className="text-xs text-text-secondary">Low Risk</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-[#F59E0B]">{analysis.riskCounts.medium}</p>
                <p className="text-xs text-text-secondary">Medium</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-[#F97316]">{analysis.riskCounts.high}</p>
                <p className="text-xs text-text-secondary">High Risk</p>
              </div>
            </div>
            {/* Stacked bar */}
            <div className="flex h-3 rounded-full overflow-hidden mt-3">
              {analysis.riskCounts.low > 0 && (
                <div
                  className="bg-accent/30"
                  style={{ width: `${(analysis.riskCounts.low / analysis.totalEntries) * 100}%` }}
                />
              )}
              {analysis.riskCounts.medium > 0 && (
                <div
                  className="bg-[#F59E0B]"
                  style={{ width: `${(analysis.riskCounts.medium / analysis.totalEntries) * 100}%` }}
                />
              )}
              {analysis.riskCounts.high > 0 && (
                <div
                  className="bg-[#F97316]"
                  style={{ width: `${(analysis.riskCounts.high / analysis.totalEntries) * 100}%` }}
                />
              )}
            </div>
          </Card>

          {/* Top Risk Compounds */}
          {analysis.topWarnings.length > 0 && (
            <Card padding="md">
              <p className="text-sm font-semibold text-text-primary mb-3">Most Common Risk Compounds</p>
              <div className="space-y-2">
                {analysis.topWarnings.map((w, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-text-primary">{w.compound}</span>
                    <Badge variant="warning">{w.count} meals</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Food Correlations */}
          {analysis.foodCorrelations.length > 0 && (
            <Card padding="md">
              <p className="text-sm font-semibold text-text-primary mb-1">Food-Symptom Correlations</p>
              <p className="text-[10px] text-text-secondary mb-3">Foods and their average next-day {scoreName} score</p>
              <div className="space-y-2">
                {analysis.foodCorrelations.map((fc, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-text-primary truncate flex-1 capitalize">{fc.food}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-text-secondary">{fc.occurrences}x</span>
                      <Badge variant={fc.avgNextDayScore >= 8 ? 'danger' : fc.avgNextDayScore >= 5 ? 'warning' : 'success'}>
                        {scoreName} {fc.avgNextDayScore.toFixed(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {analysis.totalEntries <= 10 && (
            <Card padding="md" className="bg-bg-secondary border border-border">
              <p className="text-xs text-accent">
                Log more than 10 food entries to unlock food-symptom correlation analysis. You currently have {analysis.totalEntries} entries.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
