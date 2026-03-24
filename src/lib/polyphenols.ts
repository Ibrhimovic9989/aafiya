/**
 * Polyphenol data for IBD context
 *
 * Curated from Phenol-Explorer (phenol-explorer.eu) — the most comprehensive
 * database on polyphenol content in foods. Phenol-Explorer has no REST API
 * (download-only MS Access files), so we embed the IBD-relevant subset.
 *
 * Focus: polyphenols with demonstrated effects on gut inflammation,
 * microbiome modulation, or barrier integrity in IBD research.
 *
 * Source: Phenol-Explorer 3.6 + PubMed cross-references
 */

export interface Polyphenol {
  name: string;
  class: string;
  subclass: string;
  ibdMechanism: string;
  effectDirection: 'protective' | 'mixed' | 'caution';
  topFoodSources: { food: string; amount: number; unit: string }[];
  researchNote: string;
}

export interface FoodPolyphenolProfile {
  food: string;
  indianName?: string;
  totalPolyphenols: number; // mg per 100g or 100ml
  keyPolyphenols: { name: string; amount: number; class: string }[];
  ibdRelevance: string;
  overallEffect: 'beneficial' | 'neutral' | 'caution';
}

/**
 * IBD-relevant polyphenols from Phenol-Explorer
 */
export const IBD_POLYPHENOLS: Polyphenol[] = [
  {
    name: 'Curcumin',
    class: 'Curcuminoid',
    subclass: 'Diarylheptanoid',
    ibdMechanism: 'Inhibits NF-κB, JAK2/STAT3 pathway. Natural JAK inhibitor — same target as tofacitinib. Reduces TNF-α, IL-1β, IL-6.',
    effectDirection: 'protective',
    topFoodSources: [
      { food: 'Turmeric powder', amount: 3600, unit: 'mg/100g' },
      { food: 'Curry powder', amount: 285, unit: 'mg/100g' },
      { food: 'Mustard (prepared)', amount: 9.5, unit: 'mg/100g' },
    ],
    researchNote: 'RCT: 2g/day curcumin reduced UC relapse rate from 20.5% to 4.7% (Hanai et al, Clin Gastroenterol Hepatol 2006)',
  },
  {
    name: 'Epigallocatechin gallate (EGCG)',
    class: 'Flavonoid',
    subclass: 'Flavan-3-ol',
    ibdMechanism: 'Suppresses NF-κB, reduces oxidative stress, protects gut epithelial tight junctions via PTPN2 pathway.',
    effectDirection: 'protective',
    topFoodSources: [
      { food: 'Green tea (brewed)', amount: 70, unit: 'mg/100ml' },
      { food: 'Black tea (brewed)', amount: 9.4, unit: 'mg/100ml' },
      { food: 'Apple', amount: 1.4, unit: 'mg/100g' },
    ],
    researchNote: 'Green tea polyphenols reduced colonic inflammation in DSS-colitis models by 50% (Oz et al, Inflamm Bowel Dis 2005)',
  },
  {
    name: 'Quercetin',
    class: 'Flavonoid',
    subclass: 'Flavonol',
    ibdMechanism: 'Stabilizes mast cells, reduces histamine release, inhibits COX-2 and lipoxygenase. Strengthens tight junctions.',
    effectDirection: 'protective',
    topFoodSources: [
      { food: 'Capers (raw)', amount: 234, unit: 'mg/100g' },
      { food: 'Red onion', amount: 32, unit: 'mg/100g' },
      { food: 'Apple (with skin)', amount: 4.7, unit: 'mg/100g' },
      { food: 'Berries (mixed)', amount: 3.5, unit: 'mg/100g' },
    ],
    researchNote: 'Quercetin restored barrier function in IL-13 treated intestinal cells (Amasheh et al, J Nutr 2008)',
  },
  {
    name: 'Resveratrol',
    class: 'Stilbenoid',
    subclass: 'Stilbene',
    ibdMechanism: 'Activates SIRT1 and AMPK, reduces intestinal fibrosis, modulates gut microbiome toward anti-inflammatory profile.',
    effectDirection: 'protective',
    topFoodSources: [
      { food: 'Red grape skin', amount: 3.5, unit: 'mg/100g' },
      { food: 'Peanuts', amount: 0.08, unit: 'mg/100g' },
      { food: 'Mulberries', amount: 5.1, unit: 'mg/100g' },
    ],
    researchNote: 'Resveratrol reduced clinical activity index in UC patients in a pilot RCT (Samsami-Kor et al, Arch Med Res 2015)',
  },
  {
    name: 'Ellagic acid',
    class: 'Phenolic acid',
    subclass: 'Hydroxybenzoic acid',
    ibdMechanism: 'Metabolized to urolithins by gut bacteria. Urolithin A is a potent enhancer of gut barrier integrity and autophagy.',
    effectDirection: 'protective',
    topFoodSources: [
      { food: 'Pomegranate', amount: 57, unit: 'mg/100g' },
      { food: 'Walnuts', amount: 28, unit: 'mg/100g' },
      { food: 'Raspberries', amount: 27, unit: 'mg/100g' },
      { food: 'Strawberries', amount: 2.2, unit: 'mg/100g' },
    ],
    researchNote: 'Urolithin A (ellagic acid metabolite) enhanced gut barrier function via AhR-Nrf2 pathway (Singh et al, Nat Med 2019)',
  },
  {
    name: 'Naringenin',
    class: 'Flavonoid',
    subclass: 'Flavanone',
    ibdMechanism: 'Anti-inflammatory via NF-κB inhibition, protects against oxidative damage to intestinal mucosa.',
    effectDirection: 'protective',
    topFoodSources: [
      { food: 'Grapefruit', amount: 43, unit: 'mg/100g' },
      { food: 'Orange', amount: 2.1, unit: 'mg/100g' },
      { food: 'Tomato', amount: 0.3, unit: 'mg/100g' },
    ],
    researchNote: 'Naringenin reduced colonic inflammation and fibrosis in TNBS colitis model (Amaro et al, Molecules 2020)',
  },
  {
    name: 'Rosmarinic acid',
    class: 'Phenolic acid',
    subclass: 'Hydroxycinnamic acid',
    ibdMechanism: 'Potent anti-inflammatory and antioxidant. Inhibits COX-2 expression and reduces oxidative stress markers.',
    effectDirection: 'protective',
    topFoodSources: [
      { food: 'Rosemary', amount: 200, unit: 'mg/100g' },
      { food: 'Oregano', amount: 132, unit: 'mg/100g' },
      { food: 'Mint/Pudina', amount: 55, unit: 'mg/100g' },
      { food: 'Tulsi/Holy basil', amount: 45, unit: 'mg/100g' },
    ],
    researchNote: 'Common in Indian herbs. Rosmarinic acid reduced TNF-α and IL-6 in experimental colitis (Sanbongi et al, Eur J Pharmacol 2004)',
  },
  {
    name: 'Gingerol (6-gingerol)',
    class: 'Phenol',
    subclass: 'Gingerol',
    ibdMechanism: 'Anti-inflammatory, anti-nausea. Reduces COX-2 and prostaglandin E2. Modulates gut motility.',
    effectDirection: 'protective',
    topFoodSources: [
      { food: 'Fresh ginger/Adrak', amount: 280, unit: 'mg/100g' },
      { food: 'Dried ginger/Sonth', amount: 120, unit: 'mg/100g' },
    ],
    researchNote: 'Ginger extract reduced CDAI scores in a pilot study of CD patients (Nikkhah-Bodaghi et al, Complement Ther Med 2019)',
  },
  {
    name: 'Kaempferol',
    class: 'Flavonoid',
    subclass: 'Flavonol',
    ibdMechanism: 'Anti-inflammatory but kaempferol-3-glucoside was identified as flare-associated in 2025 compound study. Context-dependent.',
    effectDirection: 'mixed',
    topFoodSources: [
      { food: 'Kale', amount: 47, unit: 'mg/100g' },
      { food: 'Spinach', amount: 6.4, unit: 'mg/100g' },
      { food: 'Broccoli', amount: 7.8, unit: 'mg/100g' },
    ],
    researchNote: 'Free kaempferol is protective, but kaempferol-3-glucoside was among 6 flare-associated compounds (PMC12638057, 2025)',
  },
  {
    name: 'Chlorogenic acid',
    class: 'Phenolic acid',
    subclass: 'Hydroxycinnamic acid',
    ibdMechanism: 'Prebiotic-like effect, promotes Bifidobacterium. But high amounts (coffee) can increase gastric motility.',
    effectDirection: 'mixed',
    topFoodSources: [
      { food: 'Coffee (brewed)', amount: 140, unit: 'mg/100ml' },
      { food: 'Apple', amount: 7.5, unit: 'mg/100g' },
      { food: 'Plum', amount: 6.8, unit: 'mg/100g' },
    ],
    researchNote: 'Moderate intake beneficial, excess may worsen diarrhea. 1-2 cups coffee is generally safe in remission.',
  },
];

/**
 * Food-level polyphenol profiles for common Indian foods
 */
export const INDIAN_FOOD_POLYPHENOLS: FoodPolyphenolProfile[] = [
  {
    food: 'Haldi Doodh (Turmeric Milk)',
    indianName: 'हल्दी दूध',
    totalPolyphenols: 165,
    keyPolyphenols: [
      { name: 'Curcumin', amount: 150, class: 'Curcuminoid' },
      { name: 'Demethoxycurcumin', amount: 12, class: 'Curcuminoid' },
    ],
    ibdRelevance: 'Highly beneficial — curcumin is a natural JAK inhibitor with clinical evidence in IBD',
    overallEffect: 'beneficial',
  },
  {
    food: 'Green Tea',
    indianName: 'ग्रीन टी',
    totalPolyphenols: 89,
    keyPolyphenols: [
      { name: 'EGCG', amount: 70, class: 'Flavan-3-ol' },
      { name: 'Epicatechin', amount: 8, class: 'Flavan-3-ol' },
    ],
    ibdRelevance: 'Protective — EGCG strengthens gut barrier and reduces inflammation',
    overallEffect: 'beneficial',
  },
  {
    food: 'Chai (Indian Tea)',
    indianName: 'चाय',
    totalPolyphenols: 45,
    keyPolyphenols: [
      { name: 'Theaflavins', amount: 18, class: 'Flavan-3-ol polymer' },
      { name: 'Gingerol', amount: 5, class: 'Phenol' },
      { name: 'EGCG', amount: 9.4, class: 'Flavan-3-ol' },
    ],
    ibdRelevance: 'Moderately beneficial — ginger and tea polyphenols help, but watch caffeine and lactose from milk',
    overallEffect: 'neutral',
  },
  {
    food: 'Pomegranate (Anaar)',
    indianName: 'अनार',
    totalPolyphenols: 250,
    keyPolyphenols: [
      { name: 'Ellagic acid', amount: 57, class: 'Hydroxybenzoic acid' },
      { name: 'Punicalagin', amount: 150, class: 'Ellagitannin' },
    ],
    ibdRelevance: 'Highly beneficial — ellagic acid converts to urolithin A which strengthens gut barrier',
    overallEffect: 'beneficial',
  },
  {
    food: 'Pudina Chutney (Mint)',
    indianName: 'पुदीना चटनी',
    totalPolyphenols: 68,
    keyPolyphenols: [
      { name: 'Rosmarinic acid', amount: 55, class: 'Hydroxycinnamic acid' },
      { name: 'Luteolin', amount: 8, class: 'Flavone' },
    ],
    ibdRelevance: 'Beneficial — rosmarinic acid is anti-inflammatory, mint soothes gut',
    overallEffect: 'beneficial',
  },
  {
    food: 'Adrak (Ginger)',
    indianName: 'अदरक',
    totalPolyphenols: 310,
    keyPolyphenols: [
      { name: '6-Gingerol', amount: 280, class: 'Gingerol' },
      { name: '6-Shogaol', amount: 18, class: 'Shogaol' },
    ],
    ibdRelevance: 'Very beneficial — reduces nausea, COX-2 inhibitor, clinical evidence in CD',
    overallEffect: 'beneficial',
  },
  {
    food: 'Amla (Indian Gooseberry)',
    indianName: 'आंवला',
    totalPolyphenols: 680,
    keyPolyphenols: [
      { name: 'Gallic acid', amount: 350, class: 'Hydroxybenzoic acid' },
      { name: 'Ellagic acid', amount: 180, class: 'Hydroxybenzoic acid' },
      { name: 'Quercetin', amount: 12, class: 'Flavonol' },
    ],
    ibdRelevance: 'Exceptionally beneficial — one of the richest polyphenol sources, supports gut barrier',
    overallEffect: 'beneficial',
  },
  {
    food: 'Methi (Fenugreek)',
    indianName: 'मेथी',
    totalPolyphenols: 85,
    keyPolyphenols: [
      { name: 'Diosgenin', amount: 40, class: 'Steroidal saponin' },
      { name: 'Gallic acid', amount: 28, class: 'Hydroxybenzoic acid' },
    ],
    ibdRelevance: 'Beneficial — anti-inflammatory, mucilage protects gut lining',
    overallEffect: 'beneficial',
  },
];

/**
 * Get polyphenol info for a food item
 */
export function getPolyphenolProfile(foodName: string): FoodPolyphenolProfile | null {
  const lower = foodName.toLowerCase();
  return INDIAN_FOOD_POLYPHENOLS.find(f =>
    f.food.toLowerCase().includes(lower) ||
    (f.indianName && f.indianName.includes(foodName))
  ) || null;
}

/**
 * Get all protective polyphenols for agent context
 */
export function getPolyphenolContextForAgent(): string {
  let ctx = '\n\nPolyphenol Intelligence (from Phenol-Explorer data):\n';
  ctx += 'Key polyphenols that affect gut health:\n';

  for (const pp of IBD_POLYPHENOLS.filter(p => p.effectDirection === 'protective').slice(0, 6)) {
    const foods = pp.topFoodSources.slice(0, 2).map(f => f.food).join(', ');
    ctx += `- ${pp.name}: ${foods} — ${pp.ibdMechanism.split('.')[0]}\n`;
  }

  ctx += '\nWhen she eats foods rich in these polyphenols, mention the benefit naturally.\n';
  ctx += 'For example: "Haldi doodh is great — turmeric has curcumin which helps calm inflammation naturally."\n';

  return ctx;
}
