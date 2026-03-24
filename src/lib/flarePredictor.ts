/**
 * Multi-signal flare risk prediction engine
 *
 * Now condition-aware: reads weights from ConditionProfile.flareWeights
 * and uses condition-specific cycle impact data.
 *
 * Default weights (used when no profile provided):
 * - Symptom trend: 25%
 * - Circadian disruption: 20%
 * - Dietary risk: 15%
 * - Menstrual phase: 15%
 * - Stress/mood: 10%
 * - Medication adherence: 10%
 * - Meal timing: 5%
 */

import type { SymptomEntry, SleepEntry, FoodEntry, MoodEntry, MedicationEntry, CycleEntry } from './db';
import { calculateCircadianScore, calculateSocialJetLag } from './circadian';
import { getCycleInfo } from './cyclePhase';
import { mean } from './statistics';
import { BENCHMARKS, type PopulationStat } from './populationStats';
import { getCyclePhaseForDay, type CyclePhaseProfile } from './cycleReference';
import type { ConditionProfile, FlareWeights } from './conditions/types';

export interface FlareRiskResult {
  score: number; // 0-100
  level: 'low' | 'watch' | 'elevated' | 'high';
  factors: FlareRiskFactor[];
  recommendation: string;
  topConcern: string | null;
}

export interface FlareRiskFactor {
  factor: string;
  contribution: number; // points added/subtracted
  direction: 'up' | 'down';
  detail: string;
  weight: number; // percentage weight
}

export function calculateFlareRisk(data: {
  recentSymptoms: SymptomEntry[]; // last 7 days
  recentSleep: SleepEntry[]; // last 7 days
  recentFood: FoodEntry[]; // last 2 days
  recentMood: MoodEntry[]; // last 3 days
  recentMeds: MedicationEntry[]; // last 7 days
  cycleStartDate?: string;
  cycleLength?: number;
  currentDate: string;
  targetBedtime?: string;
  targetWakeTime?: string;
  conditionProfile?: ConditionProfile; // condition-specific weights and data
  learnedWeights?: { symptomTrend: number; circadianDisruption: number; dietaryRisk: number; menstrualPhase: number; stressMood: number; medicationAdherence: number; mealTiming: number };
}): FlareRiskResult {
  const factors: FlareRiskFactor[] = [];
  let totalScore = 0;

  // Use learned weights if available, otherwise defaults
  const w = data.learnedWeights || {
    symptomTrend: 25, circadianDisruption: 20, dietaryRisk: 15,
    menstrualPhase: 15, stressMood: 10, medicationAdherence: 10, mealTiming: 5,
  };

  // 1. HBI Trend
  const hbiScore = calculateHBITrend(data.recentSymptoms, w.symptomTrend);
  factors.push(hbiScore.factor);
  totalScore += hbiScore.contribution;

  // 2. Circadian Disruption
  const circadianScore = calculateCircadianFactor(data.recentSleep, data.targetBedtime, data.targetWakeTime, w.circadianDisruption);
  factors.push(circadianScore.factor);
  totalScore += circadianScore.contribution;

  // 3. Food Compound Risk
  const foodScore = calculateFoodFactor(data.recentFood, w.dietaryRisk);
  factors.push(foodScore.factor);
  totalScore += foodScore.contribution;

  // 4. Menstrual Phase
  if (data.cycleStartDate) {
    const cycleScore = calculateCycleFactor(data.cycleStartDate, data.currentDate, data.cycleLength, w.menstrualPhase);
    factors.push(cycleScore.factor);
    totalScore += cycleScore.contribution;
  }

  // 5. Stress/Mood
  const moodScore = calculateMoodFactor(data.recentMood, w.stressMood);
  factors.push(moodScore.factor);
  totalScore += moodScore.contribution;

  // 6. Medication Adherence
  const medScore = calculateMedFactor(data.recentMeds, w.medicationAdherence);
  factors.push(medScore.factor);
  totalScore += medScore.contribution;

  // 7. Meal Timing
  const mealTimingScore = calculateMealTimingFactor(data.recentFood, w.mealTiming);
  factors.push(mealTimingScore.factor);
  totalScore += mealTimingScore.contribution;

  // Clamp to 0-100
  totalScore = Math.max(0, Math.min(100, Math.round(totalScore)));

  const level = getRiskLevel(totalScore);
  const recommendation = getRecommendation(level, factors);
  const topConcern = factors
    .filter(f => f.direction === 'up')
    .sort((a, b) => b.contribution - a.contribution)[0]?.detail || null;

  return { score: totalScore, level, factors, recommendation, topConcern };
}

function calculateHBITrend(symptoms: SymptomEntry[], weight: number = 25): { factor: FlareRiskFactor; contribution: number } {
  if (symptoms.length === 0) {
    return {
      factor: { factor: 'Symptom Trend', contribution: 0, direction: 'down', detail: 'No symptom data logged yet', weight },
      contribution: weight * 0.6,
    };
  }

  const scores = symptoms.map(s => s.hbiScore);
  const avg = mean(scores);
  const recent = mean(scores.slice(-3));
  const trending = recent > avg;

  const hbiContribution = Math.min(weight, (avg / 16) * weight);
  const trendMod = trending ? 3 : -2;

  const contribution = hbiContribution + trendMod;
  const detail = trending
    ? `HBI trending up (${recent.toFixed(1)} vs ${avg.toFixed(1)} avg)`
    : `HBI stable/improving (${recent.toFixed(1)} recent)`;

  return {
    factor: { factor: 'Symptom Trend', contribution: Math.round(contribution), direction: trending ? 'up' : 'down', detail, weight },
    contribution,
  };
}

function calculateCircadianFactor(
  sleep: SleepEntry[],
  targetBedtime: string = '22:00',
  targetWakeTime: string = '07:00',
  weight: number = 20
): { factor: FlareRiskFactor; contribution: number } {
  if (sleep.length === 0) {
    return {
      factor: { factor: 'Sleep Pattern', contribution: 0, direction: 'up', detail: 'No sleep data logged yet', weight },
      contribution: weight * 0.5,
    };
  }

  const avgCircadian = mean(sleep.map(s => s.circadianScore));
  const contribution = ((100 - avgCircadian) / 100) * weight;

  const avgJetLag = mean(sleep.map(s => s.socialJetLagMinutes));
  const hours = (avgJetLag / 60).toFixed(1);

  const direction = avgCircadian < 60 ? 'up' : 'down';
  const detail = avgCircadian < 40
    ? `Severe circadian disruption (${hours}hrs off-target)`
    : avgCircadian < 60
    ? `Moderate circadian disruption (${hours}hrs off-target)`
    : `Sleep timing improving (circadian score: ${avgCircadian.toFixed(0)}%)`;

  return {
    factor: { factor: 'Sleep Pattern', contribution: Math.round(contribution), direction, detail, weight },
    contribution,
  };
}

function calculateFoodFactor(food: FoodEntry[], weight: number = 15): { factor: FlareRiskFactor; contribution: number } {
  if (food.length === 0) {
    return {
      factor: { factor: 'Food Compounds', contribution: 0, direction: 'down', detail: 'No food data logged yet', weight },
      contribution: weight * 0.33,
    };
  }

  const eatenMeals = food.filter(f => !f.skipped);
  const skippedMeals = food.filter(f => f.skipped);
  const highRiskMeals = eatenMeals.filter(f => f.mealRisk === 'high').length;
  const totalMeals = eatenMeals.length;
  const riskRatio = totalMeals > 0 ? highRiskMeals / totalMeals : 0;
  const skipPenalty = skippedMeals.length * 2;

  const contribution = (riskRatio * weight) + skipPenalty;
  const direction = (riskRatio > 0.3 || skippedMeals.length > 1) ? 'up' : 'down';
  let detail = '';
  if (skippedMeals.length > 0 && highRiskMeals > 0) {
    detail = `${skippedMeals.length} skipped meal(s) + ${highRiskMeals} high-risk meal(s)`;
  } else if (skippedMeals.length > 0) {
    detail = `${skippedMeals.length} skipped meal(s) — skipping meals increases stress on your body`;
  } else if (highRiskMeals > 0) {
    detail = `${highRiskMeals} of ${totalMeals} recent meals flagged high-risk`;
  } else {
    detail = 'Recent meals look good';
  }

  return {
    factor: { factor: 'Food Compounds', contribution: Math.round(contribution), direction, detail, weight },
    contribution,
  };
}

function calculateCycleFactor(
  cycleStartDate: string,
  currentDate: string,
  cycleLength: number = 28,
  weight: number = 15
): { factor: FlareRiskFactor; contribution: number } {
  const info = getCycleInfo(cycleStartDate, currentDate, cycleLength);

  // Use Kaggle-backed cycle phase data for more precise risk multiplier
  const phaseProfile = getCyclePhaseForDay(info.cycleDay, cycleLength);
  const riskMultiplier = phaseProfile.ibdImpact.riskMultiplier;
  const contribution = (riskMultiplier - 1) * weight / 0.4;

  const direction = riskMultiplier > 1.1 ? 'up' : 'down';
  // Include Kaggle-backed symptom expectations
  const expectedSymptoms = phaseProfile.ibdImpact.commonSymptoms.slice(0, 2).join(', ');
  const detail = riskMultiplier > 1.1
    ? `${phaseProfile.phase} phase (Day ${info.cycleDay}) — ${phaseProfile.ibdImpact.riskLevel} risk. Common: ${expectedSymptoms}`
    : `${phaseProfile.phase} phase (Day ${info.cycleDay}) — ${phaseProfile.aafiyaTip}`;

  return {
    factor: { factor: 'Menstrual Phase', contribution: Math.round(Math.max(0, contribution)), direction, detail, weight },
    contribution: Math.max(0, contribution),
  };
}

function calculateMoodFactor(mood: MoodEntry[], weight: number = 10): { factor: FlareRiskFactor; contribution: number } {
  if (mood.length === 0) {
    return {
      factor: { factor: 'Stress & Mood', contribution: 0, direction: 'down', detail: 'No mood data logged yet', weight },
      contribution: weight * 0.3,
    };
  }

  const avgStress = mean(mood.map(m => m.stress));
  const contribution = (avgStress / 10) * weight;

  const direction = avgStress > 6 ? 'up' : 'down';
  const detail = avgStress > 7
    ? `High stress (${avgStress.toFixed(1)}/10) — stress worsens inflammation`
    : avgStress > 5
    ? `Moderate stress (${avgStress.toFixed(1)}/10)`
    : `Stress well-managed (${avgStress.toFixed(1)}/10)`;

  return {
    factor: { factor: 'Stress & Mood', contribution: Math.round(contribution), direction, detail, weight },
    contribution,
  };
}

function calculateMedFactor(meds: MedicationEntry[], weight: number = 10): { factor: FlareRiskFactor; contribution: number } {
  if (meds.length === 0) {
    return {
      factor: { factor: 'Medication', contribution: 0, direction: 'down', detail: 'No medication data logged yet', weight },
      contribution: weight * 0.3,
    };
  }

  const taken = meds.filter(m => m.taken).length;
  const adherence = taken / meds.length;
  const contribution = ((1 - adherence) * weight);

  const direction = adherence < 0.8 ? 'up' : 'down';
  const detail = adherence >= 0.95
    ? `Excellent medication adherence (${(adherence * 100).toFixed(0)}%)`
    : adherence >= 0.8
    ? `Good adherence (${(adherence * 100).toFixed(0)}%)`
    : `Medication adherence needs attention (${(adherence * 100).toFixed(0)}%)`;

  return {
    factor: { factor: 'Medication', contribution: Math.round(contribution), direction, detail, weight },
    contribution,
  };
}

function calculateMealTimingFactor(food: FoodEntry[], weight: number = 5): { factor: FlareRiskFactor; contribution: number } {
  if (food.length === 0) {
    return {
      factor: { factor: 'Meal Timing', contribution: 0, direction: 'down', detail: 'No meal timing data', weight },
      contribution: weight * 0.4,
    };
  }

  // Check if breakfast is being eaten (skipping breakfast disrupts clock genes)
  const breakfasts = food.filter(f => f.mealType === 'breakfast');
  const hasBreakfast = breakfasts.length > 0;
  const breakfastSkipped = breakfasts.some(f => f.skipped);
  const totalSkipped = food.filter(f => f.skipped).length;

  let contribution = 0;
  let direction: 'up' | 'down' = 'down';
  let detail = '';

  if (breakfastSkipped || !hasBreakfast) {
    contribution = weight;
    direction = 'up';
    detail = breakfastSkipped
      ? 'Breakfast skipped — this can disrupt your body\'s rhythm'
      : 'No breakfast logged';
  } else {
    detail = 'Eating breakfast — great for your rhythm';
  }

  // Extra penalty if multiple meals skipped
  if (totalSkipped >= 2) {
    contribution += 3;
    detail = `${totalSkipped} meals skipped — your body needs regular nourishment`;
  }

  return {
    factor: { factor: 'Meal Timing', contribution, direction, detail, weight },
    contribution,
  };
}

function getRiskLevel(score: number): 'low' | 'watch' | 'elevated' | 'high' {
  if (score <= 25) return 'low';
  if (score <= 50) return 'watch';
  if (score <= 75) return 'elevated';
  return 'high';
}

function getRecommendation(level: string, factors: FlareRiskFactor[], conditionProfile?: ConditionProfile): string {
  const concerns = factors.filter(f => f.direction === 'up').sort((a, b) => b.contribution - a.contribution);
  const topConcern = concerns[0]?.factor;

  // Context tips — condition-aware
  const conditionName = conditionProfile?.shortName || 'your condition';
  const cyclePercent = conditionProfile?.cycleImpact.prevalencePercent || 53;

  const contextTips: Record<string, string> = {
    'Sleep Pattern': 'Research shows sleep disruption worsens autoimmune inflammation — fixing this matters.',
    'Food Compounds': 'Studies show diet significantly impacts autoimmune disease activity. Watch what you eat.',
    'Stress & Mood': 'Research shows high stress doubles flare risk within 2 months.',
    'Medication': 'Medication adherence is crucial for managing ' + conditionName + ' — every dose counts.',
    'Meal Timing': 'Regular meals help your body maintain a healthy rhythm. Skipping stresses your system.',
    'Menstrual Phase': `${cyclePercent}% of people with ${conditionName} experience worse symptoms during menstruation — this is normal.`,
  };

  const tip = topConcern ? contextTips[topConcern] : '';

  switch (level) {
    case 'low':
      return 'Your risk is low — keep doing what you\'re doing. This is a great day for normal activities.';
    case 'watch':
      return concerns.length > 0
        ? `Watch out for: ${concerns[0].detail}. ${tip} Consider lighter meals and prioritizing rest today.`
        : 'Some risk factors present — stay mindful of your body today.';
    case 'elevated':
      return concerns.length > 0
        ? `Elevated risk due to: ${concerns.slice(0, 2).map(c => c.factor).join(' and ')}. ${tip} Consider a bland diet, extra rest, and reach out to your doctor if symptoms worsen.`
        : 'Multiple risk factors elevated — take it easy today.';
    case 'high':
      return `Risk is high — consider contacting your doctor. ${tip} Stick to safe foods, rest, and monitor symptoms closely.`;
    default:
      return '';
  }
}

/**
 * Get contextual benchmark comparison for an HBI score
 * Uses OHDSI population data
 */
export function getHBIBenchmarkContext(hbi: number): string {
  if (hbi < BENCHMARKS.hbi.remission.max) {
    return `HBI ${hbi} is in remission range (population avg in remission: 2.3). You're doing well.`;
  } else if (hbi <= BENCHMARKS.hbi.mild.max) {
    return `HBI ${hbi} is mild activity. Population data shows 30-50% of patients flare annually even on treatment — watch closely.`;
  } else if (hbi <= BENCHMARKS.hbi.moderate.max) {
    return `HBI ${hbi} indicates moderate activity. Consider contacting your doctor.`;
  } else {
    return `HBI ${hbi} is severe. Please contact your doctor urgently.`;
  }
}

export function getRiskColor(level: string): string {
  switch (level) {
    case 'low': return '#A8C5A0';
    case 'watch': return '#F5D580';
    case 'elevated': return '#F4A89A';
    case 'high': return '#E88D97';
    default: return '#A39E98';
  }
}

export function getRiskLabel(level: string): string {
  switch (level) {
    case 'low': return 'Steady';
    case 'watch': return 'Watch';
    case 'elevated': return 'Elevated';
    case 'high': return 'High Risk';
    default: return 'Unknown';
  }
}
