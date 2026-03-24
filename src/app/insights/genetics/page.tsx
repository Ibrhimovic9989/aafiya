'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { IBD_GENE_DATABASE, CATEGORY_INFO, getGenesByCategory, type GeneInfo } from '@/lib/genetics';
import { EXTENDED_IBD_GENES, GENE_DRUG_MAP, getTotalGeneCount, type IBDGeneEntry } from '@/lib/ibdGenes';

type ViewMode = 'categories' | 'all' | 'extended' | 'live';

interface GWASVariant {
  rsId: string;
  pValue: number;
  orPerCopyNum: number | null;
  genes: string[];
  traitName: string;
  riskAllele: string;
}

export default function GeneticsPage() {
  const [view, setView] = useState<ViewMode>('categories');
  const [expandedGene, setExpandedGene] = useState<string | null>(null);
  const [liveData, setLiveData] = useState<GWASVariant[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveTrait, setLiveTrait] = useState<'crohns' | 'uc' | 'ibd'>('crohns');

  const genesByCategory = getGenesByCategory();

  async function fetchLiveData(trait: string) {
    setLiveLoading(true);
    try {
      const res = await fetch(`/api/gwas?trait=${trait}&size=50`);
      if (res.ok) {
        const data = await res.json();
        setLiveData(data.associations || []);
      }
    } catch (err) {
      console.error('Failed to fetch GWAS data:', err);
    } finally {
      setLiveLoading(false);
    }
  }

  useEffect(() => {
    if (view === 'live' && liveData.length === 0) {
      fetchLiveData(liveTrait);
    }
  }, [view]);

  function GeneCard({ gene, expanded, onToggle }: { gene: GeneInfo; expanded: boolean; onToggle: () => void }) {
    const catInfo = CATEGORY_INFO[gene.category];
    return (
      <div className="rounded-xl border border-border bg-bg overflow-hidden animate-slide-up">
        <button onClick={onToggle} className="w-full text-left p-4 tap">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg"
              style={{ backgroundColor: `${catInfo.color}15` }}>
              {catInfo.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text-primary font-mono">{gene.gene}</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                  gene.riskLevel === 'high' ? 'bg-red-100 text-red-600'
                  : gene.riskLevel === 'moderate' ? 'bg-amber-100 text-amber-600'
                  : 'bg-blue-100 text-blue-600'
                }`}>{gene.riskLevel}</span>
              </div>
              <p className="text-[11px] text-text-secondary mt-0.5 leading-snug">{gene.fullName}</p>
              <p className="text-[10px] font-medium mt-1" style={{ color: catInfo.color }}>{gene.pathway}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`text-text-tertiary shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-3 animate-fade-in border-t border-border pt-3">
            <div>
              <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">What it does</p>
              <p className="text-[12px] text-text-primary leading-relaxed">{gene.role}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">Lifestyle connection</p>
              <p className="text-[12px] text-text-primary leading-relaxed">{gene.lifestyleConnection}</p>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/10">
              <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-accent mb-0.5">Aafiya&apos;s take</p>
                <p className="text-[12px] text-text-primary leading-relaxed">{gene.aafiyaInsight}</p>
              </div>
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
          <h1 className="text-xl font-semibold text-text-primary">Genetics</h1>
          <p className="text-[11px] text-text-tertiary">Gene-lifestyle connections from GWAS research</p>
        </div>
      </div>

      {/* Info banner */}
      <Card padding="sm" className="mb-4 bg-accent/5 border-accent/10">
        <p className="text-[11px] text-text-secondary leading-relaxed">
          <span className="font-semibold">{getTotalGeneCount()} genes</span> linked to gut health from GWAS + IBDDB research.
          Understanding them helps Aafiya give you more personalized advice — connecting your daily
          choices to what&apos;s happening at the cellular level.
        </p>
      </Card>

      {/* View toggle */}
      <div className="flex gap-1 p-1 rounded-lg bg-bg-secondary mb-4">
        {[
          { key: 'categories' as const, label: 'By Function' },
          { key: 'all' as const, label: 'Core 12' },
          { key: 'extended' as const, label: 'IBDDB' },
          { key: 'live' as const, label: 'Live GWAS' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
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

      {/* Categories View */}
      {view === 'categories' && (
        <div className="space-y-6">
          {Object.entries(genesByCategory).map(([category, genes]) => {
            const catInfo = CATEGORY_INFO[category];
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{catInfo.emoji}</span>
                  <div>
                    <h2 className="text-sm font-semibold text-text-primary">{catInfo.label}</h2>
                    <p className="text-[10px] text-text-tertiary">{catInfo.description}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {genes.map(gene => (
                    <GeneCard
                      key={gene.gene}
                      gene={gene}
                      expanded={expandedGene === gene.gene}
                      onToggle={() => setExpandedGene(expandedGene === gene.gene ? null : gene.gene)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* All Genes View */}
      {view === 'all' && (
        <div className="space-y-2">
          {IBD_GENE_DATABASE.map(gene => (
            <GeneCard
              key={gene.gene}
              gene={gene}
              expanded={expandedGene === gene.gene}
              onToggle={() => setExpandedGene(expandedGene === gene.gene ? null : gene.gene)}
            />
          ))}
        </div>
      )}

      {/* Extended IBDDB View */}
      {view === 'extended' && (
        <div>
          <Card padding="sm" className="mb-3 bg-bg-secondary">
            <p className="text-[10px] text-text-tertiary">
              From <span className="font-medium">IBDDB</span> — 289 curated IBD genes. Showing {EXTENDED_IBD_GENES.length} with lifestyle connections.
            </p>
          </Card>
          <div className="space-y-2">
            {EXTENDED_IBD_GENES.map(gene => {
              const isExpanded = expandedGene === gene.gene;
              const drugs = GENE_DRUG_MAP[gene.gene];
              return (
                <div key={gene.gene} className="rounded-xl border border-border bg-bg overflow-hidden animate-slide-up">
                  <button onClick={() => setExpandedGene(isExpanded ? null : gene.gene)} className="w-full text-left p-4 tap">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg bg-blue-50">
                        {gene.ibdSubtype === 'CD' ? '🔬' : gene.ibdSubtype === 'UC' ? '🧫' : '🧬'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-text-primary font-mono">{gene.gene}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                            gene.ibdSubtype === 'CD' ? 'bg-purple-100 text-purple-600'
                            : gene.ibdSubtype === 'UC' ? 'bg-orange-100 text-orange-600'
                            : 'bg-blue-100 text-blue-600'
                          }`}>{gene.ibdSubtype}</span>
                          {gene.oddsRatio && (
                            <span className="text-[9px] font-mono text-text-tertiary">OR: {gene.oddsRatio}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-text-secondary mt-0.5 leading-snug">{gene.fullName}</p>
                        <p className="text-[10px] font-medium text-accent mt-1">{gene.pathway}</p>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className={`text-text-tertiary shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 animate-fade-in border-t border-border pt-3">
                      <div>
                        <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">What it does</p>
                        <p className="text-[12px] text-text-primary leading-relaxed">{gene.role}</p>
                      </div>
                      {gene.lifestyleRelevance && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/10">
                          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-accent mb-0.5">Lifestyle connection</p>
                            <p className="text-[12px] text-text-primary leading-relaxed">{gene.lifestyleRelevance}</p>
                          </div>
                        </div>
                      )}
                      {drugs && drugs.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">Drug targets</p>
                          {drugs.map(d => (
                            <div key={d.drug} className="text-[11px] text-text-primary mb-1">
                              <span className="font-medium">{d.drug}</span> — {d.mechanism}
                              <br />
                              <span className="text-[10px] text-accent">Natural: {d.naturalAlternative}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {gene.drugTarget && !drugs && (
                        <p className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded">{gene.drugTarget}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live GWAS View */}
      {view === 'live' && (
        <div>
          {/* Trait selector */}
          <div className="flex gap-2 mb-4">
            {[
              { key: 'crohns' as const, label: "Crohn's" },
              { key: 'uc' as const, label: 'UC' },
              { key: 'ibd' as const, label: 'IBD' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => { setLiveTrait(t.key); fetchLiveData(t.key); }}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                  liveTrait === t.key
                    ? 'bg-accent text-white'
                    : 'bg-bg-secondary text-text-secondary border border-border'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Card padding="sm" className="mb-3 bg-bg-secondary">
            <p className="text-[10px] text-text-tertiary">
              Live data from <span className="font-medium">EBI GWAS Catalog</span> — the world&apos;s largest database of
              gene-disease associations. Updated regularly with new research.
            </p>
          </Card>

          {liveLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-accent" style={{ animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-accent" style={{ animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '200ms' }} />
                <div className="w-2 h-2 rounded-full bg-accent" style={{ animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '400ms' }} />
              </div>
            </div>
          ) : liveData.length === 0 ? (
            <Card padding="lg" className="text-center">
              <p className="text-text-secondary text-sm">No data available. Try a different trait.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {liveData.slice(0, 30).map((variant, i) => {
                const knownGene = IBD_GENE_DATABASE.find(g =>
                  variant.genes.some(vg => vg.toUpperCase() === g.gene.toUpperCase())
                );
                return (
                  <div key={`${variant.rsId}-${i}`}
                    className={`rounded-xl border p-3 ${
                      knownGene ? 'border-accent/20 bg-accent/5' : 'border-border bg-bg'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-mono font-bold text-text-primary">{variant.rsId}</span>
                          {knownGene && (
                            <span className="text-[9px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">
                              KEY GENE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-text-secondary mt-0.5">
                          {variant.genes.join(', ') || 'Unknown gene'}
                        </p>
                      </div>
                      <div className="text-right">
                        {variant.pValue > 0 && (
                          <p className="text-[10px] font-mono text-text-tertiary">
                            p = {variant.pValue.toExponential(1)}
                          </p>
                        )}
                        {variant.orPerCopyNum && (
                          <p className={`text-[10px] font-semibold ${
                            variant.orPerCopyNum > 1.5 ? 'text-red-500' : variant.orPerCopyNum > 1 ? 'text-amber-500' : 'text-accent'
                          }`}>
                            OR: {variant.orPerCopyNum.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    {knownGene && (
                      <p className="text-[10px] text-accent mt-1.5 leading-snug">
                        {knownGene.aafiyaInsight}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <Card padding="sm" className="mt-6 bg-bg-secondary">
        <p className="text-[10px] text-text-tertiary leading-relaxed">
          Data from NHGRI-EBI GWAS Catalog. Genetic associations indicate population-level risk, not individual diagnosis.
          Always discuss genetic findings with your doctor.
        </p>
      </Card>
    </div>
  );
}
