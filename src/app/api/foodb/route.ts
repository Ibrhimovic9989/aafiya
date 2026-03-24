import { NextRequest, NextResponse } from 'next/server';

/**
 * FooDB API proxy
 * FooDB (foodb.ca) — the world's largest food constituent database.
 * Contains 70,926+ food compounds across 992 foods.
 *
 * API requires a key obtained by contacting the FooDB team.
 * If no key is configured, falls back to our static compound data.
 *
 * Endpoints:
 * - /foods: Search foods
 * - /compounds: Search compounds
 * - /contents: Get compound amounts in specific foods
 */

const FOODB_BASE = 'https://foodb.ca/api/v1';

interface FooDBFood {
  id: number;
  name: string;
  description: string;
  foodGroup: string;
  foodSubgroup: string;
}

interface FooDBCompound {
  id: number;
  name: string;
  description: string;
  cas_number: string;
  state: string;
}

interface FooDBContent {
  foodName: string;
  compoundName: string;
  amount: number;
  unit: string;
  source: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'foods';
  const query = searchParams.get('q') || '';
  const foodId = searchParams.get('food_id');
  const compoundId = searchParams.get('compound_id');
  const page = searchParams.get('page') || '1';

  const apiKey = process.env.FOODB_API_KEY;

  // If no API key, return static fallback data
  if (!apiKey) {
    return NextResponse.json({
      source: 'static_fallback',
      message: 'FooDB API key not configured. Using static IBD-relevant compound data.',
      data: getStaticFooDBData(endpoint, query, foodId),
    });
  }

  try {
    let url: string;
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Authorization': `Token ${apiKey}`,
    };

    switch (endpoint) {
      case 'foods':
        url = `${FOODB_BASE}/foods?q=${encodeURIComponent(query)}&page=${page}`;
        break;
      case 'compounds':
        url = `${FOODB_BASE}/compounds?q=${encodeURIComponent(query)}&page=${page}`;
        break;
      case 'contents':
        if (foodId) {
          url = `${FOODB_BASE}/foods/${foodId}/contents`;
        } else if (compoundId) {
          url = `${FOODB_BASE}/compounds/${compoundId}/contents`;
        } else {
          return NextResponse.json({ error: 'food_id or compound_id required for contents endpoint' }, { status: 400 });
        }
        break;
      default:
        return NextResponse.json({ error: 'Invalid endpoint. Use: foods, compounds, contents' }, { status: 400 });
    }

    const res = await fetch(url, {
      headers,
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return NextResponse.json({
          source: 'static_fallback',
          message: 'FooDB API key invalid. Using static data.',
          data: getStaticFooDBData(endpoint, query, foodId),
        });
      }
      throw new Error(`FooDB API returned ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json({
      source: 'foodb_api',
      data,
    });
  } catch (error: any) {
    console.error('FooDB API error:', error);
    return NextResponse.json({
      source: 'static_fallback',
      message: error.message,
      data: getStaticFooDBData(endpoint, query, foodId),
    });
  }
}

/**
 * Static fallback data for IBD-relevant compounds
 * Curated from FooDB's public data on food constituents
 */
function getStaticFooDBData(endpoint: string, query: string, foodId: string | null) {
  if (endpoint === 'compounds') {
    const q = query.toLowerCase();
    return IBD_RELEVANT_COMPOUNDS.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }

  if (endpoint === 'foods') {
    const q = query.toLowerCase();
    return COMMON_FOODS_WITH_COMPOUNDS.filter(f =>
      f.name.toLowerCase().includes(q)
    );
  }

  if (endpoint === 'contents' && foodId) {
    const food = COMMON_FOODS_WITH_COMPOUNDS.find(f => f.id === foodId);
    return food?.compounds || [];
  }

  return [];
}

// IBD-relevant compounds from FooDB's database
const IBD_RELEVANT_COMPOUNDS = [
  // Remission-associated (protective)
  { id: 'C001', name: 'Butyric acid', category: 'Short-chain fatty acid', ibdEffect: 'protective', mechanism: 'Feeds colonocytes, strengthens gut barrier, reduces inflammation via HDAC inhibition', foodSources: ['butter', 'ghee', 'parmesan cheese', 'fiber (bacterial fermentation)'] },
  { id: 'C002', name: 'Curcumin', category: 'Polyphenol', ibdEffect: 'protective', mechanism: 'Natural JAK2 inhibitor, reduces TNF-α and IL-6. Works on same pathway as tofacitinib', foodSources: ['turmeric/haldi', 'curry powder'] },
  { id: 'C003', name: 'Quercetin', category: 'Flavonoid', ibdEffect: 'protective', mechanism: 'Stabilizes mast cells, reduces histamine release, anti-inflammatory', foodSources: ['onions', 'apples', 'berries', 'green tea'] },
  { id: 'C004', name: 'Epigallocatechin gallate (EGCG)', category: 'Catechin', ibdEffect: 'protective', mechanism: 'Reduces NF-κB activation, protects gut epithelium', foodSources: ['green tea', 'matcha'] },
  { id: 'C005', name: 'Vanillin', category: 'Phenolic aldehyde', ibdEffect: 'protective', mechanism: 'Anti-inflammatory, reduces oxidative stress in colon', foodSources: ['vanilla', 'cloves'] },
  { id: 'C006', name: 'Capric acid', category: 'Medium-chain fatty acid', ibdEffect: 'protective', mechanism: 'Anti-microbial, supports healthy gut microbiome balance', foodSources: ['coconut oil', 'palm kernel oil', 'goat milk'] },
  { id: 'C007', name: 'Linoleic acid', category: 'Polyunsaturated fatty acid', ibdEffect: 'protective', mechanism: 'Essential fatty acid, precursor to anti-inflammatory mediators when balanced', foodSources: ['sunflower oil', 'safflower oil', 'nuts', 'seeds'] },
  { id: 'C008', name: 'Resveratrol', category: 'Stilbenoid', ibdEffect: 'protective', mechanism: 'Activates SIRT1, reduces intestinal inflammation and fibrosis', foodSources: ['grapes', 'peanuts', 'mulberries'] },
  { id: 'C009', name: 'Gingerol', category: 'Phenol', ibdEffect: 'protective', mechanism: 'Anti-inflammatory, anti-nausea, reduces COX-2 expression', foodSources: ['ginger/adrak'] },
  { id: 'C010', name: 'Ellagic acid', category: 'Polyphenol', ibdEffect: 'protective', mechanism: 'Anti-inflammatory, promotes gut barrier integrity', foodSources: ['pomegranate', 'walnuts', 'berries'] },
  { id: 'C011', name: 'Beta-glucan', category: 'Polysaccharide', ibdEffect: 'protective', mechanism: 'Prebiotic, enhances immune function, feeds beneficial gut bacteria', foodSources: ['oats', 'barley', 'mushrooms'] },
  { id: 'C012', name: 'Zinc', category: 'Mineral', ibdEffect: 'protective', mechanism: 'Supports STAT3-mediated gut wound healing, maintains tight junctions', foodSources: ['pumpkin seeds', 'eggs', 'chickpeas', 'lentils'] },
  { id: 'C013', name: 'Vitamin D3', category: 'Vitamin', ibdEffect: 'protective', mechanism: 'Modulates immune response, supports gut barrier, reduces Th17 cells', foodSources: ['sunlight', 'fatty fish', 'egg yolks', 'fortified milk'] },
  { id: 'C014', name: 'Glutamine', category: 'Amino acid', ibdEffect: 'protective', mechanism: 'Primary fuel for intestinal epithelial cells, supports gut repair', foodSources: ['eggs', 'paneer', 'chicken', 'dal', 'cabbage'] },
  { id: 'C015', name: 'Omega-3 (EPA)', category: 'Polyunsaturated fatty acid', ibdEffect: 'protective', mechanism: 'Reduces TNF signaling via TNFSF15 pathway, anti-inflammatory', foodSources: ['fatty fish', 'flaxseed', 'walnuts', 'chia seeds'] },

  // Flare-associated (risky)
  { id: 'C101', name: 'Molybdenum (excess)', category: 'Trace mineral', ibdEffect: 'risk', mechanism: 'Excess associated with IBD flares in GWAS compound analysis', foodSources: ['lentils (high amounts)', 'liver', 'grains'] },
  { id: 'C102', name: 'Cellobiose', category: 'Disaccharide', ibdEffect: 'risk', mechanism: 'Increases intestinal permeability in IBD patients', foodSources: ['honey (trace)', 'processed foods'] },
  { id: 'C103', name: 'Emulsifiers (CMC, P80)', category: 'Food additive', ibdEffect: 'risk', mechanism: 'Disrupts mucus layer, promotes bacterial translocation, increases inflammation', foodSources: ['ice cream', 'processed sauces', 'packaged snacks', 'instant noodles'] },
  { id: 'C104', name: 'Carrageenan', category: 'Food additive', ibdEffect: 'risk', mechanism: 'Triggers TLR4 pathway, causes intestinal inflammation even at low doses', foodSources: ['dairy alternatives', 'processed meats', 'some toothpaste'] },
  { id: 'C105', name: 'Maltodextrin', category: 'Polysaccharide', ibdEffect: 'risk', mechanism: 'Promotes E. coli adhesion to intestinal cells, disrupts microbiome', foodSources: ['processed foods', 'instant noodles', 'protein powders', 'sauces'] },
  { id: 'C106', name: 'Refined sugar (sucrose)', category: 'Disaccharide', ibdEffect: 'risk', mechanism: 'Feeds pathogenic Candida (CARD9 pathway), increases gut permeability', foodSources: ['sweets', 'soft drinks', 'packaged snacks', 'mithai'] },
  { id: 'C107', name: 'Capsaicin', category: 'Alkaloid', ibdEffect: 'risk', mechanism: 'Activates TRPV1 pain receptors in inflamed gut, increases urgency', foodSources: ['chillies', 'hot sauce', 'spicy food'] },
  { id: 'C108', name: 'Lactose', category: 'Disaccharide', ibdEffect: 'risk', mechanism: 'Malabsorbed in 40-44% of CD patients, causes bloating and diarrhea', foodSources: ['milk', 'cream', 'soft cheese', 'ice cream'] },
  { id: 'C109', name: 'Caffeine (excess)', category: 'Alkaloid', ibdEffect: 'risk', mechanism: 'Stimulates colonic motility, can worsen diarrhea and urgency', foodSources: ['coffee', 'energy drinks', 'strong tea'] },
  { id: 'C110', name: 'Alcohol', category: 'Organic compound', ibdEffect: 'risk', mechanism: 'Disrupts tight junctions (PTPN2 pathway), increases permeability', foodSources: ['beer', 'wine', 'spirits'] },
  { id: 'C111', name: 'Titanium dioxide (E171)', category: 'Food additive', ibdEffect: 'risk', mechanism: 'Nanoparticles accumulate in gut lymphoid tissue, trigger NLRP3 inflammasome', foodSources: ['candy coating', 'chewing gum', 'white sauces'] },
  { id: 'C112', name: 'Sulfites', category: 'Preservative', ibdEffect: 'risk', mechanism: 'Reduces sulfate-reducing bacteria, produces hydrogen sulfide toxic to colonocytes', foodSources: ['dried fruits', 'wine', 'pickles', 'processed meats'] },
];

// Common foods with their IBD-relevant compounds
const COMMON_FOODS_WITH_COMPOUNDS = [
  {
    id: 'dal',
    name: 'Dal (Lentils, cooked)',
    compounds: [
      { name: 'Glutamine', amount: 1.3, unit: 'g/100g', effect: 'protective' },
      { name: 'Zinc', amount: 1.3, unit: 'mg/100g', effect: 'protective' },
      { name: 'Beta-glucan', amount: 0.5, unit: 'g/100g', effect: 'protective' },
      { name: 'Fiber', amount: 7.9, unit: 'g/100g', effect: 'protective' },
    ],
  },
  {
    id: 'curd',
    name: 'Curd/Dahi (Yogurt)',
    compounds: [
      { name: 'Butyric acid', amount: 0.1, unit: 'g/100g', effect: 'protective' },
      { name: 'Glutamine', amount: 0.3, unit: 'g/100g', effect: 'protective' },
      { name: 'Lactose', amount: 4.7, unit: 'g/100g', effect: 'risk' },
      { name: 'Probiotics (L. acidophilus)', amount: 1e8, unit: 'CFU/100g', effect: 'protective' },
    ],
  },
  {
    id: 'haldi_doodh',
    name: 'Haldi Doodh (Turmeric Milk)',
    compounds: [
      { name: 'Curcumin', amount: 150, unit: 'mg/cup', effect: 'protective' },
      { name: 'Lactose', amount: 12, unit: 'g/cup', effect: 'risk' },
    ],
  },
  {
    id: 'maggi',
    name: 'Maggi (Instant Noodles)',
    compounds: [
      { name: 'Maltodextrin', amount: 2.5, unit: 'g/serving', effect: 'risk' },
      { name: 'Emulsifiers', amount: 0.3, unit: 'g/serving', effect: 'risk' },
      { name: 'Refined sugar', amount: 1.2, unit: 'g/serving', effect: 'risk' },
      { name: 'Sodium', amount: 860, unit: 'mg/serving', effect: 'risk' },
    ],
  },
  {
    id: 'roti',
    name: 'Roti (Whole Wheat Flatbread)',
    compounds: [
      { name: 'Fiber', amount: 3.6, unit: 'g/roti', effect: 'protective' },
      { name: 'Zinc', amount: 0.6, unit: 'mg/roti', effect: 'protective' },
    ],
  },
  {
    id: 'paratha',
    name: 'Paratha (Fried Wheat Flatbread)',
    compounds: [
      { name: 'Fiber', amount: 2.1, unit: 'g/paratha', effect: 'protective' },
      { name: 'Trans fats', amount: 0.3, unit: 'g/paratha', effect: 'risk' },
    ],
  },
  {
    id: 'chai',
    name: 'Chai (Indian Tea)',
    compounds: [
      { name: 'EGCG', amount: 30, unit: 'mg/cup', effect: 'protective' },
      { name: 'Caffeine', amount: 40, unit: 'mg/cup', effect: 'risk' },
      { name: 'Gingerol', amount: 5, unit: 'mg/cup', effect: 'protective' },
      { name: 'Lactose', amount: 6, unit: 'g/cup', effect: 'risk' },
    ],
  },
  {
    id: 'paneer',
    name: 'Paneer (Cottage Cheese)',
    compounds: [
      { name: 'Glutamine', amount: 1.8, unit: 'g/100g', effect: 'protective' },
      { name: 'Zinc', amount: 2.1, unit: 'mg/100g', effect: 'protective' },
      { name: 'Butyric acid', amount: 0.2, unit: 'g/100g', effect: 'protective' },
      { name: 'Lactose', amount: 1.2, unit: 'g/100g', effect: 'risk' },
    ],
  },
  {
    id: 'ghee',
    name: 'Ghee (Clarified Butter)',
    compounds: [
      { name: 'Butyric acid', amount: 3.0, unit: 'g/100g', effect: 'protective' },
      { name: 'Capric acid', amount: 0.6, unit: 'g/100g', effect: 'protective' },
      { name: 'Vitamin D3', amount: 1.5, unit: 'mcg/100g', effect: 'protective' },
    ],
  },
  {
    id: 'rice',
    name: 'White Rice (Cooked)',
    compounds: [
      { name: 'Resistant starch', amount: 1.2, unit: 'g/100g', effect: 'protective' },
      { name: 'Zinc', amount: 0.5, unit: 'mg/100g', effect: 'protective' },
    ],
  },
  {
    id: 'chicken_curry',
    name: 'Chicken Curry',
    compounds: [
      { name: 'Curcumin', amount: 80, unit: 'mg/serving', effect: 'protective' },
      { name: 'Glutamine', amount: 2.1, unit: 'g/serving', effect: 'protective' },
      { name: 'Gingerol', amount: 10, unit: 'mg/serving', effect: 'protective' },
      { name: 'Capsaicin', amount: 5, unit: 'mg/serving', effect: 'risk' },
    ],
  },
  {
    id: 'idli',
    name: 'Idli (Steamed Rice Cake)',
    compounds: [
      { name: 'Probiotics (fermented)', amount: 1e6, unit: 'CFU/piece', effect: 'protective' },
      { name: 'Fiber', amount: 1.1, unit: 'g/piece', effect: 'protective' },
    ],
  },
  {
    id: 'samosa',
    name: 'Samosa (Fried Pastry)',
    compounds: [
      { name: 'Trans fats', amount: 1.2, unit: 'g/piece', effect: 'risk' },
      { name: 'Emulsifiers', amount: 0.1, unit: 'g/piece', effect: 'risk' },
    ],
  },
];
