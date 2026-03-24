/**
 * Universal Disease Activity Scoring
 *
 * Condition-aware scoring system that uses the ConditionProfile
 * to calculate disease activity scores dynamically.
 *
 * Legacy HBI/CDAI functions preserved for backward compatibility.
 */

import type { ScoringSystem, SeverityLevel } from './conditions/types';

// ── Universal Scoring ──

export interface ScoreInput {
  components: Record<string, number | string[]>;
}

export function calculateActivityScore(scoring: ScoringSystem, input: ScoreInput): number {
  let total = 0;

  for (const component of scoring.components) {
    const value = input.components[component.id];

    if (component.type === 'checklist' && Array.isArray(value)) {
      total += value.length;
    } else if (typeof value === 'number') {
      total += value;
    }
  }

  return total;
}

export function getSeverity(scoring: ScoringSystem, score: number): SeverityLevel {
  for (const level of scoring.severityLevels) {
    if (score >= level.range[0] && score <= level.range[1]) {
      return level;
    }
  }
  // Return the last level (most severe) as fallback
  return scoring.severityLevels[scoring.severityLevels.length - 1];
}

export function getSecondaryScore(scoring: ScoringSystem, primaryScore: number): number | null {
  if (!scoring.estimateFormula) return null;
  return scoring.estimateFormula.calculate(primaryScore);
}

// ── Legacy HBI Functions (backward compatibility) ──

export const HBI_COMPLICATIONS = [
  'arthralgia',
  'uveitis',
  'erythema_nodosum',
  'aphthous_ulcers',
  'pyoderma_gangrenosum',
  'anal_fissure',
  'new_fistula',
  'abscess',
] as const;

export const HBI_COMPLICATION_LABELS: Record<string, string> = {
  arthralgia: 'Joint Pain (Arthralgia)',
  uveitis: 'Eye Inflammation (Uveitis)',
  erythema_nodosum: 'Skin Nodules (Erythema Nodosum)',
  aphthous_ulcers: 'Mouth Ulcers',
  pyoderma_gangrenosum: 'Skin Ulcers (Pyoderma)',
  anal_fissure: 'Anal Fissure',
  new_fistula: 'New Fistula',
  abscess: 'Abscess',
};

export interface HBIInput {
  generalWellbeing: number; // 0-4
  abdominalPain: number; // 0-3
  liquidStools: number; // count
  abdominalMass: number; // 0-3
  complications: string[]; // from HBI_COMPLICATIONS
}

export function calculateHBI(input: HBIInput): number {
  return (
    input.generalWellbeing +
    input.abdominalPain +
    input.liquidStools +
    input.abdominalMass +
    input.complications.length
  );
}

export function estimateCDAI(hbi: number): number {
  return Math.round(100 + 13 * hbi);
}

export type HBISeverity = 'remission' | 'mild' | 'moderate' | 'severe';

export function getHBISeverity(score: number): HBISeverity {
  if (score < 5) return 'remission';
  if (score <= 7) return 'mild';
  if (score <= 16) return 'moderate';
  return 'severe';
}

export function getHBISeverityColor(severity: HBISeverity): string {
  switch (severity) {
    case 'remission': return 'text-sage-dark';
    case 'mild': return 'text-risk-watch';
    case 'moderate': return 'text-coral';
    case 'severe': return 'text-rose-dark';
  }
}

export function getHBISeverityBg(severity: HBISeverity): string {
  switch (severity) {
    case 'remission': return 'bg-sage-light';
    case 'mild': return 'bg-yellow-100';
    case 'moderate': return 'bg-coral/20';
    case 'severe': return 'bg-rose/20';
  }
}

export function getHBILabel(severity: HBISeverity): string {
  switch (severity) {
    case 'remission': return 'Remission';
    case 'mild': return 'Mild Activity';
    case 'moderate': return 'Moderate Activity';
    case 'severe': return 'Severe Activity';
  }
}
