/**
 * Menstrual Cycle Reference Data
 *
 * Based on Kaggle Menstrual Cycle Dataset (CC0 license, 100 synthetic users)
 * + published IBD-menstrual research.
 *
 * Source: kaggle.com/datasets/nikitabisht/menstrual-cycle-dataset
 * Research: "Menstrual Cycle and IBD" (Gawron et al, Inflamm Bowel Dis 2014)
 *
 * Key finding: 53% of women with CD report worsening symptoms during menstruation.
 * Premenstrual phase = increased diarrhea, abdominal pain.
 * Estrogen fluctuations affect gut permeability and motility.
 */

export interface CyclePhaseProfile {
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'premenstrual';
  dayRange: string;
  hormoneProfile: {
    estrogen: 'low' | 'rising' | 'peak' | 'moderate' | 'falling';
    progesterone: 'low' | 'rising' | 'peak' | 'falling';
  };
  ibdImpact: {
    riskLevel: 'low' | 'moderate' | 'high';
    riskMultiplier: number; // 1.0 = baseline
    commonSymptoms: string[];
    mechanism: string;
  };
  recommendations: string[];
  aafiyaTip: string;
}

/**
 * Cycle phase profiles with IBD correlations
 */
export const CYCLE_PHASES: CyclePhaseProfile[] = [
  {
    phase: 'menstrual',
    dayRange: 'Days 1-5',
    hormoneProfile: {
      estrogen: 'low',
      progesterone: 'low',
    },
    ibdImpact: {
      riskLevel: 'high',
      riskMultiplier: 1.4,
      commonSymptoms: [
        'Increased tummy cramps',
        'More frequent loo visits',
        'Fatigue and low energy',
        'Nausea',
        'Joint aches',
      ],
      mechanism: 'Prostaglandin release causes both uterine and intestinal contractions. Low estrogen increases gut permeability. Inflammatory markers rise.',
    },
    recommendations: [
      'Anti-inflammatory foods (ginger tea, turmeric)',
      'Warm compresses on tummy',
      'Gentle movement, avoid intense exercise',
      'Extra rest and sleep',
      'Iron-rich foods (spinach, lentils, eggs)',
      'Avoid known trigger foods during this phase',
    ],
    aafiyaTip: 'Your body is working extra hard right now. Be gentle with yourself — warm food, rest, and ginger tea can help.',
  },
  {
    phase: 'follicular',
    dayRange: 'Days 6-13',
    hormoneProfile: {
      estrogen: 'rising',
      progesterone: 'low',
    },
    ibdImpact: {
      riskLevel: 'low',
      riskMultiplier: 0.9,
      commonSymptoms: [
        'Generally better energy',
        'Reduced pain sensitivity',
        'Improved mood',
      ],
      mechanism: 'Rising estrogen has anti-inflammatory effects. Gut motility normalizes. This is typically the best phase.',
    },
    recommendations: [
      'Good time to try new foods cautiously',
      'Best phase for N-of-1 experiments',
      'Build good sleep habits',
      'Moderate exercise is well-tolerated',
    ],
    aafiyaTip: 'You tend to feel better in this phase — it\'s a great time to build healthy habits and try new things.',
  },
  {
    phase: 'ovulatory',
    dayRange: 'Days 14-16',
    hormoneProfile: {
      estrogen: 'peak',
      progesterone: 'rising',
    },
    ibdImpact: {
      riskLevel: 'low',
      riskMultiplier: 0.85,
      commonSymptoms: [
        'Peak energy',
        'Possible mild bloating',
        'Some may experience ovulation discomfort',
      ],
      mechanism: 'Peak estrogen provides maximum anti-inflammatory protection. Some women experience brief mid-cycle discomfort.',
    },
    recommendations: [
      'Maintain regular meal timing',
      'Stay hydrated',
      'Exercise tolerance is highest',
    ],
    aafiyaTip: 'Your body is at its strongest right now. Make the most of the energy!',
  },
  {
    phase: 'luteal',
    dayRange: 'Days 17-24',
    hormoneProfile: {
      estrogen: 'moderate',
      progesterone: 'peak',
    },
    ibdImpact: {
      riskLevel: 'moderate',
      riskMultiplier: 1.1,
      commonSymptoms: [
        'Bloating',
        'Slower digestion',
        'Mild fluid retention',
        'Mood changes',
      ],
      mechanism: 'High progesterone slows gut motility. This can help reduce diarrhea but may increase bloating and constipation.',
    },
    recommendations: [
      'Smaller, more frequent meals',
      'Fiber-rich foods to help motility',
      'Magnesium-rich foods (nuts, dark chocolate in moderation)',
      'Gentle walks to aid digestion',
    ],
    aafiyaTip: 'Digestion might feel slower this week. Smaller meals and gentle movement can help things along.',
  },
  {
    phase: 'premenstrual',
    dayRange: 'Days 25-28',
    hormoneProfile: {
      estrogen: 'falling',
      progesterone: 'falling',
    },
    ibdImpact: {
      riskLevel: 'high',
      riskMultiplier: 1.3,
      commonSymptoms: [
        'Increased urgency',
        'More tummy pain',
        'Mood swings',
        'Fatigue',
        'Food cravings (especially sugar)',
        'Headaches',
      ],
      mechanism: 'Rapid hormone withdrawal triggers prostaglandin cascade. Serotonin drops (95% of serotonin is in the gut). Mast cell activation increases.',
    },
    recommendations: [
      'Prioritize sleep (hormonal shifts disrupt circadian rhythm)',
      'Anti-inflammatory foods, avoid sugar cravings',
      'Warm ginger or mint tea',
      'Stress management (meditation, gentle yoga)',
      'Avoid caffeine excess',
      'Prepare for menstrual phase — stock up on gentle foods',
    ],
    aafiyaTip: 'Your hormones are shifting and your tummy might feel it. Be extra kind to yourself — warm drinks, gentle food, and rest help.',
  },
];

/**
 * Population-level statistics from Kaggle dataset + research
 * These help contextualize the patient's experience
 */
export const CYCLE_STATISTICS = {
  // From Kaggle dataset (100 synthetic users)
  avgCycleLength: 28.5,
  cycleRange: { min: 21, max: 35 },
  avgPeriodLength: 4.8,
  periodRange: { min: 3, max: 7 },

  // From IBD research
  ibdSpecific: {
    symptomWorseningDuringMenses: 0.53, // 53%
    increasedDiarrheaPremenstrual: 0.38, // 38%
    missedWorkDueToCyclePlusIBD: 0.28, // 28%
    irregularCyclesInActiveCDPercent: 0.42, // 42%
  },

  // Lifestyle factors from dataset (stress, BMI, exercise, sleep correlations)
  lifestyleCorrelations: {
    highStress_longerCycle: true, // Stress > 7/10 associated with longer cycles
    poorSleep_worseSymptoms: true, // Sleep < 6hrs worsens menstrual + IBD symptoms
    regularExercise_betterRegularity: true, // 30min/day improves cycle regularity
    highBMI_heavierFlow: true, // BMI > 30 associated with heavier flow
  },
};

/**
 * Get the current cycle phase for a given cycle day
 */
export function getCyclePhaseForDay(cycleDay: number, cycleLength: number = 28): CyclePhaseProfile {
  if (cycleDay <= 5) return CYCLE_PHASES[0]; // menstrual
  if (cycleDay <= 13) return CYCLE_PHASES[1]; // follicular
  if (cycleDay <= 16) return CYCLE_PHASES[2]; // ovulatory
  if (cycleDay <= cycleLength - 4) return CYCLE_PHASES[3]; // luteal
  return CYCLE_PHASES[4]; // premenstrual
}

/**
 * Get cycle context for the agent prompt
 */
export function getCycleContextForAgent(cycleDay: number | null, cycleLength: number = 28): string {
  if (cycleDay === null) return '';

  const phase = getCyclePhaseForDay(cycleDay, cycleLength);

  let ctx = `\n\nMenstrual cycle context (Day ${cycleDay}, ${phase.phase} phase):`;
  ctx += `\n- Risk level: ${phase.ibdImpact.riskLevel} (${phase.ibdImpact.riskMultiplier}x baseline)`;
  ctx += `\n- Common in this phase: ${phase.ibdImpact.commonSymptoms.slice(0, 3).join(', ')}`;
  ctx += `\n- Tip: ${phase.aafiyaTip}`;
  ctx += `\nUse this context naturally — don't announce "you're in your luteal phase". Instead, if she mentions relevant symptoms, you can say things like "this is common around this time of month" or recommend phase-appropriate foods.\n`;

  return ctx;
}
