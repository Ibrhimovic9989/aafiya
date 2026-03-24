'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { IBD_POLYPHENOLS, INDIAN_FOOD_POLYPHENOLS, type Polyphenol, type FoodPolyphenolProfile } from '@/lib/polyphenols';

type ViewMode = 'compounds' | 'foods';

export default function PolyphenolsPage() {
  const [view, setView] = useState<ViewMode>('foods');
  const [expanded, setExpanded] = useState<string | null>(null);

  function CompoundCard({ pp }: { pp: Polyphenol }) {
    const isExpanded = expanded === pp.name;
    return (
      <div className="rounded-xl border border-border bg-bg overflow-hidden">
        <button onClick={() => setExpanded(isExpanded ? null : pp.name)} className="w-full text-left p-4 tap">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg ${
              pp.effectDirection === 'protective' ? 'bg-green-50' :
              pp.effectDirection === 'mixed' ? 'bg-amber-50' : 'bg-red-50'
            }`}>
              {pp.effectDirection === 'protective' ? '🛡️' : pp.effectDirection === 'mixed' ? '⚖️' : '⚠️'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-text-primary">{pp.name}</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                  pp.effectDirection === 'protective' ? 'bg-green-100 text-green-600' :
                  pp.effectDirection === 'mixed' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                }`}>{pp.effectDirection}</span>
              </div>
              <p className="text-[10px] text-text-tertiary mt-0.5">{pp.class} — {pp.subclass}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`text-text-tertiary shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-border pt-3 animate-fade-in">
            <div>
              <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">How it helps</p>
              <p className="text-[12px] text-text-primary leading-relaxed">{pp.ibdMechanism}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">Best food sources</p>
              <div className="space-y-1">
                {pp.topFoodSources.map(f => (
                  <div key={f.food} className="flex items-center justify-between">
                    <span className="text-[11px] text-text-primary">{f.food}</span>
                    <span className="text-[10px] font-mono text-text-tertiary">{f.amount} {f.unit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-accent/5 border border-accent/10">
              <p className="text-[10px] font-semibold text-accent mb-0.5">Research</p>
              <p className="text-[11px] text-text-primary leading-relaxed">{pp.researchNote}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  function FoodCard({ food }: { food: FoodPolyphenolProfile }) {
    const isExpanded = expanded === food.food;
    return (
      <div className="rounded-xl border border-border bg-bg overflow-hidden">
        <button onClick={() => setExpanded(isExpanded ? null : food.food)} className="w-full text-left p-4 tap">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-text-primary">{food.food}</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                  food.overallEffect === 'beneficial' ? 'bg-green-100 text-green-600' :
                  food.overallEffect === 'neutral' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-600'
                }`}>{food.overallEffect}</span>
              </div>
              {food.indianName && (
                <p className="text-[10px] text-text-tertiary mt-0.5">{food.indianName}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[14px] font-bold text-accent">{food.totalPolyphenols}</p>
              <p className="text-[9px] text-text-tertiary">mg/100g</p>
            </div>
          </div>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-border pt-3 animate-fade-in">
            <div>
              <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">Key polyphenols</p>
              <div className="space-y-1">
                {food.keyPolyphenols.map(p => (
                  <div key={p.name} className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-text-primary">{p.name}</span>
                      <span className="text-[9px] text-text-tertiary ml-1">({p.class})</span>
                    </div>
                    <span className="text-[10px] font-mono text-text-tertiary">{p.amount} mg</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-accent/5 border border-accent/10">
              <p className="text-[11px] text-text-primary leading-relaxed">{food.ibdRelevance}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/insights" className="p-1 rounded-lg hover:bg-bg-secondary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Polyphenols</h1>
          <p className="text-[11px] text-text-tertiary">Protective compounds from Phenol-Explorer research</p>
        </div>
      </div>

      <Card padding="sm" className="mb-4 bg-accent/5 border-accent/10">
        <p className="text-[11px] text-text-secondary leading-relaxed">
          Polyphenols are natural plant compounds that can help calm inflammation and strengthen your gut.
          Data from <span className="font-medium">Phenol-Explorer</span> — the world&apos;s largest polyphenol database.
        </p>
      </Card>

      {/* View toggle */}
      <div className="flex gap-1 p-1 rounded-lg bg-bg-secondary mb-4">
        {[
          { key: 'foods' as const, label: 'By Food' },
          { key: 'compounds' as const, label: 'By Compound' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setView(tab.key); setExpanded(null); }}
            className={`flex-1 py-2 rounded-md text-[12px] font-medium transition-all ${
              view === tab.key
                ? 'bg-bg text-text-primary shadow-sm'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Foods View */}
      {view === 'foods' && (
        <div className="space-y-2">
          {INDIAN_FOOD_POLYPHENOLS
            .sort((a, b) => b.totalPolyphenols - a.totalPolyphenols)
            .map(food => <FoodCard key={food.food} food={food} />)}
        </div>
      )}

      {/* Compounds View */}
      {view === 'compounds' && (
        <div className="space-y-2">
          {IBD_POLYPHENOLS.map(pp => <CompoundCard key={pp.name} pp={pp} />)}
        </div>
      )}

      <Card padding="sm" className="mt-6 bg-bg-secondary">
        <p className="text-[10px] text-text-tertiary leading-relaxed">
          Data from Phenol-Explorer 3.6 cross-referenced with PubMed IBD research.
          Amounts are approximate and vary by preparation method.
        </p>
      </Card>
    </div>
  );
}
