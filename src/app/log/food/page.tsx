'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { FoodItem, CompoundProfile } from '@/lib/db';
import { addFoodEntry } from '@/actions/food';
import Link from 'next/link';
import { analyzeMealCompounds, analyzeWithFooDB, type MealRiskAnalysis } from '@/lib/compounds';

interface ParsedFood {
  name: string;
  quantity: number;
  unit: string;
}

interface FoodWithNutrients extends ParsedFood {
  fdcId?: number;
  nutrients: Record<string, number>;
  description?: string;
}

function GutaBubble({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div className="flex items-start gap-2.5 animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
        </svg>
      </div>
      <div className="rounded-xl rounded-bl-sm border border-border bg-bg-secondary px-4 py-3 max-w-[85%]">
        <p className="text-[13px] text-text-primary leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function AnalysisStep({ label, done, active }: { label: string; done: boolean; active: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      {done ? (
        <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
      ) : active ? (
        <div className="w-5 h-5 rounded-full border-2 border-accent animate-spin border-t-transparent" />
      ) : (
        <div className="w-5 h-5 rounded-full bg-bg-tertiary" />
      )}
      <span className={`text-xs font-medium ${done ? 'text-accent' : active ? 'text-text-primary' : 'text-text-tertiary'}`}>
        {label}
      </span>
    </div>
  );
}

export default function FoodLoggerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>(() => {
    const h = new Date().getHours();
    if (h < 11) return 'breakfast';
    if (h < 15) return 'lunch';
    if (h < 20) return 'dinner';
    return 'snack';
  });
  const [mealTime, setMealTime] = useState(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  });

  const [step, setStep] = useState<'input' | 'parsing' | 'searching' | 'analyzing' | 'results' | 'done'>('input');
  const [parsedFoods, setParsedFoods] = useState<FoodWithNutrients[]>([]);
  const [compoundAnalysis, setCompoundAnalysis] = useState<MealRiskAnalysis | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mealOptions = [
    { value: 'breakfast' as const, label: 'Breakfast', emoji: '🌅' },
    { value: 'lunch' as const, label: 'Lunch', emoji: '☀️' },
    { value: 'dinner' as const, label: 'Dinner', emoji: '🌙' },
    { value: 'snack' as const, label: 'Snack', emoji: '🍎' },
  ];

  async function analyzeFood() {
    if (!description.trim()) return;
    setError(null);

    setStep('parsing');
    let parsed: ParsedFood[] = [];

    try {
      const parseRes = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, type: 'food_parse' }),
      });
      if (parseRes.ok) {
        const parseData = await parseRes.json();
        parsed = parseData.items || [];
      }
    } catch { /* fallback below */ }

    if (parsed.length === 0) {
      parsed = description.split(/,|and|\+/).map(item => ({
        name: item.trim(), quantity: 100, unit: 'g',
      })).filter(item => item.name.length > 0);
    }

    setStep('searching');
    const foodsWithNutrients: FoodWithNutrients[] = [];

    for (const food of parsed) {
      try {
        const searchRes = await fetch(`/api/food/search?query=${encodeURIComponent(food.name)}&pageSize=1`);
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const firstResult = searchData.foods?.[0];
          if (firstResult) {
            const nutrients: Record<string, number> = {};
            for (const n of firstResult.foodNutrients || []) {
              if (n.nutrientName && n.value !== undefined) nutrients[n.nutrientName] = n.value;
            }
            foodsWithNutrients.push({ ...food, fdcId: firstResult.fdcId, nutrients, description: firstResult.description });
          } else {
            foodsWithNutrients.push({ ...food, nutrients: {} });
          }
        } else {
          foodsWithNutrients.push({ ...food, nutrients: {} });
        }
      } catch {
        foodsWithNutrients.push({ ...food, nutrients: {} });
      }
    }

    setParsedFoods(foodsWithNutrients);

    setStep('analyzing');
    const mergedNutrients: Record<string, number> = {};
    for (const food of foodsWithNutrients) {
      for (const [key, value] of Object.entries(food.nutrients)) {
        mergedNutrients[key] = (mergedNutrients[key] || 0) + value;
      }
    }

    const foodNames = foodsWithNutrients.map(f => f.description || f.name);
    const analysis = analyzeWithFooDB(mergedNutrients, foodNames);
    setCompoundAnalysis(analysis);

    try {
      const insightRes = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'flare_analysis',
          riskScore: analysis.riskScore,
          factors: [
            ...analysis.warnings.map(w => ({ factor: 'Warning', detail: w, direction: 'up' })),
            ...analysis.positives.map(p => ({ factor: 'Positive', detail: p, direction: 'down' })),
          ],
          description: `Meal: ${description}. Key nutrients: ${Object.entries(mergedNutrients).slice(0, 10).map(([k, v]) => `${k}: ${v}`).join(', ')}`,
        }),
      });
      if (insightRes.ok) {
        const insightData = await insightRes.json();
        setAiInsight(insightData.analysis);
      }
    } catch { /* optional */ }

    setStep('results');
  }

  async function handleSave() {
    setSaving(true);
    try {
      const now = new Date();
      const foodItems: FoodItem[] = parsedFoods.map(f => ({
        name: f.name, fdcId: f.fdcId, quantity: f.quantity, unit: f.unit, nutrients: f.nutrients,
      }));

      const compounds: CompoundProfile | null = compoundAnalysis ? {
        totalFiber: parsedFoods.reduce((sum, f) => sum + (f.nutrients['Fiber, total dietary'] || 0), 0),
        insolubleFiber: 0,
        lactose: parsedFoods.reduce((sum, f) => sum + (f.nutrients['Lactose'] || 0), 0),
        fructose: parsedFoods.reduce((sum, f) => sum + (f.nutrients['Fructose'] || 0), 0),
        caffeine: parsedFoods.reduce((sum, f) => sum + (f.nutrients['Caffeine'] || 0), 0),
        alcohol: parsedFoods.reduce((sum, f) => sum + (f.nutrients['Alcohol, ethyl'] || 0), 0),
        fodmapScore: 0,
        riskCompounds: compoundAnalysis.flareCompounds.map(c => ({
          name: c.name, amount: c.amount, riskRank: c.riskRank, direction: c.direction,
        })),
      } : null;

      await addFoodEntry({
        date: now.toISOString().split('T')[0],
        timestamp: now.getTime(),
        mealType,
        description,
        foodItems,
        compounds,
        mealRisk: compoundAnalysis?.overallRisk || null,
        firstMealTime: mealType === 'breakfast' ? mealTime : undefined,
        lastMealTime: mealType === 'dinner' ? mealTime : undefined,
        notes: '',
      });
      setStep('done');
    } catch (err) {
      console.error('Failed to save food:', err);
      setSaving(false);
    }
  }

  const riskColor = compoundAnalysis?.overallRisk === 'low' ? 'accent' : compoundAnalysis?.overallRisk === 'medium' ? 'amber-500' : 'red-500';

  // Done
  if (step === 'done') {
    return (
      <div className="max-w-md mx-auto px-5 pt-12 pb-28 flex flex-col items-center gap-5 animate-slide-up">
        <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
        <p className="text-lg font-semibold text-text-primary">Meal logged</p>
        {compoundAnalysis && (
          <GutaBubble>
            {compoundAnalysis.overallRisk === 'low'
              ? "Nice choice! This meal looks safe for your gut. I'll keep tracking patterns."
              : compoundAnalysis.overallRisk === 'medium'
              ? "Some compounds to watch in this meal. I've logged everything and will correlate with how you feel tomorrow."
              : "This meal has some compounds I'll keep an eye on. I've logged everything and will watch for patterns."}
          </GutaBubble>
        )}
        <Link href="/" className="w-full">
          <button className="w-full bg-accent text-white font-semibold py-3.5 rounded-xl tap">
            Done
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-5 pt-4 pb-28 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/log" className="w-9 h-9 rounded-lg border border-border bg-bg flex items-center justify-center tap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-text-primary">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-base font-semibold text-text-primary">Log Food</h1>
          <p className="text-[10px] text-text-tertiary">AI compound analysis</p>
        </div>
      </div>

      {/* Guta asks */}
      <GutaBubble>
        What did you eat? Just describe it naturally — I&apos;ll figure out the compounds.
      </GutaBubble>

      {/* Meal type pills */}
      <div className="flex gap-2 pl-10 animate-slide-up">
        {mealOptions.map(m => (
          <button
            key={m.value}
            onClick={() => setMealType(m.value)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold tap transition-all ${
              mealType === m.value
                ? 'bg-text-primary text-white'
                : 'bg-bg-secondary border border-border text-text-primary'
            }`}
          >
            <span>{m.emoji}</span>
            {m.label}
          </button>
        ))}
      </div>

      {/* Text input */}
      <div className="pl-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <textarea
          ref={textRef}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g., dal with rice and a glass of lassi"
          rows={3}
          className="w-full px-4 py-3.5 rounded-xl border border-border bg-bg text-sm text-text-primary placeholder:text-text-quaternary resize-none outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
          disabled={step !== 'input'}
        />

        {step === 'input' && (
          <button
            onClick={analyzeFood}
            disabled={!description.trim()}
            className="w-full mt-2 bg-accent text-white font-semibold py-3.5 rounded-xl tap text-sm disabled:opacity-30 disabled:pointer-events-none"
          >
            Analyze this meal
          </button>
        )}
      </div>

      {error && (
        <div className="pl-10 rounded-xl px-4 py-3 border border-red-200 bg-red-50 animate-slide-up">
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Analysis progress */}
      {(step === 'parsing' || step === 'searching' || step === 'analyzing') && (
        <div className="pl-10 animate-slide-up">
          <div className="rounded-xl border border-border bg-bg p-4 space-y-3">
            <AnalysisStep label="AI parsing your food" done={step !== 'parsing'} active={step === 'parsing'} />
            <AnalysisStep label="Looking up USDA nutrients" done={step === 'analyzing'} active={step === 'searching'} />
            <AnalysisStep label="Cross-referencing 768 IBD compounds" done={false} active={step === 'analyzing'} />
          </div>
        </div>
      )}

      {/* Results */}
      {step === 'results' && compoundAnalysis && (
        <div className="space-y-3 animate-slide-up">
          {/* Risk score */}
          <div className="pl-10">
            <div className={`rounded-xl p-4 text-center border ${
              riskColor === 'accent' ? 'border-accent/20 bg-accent/5' : riskColor === 'red-500' ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
            }`}>
              <p className="text-[9px] text-text-tertiary font-semibold uppercase tracking-[0.15em]">Meal Risk Score</p>
              <p className={`text-3xl font-semibold mt-1 text-${riskColor}`}>
                {compoundAnalysis.riskScore}
              </p>
              <p className={`text-xs font-semibold text-${riskColor} capitalize`}>
                {compoundAnalysis.overallRisk} risk
              </p>
            </div>
          </div>

          {/* Foods identified */}
          {parsedFoods.length > 0 && (
            <div className="pl-10">
              <div className="rounded-xl border border-border bg-bg p-4">
                <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">Identified Foods</p>
                <div className="space-y-1.5">
                  {parsedFoods.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <p className="text-xs text-text-primary font-medium">{f.description || f.name}</p>
                      {f.fdcId && <span className="text-[9px] text-accent bg-accent/10 px-1.5 py-0.5 rounded font-medium">USDA</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Warnings & positives */}
          {(compoundAnalysis.warnings.length > 0 || compoundAnalysis.positives.length > 0) && (
            <div className="pl-10 space-y-2">
              {compoundAnalysis.warnings.map((w, i) => (
                <div key={`w-${i}`} className="flex items-start gap-2.5 rounded-lg bg-bg-secondary border border-red-200 px-3.5 py-2.5">
                  <span className="text-sm shrink-0 mt-0.5">⚠️</span>
                  <p className="text-[11px] text-text-primary leading-relaxed">{w}</p>
                </div>
              ))}
              {compoundAnalysis.positives.map((p, i) => (
                <div key={`p-${i}`} className="flex items-start gap-2.5 rounded-lg bg-bg-secondary border border-accent/20 px-3.5 py-2.5">
                  <span className="text-sm shrink-0 mt-0.5">✅</span>
                  <p className="text-[11px] text-text-primary leading-relaxed">{p}</p>
                </div>
              ))}
            </div>
          )}

          {/* Guta's AI take */}
          {aiInsight && <GutaBubble>{aiInsight}</GutaBubble>}

          {/* Citation */}
          <p className="pl-10 text-[9px] text-text-tertiary">
            Based on PMC12638057 (768 compounds) + USDA FoodData Central + FooDB (70K compounds) + Phenol-Explorer
          </p>

          {/* Actions */}
          <div className="pl-10 flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-accent text-white font-semibold py-3.5 rounded-xl tap text-sm disabled:opacity-40"
            >
              {saving ? 'Saving...' : 'Save meal'}
            </button>
            <button
              onClick={() => { setStep('input'); setCompoundAnalysis(null); setParsedFoods([]); setAiInsight(null); setDescription(''); }}
              className="border border-border bg-bg font-semibold py-3.5 px-4 rounded-xl tap text-text-primary text-sm"
            >
              Redo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
