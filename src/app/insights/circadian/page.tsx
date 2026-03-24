'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

interface CircadianGene {
  gene: string;
  change: string;
  role: string;
}

interface GEODataset {
  id: string;
  title: string;
  samples: number;
  tissue: string;
  platform: string;
  relevance: string;
  keyFindings: string[];
}

export default function CircadianPage() {
  const [data, setData] = useState<{ circadianGenes: CircadianGene[]; datasets: Record<string, GEODataset> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedGene, setExpandedGene] = useState<string | null>(null);
  const [expandedDataset, setExpandedDataset] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/ncbi?action=datasets');
        if (res.ok) {
          const d = await res.json();
          setData(d);
        }
      } catch (err) {
        console.error('Failed to load circadian data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6 pb-24 flex items-center justify-center min-h-[50vh]">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-accent" style={{ animation: 'dot-bounce 1.2s ease-in-out infinite' }} />
          <div className="w-2 h-2 rounded-full bg-accent" style={{ animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '200ms' }} />
          <div className="w-2 h-2 rounded-full bg-accent" style={{ animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '400ms' }} />
        </div>
      </div>
    );
  }

  const genes = data?.circadianGenes || [];
  const datasets = data?.datasets || {};

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
          <h1 className="text-xl font-semibold text-text-primary">Circadian Genes</h1>
          <p className="text-[11px] text-text-tertiary">How sleep affects inflammation at the gene level</p>
        </div>
      </div>

      <Card padding="sm" className="mb-4 bg-[#0EA5E9]/5 border-[#0EA5E9]/10">
        <p className="text-[11px] text-text-secondary leading-relaxed">
          Research has identified <span className="font-semibold">81 circadian rhythm genes</span> that are
          disrupted in active gut inflammation. Your body clock directly controls your immune system —
          when sleep is off, these genes can&apos;t do their job properly.
        </p>
      </Card>

      {/* Key stat */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <Card padding="sm" className="text-center">
          <p className="text-[20px] font-bold text-[#0EA5E9]">81</p>
          <p className="text-[9px] text-text-tertiary">Clock genes disrupted</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-[20px] font-bold text-red-500">33%</p>
          <p className="text-[9px] text-text-tertiary">BMAL1 reduction</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-[20px] font-bold text-amber-500">3</p>
          <p className="text-[9px] text-text-tertiary">Key datasets</p>
        </Card>
      </div>

      {/* Clock Genes */}
      <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
        <span className="text-lg">🧬</span> Key Clock Genes
      </h2>
      <div className="space-y-2 mb-6">
        {genes.map(gene => {
          const isExpanded = expandedGene === gene.gene;
          return (
            <div key={gene.gene} className="rounded-xl border border-border bg-bg overflow-hidden">
              <button onClick={() => setExpandedGene(isExpanded ? null : gene.gene)} className="w-full text-left p-3 tap">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0EA5E9]/10 flex items-center justify-center shrink-0">
                    <span className="text-sm">⏰</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-[12px] font-bold font-mono text-text-primary">{gene.gene}</span>
                    <p className="text-[10px] text-red-500 font-medium mt-0.5">{gene.change}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`text-text-tertiary shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-border pt-2 animate-fade-in">
                  <p className="text-[11px] text-text-primary leading-relaxed">{gene.role}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* What this means */}
      <Card padding="md" className="mb-6 bg-accent/5 border-accent/10">
        <h3 className="text-[12px] font-semibold text-accent mb-2">What this means for you</h3>
        <div className="space-y-2">
          <p className="text-[11px] text-text-primary leading-relaxed">
            When you sleep at irregular times, these clock genes can&apos;t keep your immune system on a proper schedule.
            Your immune cells lose their rhythm and stay &quot;on&quot; when they should be resting.
          </p>
          <p className="text-[11px] text-text-primary leading-relaxed">
            <span className="font-medium">The good news:</span> Even small improvements in sleep timing
            help these genes recover. Moving bedtime 30 minutes earlier each week is enough to see changes.
          </p>
          <p className="text-[11px] text-text-primary leading-relaxed">
            <span className="font-medium">Time-restricted eating</span> (eating within a 6-8 hour window)
            also helps reset your gut&apos;s internal clock, independent of sleep.
          </p>
        </div>
      </Card>

      {/* Research Datasets */}
      <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
        <span className="text-lg">📊</span> Research Datasets
      </h2>
      <p className="text-[10px] text-text-tertiary mb-3">From NCBI Gene Expression Omnibus (GEO)</p>
      <div className="space-y-2 mb-6">
        {Object.values(datasets).map((ds: GEODataset) => {
          const isExpanded = expandedDataset === ds.id;
          return (
            <div key={ds.id} className="rounded-xl border border-border bg-bg overflow-hidden">
              <button onClick={() => setExpandedDataset(isExpanded ? null : ds.id)} className="w-full text-left p-3 tap">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[12px] font-mono font-bold text-accent">{ds.id}</span>
                    <p className="text-[10px] text-text-primary mt-0.5 leading-snug">{ds.title}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-[14px] font-bold text-text-primary">{ds.samples}</p>
                    <p className="text-[9px] text-text-tertiary">samples</p>
                  </div>
                </div>
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 space-y-2 border-t border-border pt-2 animate-fade-in">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[9px] font-semibold text-text-tertiary uppercase">Tissue</p>
                      <p className="text-[10px] text-text-primary">{ds.tissue}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-text-tertiary uppercase">Platform</p>
                      <p className="text-[10px] text-text-primary">{ds.platform}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-text-tertiary uppercase mb-1">Key Findings</p>
                    <ul className="space-y-1">
                      {ds.keyFindings.map((f, i) => (
                        <li key={i} className="text-[10px] text-text-primary leading-snug flex gap-1.5">
                          <span className="text-accent shrink-0">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Card padding="sm" className="bg-bg-secondary">
        <p className="text-[10px] text-text-tertiary leading-relaxed">
          Data from NCBI Gene Expression Omnibus and published circadian-IBD research.
          Gene expression data represents tissue-level averages, not individual predictions.
        </p>
      </Card>
    </div>
  );
}
