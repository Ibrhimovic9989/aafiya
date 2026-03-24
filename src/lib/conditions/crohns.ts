import type { ConditionProfile } from './types';

export const crohnsProfile: ConditionProfile = {
  id: 'crohns',
  name: "Crohn's Disease",
  shortName: "Crohn's",
  category: 'gastrointestinal',
  description: 'Inflammatory bowel disease affecting any part of the digestive tract, most commonly the ileum and colon.',
  icon: '🫄',

  scoring: {
    name: 'HBI',
    fullName: 'Harvey-Bradshaw Index',
    maxScore: 30,
    components: [
      { id: 'generalWellbeing', label: 'General Well-being', description: 'How are you feeling overall?', type: 'scale', min: 0, max: 4, options: [
        { value: 0, label: 'Very well' }, { value: 1, label: 'Slightly below par' }, { value: 2, label: 'Poor' }, { value: 3, label: 'Very poor' }, { value: 4, label: 'Terrible' },
      ]},
      { id: 'abdominalPain', label: 'Tummy Pain', description: 'How is your tummy pain today?', type: 'scale', min: 0, max: 3, options: [
        { value: 0, label: 'None' }, { value: 1, label: 'Mild' }, { value: 2, label: 'Moderate' }, { value: 3, label: 'Severe' },
      ]},
      { id: 'liquidStools', label: 'Soft/Liquid Stools', description: 'How many times did you go to the loo today?', type: 'count', min: 0, max: 20 },
      { id: 'abdominalMass', label: 'Tummy Lump', description: 'Can you feel any lump in your tummy?', type: 'scale', min: 0, max: 3, options: [
        { value: 0, label: 'None' }, { value: 1, label: 'Not sure' }, { value: 2, label: 'Yes, I can feel it' }, { value: 3, label: 'Yes, and it hurts' },
      ]},
      { id: 'complications', label: 'Other Symptoms', description: 'Any of these today?', type: 'checklist', min: 0, max: 8, checklistItems: [
        { id: 'arthralgia', label: 'Joint aches' },
        { id: 'uveitis', label: 'Eye irritation' },
        { id: 'erythema_nodosum', label: 'Skin bumps/nodules' },
        { id: 'aphthous_ulcers', label: 'Mouth sores' },
        { id: 'pyoderma_gangrenosum', label: 'Skin ulcers' },
        { id: 'anal_fissure', label: 'Anal discomfort' },
        { id: 'new_fistula', label: 'New drainage/fistula' },
        { id: 'abscess', label: 'Abscess/swelling' },
      ]},
    ],
    severityLevels: [
      { id: 'remission', label: 'Remission', range: [0, 4], color: 'text-sage-dark', bgColor: 'bg-sage-light' },
      { id: 'mild', label: 'Mild Activity', range: [5, 7], color: 'text-risk-watch', bgColor: 'bg-yellow-100' },
      { id: 'moderate', label: 'Moderate Activity', range: [8, 16], color: 'text-coral', bgColor: 'bg-coral/20' },
      { id: 'severe', label: 'Severe Activity', range: [17, 30], color: 'text-rose-dark', bgColor: 'bg-rose/20' },
    ],
    estimateFormula: { name: 'CDAI', calculate: (hbi: number) => Math.round(100 + 13 * hbi) },
  },

  symptoms: {
    coreSymptoms: [
      { id: 'painLevel', label: 'Pain Level', gentleLabel: 'How much does your tummy hurt?', type: 'scale', min: 0, max: 10 },
      { id: 'bowelFrequency', label: 'Bowel Frequency', gentleLabel: 'How many times did you go to the loo?', type: 'count', min: 0, max: 30 },
      { id: 'blood', label: 'Blood', gentleLabel: 'Any blood when you go?', type: 'select', options: [
        { value: 'none', label: 'None' }, { value: 'trace', label: 'A little' }, { value: 'moderate', label: 'Some' }, { value: 'severe', label: 'A lot' },
      ]},
      { id: 'urgency', label: 'Urgency', gentleLabel: 'How urgent was the need to go?', type: 'scale', min: 0, max: 10 },
      { id: 'fatigue', label: 'Fatigue', gentleLabel: 'How tired are you?', type: 'scale', min: 0, max: 10 },
      { id: 'nausea', label: 'Nausea', gentleLabel: 'Any nausea or feeling sick?', type: 'scale', min: 0, max: 10 },
    ],
    complications: [
      { id: 'arthralgia', label: 'Joint Pain', gentleLabel: 'Joint aches' },
      { id: 'uveitis', label: 'Eye Inflammation', gentleLabel: 'Eye irritation/redness' },
      { id: 'erythema_nodosum', label: 'Skin Nodules', gentleLabel: 'Skin bumps' },
      { id: 'aphthous_ulcers', label: 'Mouth Ulcers', gentleLabel: 'Mouth sores' },
      { id: 'pyoderma_gangrenosum', label: 'Skin Ulcers', gentleLabel: 'Skin ulcers' },
      { id: 'anal_fissure', label: 'Anal Fissure', gentleLabel: 'Anal discomfort' },
      { id: 'new_fistula', label: 'Fistula', gentleLabel: 'New drainage' },
      { id: 'abscess', label: 'Abscess', gentleLabel: 'Swelling/abscess' },
    ],
    customFields: [
      { id: 'liquidStools', label: 'Liquid Stools', type: 'number', defaultValue: 0 },
      { id: 'bristolScale', label: 'Bristol Scale', type: 'number', defaultValue: 4 },
      { id: 'abdominalMass', label: 'Abdominal Mass', type: 'number', defaultValue: 0 },
    ],
  },

  flareWeights: {
    symptomTrend: 25,
    circadianDisruption: 20,
    dietaryRisk: 15,
    menstrualPhase: 15,
    stressMood: 10,
    medicationAdherence: 10,
    mealTiming: 5,
  },

  dietaryProfile: {
    riskFactors: [
      { name: 'Lactose', mechanism: 'Malabsorbed in 40-44% of CD patients, causes bloating', severity: 'high', foods: ['milk', 'ice cream', 'soft cheese'] },
      { name: 'Emulsifiers', mechanism: 'Strips protective mucus layer in the gut', severity: 'high', foods: ['processed foods', 'ice cream', 'instant noodles'] },
      { name: 'Maltodextrin', mechanism: 'Promotes bacterial adhesion to gut cells', severity: 'high', foods: ['instant noodles', 'packaged chips', 'protein bars'] },
      { name: 'Carrageenan', mechanism: 'Triggers intestinal inflammation even at low doses', severity: 'high', foods: ['ice cream', 'almond milk', 'processed dairy'] },
      { name: 'Alcohol', mechanism: 'Directly irritates gut lining and increases permeability', severity: 'high', foods: ['beer', 'wine', 'spirits'] },
      { name: 'Refined Sugar', mechanism: 'Feeds pathogenic organisms via CARD9 pathway', severity: 'moderate', foods: ['soft drinks', 'sweets', 'packaged juices'] },
      { name: 'High Fiber (during flare)', mechanism: 'May worsen symptoms during active disease', severity: 'moderate', foods: ['raw vegetables', 'whole grains', 'beans'] },
      { name: 'Caffeine (excess)', mechanism: 'Increases bowel frequency', severity: 'low', foods: ['coffee', 'energy drinks', 'strong tea'] },
    ],
    protectiveFactors: [
      { name: 'Butyric Acid', mechanism: '#1 remission-associated compound, feeds colonocytes', severity: 'high', foods: ['ghee', 'butter', 'parmesan'] },
      { name: 'Curcumin', mechanism: 'Natural JAK2 inhibitor, clinical evidence in IBD', severity: 'high', foods: ['turmeric', 'haldi doodh', 'curry'] },
      { name: 'Omega-3 (ALA)', mechanism: 'Anti-inflammatory fatty acid', severity: 'moderate', foods: ['flaxseed', 'walnuts', 'chia seeds'] },
      { name: 'EGCG', mechanism: 'Protects gut tight junctions via PTPN2 pathway', severity: 'moderate', foods: ['green tea'] },
      { name: 'Probiotics', mechanism: 'Supports gut defense and microbiome balance', severity: 'moderate', foods: ['yogurt', 'kefir', 'fermented foods'] },
      { name: 'Gingerol', mechanism: 'COX-2 inhibitor, reduces disease activity', severity: 'moderate', foods: ['ginger', 'ginger tea'] },
    ],
    guidelines: [
      'Eat small, frequent meals rather than large ones',
      'Keep a food diary to identify personal triggers',
      'During flares, prefer cooked over raw vegetables',
      'Stay well-hydrated, especially during flares',
      'Consider a low-FODMAP trial if bloating is an issue',
    ],
    nutrientWarnings: [
      { nutrientName: 'Lactose', threshold: 5, unit: 'g', direction: 'above', warning: 'Contains lactose which can be hard on your tummy', riskIncrease: 15 },
      { nutrientName: 'Fiber, total dietary', threshold: 10, unit: 'g', direction: 'above', warning: 'High fiber may worsen symptoms during active disease', riskIncrease: 10 },
      { nutrientName: 'Caffeine', threshold: 100, unit: 'mg', direction: 'above', warning: 'High caffeine may increase how often you need the loo', riskIncrease: 8 },
      { nutrientName: 'Alcohol, ethyl', threshold: 0, unit: 'g', direction: 'above', warning: 'Alcohol can irritate your gut', riskIncrease: 12 },
    ],
  },

  cycleImpact: {
    hasImpact: true,
    prevalencePercent: 53,
    phases: [
      { phase: 'menstrual', riskMultiplier: 1.4, commonSymptoms: ['Increased tummy cramps', 'More frequent loo visits', 'Worse fatigue'], mechanism: 'Prostaglandin release causes both uterine and intestinal contractions. Low estrogen increases gut permeability.', tip: 'Take it easy, warm compress helps both period and tummy cramps' },
      { phase: 'follicular', riskMultiplier: 0.9, commonSymptoms: ['Symptoms often improve', 'Better energy'], mechanism: 'Rising estrogen has anti-inflammatory effects and strengthens gut barrier.', tip: 'Good time for trying new foods or starting experiments' },
      { phase: 'ovulatory', riskMultiplier: 1.0, commonSymptoms: ['Generally stable'], mechanism: 'Peak estrogen provides maximum anti-inflammatory benefit.', tip: 'Your body is at its strongest point in the cycle' },
      { phase: 'luteal', riskMultiplier: 1.15, commonSymptoms: ['Mild bloating', 'Slight increase in symptoms'], mechanism: 'Progesterone slows gut motility, can cause bloating.', tip: 'Normal to feel slightly more bloated — gentle movement helps' },
      { phase: 'premenstrual', riskMultiplier: 1.3, commonSymptoms: ['Increased urgency', 'More tummy pain', 'Mood changes'], mechanism: 'Rapid hormone drop triggers prostaglandin release and increased gut sensitivity.', tip: 'Stick to safe foods and prioritize rest' },
    ],
  },

  commonMedications: [
    { name: 'Mesalamine', class: 'Aminosalicylate', description: 'Anti-inflammatory for mild-to-moderate disease' },
    { name: 'Budesonide', class: 'Corticosteroid', description: 'Targeted steroid for ileal/right-sided disease' },
    { name: 'Prednisone', class: 'Corticosteroid', description: 'Systemic steroid for flare management' },
    { name: 'Azathioprine', class: 'Immunomodulator', description: 'Long-term immune suppression' },
    { name: 'Methotrexate', class: 'Immunomodulator', description: 'Alternative immunomodulator' },
    { name: 'Infliximab', class: 'Anti-TNF Biologic', description: 'IV infusion biologic' },
    { name: 'Adalimumab', class: 'Anti-TNF Biologic', description: 'Self-injection biologic' },
    { name: 'Vedolizumab', class: 'Integrin Inhibitor', description: 'Gut-selective biologic' },
    { name: 'Ustekinumab', class: 'IL-12/23 Inhibitor', description: 'Biologic targeting IL-12 and IL-23' },
    { name: 'Risankizumab', class: 'IL-23 Inhibitor', description: 'Selective IL-23 blocker' },
    { name: 'Tofacitinib', class: 'JAK Inhibitor', description: 'Oral small molecule' },
  ],

  populationStats: [
    { stat: 'Average disease activity in remission', value: 'HBI 2.3 ± 1.8', source: 'OHDSI', context: 'If your score is below 5, you are doing well' },
    { stat: 'Annual flare rate on treatment', value: '30-50%', source: 'OHDSI', context: 'Flares happen even on treatment — you are not failing' },
    { stat: 'Anti-TNF response rate', value: '60-70%', source: 'OHDSI', context: 'Biologics help most patients but not all' },
    { stat: 'Sleep disruption in active disease', value: '75% of patients', source: 'NIHR', context: 'Sleep problems are very common and worth fixing' },
    { stat: 'High fiber and flare risk reduction', value: '40% lower risk', source: 'NIHR', context: 'Fiber is protective in remission (not during flares)' },
    { stat: 'Stress and flare risk', value: '2x higher within 2 months', source: 'TriNetX', context: 'Stress management is a real treatment' },
    { stat: 'Steroid-free remission rate', value: '25-35%', source: 'OHDSI', context: 'Every dose of your medication counts' },
  ],

  emergencyProtocol: {
    severityQuestions: [
      { question: 'How many times are you going to the loo per day?', options: [
        { label: 'Less than 4', severity: 'mild' }, { label: '4-6', severity: 'moderate' }, { label: '7-10', severity: 'severe' }, { label: 'More than 10', severity: 'emergency' },
      ]},
      { question: 'Is there blood when you go?', options: [
        { label: 'No', severity: 'mild' }, { label: 'A little', severity: 'moderate' }, { label: 'A lot', severity: 'severe' }, { label: 'Mostly blood', severity: 'emergency' },
      ]},
      { question: 'How is your pain?', options: [
        { label: 'Mild discomfort', severity: 'mild' }, { label: 'Moderate, manageable', severity: 'moderate' }, { label: 'Severe', severity: 'severe' }, { label: 'Unbearable/rigid tummy', severity: 'emergency' },
      ]},
      { question: 'Do you have a fever?', options: [
        { label: 'No', severity: 'mild' }, { label: 'Low grade (below 38.5C)', severity: 'moderate' }, { label: 'High (above 38.5C)', severity: 'severe' },
      ]},
    ],
    immediateActions: [
      'Switch to clear liquids (water, broth, electrolyte drinks)',
      'Take your prescribed medications — do not skip doses',
      'Rest and avoid physical exertion',
      'Apply a warm compress to your tummy if it helps',
      'Track your symptoms so you can share with your doctor',
    ],
    whenToCallDoctor: [
      'Symptoms have been worsening for more than 2-3 days',
      'You are having more than 6 loose stools per day',
      'Pain is not controlled by your usual methods',
      'You notice blood when you go',
      'You have been unable to keep food/liquids down for 24 hours',
    ],
    whenToGoER: [
      'Severe pain with a rigid, distended tummy',
      'High fever (above 39C / 102F)',
      'Significant bleeding',
      'Signs of dehydration (dizziness, no urine, racing heart)',
      'Severe vomiting preventing medication or fluids',
    ],
    whatToTellER: [
      'Your diagnosis and where it affects you (e.g., ileocolonic)',
      'Your current medications and doses',
      'When your symptoms started getting worse',
      'Recent lab results if available',
    ],
    doNotDo: [
      'Do NOT take NSAIDs (ibuprofen, naproxen) — they can worsen inflammation',
      'Do NOT stop your biologic or immunomodulator without talking to your doctor',
      'Do NOT use heating pads directly on skin',
    ],
    dietDuringFlare: [
      'Clear liquids first (broth, water, oral rehydration solution)',
      'Gradually add: white rice, plain toast, bananas, boiled potatoes',
      'Avoid: dairy, raw vegetables, high-fiber foods, spicy food, alcohol',
      'Small, frequent meals are better than large ones',
    ],
  },

  aiContext: {
    gentleLanguage: {
      'Crohn\'s disease': 'your condition',
      'IBD': 'your condition',
      'stools': 'when you go to the loo',
      'bowel': 'tummy',
      'diarrhea': 'loose motions',
      'abdominal': 'tummy',
      'intestinal': 'tummy',
      'rectal': 'back passage',
      'fistula': 'drainage',
      'colitis': 'inflammation',
    },
    avoidTerms: ['Crohn\'s disease', 'IBD', 'inflammatory bowel disease', 'stools', 'bowel movements', 'diarrhea', 'abdominal', 'intestinal perforation'],
    systemPromptContext: `The user has Crohn's disease. Key pathways: NOD2 (bacterial sensing), ATG16L1 (autophagy), IL23R (Th17), PTPN2 (tight junctions), JAK2/STAT3 (signaling). Butyric acid is the #1 remission-associated compound. Disrupted sleep decreases BMAL1/PER2 by ~33% in active disease. Emulsifiers, maltodextrin, and carrageenan damage the mucus barrier. 53% of women experience worse symptoms during menstruation.`,
    symptomTriggerPhrases: ['pain', 'cramps', 'not feeling well', 'tummy', 'tired', 'nauseous', 'blood', 'urgency', 'loo', 'toilet', 'bathroom', 'hurts', 'ache', 'fatigue'],
    followUpQuestions: ['How many times did you go to the loo today?', 'Any blood?', 'How is your energy?', 'Did you eat anything unusual?'],
  },

  experimentTemplates: [
    { title: 'Does removing dairy reduce symptoms?', hypothesis: 'Eliminating dairy will reduce disease activity', variable: 'dairy_elimination', baselineDays: 14, interventionDays: 14 },
    { title: 'Does sleeping 1 hour earlier help?', hypothesis: 'Earlier sleep reduces next-day symptoms', variable: 'sleep_timing', baselineDays: 7, interventionDays: 7 },
    { title: 'Does stress above 7/10 predict a flare?', hypothesis: 'High stress predicts symptom worsening within 48h', variable: 'stress_observation', baselineDays: 14, interventionDays: 14 },
    { title: 'Does turmeric reduce inflammation?', hypothesis: 'Daily turmeric/curcumin reduces disease activity score', variable: 'turmeric_supplementation', baselineDays: 14, interventionDays: 14 },
    { title: 'Does a low-FODMAP diet help?', hypothesis: 'Low-FODMAP reduces bloating and frequency', variable: 'low_fodmap', baselineDays: 7, interventionDays: 21 },
  ],
};
