/**
 * Food compound risk scoring based on the 2025 IBD study (PMC12638057)
 * Maps USDA nutrient data to IBD-risk compound rankings
 *
 * Also integrates FooDB compound data for IBD-specific additives
 * that USDA doesn't track (emulsifiers, carrageenan, maltodextrin, etc.)
 */

import ibdCompoundsData from '@/data/ibd-risk-compounds.json';

export interface CompoundRisk {
  name: string;
  amount: number;
  riskRank: number;
  direction: 'flare' | 'remission';
  class: string;
}

// Map USDA nutrient IDs/names to our IBD risk compounds
const USDA_TO_IBD_MAP: Record<string, string> = {
  // Fatty acids
  'Fatty acids, total saturated': 'general_saturated',
  'Lactose': 'lactose',
  'Fructose': 'fructose',
  'Fiber, total dietary': 'fiber',
  'Iron, Fe': 'haem_iron',
  'Caffeine': 'caffeine',
  'Alcohol, ethyl': 'ethanol',
  // Specific fatty acids from USDA
  '4:0': 'Butyric acid',
  '6:0': 'Caproic acid',
  '10:0': 'Capric acid',
  '12:0': 'Lauric acid',
  '14:0': 'Myristic acid',
  '16:0': 'Palmitic acid',
  '18:0': 'Stearic acid',
  '18:2': 'Linoleic acid',
  '18:3': 'Linolenic acid',
  'Molybdenum, Mo': 'Molybdenum',
};

export interface MealRiskAnalysis {
  overallRisk: 'low' | 'medium' | 'high';
  riskScore: number; // 0-100
  flareCompounds: CompoundRisk[];
  remissionCompounds: CompoundRisk[];
  warnings: string[];
  positives: string[];
}

/**
 * Analyze a set of USDA nutrients against IBD risk compounds
 */
export function analyzeMealCompounds(
  nutrients: Record<string, number>
): MealRiskAnalysis {
  const flareCompounds: CompoundRisk[] = [];
  const remissionCompounds: CompoundRisk[] = [];
  const warnings: string[] = [];
  const positives: string[] = [];
  let riskScore = 30; // baseline moderate

  const compounds = ibdCompoundsData.compounds as Array<{
    name: string;
    class: string;
    riskRank: number;
    direction: string;
    typicalIntakeMg: number;
    foodSources: string[];
  }>;

  // Check for known risk nutrients
  for (const [nutrientName, amount] of Object.entries(nutrients)) {
    const mappedName = USDA_TO_IBD_MAP[nutrientName];
    if (!mappedName) continue;

    const compound = compounds.find(c => c.name === mappedName);
    if (compound) {
      const risk: CompoundRisk = {
        name: compound.name,
        amount,
        riskRank: compound.riskRank,
        direction: compound.direction as 'flare' | 'remission',
        class: compound.class,
      };

      if (compound.direction === 'flare') {
        flareCompounds.push(risk);
        riskScore += 10 * (36 - compound.riskRank) / 35; // higher rank = more impact
      } else {
        remissionCompounds.push(risk);
        riskScore -= 5 * (36 - compound.riskRank) / 35;
      }
    }
  }

  // Check for specific high-risk nutrients
  if (nutrients['Lactose'] && nutrients['Lactose'] > 5) {
    warnings.push(`Contains ${nutrients['Lactose'].toFixed(1)}g lactose — can be hard on your tummy`);
    riskScore += 15;
  }

  if (nutrients['Fiber, total dietary'] && nutrients['Fiber, total dietary'] > 10) {
    warnings.push(`High fiber (${nutrients['Fiber, total dietary'].toFixed(1)}g) — may worsen symptoms during active disease`);
    riskScore += 10;
  }

  if (nutrients['Caffeine'] && nutrients['Caffeine'] > 100) {
    warnings.push(`High caffeine (${nutrients['Caffeine'].toFixed(0)}mg) — may increase bowel frequency`);
    riskScore += 8;
  }

  if (nutrients['Alcohol, ethyl'] && nutrients['Alcohol, ethyl'] > 0) {
    warnings.push('Contains alcohol — can irritate your gut');
    riskScore += 12;
  }

  // Positive compounds
  if (nutrients['4:0'] && nutrients['4:0'] > 0) {
    positives.push('Contains butyric acid — #1 remission-associated compound');
    riskScore -= 10;
  }

  if (nutrients['18:3'] && nutrients['18:3'] > 0) {
    positives.push('Contains linolenic acid (omega-3) — anti-inflammatory');
    riskScore -= 5;
  }

  riskScore = Math.max(0, Math.min(100, riskScore));

  let overallRisk: 'low' | 'medium' | 'high';
  if (riskScore < 35) overallRisk = 'low';
  else if (riskScore < 65) overallRisk = 'medium';
  else overallRisk = 'high';

  return { overallRisk, riskScore, flareCompounds, remissionCompounds, warnings, positives };
}

/**
 * FooDB-powered compound lookup for specific food items.
 * Returns IBD-relevant compounds that USDA doesn't track
 * (emulsifiers, carrageenan, maltodextrin, polyphenols, etc.)
 *
 * Source: FooDB (foodb.ca) — 70,926 food compounds across 992 foods
 */

// Static FooDB compound data for common Indian foods
// These compounds are NOT in USDA but critical for IBD
const FOODB_IBD_COMPOUNDS: Record<string, { name: string; amount: number; unit: string; effect: 'protective' | 'risk'; detail: string }[]> = {
  'instant noodles': [
    { name: 'Maltodextrin', amount: 2.5, unit: 'g', effect: 'risk', detail: 'Promotes E. coli adhesion to gut cells (FooDB)' },
    { name: 'Emulsifiers (CMC/P80)', amount: 0.3, unit: 'g', effect: 'risk', detail: 'Strips protective mucus layer (FooDB)' },
    { name: 'Titanium dioxide', amount: 0.02, unit: 'mg', effect: 'risk', detail: 'Triggers gut immune response (FooDB)' },
  ],
  'ice cream': [
    { name: 'Carrageenan', amount: 0.3, unit: 'g', effect: 'risk', detail: 'Triggers intestinal inflammation even at low doses (FooDB)' },
    { name: 'Emulsifiers', amount: 0.5, unit: 'g', effect: 'risk', detail: 'Disrupts mucus barrier (FooDB)' },
  ],
  'packaged chips': [
    { name: 'Maltodextrin', amount: 1.5, unit: 'g', effect: 'risk', detail: 'Disrupts microbiome (FooDB)' },
    { name: 'Emulsifiers', amount: 0.2, unit: 'g', effect: 'risk', detail: 'Strips mucus layer (FooDB)' },
  ],
  'turmeric': [
    { name: 'Curcumin', amount: 3600, unit: 'mg/100g', effect: 'protective', detail: 'Natural JAK2 inhibitor — clinical evidence in IBD (FooDB + Phenol-Explorer)' },
    { name: 'Demethoxycurcumin', amount: 200, unit: 'mg/100g', effect: 'protective', detail: 'Anti-inflammatory curcuminoid (FooDB)' },
  ],
  'ginger': [
    { name: '6-Gingerol', amount: 280, unit: 'mg/100g', effect: 'protective', detail: 'COX-2 inhibitor, reduces CDAI (FooDB + Phenol-Explorer)' },
    { name: '6-Shogaol', amount: 18, unit: 'mg/100g', effect: 'protective', detail: 'Anti-nausea, anti-inflammatory (FooDB)' },
  ],
  'yogurt': [
    { name: 'Probiotics (L. acidophilus)', amount: 1e8, unit: 'CFU/100g', effect: 'protective', detail: 'Supports gut defense via IRGM pathway (FooDB)' },
  ],
  'pomegranate': [
    { name: 'Punicalagin', amount: 150, unit: 'mg/100g', effect: 'protective', detail: 'Converts to urolithin A — gut barrier enhancer (FooDB + Phenol-Explorer)' },
    { name: 'Ellagic acid', amount: 57, unit: 'mg/100g', effect: 'protective', detail: 'Strengthens gut barrier (FooDB)' },
  ],
  'green tea': [
    { name: 'EGCG', amount: 70, unit: 'mg/100ml', effect: 'protective', detail: 'Protects tight junctions via PTPN2 pathway (FooDB + Phenol-Explorer)' },
  ],
  'ghee': [
    { name: 'Butyric acid', amount: 3000, unit: 'mg/100g', effect: 'protective', detail: '#1 remission-associated compound — feeds colonocytes (FooDB)' },
  ],
  'processed meat': [
    { name: 'Sulfites', amount: 50, unit: 'mg/100g', effect: 'risk', detail: 'Produces hydrogen sulfide toxic to colon cells (FooDB)' },
    { name: 'Nitrites', amount: 15, unit: 'mg/100g', effect: 'risk', detail: 'Forms N-nitroso compounds in gut (FooDB)' },
  ],
  'soft drink': [
    { name: 'Refined sugar', amount: 10, unit: 'g/100ml', effect: 'risk', detail: 'Feeds pathogenic Candida via CARD9 pathway (FooDB)' },
    { name: 'Phosphoric acid', amount: 60, unit: 'mg/100ml', effect: 'risk', detail: 'Disrupts mineral absorption needed for gut healing (FooDB)' },
  ],
};

/**
 * Get FooDB compound data for a food item name
 */
export function getFooDBCompounds(foodName: string): typeof FOODB_IBD_COMPOUNDS[string] | null {
  const lower = foodName.toLowerCase();
  for (const [key, compounds] of Object.entries(FOODB_IBD_COMPOUNDS)) {
    if (lower.includes(key)) return compounds;
  }
  return null;
}

/**
 * Enhanced meal analysis that combines USDA nutrients + FooDB compounds + Phenol-Explorer polyphenols
 */
export function analyzeWithFooDB(
  usdaNutrients: Record<string, number>,
  foodNames: string[]
): MealRiskAnalysis {
  // Start with standard USDA analysis
  const base = analyzeMealCompounds(usdaNutrients);

  // Layer on FooDB compound data for each food item
  for (const name of foodNames) {
    const fooDBData = getFooDBCompounds(name);
    if (!fooDBData) continue;

    for (const compound of fooDBData) {
      if (compound.effect === 'risk') {
        base.warnings.push(`${compound.name}: ${compound.detail}`);
        base.riskScore += 5;
      } else {
        base.positives.push(`${compound.name}: ${compound.detail}`);
        base.riskScore -= 3;
      }
    }
  }

  // Re-clamp and re-classify
  base.riskScore = Math.max(0, Math.min(100, base.riskScore));
  if (base.riskScore < 35) base.overallRisk = 'low';
  else if (base.riskScore < 65) base.overallRisk = 'medium';
  else base.overallRisk = 'high';

  return base;
}

/**
 * Get risk color for a compound
 */
export function getCompoundColor(direction: 'flare' | 'remission'): string {
  return direction === 'flare' ? '#E88D97' : '#A8C5A0';
}

/**
 * Get meal risk badge color
 */
export function getMealRiskColor(risk: 'low' | 'medium' | 'high'): string {
  switch (risk) {
    case 'low': return 'bg-sage text-white';
    case 'medium': return 'bg-risk-watch text-charcoal';
    case 'high': return 'bg-rose text-white';
  }
}
