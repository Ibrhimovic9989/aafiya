/**
 * Population-Level IBD Statistics
 *
 * Curated from OHDSI IBD Characterization Study + published research.
 *
 * OHDSI (Observational Health Data Sciences and Informatics) ran a
 * characterization study across 8 databases covering millions of patients.
 * Results viewable at data.ohdsi.org (Shiny app).
 *
 * Source: github.com/ohdsi-studies/IbdCharacterization
 * Also: Lancet, Gut, Am J Gastroenterol population studies
 *
 * Note: TriNetX IBD dataset (commercial, Databricks) and
 * NIHR Gut Reaction (restricted TRE) are not directly accessible.
 * Their published findings are incorporated here.
 */

export interface PopulationStat {
  metric: string;
  value: string;
  context: string;
  source: string;
  relevance: 'high' | 'moderate' | 'reference';
}

/**
 * Key population-level statistics for contextualizing individual data
 */
export const POPULATION_STATS: PopulationStat[] = [
  // Disease activity benchmarks
  {
    metric: 'Average HBI in remission',
    value: '2.3 ± 1.8',
    context: 'Patients in clinical remission typically score 0-4 on HBI',
    source: 'OHDSI / Harvey-Bradshaw 1980',
    relevance: 'high',
  },
  {
    metric: 'HBI remission threshold',
    value: '< 5',
    context: 'Below 5 is remission. 5-7 mild, 8-16 moderate, >16 severe',
    source: 'Best et al, Gastroenterology',
    relevance: 'high',
  },
  {
    metric: 'Annual flare rate (on treatment)',
    value: '30-50%',
    context: 'Even with treatment, 30-50% of CD patients have at least one flare per year',
    source: 'OHDSI characterization',
    relevance: 'high',
  },
  {
    metric: 'Days to flare prediction',
    value: '24-72 hours',
    context: 'Multi-signal monitoring can detect flare risk 1-3 days before clinical symptoms',
    source: 'Wearable + symptom tracking studies',
    relevance: 'high',
  },

  // Medication benchmarks
  {
    metric: 'Anti-TNF response rate',
    value: '60-70%',
    context: 'About 60-70% respond to first anti-TNF therapy. 30-40% lose response over time.',
    source: 'OHDSI / ACG guidelines',
    relevance: 'moderate',
  },
  {
    metric: 'Steroid-free remission at 1 year',
    value: '25-35%',
    context: 'Only 25-35% achieve steroid-free remission at 1 year on conventional therapy',
    source: 'OHDSI characterization',
    relevance: 'moderate',
  },

  // Demographics
  {
    metric: 'Peak onset age',
    value: '15-30 years',
    context: 'CD most commonly diagnosed in teens and young adults',
    source: 'Epidemiology studies',
    relevance: 'reference',
  },
  {
    metric: 'Female:Male ratio in CD',
    value: '1.2:1',
    context: 'Slightly more women affected, especially after puberty',
    source: 'OHDSI characterization',
    relevance: 'reference',
  },
  {
    metric: 'Ileocolonic involvement rate',
    value: '40-55%',
    context: 'Most common CD location — both ileum and colon affected',
    source: 'Montreal classification data',
    relevance: 'high',
  },

  // Lifestyle factors from research
  {
    metric: 'Sleep disruption in active IBD',
    value: '75%',
    context: '75% of patients with active IBD report significant sleep disturbance',
    source: 'Ananthakrishnan et al, Clin Gastroenterol Hepatol 2013',
    relevance: 'high',
  },
  {
    metric: 'Circadian gene disruption',
    value: '33% reduction',
    context: 'BMAL1 and PER2 expression reduced by ~33% in active IBD tissue',
    source: 'Palmieri et al, Mucosal Immunol 2015',
    relevance: 'high',
  },
  {
    metric: 'Menstrual symptom worsening',
    value: '53%',
    context: '53% of women with CD report worse GI symptoms during menstruation',
    source: 'Gawron et al, Inflamm Bowel Dis 2014',
    relevance: 'high',
  },
  {
    metric: 'Stress-flare correlation',
    value: '2x risk',
    context: 'High perceived stress doubles the risk of flare within 2 months',
    source: 'Bernstein et al, Am J Gastroenterol 2010',
    relevance: 'high',
  },
  {
    metric: 'Exercise benefit',
    value: '24% lower risk',
    context: 'Regular moderate exercise associated with 24% lower risk of active disease',
    source: 'Jones et al, Aliment Pharmacol Ther 2015',
    relevance: 'high',
  },

  // Nutrition
  {
    metric: 'Processed food risk',
    value: '1.44x',
    context: 'Ultra-processed food intake >5 servings/day: 1.44x risk of CD development',
    source: 'Narula et al, BMJ 2021',
    relevance: 'high',
  },
  {
    metric: 'Fiber protective effect',
    value: '40% lower risk',
    context: 'High fiber intake associated with 40% lower risk of CD flares',
    source: 'Ananthakrishnan et al, Gastroenterology 2013',
    relevance: 'high',
  },
  {
    metric: 'Vitamin D deficiency in CD',
    value: '50-70%',
    context: '50-70% of CD patients are vitamin D deficient, associated with worse outcomes',
    source: 'OHDSI / Multiple studies',
    relevance: 'high',
  },

  // From NIHR Gut Reaction (published findings, not raw data)
  {
    metric: 'Diet quality impact',
    value: 'Significant',
    context: 'NIHR Gut Reaction (34K participants): dietary patterns significantly predict disease activity trajectories',
    source: 'NIHR Gut Reaction cohort (published findings)',
    relevance: 'moderate',
  },

  // From TriNetX (published findings)
  {
    metric: 'Comorbidity rate',
    value: '45-60%',
    context: 'CD patients have 45-60% rate of at least one comorbidity (anxiety, anemia, arthritis most common)',
    source: 'TriNetX curated EHR analysis (published findings)',
    relevance: 'moderate',
  },
];

/**
 * Contextual benchmarks for comparing individual data
 */
export const BENCHMARKS = {
  hbi: {
    remission: { max: 4, label: 'Remission' },
    mild: { min: 5, max: 7, label: 'Mild' },
    moderate: { min: 8, max: 16, label: 'Moderate' },
    severe: { min: 17, label: 'Severe' },
  },
  sleep: {
    idealBedtime: '22:00',
    idealWakeTime: '07:00',
    minDuration: 7,
    maxDuration: 9,
    socialJetLagSevere: 120, // minutes — 2+ hours is severe
  },
  food: {
    fiberTarget: 25, // g/day
    processedFoodLimit: 2, // servings/day
    mealTimingWindow: 8, // hours — time-restricted feeding
  },
  exercise: {
    moderateMinutes: 150, // per week
    stepsTarget: 7500, // per day
  },
};

/**
 * Get a relevant population stat for a given context
 */
export function getRelevantStats(context: 'sleep' | 'food' | 'symptoms' | 'cycle' | 'stress'): PopulationStat[] {
  const keywords: Record<string, string[]> = {
    sleep: ['sleep', 'circadian', 'BMAL1'],
    food: ['fiber', 'processed', 'vitamin', 'diet', 'nutrition'],
    symptoms: ['HBI', 'flare', 'remission', 'ileocolonic'],
    cycle: ['menstrual', 'women'],
    stress: ['stress', 'exercise'],
  };

  const kw = keywords[context] || [];
  return POPULATION_STATS.filter(s =>
    kw.some(k =>
      s.metric.toLowerCase().includes(k.toLowerCase()) ||
      s.context.toLowerCase().includes(k.toLowerCase())
    )
  );
}

/**
 * Generate population context for agent prompt
 */
export function getPopulationContextForAgent(): string {
  let ctx = '\n\nPopulation benchmarks (use to contextualize her data):\n';
  for (const stat of POPULATION_STATS.filter(s => s.relevance === 'high')) {
    ctx += `- ${stat.metric}: ${stat.value} — ${stat.context}\n`;
  }
  ctx += '\nUse these to give perspective: "Your HBI of 3 is well in remission range" or "75% of people in active flares have sleep issues, so fixing sleep really matters."\n';
  return ctx;
}
