'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PersonalTrigger, PersonalInsight, LearnedWeights } from '@/lib/db';
import {
  getTriggers,
  getInsights,
  getLearnedWeightsAction,
  getPredictionFeedbackCount,
  runCorrelationAnalysisAction,
  confirmTrigger as confirmTriggerAction,
  dismissTrigger as dismissTriggerAction,
  markInsightRead as markInsightReadAction,
} from '@/actions/learning';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function LearnPage() {
  const [triggers, setTriggers] = useState<PersonalTrigger[]>([]);
  const [insights, setInsights] = useState<PersonalInsight[]>([]);
  const [weights, setWeights] = useState<LearnedWeights | null>(null);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [tab, setTab] = useState<'triggers' | 'insights' | 'brain'>('triggers');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [t, i, w, fc] = await Promise.all([
      getTriggers(),
      getInsights(),
      getLearnedWeightsAction(),
      getPredictionFeedbackCount(),
    ]);
    setTriggers(t);
    setInsights(i);
    setWeights(w ?? null);
    setFeedbackCount(fc);
  }

  async function runAnalysis() {
    setAnalyzing(true);
    try {
      await runCorrelationAnalysisAction();
      await loadData();
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  }

  async function confirmTrigger(id: string) {
    await confirmTriggerAction(id);
    setTriggers(prev => prev.map(t => t.id === id ? { ...t, confirmed: true } : t));
  }

  async function dismissTrigger(id: string) {
    await dismissTriggerAction(id);
    setTriggers(prev => prev.filter(t => t.id !== id));
  }

  async function markInsightRead(id: string) {
    await markInsightReadAction(id);
    setInsights(prev => prev.map(i => i.id === id ? { ...i, read: true } : i));
  }

  const confirmedTriggers = triggers.filter(t => t.confirmed);
  const suspectedTriggers = triggers.filter(t => !t.confirmed);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/insights" className="w-9 h-9 rounded-lg border border-border bg-bg flex items-center justify-center tap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Aafiya&apos;s Brain</h1>
          <p className="text-[12px] text-text-tertiary">What I&apos;ve learned about you</p>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <Card padding="sm" className="text-center">
          <p className="text-lg font-bold text-accent">{confirmedTriggers.length}</p>
          <p className="text-[10px] text-text-tertiary">Confirmed Triggers</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-lg font-bold text-risk-watch">{suspectedTriggers.length}</p>
          <p className="text-[10px] text-text-tertiary">Suspected</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-lg font-bold text-lavender">{weights?.accuracy ?? 0}%</p>
          <p className="text-[10px] text-text-tertiary">Prediction Accuracy</p>
        </Card>
      </div>

      {/* Run Analysis */}
      <Button fullWidth variant="secondary" onClick={runAnalysis} disabled={analyzing}>
        {analyzing ? 'Analyzing your data...' : 'Re-analyze My Data'}
      </Button>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-bg-secondary mt-6 mb-4">
        {(['triggers', 'insights', 'brain'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === t ? 'bg-bg shadow-sm text-text-primary' : 'text-text-tertiary'
            }`}
          >
            {t === 'triggers' ? 'My Triggers' : t === 'insights' ? 'Discoveries' : 'Learning'}
          </button>
        ))}
      </div>

      {/* Triggers Tab */}
      {tab === 'triggers' && (
        <div className="space-y-3">
          {triggers.length === 0 ? (
            <Card padding="md" className="text-center">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-sm text-text-secondary">No triggers discovered yet</p>
              <p className="text-[11px] text-text-tertiary mt-1">
                Keep logging your symptoms, food, and sleep. Aafiya needs at least 7 days of data to start finding patterns.
              </p>
            </Card>
          ) : (
            <>
              {confirmedTriggers.length > 0 && (
                <>
                  <p className="text-[11px] font-semibold text-accent uppercase tracking-wider">Confirmed</p>
                  {confirmedTriggers.map(t => (
                    <TriggerCard key={t.id} trigger={t} onDismiss={dismissTrigger} />
                  ))}
                </>
              )}

              {suspectedTriggers.length > 0 && (
                <>
                  <p className="text-[11px] font-semibold text-risk-watch uppercase tracking-wider mt-4">Suspected — Help Aafiya Learn</p>
                  <p className="text-[11px] text-text-tertiary mb-2">
                    Do these match your experience? Confirming helps Aafiya give you better advice.
                  </p>
                  {suspectedTriggers.map(t => (
                    <TriggerCard key={t.id} trigger={t} onConfirm={confirmTrigger} onDismiss={dismissTrigger} />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Insights Tab */}
      {tab === 'insights' && (
        <div className="space-y-3">
          {insights.length === 0 ? (
            <Card padding="md" className="text-center">
              <p className="text-2xl mb-2">💡</p>
              <p className="text-sm text-text-secondary">No insights yet</p>
              <p className="text-[11px] text-text-tertiary mt-1">
                Aafiya generates insights as it discovers patterns in your data.
              </p>
            </Card>
          ) : (
            insights.slice(0, 20).map(insight => (
              <button
                key={insight.id}
                onClick={() => markInsightRead(insight.id)}
                className="w-full text-left"
              >
                <Card padding="md" className={`${!insight.read ? 'border-accent/30' : ''}`}>
                  <div className="flex items-start gap-2">
                    {!insight.read && (
                      <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-secondary text-text-tertiary font-medium">
                          {insight.type === 'trigger_discovered' ? '🔍 Trigger'
                            : insight.type === 'weekly_summary' ? '📊 Weekly'
                            : insight.type === 'pattern_found' ? '📈 Pattern'
                            : insight.type === 'prediction_improved' ? '🎯 Accuracy'
                            : '⭐ Milestone'}
                        </span>
                        <span className="text-[10px] text-text-quaternary">
                          {new Date(insight.generatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-text-primary">{insight.title}</p>
                      <p className="text-[12px] text-text-secondary mt-0.5 leading-relaxed">{insight.body}</p>
                      {insight.actionable && insight.action && (
                        <p className="text-[11px] text-accent font-medium mt-2">
                          💡 {insight.action}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </button>
            ))
          )}
        </div>
      )}

      {/* Brain Tab */}
      {tab === 'brain' && (
        <div className="space-y-4">
          <Card padding="md">
            <p className="text-sm font-semibold text-text-primary mb-3">How Aafiya Learns</p>
            <div className="space-y-3 text-[12px] text-text-secondary leading-relaxed">
              <div className="flex gap-3">
                <span className="text-lg">1️⃣</span>
                <p><strong className="text-text-primary">Correlation Engine</strong> — Every time you log symptoms, Aafiya looks at what you ate, how you slept, your stress, and your cycle in the past 24-48 hours to find patterns.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-lg">2️⃣</span>
                <p><strong className="text-text-primary">Trigger Discovery</strong> — When a pattern appears consistently (at least 5 occurrences, r &gt; 0.25), Aafiya flags it as a suspected trigger and asks you to confirm.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-lg">3️⃣</span>
                <p><strong className="text-text-primary">Adaptive Weights</strong> — Aafiya tracks whether its flare predictions were right. Over time, it increases the weight of factors that matter most for YOU.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-lg">4️⃣</span>
                <p><strong className="text-text-primary">AI Context</strong> — Confirmed triggers are fed into Aafiya&apos;s AI companion, so it can give you truly personalized advice.</p>
              </div>
            </div>
          </Card>

          {/* Current Weights */}
          <Card padding="md">
            <p className="text-sm font-semibold text-text-primary mb-3">Current Flare Prediction Weights</p>
            <p className="text-[11px] text-text-tertiary mb-3">
              {weights && weights.totalPredictions > 10
                ? 'These weights have been personalized based on your feedback.'
                : 'Using default weights. Give feedback on predictions to personalize.'}
            </p>
            <div className="space-y-2">
              {[
                { label: 'Symptom Trend', value: weights?.symptomTrend ?? 25, color: 'bg-rose' },
                { label: 'Sleep & Circadian', value: weights?.circadianDisruption ?? 20, color: 'bg-lavender' },
                { label: 'Diet & Food', value: weights?.dietaryRisk ?? 15, color: 'bg-coral' },
                { label: 'Menstrual Phase', value: weights?.menstrualPhase ?? 15, color: 'bg-rose' },
                { label: 'Stress & Mood', value: weights?.stressMood ?? 10, color: 'bg-risk-watch' },
                { label: 'Medication', value: weights?.medicationAdherence ?? 10, color: 'bg-accent' },
                { label: 'Meal Timing', value: weights?.mealTiming ?? 5, color: 'bg-blue' },
              ].map(w => (
                <div key={w.label}>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-text-secondary">{w.label}</span>
                    <span className="text-text-primary font-medium">{w.value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
                    <div className={`h-full rounded-full ${w.color}`} style={{ width: `${w.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Accuracy */}
          {weights && weights.totalPredictions > 0 && (
            <Card padding="md">
              <p className="text-sm font-semibold text-text-primary mb-2">Prediction Accuracy</p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-accent flex items-center justify-center">
                  <span className="text-lg font-bold text-accent">{weights.accuracy}%</span>
                </div>
                <div>
                  <p className="text-[12px] text-text-secondary">
                    {weights.correctPredictions} correct out of {weights.totalPredictions} predictions
                  </p>
                  <p className="text-[11px] text-text-tertiary mt-1">
                    {weights.accuracy >= 80 ? 'Excellent — Aafiya knows you well'
                      : weights.accuracy >= 60 ? 'Good — getting better with each feedback'
                      : 'Still learning — keep giving feedback'}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function TriggerCard({
  trigger,
  onConfirm,
  onDismiss,
}: {
  trigger: PersonalTrigger;
  onConfirm?: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const isRisk = trigger.direction === 'worsens';

  return (
    <Card padding="md">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isRisk ? 'bg-red-light text-rose' : 'bg-green-light text-green'
        }`}>
          <span className="text-sm">{isRisk ? '⚠️' : '✅'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-text-primary">{trigger.factor}</p>
            {trigger.confirmed && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent-light text-accent font-medium">Confirmed</span>
            )}
          </div>
          <p className="text-[12px] text-text-secondary mt-0.5 leading-relaxed">{trigger.detail}</p>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-text-tertiary">
            <span>Confidence: {trigger.confidence}%</span>
            <span>Based on {trigger.sampleSize} data points</span>
          </div>

          {/* Confirm / Dismiss buttons for suspected triggers */}
          {!trigger.confirmed && onConfirm && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onConfirm(trigger.id)}
                className="px-3 py-1.5 rounded-lg bg-accent-light text-accent text-[11px] font-medium hover:bg-accent/20 transition-colors"
              >
                Yes, this is real
              </button>
              <button
                onClick={() => onDismiss(trigger.id)}
                className="px-3 py-1.5 rounded-lg bg-bg-secondary text-text-tertiary text-[11px] font-medium hover:bg-bg-tertiary transition-colors"
              >
                Not for me
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
