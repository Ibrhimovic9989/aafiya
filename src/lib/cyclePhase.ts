/**
 * Menstrual cycle phase calculation and IBD risk modifiers
 *
 * Research basis:
 * - 53% of CD women report worsening during menstruation (PMC6196767)
 * - Premenstrual phase = increased diarrhea in CD (PMC3572320)
 * - Menstrual phase: significantly more severe abdominal pain (p=0.002)
 * - 79% of IBD patients experience systemic premenstrual symptoms vs 50% controls
 * - Nausea (30% vs 7%), flatulence (53% vs 22%), pain (68% vs 38%) in IBD vs controls
 * - Estrogen surges → decreased gut motility, increased permeability
 * - Women with irregular cycles have lower IBDQ scores
 */

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export interface CycleInfo {
  cycleDay: number;
  phase: CyclePhase;
  phaseDay: number; // day within current phase
  phaseDaysRemaining: number;
  riskModifier: number; // multiplier for flare risk (1.0 = baseline)
  warning: string | null;
  symptoms: string[];
}

/**
 * Calculate cycle day from a start date
 * @param cycleStartDate - ISO date string of last period start
 * @param currentDate - current date
 * @param cycleLength - typical cycle length (default 28)
 */
export function getCycleDay(
  cycleStartDate: string,
  currentDate: string,
  cycleLength: number = 28
): number {
  const start = new Date(cycleStartDate);
  const current = new Date(currentDate);
  const diffDays = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return (diffDays % cycleLength) + 1;
}

/**
 * Determine cycle phase from cycle day
 * Standard 28-day cycle:
 * - Menstrual: Days 1-5
 * - Follicular: Days 6-13
 * - Ovulatory: Days 14-16
 * - Luteal: Days 17-28
 */
export function getPhaseFromDay(cycleDay: number, cycleLength: number = 28): CyclePhase {
  if (cycleDay <= 5) return 'menstrual';
  if (cycleDay <= 13) return 'follicular';
  if (cycleDay <= 16) return 'ovulatory';
  return 'luteal';
}

/**
 * Get comprehensive cycle info with IBD-specific risk modifiers
 */
export function getCycleInfo(
  cycleStartDate: string,
  currentDate: string,
  cycleLength: number = 28
): CycleInfo {
  const cycleDay = getCycleDay(cycleStartDate, currentDate, cycleLength);
  const phase = getPhaseFromDay(cycleDay, cycleLength);

  const phaseRanges: Record<CyclePhase, [number, number]> = {
    menstrual: [1, 5],
    follicular: [6, 13],
    ovulatory: [14, 16],
    luteal: [17, cycleLength],
  };

  const [phaseStart, phaseEnd] = phaseRanges[phase];
  const phaseDay = cycleDay - phaseStart + 1;
  const phaseDaysRemaining = phaseEnd - cycleDay;

  let riskModifier = 1.0;
  let warning: string | null = null;
  const symptoms: string[] = [];

  switch (phase) {
    case 'menstrual':
      riskModifier = 1.4; // 40% increased risk
      warning = "You're in your menstrual phase. 53% of CD women experience worse symptoms now. Pain and nocturnal diarrhea may increase.";
      symptoms.push('Increased abdominal pain', 'Possible nocturnal diarrhea', 'Higher nausea risk', 'Fatigue');
      break;
    case 'follicular':
      riskModifier = 1.0; // baseline
      warning = null;
      symptoms.push('Lower risk phase', 'Good time for experiments');
      break;
    case 'ovulatory':
      riskModifier = 1.05;
      warning = null;
      symptoms.push('Slight hormonal shift', 'Generally stable');
      break;
    case 'luteal':
      riskModifier = 1.2; // 20% increased risk
      if (cycleDay >= cycleLength - 5) {
        // Premenstrual window
        riskModifier = 1.3;
        warning = 'Premenstrual phase starting. Watch for increased nausea, bloating, and abdominal pain. Consider lighter meals.';
        symptoms.push('Nausea risk up (30% vs 7% in non-IBD)', 'Flatulence risk up (53% vs 22%)', 'Abdominal pain risk up (68% vs 38%)', 'Consider lighter meals');
      } else {
        symptoms.push('Moderate hormonal changes', 'Monitor for early premenstrual symptoms');
      }
      break;
  }

  return { cycleDay, phase, phaseDay, phaseDaysRemaining, riskModifier, warning, symptoms };
}

export const PHASE_COLORS: Record<CyclePhase, string> = {
  menstrual: '#E88D97',
  follicular: '#A8C5A0',
  ovulatory: '#C4B5E0',
  luteal: '#F5D580',
};

export const PHASE_LABELS: Record<CyclePhase, string> = {
  menstrual: 'Menstrual',
  follicular: 'Follicular',
  ovulatory: 'Ovulatory',
  luteal: 'Luteal',
};
