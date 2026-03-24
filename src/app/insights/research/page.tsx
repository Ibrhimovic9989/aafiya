'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

type DataSource = {
  name: string;
  description: string;
  type: 'api' | 'static' | 'reference';
  status: 'integrated' | 'embedded' | 'published_findings';
  url: string;
  dataPoints: string;
  howUsed: string;
  icon: string;
};

const DATA_SOURCES: DataSource[] = [
  {
    name: 'USDA FoodData Central',
    description: 'U.S. Department of Agriculture food nutrient database',
    type: 'api',
    status: 'integrated',
    url: 'fdc.nal.usda.gov',
    dataPoints: '300,000+ foods with full nutrient profiles',
    howUsed: 'Real-time food nutrient lookup when you log meals. Maps Indian foods to USDA entries for compound analysis.',
    icon: '🥗',
  },
  {
    name: 'EBI GWAS Catalog',
    description: 'European Bioinformatics Institute genome-wide association studies',
    type: 'api',
    status: 'integrated',
    url: 'ebi.ac.uk/gwas',
    dataPoints: '500,000+ genetic associations across all diseases',
    howUsed: 'Live lookup of genetic variants linked to gut health. Powers the Genetics insights page with real-time research data.',
    icon: '🧬',
  },
  {
    name: 'FooDB',
    description: 'The world\'s largest food constituent database',
    type: 'api',
    status: 'integrated',
    url: 'foodb.ca',
    dataPoints: '70,926 food compounds across 992 foods',
    howUsed: 'Maps foods to their specific chemical compounds — identifies which compounds in your meals affect gut health.',
    icon: '🔬',
  },
  {
    name: 'Phenol-Explorer',
    description: 'Comprehensive polyphenol content database',
    type: 'static',
    status: 'embedded',
    url: 'phenol-explorer.eu',
    dataPoints: '35,000+ polyphenol content values in 400+ foods',
    howUsed: 'Embedded polyphenol data for Indian foods — identifies protective compounds like curcumin, EGCG, quercetin in your diet.',
    icon: '🫖',
  },
  {
    name: 'NCBI GEO',
    description: 'Gene Expression Omnibus — largest gene expression data repository',
    type: 'api',
    status: 'integrated',
    url: 'ncbi.nlm.nih.gov/geo',
    dataPoints: '3 key IBD datasets: GSE93624, GSE57945, GSE134809',
    howUsed: 'Circadian rhythm gene data — 81 disrupted clock genes in IBD tissue. Informs sleep advice and circadian scoring.',
    icon: '⏰',
  },
  {
    name: 'IBDDB',
    description: 'Curated IBD gene and protein database',
    type: 'static',
    status: 'embedded',
    url: 'ibddb.org',
    dataPoints: '289 curated IBD genes with 34 data columns each',
    howUsed: 'Expanded gene database with lifestyle connections — maps 50+ genes to actionable dietary and lifestyle changes.',
    icon: '📚',
  },
  {
    name: 'Kaggle Menstrual Cycle Dataset',
    description: 'Synthetic menstrual cycle data with lifestyle correlations',
    type: 'static',
    status: 'embedded',
    url: 'kaggle.com',
    dataPoints: '100 users with cycle, stress, sleep, diet, exercise data',
    howUsed: 'Reference data for cycle phase profiles — connects menstrual phases to IBD symptom patterns.',
    icon: '📊',
  },
  {
    name: 'OpenStreetMap / IBD Open Data',
    description: 'Public toilet locations worldwide',
    type: 'api',
    status: 'integrated',
    url: 'openstreetmap.org',
    dataPoints: '12,000+ UK locations + global coverage',
    howUsed: 'Powers the Nearby Restrooms feature — find the closest toilet anywhere using GPS.',
    icon: '🚻',
  },
  {
    name: 'OHDSI IBD Characterization',
    description: 'Observational Health Data Sciences population-level study',
    type: 'static',
    status: 'published_findings',
    url: 'ohdsi.org',
    dataPoints: 'Population-level statistics across 8 databases, millions of patients',
    howUsed: 'Benchmark data — contextualizes your HBI scores, flare rates, and treatment responses against population averages.',
    icon: '📈',
  },
  {
    name: 'NIHR Gut Reaction',
    description: 'National Institute for Health Research IBD cohort',
    type: 'reference',
    status: 'published_findings',
    url: 'bdrn.nihr.ac.uk',
    dataPoints: '34,000 participants, ongoing cohort',
    howUsed: 'Published findings on diet quality and disease trajectories inform our dietary risk scoring.',
    icon: '🇬🇧',
  },
  {
    name: 'TriNetX IBD Dataset',
    description: 'Curated real-world electronic health records',
    type: 'reference',
    status: 'published_findings',
    url: 'trinetx.com',
    dataPoints: 'Millions of de-identified IBD patient records',
    howUsed: 'Published comorbidity and treatment outcome data informs population benchmarks.',
    icon: '🏥',
  },
  {
    name: 'PMC12638057 (2025 Nutrients)',
    description: '768-compound IBD risk analysis using random forest ML',
    type: 'static',
    status: 'embedded',
    url: 'pubmed.ncbi.nlm.nih.gov',
    dataPoints: '768 compounds analyzed, 77% specificity, top 75 IBD-risk compounds',
    howUsed: 'Core food compound risk scoring — identifies which specific chemicals in food correlate with flares vs remission.',
    icon: '🧪',
  },
];

export default function ResearchPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const integrated = DATA_SOURCES.filter(d => d.status === 'integrated');
  const embedded = DATA_SOURCES.filter(d => d.status === 'embedded');
  const published = DATA_SOURCES.filter(d => d.status === 'published_findings');

  function SourceCard({ source }: { source: DataSource }) {
    const isExpanded = expanded === source.name;
    return (
      <div className="rounded-xl border border-border bg-bg overflow-hidden">
        <button onClick={() => setExpanded(isExpanded ? null : source.name)} className="w-full text-left p-3 tap">
          <div className="flex items-center gap-3">
            <span className="text-xl">{source.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-text-primary">{source.name}</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                  source.status === 'integrated' ? 'bg-green-100 text-green-600'
                  : source.status === 'embedded' ? 'bg-blue-100 text-blue-600'
                  : 'bg-amber-100 text-amber-600'
                }`}>
                  {source.status === 'integrated' ? 'Live API' :
                   source.status === 'embedded' ? 'Embedded' : 'Research'}
                </span>
              </div>
              <p className="text-[10px] text-text-tertiary mt-0.5">{source.description}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`text-text-tertiary shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </button>

        {isExpanded && (
          <div className="px-3 pb-3 space-y-2 border-t border-border pt-2 animate-fade-in">
            <div>
              <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-0.5">Data</p>
              <p className="text-[11px] text-text-primary">{source.dataPoints}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-0.5">How Aafiya uses it</p>
              <p className="text-[11px] text-text-primary leading-relaxed">{source.howUsed}</p>
            </div>
            <p className="text-[10px] text-accent font-medium">{source.url}</p>
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
          <h1 className="text-xl font-semibold text-text-primary">Research Sources</h1>
          <p className="text-[11px] text-text-tertiary">The science behind Aafiya&apos;s intelligence</p>
        </div>
      </div>

      <Card padding="sm" className="mb-4 bg-accent/5 border-accent/10">
        <p className="text-[11px] text-text-secondary leading-relaxed">
          Aafiya integrates <span className="font-semibold">{DATA_SOURCES.length} research sources</span> — from live APIs
          to published clinical data — to give you the most evidence-based health insights possible.
        </p>
      </Card>

      {/* Live APIs */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h2 className="text-sm font-semibold text-text-primary">Live APIs ({integrated.length})</h2>
        </div>
        <div className="space-y-2">
          {integrated.map(s => <SourceCard key={s.name} source={s} />)}
        </div>
      </div>

      {/* Embedded Data */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <h2 className="text-sm font-semibold text-text-primary">Embedded Datasets ({embedded.length})</h2>
        </div>
        <div className="space-y-2">
          {embedded.map(s => <SourceCard key={s.name} source={s} />)}
        </div>
      </div>

      {/* Published Findings */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <h2 className="text-sm font-semibold text-text-primary">Published Research ({published.length})</h2>
        </div>
        <div className="space-y-2">
          {published.map(s => <SourceCard key={s.name} source={s} />)}
        </div>
      </div>

      {/* Footer */}
      <Card padding="sm" className="bg-bg-secondary">
        <p className="text-[10px] text-text-tertiary leading-relaxed">
          All data is used for educational and wellness tracking purposes only.
          Aafiya is not a substitute for medical advice. Always consult your doctor
          for clinical decisions.
        </p>
      </Card>
    </div>
  );
}
