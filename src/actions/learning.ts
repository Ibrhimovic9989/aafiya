'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-utils';

// ── Triggers ──

export async function getTriggers() {
  const user = await getAuthUser();
  const triggers = await prisma.personalTrigger.findMany({
    where: { userId: user.id, dismissed: false },
    orderBy: { confidence: 'desc' },
  });
  return triggers.map(t => ({
    ...t,
    discoveredAt: Number(t.discoveredAt),
    lastUpdated: Number(t.lastUpdated),
    factorType: t.factorType as any,
    direction: t.direction as any,
  }));
}

export async function confirmTrigger(id: string) {
  const user = await getAuthUser();
  const trigger = await prisma.personalTrigger.findFirst({ where: { id, userId: user.id } });
  if (!trigger) throw new Error('Trigger not found');
  return prisma.personalTrigger.update({ where: { id }, data: { confirmed: true } });
}

export async function dismissTrigger(id: string) {
  const user = await getAuthUser();
  const trigger = await prisma.personalTrigger.findFirst({ where: { id, userId: user.id } });
  if (!trigger) throw new Error('Trigger not found');
  return prisma.personalTrigger.update({ where: { id }, data: { dismissed: true } });
}

// ── Insights ──

export async function getInsights() {
  const user = await getAuthUser();
  const entries = await prisma.personalInsight.findMany({
    where: { userId: user.id },
    orderBy: { generatedAt: 'desc' },
  });
  return entries.map(e => ({
    ...e,
    generatedAt: Number(e.generatedAt),
    type: e.type as any,
    data: (e.data as any) ?? undefined,
    action: e.action ?? undefined,
  }));
}

export async function markInsightRead(id: string) {
  const user = await getAuthUser();
  const insight = await prisma.personalInsight.findFirst({ where: { id, userId: user.id } });
  if (!insight) throw new Error('Insight not found');
  return prisma.personalInsight.update({ where: { id }, data: { read: true } });
}

export async function getUnreadInsightsCount() {
  const user = await getAuthUser();
  return prisma.personalInsight.count({ where: { userId: user.id, read: false } });
}

// ── Learned Weights ──

export async function getLearnedWeightsAction() {
  const user = await getAuthUser();
  const weights = await prisma.learnedWeights.findUnique({ where: { userId: user.id } });
  if (!weights) {
    return {
      id: 'main',
      symptomTrend: 25,
      circadianDisruption: 20,
      dietaryRisk: 15,
      menstrualPhase: 15,
      stressMood: 10,
      medicationAdherence: 10,
      mealTiming: 5,
      accuracy: 0,
      totalPredictions: 0,
      correctPredictions: 0,
      lastUpdated: 0,
    };
  }
  return {
    id: weights.id,
    symptomTrend: weights.symptomTrend,
    circadianDisruption: weights.circadianDisruption,
    dietaryRisk: weights.dietaryRisk,
    menstrualPhase: weights.menstrualPhase,
    stressMood: weights.stressMood,
    medicationAdherence: weights.medicationAdherence,
    mealTiming: weights.mealTiming,
    accuracy: weights.accuracy,
    totalPredictions: weights.totalPredictions,
    correctPredictions: weights.correctPredictions,
    lastUpdated: Number(weights.lastUpdated),
  };
}

// ── Prediction Feedback ──

export async function getPredictionFeedbackCount() {
  const user = await getAuthUser();
  return prisma.predictionFeedback.count({ where: { userId: user.id } });
}

export async function recordPredictionFeedbackAction(data: {
  predictedLevel: string;
  predictedScore: number;
  actualOutcome: string;
  factors: { factor: string; contribution: number }[];
}) {
  const user = await getAuthUser();

  const accurate = isAccurate(data.predictedLevel, data.actualOutcome);

  await prisma.predictionFeedback.create({
    data: {
      userId: user.id,
      date: new Date().toISOString().split('T')[0],
      predictedLevel: data.predictedLevel,
      predictedScore: data.predictedScore,
      actualOutcome: data.actualOutcome,
      accurate,
      factors: data.factors,
      timestamp: BigInt(Date.now()),
    },
  });

  // Update learned weights
  await updateLearnedWeights(user.id, accurate, data.factors, data.actualOutcome);
}

function isAccurate(predicted: string, actual: string): boolean {
  const predLevel: Record<string, number> = { low: 0, watch: 1, elevated: 2, high: 3 };
  const actLevel: Record<string, number> = { no_flare: 0, mild_flare: 1, moderate_flare: 2, severe_flare: 3 };
  return Math.abs((predLevel[predicted] ?? 0) - (actLevel[actual] ?? 0)) <= 1;
}

async function updateLearnedWeights(
  userId: string,
  accurate: boolean,
  factors: { factor: string; contribution: number }[],
  actualOutcome: string
) {
  const existing = await prisma.learnedWeights.findUnique({ where: { userId } });
  const weights = existing || {
    symptomTrend: 25, circadianDisruption: 20, dietaryRisk: 15,
    menstrualPhase: 15, stressMood: 10, medicationAdherence: 10, mealTiming: 5,
    totalPredictions: 0, correctPredictions: 0, accuracy: 0,
  };

  const totalPredictions = weights.totalPredictions + 1;
  const correctPredictions = weights.correctPredictions + (accurate ? 1 : 0);
  const accuracy = Math.round((correctPredictions / totalPredictions) * 100);

  // Adjust weights based on feedback
  const learningRate = 0.5;
  const factorMap: Record<string, string> = {
    'Symptom Trend': 'symptomTrend',
    'Sleep Pattern': 'circadianDisruption',
    'Food Compounds': 'dietaryRisk',
    'Menstrual Phase': 'menstrualPhase',
    'Stress & Mood': 'stressMood',
    'Medication': 'medicationAdherence',
    'Meal Timing': 'mealTiming',
  };

  const adjustments: Record<string, number> = {};
  if (!accurate) {
    const wasOver = actualOutcome === 'no_flare' || actualOutcome === 'mild_flare';
    for (const f of factors) {
      const key = factorMap[f.factor];
      if (!key) continue;
      if (wasOver && f.contribution > 5) {
        adjustments[key] = -learningRate;
      } else if (!wasOver && f.contribution < 5) {
        adjustments[key] = learningRate;
      }
    }
  }

  const newWeights: Record<string, number> = {
    symptomTrend: weights.symptomTrend + (adjustments['symptomTrend'] || 0),
    circadianDisruption: weights.circadianDisruption + (adjustments['circadianDisruption'] || 0),
    dietaryRisk: weights.dietaryRisk + (adjustments['dietaryRisk'] || 0),
    menstrualPhase: weights.menstrualPhase + (adjustments['menstrualPhase'] || 0),
    stressMood: weights.stressMood + (adjustments['stressMood'] || 0),
    medicationAdherence: weights.medicationAdherence + (adjustments['medicationAdherence'] || 0),
    mealTiming: weights.mealTiming + (adjustments['mealTiming'] || 0),
  };

  // Normalize to sum to 100
  const total = Object.values(newWeights).reduce((a, b) => a + b, 0);
  for (const key of Object.keys(newWeights)) {
    newWeights[key] = Math.max(1, Math.round((newWeights[key] / total) * 100));
  }

  await prisma.learnedWeights.upsert({
    where: { userId },
    update: {
      ...newWeights,
      totalPredictions,
      correctPredictions,
      accuracy,
      lastUpdated: BigInt(Date.now()),
    },
    create: {
      userId,
      ...newWeights,
      totalPredictions,
      correctPredictions,
      accuracy,
      lastUpdated: BigInt(Date.now()),
    },
  });
}

// ── Correlation Engine (server-side) ──

export async function runCorrelationAnalysisAction() {
  const user = await getAuthUser();
  const today = new Date().toISOString().split('T')[0];
  const threeMonthsAgo = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];

  const [symptoms, food, sleep, mood, meds] = await Promise.all([
    prisma.symptomEntry.findMany({ where: { userId: user.id, date: { gte: threeMonthsAgo } }, orderBy: { date: 'asc' } }),
    prisma.foodEntry.findMany({ where: { userId: user.id, date: { gte: threeMonthsAgo } }, orderBy: { date: 'asc' } }),
    prisma.sleepEntry.findMany({ where: { userId: user.id, date: { gte: threeMonthsAgo } }, orderBy: { date: 'asc' } }),
    prisma.moodEntry.findMany({ where: { userId: user.id, date: { gte: threeMonthsAgo } }, orderBy: { date: 'asc' } }),
    prisma.medicationEntry.findMany({ where: { userId: user.id, date: { gte: threeMonthsAgo } }, orderBy: { date: 'asc' } }),
  ]);

  if (symptoms.length < 7) {
    return { triggers: 0, insights: 0, message: 'Need at least 7 days of symptom data' };
  }

  // Build day dataset
  const dayMap = new Map<string, {
    avgSymptom: number;
    foods: string[];
    sleepDuration: number;
    sleepScore: number;
    stress: number;
    mealRisks: string[];
    skippedMeals: number;
  }>();

  for (const s of symptoms) {
    const existing = dayMap.get(s.date) || { avgSymptom: 0, foods: [], sleepDuration: 0, sleepScore: 100, stress: 0, mealRisks: [], skippedMeals: 0 };
    existing.avgSymptom = s.hbiScore || s.activityScore as number || s.painLevel;
    dayMap.set(s.date, existing);
  }

  for (const f of food) {
    const day = dayMap.get(f.date);
    if (day) {
      const items = (f.foodItems as any[]) || [];
      day.foods.push(...items.map((i: any) => i.name?.toLowerCase()).filter(Boolean));
      if (f.mealRisk) day.mealRisks.push(f.mealRisk);
      if (f.skipped) day.skippedMeals++;
    }
  }

  for (const s of sleep) {
    const day = dayMap.get(s.date);
    if (day) {
      day.sleepDuration = s.duration;
      day.sleepScore = s.circadianScore;
    }
  }

  for (const m of mood) {
    const day = dayMap.get(m.date);
    if (day) {
      day.stress = m.stress;
    }
  }

  // Analyze food correlations (food on day N → symptoms on day N+1)
  const dates = Array.from(dayMap.keys()).sort();
  const foodCounts = new Map<string, { withFood: number[]; withoutFood: number[] }>();

  for (let i = 0; i < dates.length - 1; i++) {
    const dayData = dayMap.get(dates[i]);
    const nextDayData = dayMap.get(dates[i + 1]);
    if (!dayData || !nextDayData) continue;

    const nextSymptom = nextDayData.avgSymptom;
    const foodsEaten = new Set(dayData.foods);

    for (const food of foodsEaten) {
      if (!foodCounts.has(food)) foodCounts.set(food, { withFood: [], withoutFood: [] });
      foodCounts.get(food)!.withFood.push(nextSymptom);
    }

    // Track absence for common foods
    for (const [food, data] of foodCounts.entries()) {
      if (!foodsEaten.has(food)) {
        data.withoutFood.push(nextSymptom);
      }
    }
  }

  // Discover triggers
  let newTriggers = 0;
  let newInsights = 0;

  for (const [food, data] of foodCounts.entries()) {
    if (data.withFood.length < 3 || data.withoutFood.length < 3) continue;

    const avgWith = data.withFood.reduce((a, b) => a + b, 0) / data.withFood.length;
    const avgWithout = data.withoutFood.reduce((a, b) => a + b, 0) / data.withoutFood.length;
    const diff = avgWith - avgWithout;
    const effectSize = Math.abs(diff) / Math.max(1, Math.sqrt(
      (variance(data.withFood) + variance(data.withoutFood)) / 2
    ));

    if (effectSize < 0.25) continue;

    const direction = diff > 0 ? 'worsens' : 'improves';
    const confidence = Math.min(100, Math.round(effectSize * 30 + data.withFood.length * 2));
    const correlation = diff > 0 ? Math.min(1, effectSize * 0.5) : Math.max(-1, -effectSize * 0.5);

    // Check if trigger already exists
    const existing = await prisma.personalTrigger.findFirst({
      where: { userId: user.id, factor: food, factorType: 'food' },
    });

    if (existing) {
      await prisma.personalTrigger.update({
        where: { id: existing.id },
        data: {
          correlation, confidence, sampleSize: data.withFood.length,
          avgSymptomWith: avgWith, avgSymptomWithout: avgWithout,
          lastUpdated: BigInt(Date.now()),
        },
      });
    } else {
      await prisma.personalTrigger.create({
        data: {
          userId: user.id,
          discoveredAt: BigInt(Date.now()),
          factor: food,
          factorType: 'food',
          direction,
          correlation,
          confidence,
          sampleSize: data.withFood.length,
          avgSymptomWith: avgWith,
          avgSymptomWithout: avgWithout,
          detail: `${food} ${direction} symptoms by ${Math.abs(diff).toFixed(1)} points on average`,
          lastUpdated: BigInt(Date.now()),
        },
      });
      newTriggers++;

      // Create insight for new trigger
      await prisma.personalInsight.create({
        data: {
          userId: user.id,
          generatedAt: BigInt(Date.now()),
          type: 'trigger_discovered',
          title: `New ${direction === 'worsens' ? 'risk' : 'protective'} factor: ${food}`,
          body: `Aafiya found that ${food} ${direction} your symptoms by ${Math.abs(diff).toFixed(1)} points on average, based on ${data.withFood.length} observations.`,
          actionable: true,
          action: direction === 'worsens'
            ? `Consider reducing ${food} intake and observe if symptoms improve`
            : `${food} seems beneficial — consider including it more often`,
        },
      });
      newInsights++;
    }
  }

  return { triggers: newTriggers, insights: newInsights, message: 'Analysis complete' };
}

// ── Triggers for AI context ──

export async function getPersonalTriggersForAgentAction(): Promise<string> {
  const user = await getAuthUser();
  const triggers = await prisma.personalTrigger.findMany({
    where: { userId: user.id, dismissed: false },
  });

  if (triggers.length === 0) return '';

  let context = '\n\nPERSONAL TRIGGERS (discovered from their data):';
  const confirmed = triggers.filter(t => t.confirmed);
  const suspected = triggers.filter(t => !t.confirmed && t.confidence > 50);

  if (confirmed.length > 0) {
    context += '\nConfirmed:';
    for (const t of confirmed) {
      context += `\n- ${t.factor} ${t.direction} symptoms (r=${t.correlation.toFixed(2)}, n=${t.sampleSize})`;
    }
  }
  if (suspected.length > 0) {
    context += '\nSuspected:';
    for (const t of suspected.slice(0, 5)) {
      context += `\n- ${t.factor} may ${t.direction === 'worsens' ? 'worsen' : 'improve'} symptoms (${t.confidence}% confidence)`;
    }
  }

  return context;
}

function variance(arr: number[]): number {
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((sum, val) => sum + (val - avg) ** 2, 0) / arr.length;
}
