/**
 * Type definitions for Aafiya data models.
 * Data layer is now backed by Prisma/PostgreSQL via server actions in @/actions/*.
 * This file is kept for type exports only.
 */
import type { ConditionId } from './conditions/types';

export interface SymptomEntry {
  id: string;
  date: string;
  timestamp: number;
  conditionId?: ConditionId; // which condition this was logged for

  // ── Universal fields (all conditions) ──
  generalWellbeing: number; // 0-4
  painLevel: number; // 0-10
  fatigue: number; // 0-10
  fever: boolean;
  complications: string[]; // condition-specific complication IDs

  // ── Disease activity scores (condition-specific) ──
  activityScore?: number; // primary score (HBI, DAS28, SLEDAI, etc.)
  secondaryScore?: number; // derived score (CDAI, etc.)
  scoringComponents?: Record<string, number>; // raw component values

  // ── GI-specific (Crohn's, UC, Celiac) ──
  painLocation?: 'right' | 'left' | 'both' | 'none';
  liquidStools?: number;
  abdominalMass?: number;
  bowelFrequency?: number;
  bristolScale?: number;
  blood?: 'none' | 'trace' | 'moderate' | 'severe';
  urgency?: number;
  nausea?: number;

  // ── Joint-specific (RA, AS, PsA) ──
  jointPain?: number;
  morningStiffness?: number; // minutes
  swollenJoints?: number;
  tenderJoints?: number;

  // ── Skin-specific (Psoriasis, Lupus) ──
  skinSeverity?: number;
  bodyAreaAffected?: number;
  itching?: number;

  // ── Neuro-specific (MS) ──
  numbnessTingling?: number;
  visionIssues?: number;
  balanceIssues?: number;
  cognitiveFunction?: number;

  // ── Endocrine-specific (Hashimoto's, T1D) ──
  coldSensitivity?: number;
  weightChange?: number;
  bloodSugar?: number;
  insulinDoses?: number;

  // ── Legacy compatibility ──
  /** @deprecated Use activityScore instead */
  hbiScore: number;
  /** @deprecated Use secondaryScore instead */
  cdaiEstimate: number;
}

export interface FoodItem {
  name: string;
  fdcId?: number;
  quantity: number;
  unit: string;
  nutrients?: Record<string, number>;
}

export interface CompoundProfile {
  totalFiber: number;
  insolubleFiber: number;
  lactose: number;
  fructose: number;
  caffeine: number;
  alcohol: number;
  fodmapScore: number;
  riskCompounds: { name: string; amount: number; riskRank: number; direction: 'flare' | 'remission' }[];
}

export interface FoodEntry {
  id: string;
  date: string;
  timestamp: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  skipped?: boolean;
  foodItems: FoodItem[];
  compounds: CompoundProfile | null;
  mealRisk: 'low' | 'medium' | 'high' | null;
  firstMealTime?: string;
  lastMealTime?: string;
  notes: string;
}

export interface SleepEntry {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  duration: number;
  quality: number; // 1-5
  socialJetLagMinutes: number;
  circadianScore: number;
  targetBedtime: string;
  metTarget: boolean;
}

export interface MedicationEntry {
  id: string;
  date: string;
  medication: string;
  dosage: string;
  taken: boolean;
  time: string;
  notes: string;
}

export interface CycleEntry {
  id: string;
  date: string;
  cycleDay: number;
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  flowIntensity: number; // 0-5
  pain: number; // 0-10
  notes: string;
}

export interface MoodEntry {
  id: string;
  date: string;
  timestamp: number;
  mood: number; // 1-10
  energy: number; // 1-10
  stress: number; // 1-10
  anxiety: number; // 1-10
  notes: string;
}

export interface Experiment {
  id: string;
  title: string;
  hypothesis: string;
  variable: string;
  startDate: string;
  endDate: string;
  baselineDays: number;
  interventionDays: number;
  status: 'baseline' | 'intervention' | 'analysis' | 'completed';
  result?: ExperimentResult;
}

export interface ExperimentResult {
  baselineAvgSymptoms: number;
  interventionAvgSymptoms: number;
  percentChange: number;
  statisticalSignificance: boolean;
  pValue: number;
  effectSize: number;
  conclusion: string;
}

export interface FlareRiskEntry {
  id: string;
  date: string;
  score: number;
  level: 'low' | 'watch' | 'elevated' | 'high';
  factors: { factor: string; contribution: number; direction: 'up' | 'down'; detail: string }[];
  recommendation: string;
}

export interface UserProfile {
  id: string;
  name: string;
  conditionId: ConditionId; // selected autoimmune condition
  diagnosis: string; // free-text diagnosis details
  diseaseLocation: string;
  medications: string[];
  targetBedtime: string;
  targetWakeTime: string;
  cycleStartDate: string;
  cycleLength: number;
  doctorName: string;
  doctorContact: string;
  onboardingComplete: boolean;
  trackCycle: boolean; // whether to show cycle tracking
}

export interface ChatMessage {
  id: string;
  timestamp: number;
  role: 'user' | 'assistant';
  content: string;
}

// ── Self-Learning Tables ──

/** Personal trigger discovered by the correlation engine */
export interface PersonalTrigger {
  id: string;
  discoveredAt: number; // timestamp
  factor: string; // e.g., "dairy", "poor sleep", "high stress"
  factorType: 'food' | 'sleep' | 'stress' | 'cycle' | 'medication' | 'weather' | 'other';
  direction: 'worsens' | 'improves';
  correlation: number; // -1 to 1 (Pearson r)
  confidence: number; // 0-100 (based on sample size + effect size)
  sampleSize: number; // how many data points this is based on
  avgSymptomWith: number; // avg activity score when factor is present
  avgSymptomWithout: number; // avg activity score when factor is absent
  detail: string; // human-readable explanation
  confirmed: boolean; // user confirmed this trigger
  dismissed: boolean; // user said "this isn't real"
  lastUpdated: number; // timestamp of last re-analysis
}

/** Flare prediction accuracy tracking */
export interface PredictionFeedback {
  id: string;
  date: string;
  predictedLevel: 'low' | 'watch' | 'elevated' | 'high';
  predictedScore: number;
  actualOutcome: 'no_flare' | 'mild_flare' | 'moderate_flare' | 'severe_flare';
  accurate: boolean;
  factors: { factor: string; contribution: number }[];
  timestamp: number;
}

/** Learned weight adjustments per user */
export interface LearnedWeights {
  id: string; // 'main'
  symptomTrend: number;
  circadianDisruption: number;
  dietaryRisk: number;
  menstrualPhase: number;
  stressMood: number;
  medicationAdherence: number;
  mealTiming: number;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number; // 0-100
  lastUpdated: number;
}

/** Personal insight generated by the engine */
export interface PersonalInsight {
  id: string;
  generatedAt: number;
  type: 'trigger_discovered' | 'pattern_found' | 'prediction_improved' | 'milestone' | 'weekly_summary';
  title: string;
  body: string;
  data?: Record<string, any>; // supporting data
  read: boolean;
  actionable: boolean;
  action?: string; // suggested action
}

