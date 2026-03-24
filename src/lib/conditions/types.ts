/**
 * Universal Autoimmune Condition Profile System
 *
 * Each condition implements this interface to plug into the app.
 * The app shell stays the same — scoring, symptoms, compounds,
 * AI prompts, and recommendations all come from the selected profile.
 */

export type ConditionId =
  | 'crohns'
  | 'ulcerative_colitis'
  | 'rheumatoid_arthritis'
  | 'lupus'
  | 'psoriasis'
  | 'ankylosing_spondylitis'
  | 'multiple_sclerosis'
  | 'hashimotos'
  | 'celiac'
  | 'type1_diabetes';

export type ConditionCategory = 'gastrointestinal' | 'rheumatic' | 'neurological' | 'endocrine' | 'dermatological';

export interface ConditionProfile {
  id: ConditionId;
  name: string;
  shortName: string;
  category: ConditionCategory;
  description: string;
  icon: string; // emoji

  // ── Scoring ──
  scoring: ScoringSystem;

  // ── Symptom Template ──
  symptoms: SymptomTemplate;

  // ── Flare Risk Weights ──
  flareWeights: FlareWeights;

  // ── Food & Compounds ──
  dietaryProfile: DietaryProfile;

  // ── Menstrual Cycle Impact ──
  cycleImpact: CycleImpactProfile;

  // ── Medications ──
  commonMedications: MedicationInfo[];

  // ── Population Stats ──
  populationStats: PopulationStatEntry[];

  // ── Emergency Protocol ──
  emergencyProtocol: EmergencyProtocol;

  // ── AI Context ──
  aiContext: AIContextProfile;

  // ── Experiment Templates ──
  experimentTemplates: ExperimentTemplate[];
}

// ── Scoring System ──

export interface ScoringSystem {
  name: string; // e.g., "HBI", "DAS28", "SLEDAI"
  fullName: string;
  maxScore: number;
  components: ScoringComponent[];
  severityLevels: SeverityLevel[];
  estimateFormula?: { // secondary score (like CDAI from HBI)
    name: string;
    calculate: (primaryScore: number) => number;
  };
}

export interface ScoringComponent {
  id: string;
  label: string;
  description: string;
  type: 'scale' | 'count' | 'boolean' | 'checklist';
  min: number;
  max: number;
  options?: { value: number; label: string }[];
  checklistItems?: { id: string; label: string }[];
}

export interface SeverityLevel {
  id: string;
  label: string;
  range: [number, number]; // [min, max]
  color: string; // tailwind class
  bgColor: string;
}

// ── Symptom Template ──

export interface SymptomTemplate {
  /** Core symptoms always tracked for this condition */
  coreSymptoms: SymptomField[];
  /** Extra-articular / systemic symptoms */
  complications: ComplicationItem[];
  /** Fields to include in the SymptomEntry beyond the standard ones */
  customFields: CustomSymptomField[];
}

export interface SymptomField {
  id: string;
  label: string;
  gentleLabel: string; // user-facing gentle language
  type: 'scale' | 'count' | 'boolean' | 'select';
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];
  unit?: string;
}

export interface ComplicationItem {
  id: string;
  label: string;
  gentleLabel: string;
}

export interface CustomSymptomField {
  id: string;
  label: string;
  type: 'number' | 'boolean' | 'string';
  defaultValue: number | boolean | string;
}

// ── Flare Risk Weights ──

export interface FlareWeights {
  symptomTrend: number; // percentage weight
  circadianDisruption: number;
  dietaryRisk: number;
  menstrualPhase: number;
  stressMood: number;
  medicationAdherence: number;
  mealTiming: number;
  /** Condition-specific extra factors */
  customFactors?: { id: string; label: string; weight: number }[];
}

// ── Dietary Profile ──

export interface DietaryProfile {
  /** Foods/compounds that are risky for this condition */
  riskFactors: DietaryFactor[];
  /** Foods/compounds that are protective */
  protectiveFactors: DietaryFactor[];
  /** General dietary guidance */
  guidelines: string[];
  /** Condition-specific USDA nutrient warnings */
  nutrientWarnings: NutrientWarning[];
}

export interface DietaryFactor {
  name: string;
  mechanism: string;
  severity: 'high' | 'moderate' | 'low';
  foods: string[];
}

export interface NutrientWarning {
  nutrientName: string;
  threshold: number;
  unit: string;
  direction: 'above' | 'below';
  warning: string;
  riskIncrease: number; // points added to risk score
}

// ── Cycle Impact ──

export interface CycleImpactProfile {
  hasImpact: boolean;
  prevalencePercent?: number; // % of patients who report cycle-related worsening
  phases: CyclePhaseImpact[];
}

export interface CyclePhaseImpact {
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'premenstrual';
  riskMultiplier: number; // 1.0 = no change
  commonSymptoms: string[];
  mechanism: string;
  tip: string;
}

// ── Medications ──

export interface MedicationInfo {
  name: string;
  class: string;
  description: string;
}

// ── Population Stats ──

export interface PopulationStatEntry {
  stat: string;
  value: string;
  source: string;
  context: string;
}

// ── Emergency Protocol ──

export interface EmergencyProtocol {
  severityQuestions: EmergencyQuestion[];
  immediateActions: string[];
  whenToCallDoctor: string[];
  whenToGoER: string[];
  whatToTellER: string[];
  doNotDo: string[];
  dietDuringFlare: string[];
}

export interface EmergencyQuestion {
  question: string;
  options: { label: string; severity: 'mild' | 'moderate' | 'severe' | 'emergency' }[];
}

// ── AI Context ──

export interface AIContextProfile {
  /** Gentle language substitutions: clinical term → gentle term */
  gentleLanguage: Record<string, string>;
  /** Terms to never say to the user */
  avoidTerms: string[];
  /** Condition-specific system prompt additions */
  systemPromptContext: string;
  /** What symptom-related phrases trigger symptom logging */
  symptomTriggerPhrases: string[];
  /** Recommended follow-up questions after symptom log */
  followUpQuestions: string[];
}

// ── Experiment Templates ──

export interface ExperimentTemplate {
  title: string;
  hypothesis: string;
  variable: string;
  baselineDays: number;
  interventionDays: number;
}
