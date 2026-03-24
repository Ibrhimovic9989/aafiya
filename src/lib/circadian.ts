/**
 * Circadian rhythm scoring based on social jet lag research
 *
 * Research basis:
 * - BMAL1 and PER2 decreased by 1/3 in active IBD (PMC12028002)
 * - Sleep disorders correlate with disease severity
 * - Time-restricted feeding (6-8hr window) reduces TNF-α, IL-1β, IL-6
 * - Skipping breakfast disrupts clock gene expression
 * - Even dim light at night increases inflammatory responses
 * - Social jet lag correlates with IBD flare risk (Post et al., 2024)
 */

/**
 * Convert HH:mm time string to minutes since midnight
 * Handles cross-midnight times (e.g., bedtime 02:00 = 26 hours = 1560 min)
 */
function timeToMinutes(time: string, isBedtime = false): number {
  const [h, m] = time.split(':').map(Number);
  let minutes = h * 60 + m;
  // If bedtime is after midnight but before 10am, add 24h for correct midpoint calc
  if (isBedtime && h < 10) {
    minutes += 24 * 60;
  }
  return minutes;
}

function minutesToTime(minutes: number): string {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Calculate sleep midpoint (chronotype indicator)
 */
export function getSleepMidpoint(bedtime: string, wakeTime: string): string {
  const bed = timeToMinutes(bedtime, true);
  let wake = timeToMinutes(wakeTime);
  if (wake < bed) wake += 24 * 60;
  const midpoint = (bed + wake) / 2;
  return minutesToTime(Math.round(midpoint));
}

/**
 * Calculate sleep duration in minutes
 */
export function getSleepDuration(bedtime: string, wakeTime: string): number {
  const bed = timeToMinutes(bedtime, true);
  let wake = timeToMinutes(wakeTime);
  if (wake <= bed) wake += 24 * 60;
  return wake - bed;
}

/**
 * Calculate social jet lag in minutes
 * Social jet lag = |actual sleep midpoint - target sleep midpoint|
 *
 * Her target: 10pm-7am → midpoint = 2:30am (150 min)
 * Her actual: 5am-11am → midpoint = 8:00am (480 min)
 * Social jet lag = 330 min = 5.5 hours (SEVERE)
 */
export function calculateSocialJetLag(
  bedtime: string,
  wakeTime: string,
  targetBedtime: string = '22:00',
  targetWakeTime: string = '07:00'
): number {
  const actualMid = timeToMinutes(getSleepMidpoint(bedtime, wakeTime));
  const targetMid = timeToMinutes(getSleepMidpoint(targetBedtime, targetWakeTime));

  let diff = Math.abs(actualMid - targetMid);
  if (diff > 12 * 60) diff = 24 * 60 - diff;
  return diff;
}

/**
 * Circadian score (0-100, 100 = perfect alignment)
 *
 * Factors:
 * - Social jet lag (primary, 60% weight)
 * - Sleep duration deviation from 8-9 hrs (20% weight)
 * - Bedtime consistency (20% weight) - requires historical data
 */
export function calculateCircadianScore(
  bedtime: string,
  wakeTime: string,
  targetBedtime: string = '22:00',
  targetWakeTime: string = '07:00'
): number {
  const jetLag = calculateSocialJetLag(bedtime, wakeTime, targetBedtime, targetWakeTime);
  const duration = getSleepDuration(bedtime, wakeTime);

  // Social jet lag score (0-100): 0 min = 100, 360+ min = 0
  const jetLagScore = Math.max(0, 100 - (jetLag / 360) * 100);

  // Duration score: ideal is 480-540 min (8-9 hrs)
  const idealDuration = 510; // 8.5 hrs
  const durationDev = Math.abs(duration - idealDuration);
  const durationScore = Math.max(0, 100 - (durationDev / 180) * 100);

  // Weighted score
  const score = jetLagScore * 0.7 + durationScore * 0.3;
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Calculate progressive bedtime target
 * Shifts 30 min earlier per week from current pattern toward target
 */
export function getProgressiveBedtimeTarget(
  currentTypicalBedtime: string,
  targetBedtime: string = '22:00',
  weeksElapsed: number
): string {
  const current = timeToMinutes(currentTypicalBedtime, true);
  const target = timeToMinutes(targetBedtime, true);

  // Calculate total shift needed
  let totalShift = current - target;
  if (totalShift < 0) totalShift += 24 * 60;

  // 30 min per week
  const shiftSoFar = Math.min(weeksElapsed * 30, totalShift);
  const newBedtime = current - shiftSoFar;

  return minutesToTime(Math.round(newBedtime));
}

/**
 * Calculate eating window duration
 */
export function getEatingWindow(firstMealTime: string, lastMealTime: string): number {
  const first = timeToMinutes(firstMealTime);
  let last = timeToMinutes(lastMealTime);
  if (last < first) last += 24 * 60;
  return last - first;
}

/**
 * Time-restricted feeding compliance
 * Target: 6-8 hour eating window
 */
export function getTRFCompliance(eatingWindowMinutes: number): {
  compliant: boolean;
  score: number;
  message: string;
} {
  const hours = eatingWindowMinutes / 60;
  if (hours <= 8) {
    return { compliant: true, score: 100, message: `${hours.toFixed(1)}hr eating window — excellent` };
  }
  if (hours <= 10) {
    return { compliant: false, score: 70, message: `${hours.toFixed(1)}hr eating window — try to narrow to 8hrs` };
  }
  if (hours <= 12) {
    return { compliant: false, score: 40, message: `${hours.toFixed(1)}hr eating window — aim for 6-8hrs` };
  }
  return { compliant: false, score: 10, message: `${hours.toFixed(1)}hr eating window — significantly wider than recommended` };
}

/**
 * Get circadian insight message
 */
export function getCircadianInsight(score: number, jetLagMinutes: number): string {
  if (score >= 80) {
    return 'Your sleep timing is well-aligned. BMAL1 expression benefits from this consistency.';
  }
  if (score >= 60) {
    return 'Getting closer to your target. Each night of improved timing helps stabilize your circadian rhythm.';
  }
  if (score >= 40) {
    const hours = (jetLagMinutes / 60).toFixed(1);
    return `Your sleep is ${hours} hours off-target. Research shows this level of circadian disruption can increase inflammatory markers.`;
  }
  const hours = (jetLagMinutes / 60).toFixed(1);
  return `Significant circadian disruption (${hours}hrs off-target). BMAL1 and PER2 expression may be reduced, increasing inflammation risk. Even small shifts toward your target can help.`;
}
