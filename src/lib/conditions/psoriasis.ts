import type { ConditionProfile } from './types';

export const psoriasisProfile: ConditionProfile = {
  id: 'psoriasis',
  name: 'Psoriasis / Psoriatic Arthritis',
  shortName: 'Psoriasis',
  category: 'dermatological',
  description: 'An immune-mediated skin condition causing rapid skin cell buildup, often with joint involvement (psoriatic arthritis) in up to 30% of patients.',
  icon: '🧴',

  scoring: {
    name: 'sPASI',
    fullName: 'Simplified Psoriasis Area and Severity Index',
    maxScore: 72,
    components: [
      { id: 'headScaling', label: 'Head Scaling', description: 'How much scaling on your head and face?', type: 'scale', min: 0, max: 4, options: [
        { value: 0, label: 'None' }, { value: 1, label: 'Slight' }, { value: 2, label: 'Moderate' }, { value: 3, label: 'Marked' }, { value: 4, label: 'Very marked' },
      ]},
      { id: 'headRedness', label: 'Head Redness', description: 'How red are the patches on your head?', type: 'scale', min: 0, max: 4, options: [
        { value: 0, label: 'None' }, { value: 1, label: 'Slight pink' }, { value: 2, label: 'Pink-red' }, { value: 3, label: 'Red' }, { value: 4, label: 'Very red' },
      ]},
      { id: 'headThickness', label: 'Head Thickness', description: 'How thick are the patches on your head?', type: 'scale', min: 0, max: 4, options: [
        { value: 0, label: 'None' }, { value: 1, label: 'Barely raised' }, { value: 2, label: 'Slightly raised' }, { value: 3, label: 'Raised' }, { value: 4, label: 'Very thick' },
      ]},
      { id: 'headArea', label: 'Head Area Affected', description: 'How much of your head/face is affected?', type: 'scale', min: 0, max: 6, options: [
        { value: 0, label: 'None' }, { value: 1, label: '<10%' }, { value: 2, label: '10-30%' }, { value: 3, label: '30-50%' }, { value: 4, label: '50-70%' }, { value: 5, label: '70-90%' }, { value: 6, label: '90-100%' },
      ]},
      { id: 'trunkArea', label: 'Trunk Area Affected', description: 'How much of your trunk is affected?', type: 'scale', min: 0, max: 6, options: [
        { value: 0, label: 'None' }, { value: 1, label: '<10%' }, { value: 2, label: '10-30%' }, { value: 3, label: '30-50%' }, { value: 4, label: '50-70%' }, { value: 5, label: '70-90%' }, { value: 6, label: '90-100%' },
      ]},
      { id: 'armsArea', label: 'Arms Area Affected', description: 'How much of your arms are affected?', type: 'scale', min: 0, max: 6, options: [
        { value: 0, label: 'None' }, { value: 1, label: '<10%' }, { value: 2, label: '10-30%' }, { value: 3, label: '30-50%' }, { value: 4, label: '50-70%' }, { value: 5, label: '70-90%' }, { value: 6, label: '90-100%' },
      ]},
      { id: 'legsArea', label: 'Legs Area Affected', description: 'How much of your legs are affected?', type: 'scale', min: 0, max: 6, options: [
        { value: 0, label: 'None' }, { value: 1, label: '<10%' }, { value: 2, label: '10-30%' }, { value: 3, label: '30-50%' }, { value: 4, label: '50-70%' }, { value: 5, label: '70-90%' }, { value: 6, label: '90-100%' },
      ]},
      { id: 'jointPain', label: 'Joint Pain (PsA)', description: 'How much joint pain do you have today?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'None' }, { value: 2, label: 'Mild' }, { value: 5, label: 'Moderate' }, { value: 7, label: 'Significant' }, { value: 10, label: 'Severe' },
      ]},
    ],
    severityLevels: [
      { id: 'mild', label: 'Mild', range: [0, 4], color: 'text-sage-dark', bgColor: 'bg-sage-light' },
      { id: 'moderate', label: 'Moderate', range: [5, 10], color: 'text-risk-watch', bgColor: 'bg-yellow-100' },
      { id: 'severe', label: 'Severe', range: [11, 30], color: 'text-coral', bgColor: 'bg-coral/20' },
      { id: 'very_severe', label: 'Very Severe', range: [31, 72], color: 'text-rose-dark', bgColor: 'bg-rose/20' },
    ],
  },

  symptoms: {
    coreSymptoms: [
      { id: 'plaques', label: 'Plaques/Patches', gentleLabel: 'How are your skin patches today?', type: 'scale', min: 0, max: 10 },
      { id: 'itching', label: 'Itching', gentleLabel: 'How itchy is your skin?', type: 'scale', min: 0, max: 10 },
      { id: 'scaling', label: 'Scaling', gentleLabel: 'How much scaling or flaking?', type: 'scale', min: 0, max: 10 },
      { id: 'nailChanges', label: 'Nail Changes', gentleLabel: 'Any changes to your nails?', type: 'select', options: [
        { value: 'none', label: 'None' }, { value: 'mild', label: 'A little' }, { value: 'moderate', label: 'Noticeable' }, { value: 'severe', label: 'Significant' },
      ]},
      { id: 'jointPain', label: 'Joint Pain', gentleLabel: 'Any joint pain or stiffness?', type: 'scale', min: 0, max: 10 },
      { id: 'fatigue', label: 'Fatigue', gentleLabel: 'How tired are you?', type: 'scale', min: 0, max: 10 },
    ],
    complications: [
      { id: 'nail_pitting', label: 'Nail Pitting', gentleLabel: 'Small dents in your nails' },
      { id: 'dactylitis', label: 'Dactylitis', gentleLabel: 'Swollen "sausage" fingers or toes' },
      { id: 'enthesitis', label: 'Enthesitis', gentleLabel: 'Pain where tendons meet bone' },
      { id: 'eye_inflammation', label: 'Eye Inflammation', gentleLabel: 'Eye redness or irritation' },
      { id: 'skin_cracking', label: 'Skin Cracking', gentleLabel: 'Cracking or bleeding patches' },
    ],
    customFields: [
      { id: 'bodyAreaCoverage', label: 'Body Area Coverage %', type: 'number', defaultValue: 0 },
      { id: 'newPatches', label: 'New Patches', type: 'boolean', defaultValue: false },
      { id: 'sunExposure', label: 'Sun Exposure (minutes)', type: 'number', defaultValue: 0 },
    ],
  },

  flareWeights: {
    symptomTrend: 25,
    circadianDisruption: 10,
    dietaryRisk: 15,
    menstrualPhase: 10,
    stressMood: 25,
    medicationAdherence: 10,
    mealTiming: 5,
    customFactors: [
      { id: 'skinDryness', label: 'Skin dryness / low humidity', weight: 10 },
      { id: 'alcoholUse', label: 'Alcohol consumption', weight: 15 },
    ],
  },

  dietaryProfile: {
    riskFactors: [
      { name: 'Alcohol', mechanism: 'Major psoriasis trigger — increases TNF-alpha, disrupts gut barrier, and worsens skin inflammation', severity: 'high', foods: ['beer', 'wine', 'spirits', 'cocktails'] },
      { name: 'Gluten', mechanism: 'Some psoriasis patients have anti-gliadin antibodies; gluten may worsen skin inflammation', severity: 'moderate', foods: ['bread', 'pasta', 'wheat flour', 'barley', 'rye'] },
      { name: 'Nightshades', mechanism: 'Solanine may trigger inflammation in some patients — individual sensitivity varies', severity: 'low', foods: ['tomatoes', 'peppers', 'potatoes', 'eggplant'] },
      { name: 'Excess Sugar', mechanism: 'Promotes systemic inflammation and worsens metabolic comorbidities', severity: 'moderate', foods: ['soft drinks', 'sweets', 'pastries', 'packaged juices'] },
      { name: 'Processed/Red Meat', mechanism: 'Arachidonic acid promotes pro-inflammatory eicosanoids', severity: 'moderate', foods: ['red meat', 'processed meats', 'sausages'] },
    ],
    protectiveFactors: [
      { name: 'Omega-3 Fatty Acids', mechanism: 'Anti-inflammatory, reduces TNF-alpha and IL-6, supports skin barrier', severity: 'high', foods: ['salmon', 'mackerel', 'sardines', 'flaxseed', 'walnuts'] },
      { name: 'Vitamin D', mechanism: 'Immune modulator, slows keratinocyte proliferation — many psoriasis patients are deficient', severity: 'high', foods: ['fatty fish', 'egg yolks', 'fortified milk', 'sunlight exposure'] },
      { name: 'Curcumin', mechanism: 'Inhibits NF-kB and TNF-alpha, reduces scaling and redness', severity: 'moderate', foods: ['turmeric', 'golden milk', 'curry'] },
      { name: 'Mediterranean Diet', mechanism: 'Rich in anti-inflammatory compounds, associated with lower psoriasis severity', severity: 'high', foods: ['olive oil', 'fish', 'vegetables', 'fruits', 'nuts'] },
      { name: 'Antioxidants', mechanism: 'Reduce oxidative stress in skin cells', severity: 'moderate', foods: ['berries', 'leafy greens', 'green tea', 'colorful vegetables'] },
    ],
    guidelines: [
      'Focus on an anti-inflammatory diet rich in omega-3 and colorful vegetables',
      'Consider limiting or avoiding alcohol, as it is one of the strongest dietary triggers',
      'Try an elimination approach with nightshades to see if they affect you personally',
      'Maintain a healthy weight — excess weight worsens psoriasis severity',
      'Stay well-hydrated to support skin health',
    ],
    nutrientWarnings: [
      { nutrientName: 'Alcohol, ethyl', threshold: 0, unit: 'g', direction: 'above', warning: 'Alcohol is a major psoriasis trigger and can worsen flares', riskIncrease: 20 },
      { nutrientName: 'Sugars, total', threshold: 25, unit: 'g', direction: 'above', warning: 'Excess sugar may increase inflammation', riskIncrease: 8 },
      { nutrientName: 'Vitamin D (D2 + D3)', threshold: 15, unit: 'mcg', direction: 'below', warning: 'Low vitamin D is linked to worse psoriasis — consider supplementing', riskIncrease: 10 },
    ],
  },

  cycleImpact: {
    hasImpact: true,
    prevalencePercent: 40,
    phases: [
      { phase: 'menstrual', riskMultiplier: 1.2, commonSymptoms: ['Increased itching', 'More visible patches', 'Joint stiffness'], mechanism: 'Low estrogen reduces its protective anti-inflammatory effect on skin.', tip: 'Keep up with moisturizing and be extra gentle with your skin' },
      { phase: 'follicular', riskMultiplier: 0.85, commonSymptoms: ['Skin often improves', 'Less itching', 'Better energy'], mechanism: 'Rising estrogen has anti-inflammatory effects and supports skin healing.', tip: 'A good time to introduce new skincare routines or try gentle sun exposure' },
      { phase: 'ovulatory', riskMultiplier: 0.8, commonSymptoms: ['Skin at its calmest', 'Reduced redness'], mechanism: 'Peak estrogen provides maximum anti-inflammatory benefit for skin.', tip: 'Your skin may look and feel its best around this time' },
      { phase: 'luteal', riskMultiplier: 1.1, commonSymptoms: ['Gradual increase in itching', 'Mild flare activity'], mechanism: 'Progesterone shifts immune balance, may slightly increase skin inflammation.', tip: 'Stay consistent with your topical treatments' },
      { phase: 'premenstrual', riskMultiplier: 1.25, commonSymptoms: ['Increased itching', 'Patches may worsen', 'Mood changes affecting coping'], mechanism: 'Rapid hormone drop can trigger immune activation and worsen skin inflammation.', tip: 'Prioritize stress management and gentle skincare — this phase passes' },
    ],
  },

  commonMedications: [
    { name: 'Topical Corticosteroids', class: 'Topical', description: 'First-line treatment to reduce inflammation and itching' },
    { name: 'Calcipotriol', class: 'Vitamin D Analog', description: 'Slows skin cell growth and reduces scaling' },
    { name: 'Tazarotene', class: 'Topical Retinoid', description: 'Normalizes skin cell growth' },
    { name: 'Methotrexate', class: 'Immunomodulator', description: 'Systemic treatment for moderate-to-severe psoriasis' },
    { name: 'Cyclosporine', class: 'Immunosuppressant', description: 'Fast-acting systemic for severe flares' },
    { name: 'Apremilast', class: 'PDE4 Inhibitor', description: 'Oral treatment targeting inflammation pathways' },
    { name: 'Secukinumab', class: 'IL-17A Inhibitor', description: 'Biologic targeting a key psoriasis pathway' },
    { name: 'Ixekizumab', class: 'IL-17A Inhibitor', description: 'Biologic for moderate-to-severe psoriasis' },
    { name: 'Guselkumab', class: 'IL-23 Inhibitor', description: 'Biologic with long-lasting effect' },
    { name: 'Adalimumab', class: 'Anti-TNF Biologic', description: 'Biologic for psoriasis and psoriatic arthritis' },
    { name: 'Ustekinumab', class: 'IL-12/23 Inhibitor', description: 'Biologic targeting both IL-12 and IL-23' },
  ],

  populationStats: [
    { stat: 'Prevalence', value: '2-3% of population', source: 'WHO', context: 'You are not alone — psoriasis is one of the most common autoimmune conditions' },
    { stat: 'Psoriatic arthritis co-occurrence', value: 'Up to 30%', source: 'NPF', context: 'Joint symptoms are worth mentioning to your doctor' },
    { stat: 'Stress as a trigger', value: 'Reported by ~70% of patients', source: 'BJD', context: 'Stress management is a real part of treatment' },
    { stat: 'Biologic response rate', value: '75-90% achieve PASI 75', source: 'AAD', context: 'Modern biologics work very well for most people' },
    { stat: 'Vitamin D deficiency', value: 'Common in 50-80% of patients', source: 'JAAD', context: 'Getting your vitamin D levels checked is worth doing' },
    { stat: 'Alcohol and psoriasis risk', value: '1.5-2x increased risk', source: 'JAMA Derm', context: 'Reducing alcohol can make a real difference' },
  ],

  emergencyProtocol: {
    severityQuestions: [
      { question: 'How much of your skin is affected?', options: [
        { label: 'Small patches', severity: 'mild' }, { label: 'Several areas', severity: 'moderate' }, { label: 'Large areas', severity: 'severe' }, { label: 'Most of my body', severity: 'emergency' },
      ]},
      { question: 'Is your skin bright red all over?', options: [
        { label: 'No, just patches', severity: 'mild' }, { label: 'Some redness spreading', severity: 'moderate' }, { label: 'Large red areas', severity: 'severe' }, { label: 'Yes, full body redness', severity: 'emergency' },
      ]},
      { question: 'Do you have pustules (small blisters) forming?', options: [
        { label: 'No', severity: 'mild' }, { label: 'A few', severity: 'moderate' }, { label: 'Many', severity: 'severe' }, { label: 'Widespread pustules', severity: 'emergency' },
      ]},
      { question: 'Do you have a fever or feel unwell?', options: [
        { label: 'No', severity: 'mild' }, { label: 'Slightly unwell', severity: 'moderate' }, { label: 'Fever and feeling unwell', severity: 'severe' }, { label: 'High fever with skin changes', severity: 'emergency' },
      ]},
    ],
    immediateActions: [
      'Gently moisturize affected areas with fragrance-free emollient',
      'Take your prescribed medications — do not skip doses',
      'Avoid scratching, even though it is tempting — gentle cool compresses help',
      'Wear soft, breathable fabrics against your skin',
      'Track what might have triggered this flare',
    ],
    whenToCallDoctor: [
      'Your patches are spreading significantly',
      'Current treatments are not controlling your symptoms',
      'You notice new joint pain or swelling',
      'Your nails are changing noticeably',
      'You are feeling very low emotionally because of your skin',
    ],
    whenToGoER: [
      'Your skin is bright red all over (erythrodermic psoriasis) — this is a medical emergency',
      'Widespread pustules forming rapidly (pustular psoriasis flare)',
      'High fever with skin changes',
      'Signs of skin infection (increasing warmth, oozing, spreading redness)',
      'Severe joint swelling with inability to move',
    ],
    whatToTellER: [
      'That you have psoriasis and/or psoriatic arthritis',
      'Your current medications and doses',
      'When the change in your skin started',
      'Any recent medication changes or infections',
    ],
    doNotDo: [
      'Do NOT scratch or pick at your skin — it can trigger new patches (Koebner phenomenon)',
      'Do NOT stop your biologic or systemic medication without talking to your doctor',
      'Do NOT use very hot water on affected areas',
      'Do NOT apply topical steroids to broken/infected skin without guidance',
    ],
    dietDuringFlare: [
      'Avoid alcohol completely during a flare',
      'Focus on omega-3-rich foods: salmon, sardines, walnuts, flaxseed',
      'Eat plenty of colorful fruits and vegetables for antioxidants',
      'Stay well-hydrated — skin health starts from within',
      'Consider temporarily avoiding nightshades if you suspect they affect you',
    ],
  },

  aiContext: {
    gentleLanguage: {
      'psoriasis': 'your skin condition',
      'psoriatic arthritis': 'your joint symptoms',
      'plaques': 'patches',
      'lesions': 'affected areas',
      'erythrodermic': 'widespread redness',
      'pustular': 'blistering',
      'scaling': 'flaking',
      'pruritus': 'itching',
    },
    avoidTerms: ['lesions', 'disease', 'plaques', 'erythrodermic', 'pustular', 'pruritus', 'dermatosis'],
    systemPromptContext: `The user has psoriasis, possibly with psoriatic arthritis. Key pathways: IL-17/IL-23 axis (primary), TNF-alpha, Th17 cells, keratinocyte hyperproliferation. Alcohol is the #1 modifiable trigger. Stress triggers flares in ~70% of patients. Vitamin D (both oral and topical analogs) is important. ~40% of women report cycle-related skin changes. Estrogen is generally protective for skin. The Koebner phenomenon means skin trauma can trigger new patches.`,
    symptomTriggerPhrases: ['itchy', 'patches', 'flaking', 'red', 'scaling', 'skin', 'joint', 'nails', 'stiff', 'swollen', 'sore', 'irritated', 'burning'],
    followUpQuestions: ['How is the itching today?', 'Are your patches spreading or staying the same?', 'Any joint stiffness?', 'Have you been under extra stress lately?'],
  },

  experimentTemplates: [
    { title: 'Does avoiding alcohol improve my skin?', hypothesis: 'Eliminating alcohol will reduce patch severity within 4 weeks', variable: 'alcohol_elimination', baselineDays: 14, interventionDays: 28 },
    { title: 'Does daily omega-3 help?', hypothesis: 'Omega-3 supplementation reduces scaling and redness', variable: 'omega3_supplementation', baselineDays: 14, interventionDays: 28 },
    { title: 'Do nightshades affect my psoriasis?', hypothesis: 'Removing nightshades reduces skin inflammation', variable: 'nightshade_elimination', baselineDays: 14, interventionDays: 21 },
    { title: 'Does stress management reduce flares?', hypothesis: 'Daily meditation or relaxation reduces flare frequency', variable: 'stress_management', baselineDays: 14, interventionDays: 21 },
    { title: 'Does moderate sun exposure help?', hypothesis: '15-20 minutes of sun exposure improves skin symptoms', variable: 'sun_exposure', baselineDays: 7, interventionDays: 14 },
  ],
};
