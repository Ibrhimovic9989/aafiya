'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSymptomsByDateRange } from '@/actions/symptoms';
import { getFoodByDateRange } from '@/actions/food';
import { getSleepByDateRange } from '@/actions/sleep';
import { getCycleByDateRange } from '@/actions/cycle';
import { getProfileSafe } from '@/actions/profile';
import { Card } from '@/components/ui/Card';
import { mean } from '@/lib/statistics';
import { useCondition } from '@/lib/useCondition';

interface InsightPreview {
  flareTimeline: string;
  triggers: string;
  sleep: string;
  cycle: string;
}

export default function InsightsPage() {
  const { profile: conditionProfile } = useCondition();
  const scoreName = conditionProfile.scoring.name;
  const conditionShort = conditionProfile.shortName;
  const [preview, setPreview] = useState<InsightPreview>({
    flareTimeline: 'Loading...',
    triggers: 'Loading...',
    sleep: 'Loading...',
    cycle: 'Loading...',
  });
  const [showCycle, setShowCycle] = useState(false);

  useEffect(() => {
    async function loadPreviews() {
      const today = new Date().toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

      const [symptoms, food, sleep, cycle, userProfile] = await Promise.all([
        getSymptomsByDateRange(monthAgo, today),
        getFoodByDateRange(monthAgo, today),
        getSleepByDateRange(monthAgo, today),
        getCycleByDateRange(monthAgo, today),
        getProfileSafe(),
      ]);

      // Determine if cycle card should show
      const gender = userProfile?.gender || '';
      const trackCycle = userProfile?.trackCycle ?? true;
      setShowCycle(gender !== 'male' && trackCycle);

      const flareTimeline = symptoms.length > 0
        ? `Avg ${scoreName}: ${mean(symptoms.map((s: any) => s.activityScore ?? s.hbiScore)).toFixed(1)} over ${symptoms.length} entries`
        : 'No symptom data yet';

      const highRisk = food.filter((f: any) => f.mealRisk === 'high').length;
      const triggers = food.length > 0
        ? `${highRisk} high-risk meals of ${food.length} logged`
        : 'No food data yet';

      const sleepPreview = sleep.length > 0
        ? `Avg circadian score: ${mean(sleep.map((s: any) => s.circadianScore)).toFixed(0)}%`
        : 'No sleep data yet';

      const cyclePreview = cycle.length > 0
        ? `${cycle.length} cycle entries logged`
        : 'No cycle data yet';

      setPreview({
        flareTimeline,
        triggers,
        sleep: sleepPreview,
        cycle: cyclePreview,
      });
    }
    loadPreviews();
  }, [scoreName]);

  const cards = [
    {
      id: 'flare',
      title: 'Flare Timeline',
      description: `${scoreName} scores and symptom trends over time`,
      href: '/insights/flare-timeline',
      stat: preview.flareTimeline,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F97316]">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      bg: 'bg-[#F97316]/10',
    },
    {
      id: 'triggers',
      title: 'Food Triggers',
      description: `Identify foods that correlate with ${conditionShort} flares`,
      href: '/insights/triggers',
      stat: preview.triggers,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F59E0B]">
          <path d="M18 8h1a4 4 0 010 8h-1" />
          <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      ),
      bg: 'bg-[#F59E0B]/10',
    },
    {
      id: 'sleep',
      title: 'Sleep Analysis',
      description: 'Circadian rhythm and sleep quality trends',
      href: '/insights/sleep',
      stat: preview.sleep,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7C3AED]">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      ),
      bg: 'bg-[#7C3AED]/10',
    },
    {
      id: 'cycle',
      title: 'Cycle Correlation',
      description: `How your menstrual cycle affects ${conditionShort} symptoms`,
      href: '/insights/cycle',
      stat: preview.cycle,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l2 2" />
        </svg>
      ),
      bg: 'bg-red-500/10',
    },
    {
      id: 'genetics',
      title: 'Genetics',
      description: `Gene-lifestyle connections for ${conditionShort}`,
      href: '/insights/genetics',
      stat: `Key genes for ${conditionShort}`,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10A37F]">
          <path d="M10 2v2M14 2v2M10 20v2M14 20v2M6 8h12M6 12h12M6 16h12M8 4a2 2 0 012-2h4a2 2 0 012 2v16a2 2 0 01-2 2h-4a2 2 0 01-2-2V4z" />
        </svg>
      ),
      bg: 'bg-[#10A37F]/10',
    },
    {
      id: 'polyphenols',
      title: 'Polyphenols',
      description: 'Protective compounds in your food',
      href: '/insights/polyphenols',
      stat: '10+ key compounds mapped',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8B5CF6]">
          <path d="M12 22c4.97 0 9-2.24 9-5V7c0-2.76-4.03-5-9-5S3 4.24 3 7v10c0 2.76 4.03 5 9 5z" />
          <path d="M3 7c0 2.76 4.03 5 9 5s9-2.24 9-5" />
          <path d="M3 12c0 2.76 4.03 5 9 5s9-2.24 9-5" />
        </svg>
      ),
      bg: 'bg-[#8B5CF6]/10',
    },
    {
      id: 'circadian',
      title: 'Circadian Genes',
      description: `How sleep affects ${conditionShort}-related genes`,
      href: '/insights/circadian',
      stat: `Clock genes in ${conditionShort}`,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0EA5E9]">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      bg: 'bg-[#0EA5E9]/10',
    },
    {
      id: 'brain',
      title: 'Aafiya\'s Brain',
      description: 'Personal triggers, discoveries & how Aafiya learns',
      href: '/insights/learn',
      stat: 'Self-improving AI',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#EC4899]">
          <path d="M12 2a7 7 0 017 7c0 3-2 5.5-4 7.5S12 20 12 22c0-2-1-2.5-3-4.5S5 12 5 9a7 7 0 017-7z" />
        </svg>
      ),
      bg: 'bg-[#EC4899]/10',
    },
    {
      id: 'research',
      title: 'Research Sources',
      description: 'Scientific databases powering Aafiya',
      href: '/insights/research',
      stat: '5 live APIs + 4 datasets',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6366F1]">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          <path d="M8 7h8M8 11h6" />
        </svg>
      ),
      bg: 'bg-[#6366F1]/10',
    },
  ];

  // Filter out cycle card when not applicable
  const visibleCards = cards.filter(card => {
    if (card.id === 'cycle' && !showCycle) return false;
    return true;
  });

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-1 rounded-lg hover:bg-bg-secondary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-xl font-semibold text-text-primary">Insights</h1>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {visibleCards.map(card => (
          <Link key={card.href} href={card.href}>
            <Card padding="md" className="h-full hover:shadow-sm transition-shadow">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                {card.icon}
              </div>
              <h2 className="text-sm font-semibold text-text-primary">{card.title}</h2>
              <p className="text-[11px] text-text-secondary mt-0.5 leading-snug">{card.description}</p>
              <p className="text-[10px] text-accent font-medium mt-2">{card.stat}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
