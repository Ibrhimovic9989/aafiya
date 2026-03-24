/**
 * Statistical functions for N-of-1 clinical trials
 * Implements paired t-test, Cohen's d effect size, and confidence intervals
 */

/**
 * Calculate mean of an array
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculate standard deviation
 */
export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squaredDiffs = values.map(v => (v - avg) ** 2);
  return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1));
}

/**
 * Paired t-test
 * Tests whether the mean difference between paired observations is significantly different from zero
 */
export function pairedTTest(baseline: number[], intervention: number[]): {
  tStatistic: number;
  pValue: number;
  significant: boolean;
  meanDifference: number;
  confidenceInterval: [number, number];
} {
  const n = Math.min(baseline.length, intervention.length);
  if (n < 3) {
    return { tStatistic: 0, pValue: 1, significant: false, meanDifference: 0, confidenceInterval: [0, 0] };
  }

  // Calculate differences
  const differences = baseline.slice(0, n).map((b, i) => b - intervention[i]);
  const meanDiff = mean(differences);
  const sdDiff = standardDeviation(differences);

  if (sdDiff === 0) {
    return { tStatistic: 0, pValue: 1, significant: false, meanDifference: meanDiff, confidenceInterval: [meanDiff, meanDiff] };
  }

  const tStatistic = meanDiff / (sdDiff / Math.sqrt(n));
  const df = n - 1;

  // Approximate p-value using t-distribution (two-tailed)
  const pValue = approximatePValue(Math.abs(tStatistic), df);

  // 95% confidence interval
  const tCritical = approximateTCritical(df);
  const marginOfError = tCritical * (sdDiff / Math.sqrt(n));

  return {
    tStatistic: Math.round(tStatistic * 1000) / 1000,
    pValue: Math.round(pValue * 10000) / 10000,
    significant: pValue < 0.05,
    meanDifference: Math.round(meanDiff * 100) / 100,
    confidenceInterval: [
      Math.round((meanDiff - marginOfError) * 100) / 100,
      Math.round((meanDiff + marginOfError) * 100) / 100,
    ],
  };
}

/**
 * Cohen's d effect size for paired data
 * Small: 0.2, Medium: 0.5, Large: 0.8
 */
export function cohensD(baseline: number[], intervention: number[]): {
  d: number;
  magnitude: 'negligible' | 'small' | 'medium' | 'large';
} {
  const n = Math.min(baseline.length, intervention.length);
  if (n < 2) return { d: 0, magnitude: 'negligible' };

  const differences = baseline.slice(0, n).map((b, i) => b - intervention[i]);
  const meanDiff = mean(differences);
  const sdDiff = standardDeviation(differences);

  if (sdDiff === 0) return { d: 0, magnitude: 'negligible' };

  const d = Math.abs(meanDiff / sdDiff);

  let magnitude: 'negligible' | 'small' | 'medium' | 'large';
  if (d < 0.2) magnitude = 'negligible';
  else if (d < 0.5) magnitude = 'small';
  else if (d < 0.8) magnitude = 'medium';
  else magnitude = 'large';

  return { d: Math.round(d * 100) / 100, magnitude };
}

/**
 * Approximate p-value from t-statistic using a simple approximation
 * (Good enough for N-of-1 trials with small sample sizes)
 */
function approximatePValue(t: number, df: number): number {
  // Using approximation: p ≈ 2 * (1 - Φ(t * sqrt(df/(df-2+t²))))
  // where Φ is standard normal CDF
  const x = t * Math.sqrt(df / (df - 2 + t * t));
  return 2 * (1 - normalCDF(x));
}

/**
 * Standard normal CDF approximation (Abramowitz & Stegun)
 */
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Approximate t-critical value for 95% CI (two-tailed)
 */
function approximateTCritical(df: number): number {
  // Lookup for small df, approximate for larger
  const table: Record<number, number> = {
    1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
    6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
    15: 2.131, 20: 2.086, 25: 2.060, 30: 2.042,
  };

  if (table[df]) return table[df];
  if (df > 30) return 1.96; // approaches z-value
  // Linear interpolation for gaps
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  for (let i = 0; i < keys.length - 1; i++) {
    if (df > keys[i] && df < keys[i + 1]) {
      const ratio = (df - keys[i]) / (keys[i + 1] - keys[i]);
      return table[keys[i]] + ratio * (table[keys[i + 1]] - table[keys[i]]);
    }
  }
  return 1.96;
}

/**
 * Calculate percent change
 */
export function percentChange(baseline: number, intervention: number): number {
  if (baseline === 0) return 0;
  return Math.round(((intervention - baseline) / baseline) * 10000) / 100;
}

/**
 * Generate plain-language conclusion for experiment results
 */
export function generateConclusion(
  experimentTitle: string,
  baselineValues: number[],
  interventionValues: number[],
  metric: string = 'HBI score'
): string {
  const baselineAvg = mean(baselineValues);
  const interventionAvg = mean(interventionValues);
  const test = pairedTTest(baselineValues, interventionValues);
  const effect = cohensD(baselineValues, interventionValues);
  const change = percentChange(baselineAvg, interventionAvg);

  const direction = interventionAvg < baselineAvg ? 'decreased' : 'increased';
  const improved = interventionAvg < baselineAvg; // lower HBI = better

  let conclusion = `During "${experimentTitle}", your average ${metric} ${direction} from ${baselineAvg.toFixed(1)} to ${interventionAvg.toFixed(1)} (${Math.abs(change)}% ${direction === 'decreased' ? 'reduction' : 'increase'}).`;

  if (test.significant) {
    conclusion += ` This change is statistically significant (p=${test.pValue}).`;
    if (effect.magnitude === 'large') {
      conclusion += ` The effect size is large (d=${effect.d}), meaning this intervention had a substantial impact.`;
    } else if (effect.magnitude === 'medium') {
      conclusion += ` The effect size is moderate (d=${effect.d}).`;
    }
    if (improved) {
      conclusion += ' This suggests the intervention is genuinely helping.';
    } else {
      conclusion += ' This suggests the intervention may be making things worse — consider stopping.';
    }
  } else {
    conclusion += ` However, this change is not statistically significant (p=${test.pValue}), meaning it could be due to natural variation rather than the intervention.`;
    conclusion += ' Consider running the experiment for a longer period to get more data.';
  }

  return conclusion;
}
