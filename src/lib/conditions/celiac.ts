import type { ConditionProfile } from './types';

export const celiacProfile: ConditionProfile = {
  id: 'celiac',
  name: 'Celiac Disease',
  shortName: 'Celiac',
  category: 'gastrointestinal',
  description: 'An autoimmune condition where eating gluten triggers an immune response that damages the small intestine lining, impairing nutrient absorption.',
  icon: '🌾',

  scoring: {
    name: 'CSI',
    fullName: 'Celiac Symptom Index (Simplified)',
    maxScore: 50,
    components: [
      { id: 'giSymptoms', label: 'Digestive Symptoms', description: 'How is your tummy feeling? (pain, bloating, bowel changes)', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'No symptoms' }, { value: 2, label: 'Mild' }, { value: 5, label: 'Moderate' }, { value: 7, label: 'Significant' }, { value: 10, label: 'Severe' },
      ]},
      { id: 'fatigue', label: 'Fatigue', description: 'How is your energy?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'Full of energy' }, { value: 2, label: 'Slightly tired' }, { value: 5, label: 'Moderately fatigued' }, { value: 7, label: 'Very fatigued' }, { value: 10, label: 'Completely exhausted' },
      ]},
      { id: 'headaches', label: 'Headaches', description: 'Any headaches?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'None' }, { value: 2, label: 'Mild' }, { value: 5, label: 'Moderate' }, { value: 7, label: 'Significant' }, { value: 10, label: 'Severe' },
      ]},
      { id: 'skinIssues', label: 'Skin (DH)', description: 'Any skin rash or itching?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'None' }, { value: 2, label: 'Mild itching' }, { value: 5, label: 'Noticeable rash' }, { value: 7, label: 'Widespread rash' }, { value: 10, label: 'Severe rash/blistering' },
      ]},
      { id: 'mood', label: 'Mood', description: 'How is your mood?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'Positive and stable' }, { value: 2, label: 'Slightly low' }, { value: 5, label: 'Noticeably low' }, { value: 7, label: 'Quite low or anxious' }, { value: 10, label: 'Very depressed or anxious' },
      ]},
    ],
    severityLevels: [
      { id: 'well_managed', label: 'Well Managed', range: [0, 8], color: 'text-sage-dark', bgColor: 'bg-sage-light' },
      { id: 'mild', label: 'Mild Symptoms', range: [9, 18], color: 'text-risk-watch', bgColor: 'bg-yellow-100' },
      { id: 'moderate', label: 'Moderate Symptoms', range: [19, 32], color: 'text-coral', bgColor: 'bg-coral/20' },
      { id: 'severe', label: 'Significant Symptoms', range: [33, 50], color: 'text-rose-dark', bgColor: 'bg-rose/20' },
    ],
  },

  symptoms: {
    coreSymptoms: [
      { id: 'bloating', label: 'Bloating', gentleLabel: 'How bloated is your tummy?', type: 'scale', min: 0, max: 10 },
      { id: 'diarrhea', label: 'Loose Stools', gentleLabel: 'How are your bowel movements?', type: 'select', options: [
        { value: 'normal', label: 'Normal' }, { value: 'soft', label: 'Soft' }, { value: 'loose', label: 'Loose/watery' }, { value: 'constipated', label: 'Constipated' },
      ]},
      { id: 'abdominalPain', label: 'Tummy Pain', gentleLabel: 'Any pain in your tummy?', type: 'scale', min: 0, max: 10 },
      { id: 'fatigue', label: 'Fatigue', gentleLabel: 'How tired are you?', type: 'scale', min: 0, max: 10 },
      { id: 'brainFog', label: 'Brain Fog', gentleLabel: 'How clear is your thinking?', type: 'scale', min: 0, max: 10 },
      { id: 'skinRash', label: 'Skin Rash (DH)', gentleLabel: 'Any itchy skin rash?', type: 'select', options: [
        { value: 'none', label: 'None' }, { value: 'mild', label: 'Mild itch' }, { value: 'moderate', label: 'Visible rash' }, { value: 'severe', label: 'Blistering rash' },
      ]},
    ],
    complications: [
      { id: 'anemia', label: 'Anemia Symptoms', gentleLabel: 'Feeling pale, weak, or short of breath' },
      { id: 'bone_pain', label: 'Bone Pain', gentleLabel: 'Bone aches or pains' },
      { id: 'mouth_ulcers', label: 'Mouth Ulcers', gentleLabel: 'Sores in your mouth' },
      { id: 'neuropathy', label: 'Neuropathy', gentleLabel: 'Tingling or numbness in hands/feet' },
      { id: 'weight_loss', label: 'Weight Loss', gentleLabel: 'Unexplained weight loss' },
    ],
    customFields: [
      { id: 'glutenExposure', label: 'Possible Gluten Exposure', type: 'boolean', defaultValue: false },
      { id: 'ateOut', label: 'Ate Outside Home', type: 'boolean', defaultValue: false },
      { id: 'stoolCount', label: 'Bowel Movements Today', type: 'number', defaultValue: 1 },
    ],
  },

  flareWeights: {
    symptomTrend: 20,
    circadianDisruption: 10,
    dietaryRisk: 35,
    menstrualPhase: 10,
    stressMood: 10,
    medicationAdherence: 5,
    mealTiming: 10,
    customFactors: [
      { id: 'glutenExposure', label: 'Gluten exposure (known or suspected)', weight: 40 },
      { id: 'eatingOut', label: 'Eating outside the home', weight: 10 },
    ],
  },

  dietaryProfile: {
    riskFactors: [
      { name: 'Gluten (Wheat)', mechanism: 'THE primary trigger — gliadin peptides activate the immune response and damage intestinal villi', severity: 'high', foods: ['bread', 'pasta', 'flour tortillas', 'couscous', 'wheat-based cereal', 'many sauces and soups'] },
      { name: 'Gluten (Barley)', mechanism: 'Contains hordein, a gluten protein that triggers the same immune response as wheat', severity: 'high', foods: ['barley', 'malt', 'malt vinegar', 'beer', 'barley-based soups'] },
      { name: 'Gluten (Rye)', mechanism: 'Contains secalin, another gluten protein that activates celiac immune response', severity: 'high', foods: ['rye bread', 'rye crackers', 'some whiskeys'] },
      { name: 'Cross-Contamination', mechanism: 'Even trace amounts of gluten (>20 ppm) can trigger immune response and intestinal damage', severity: 'high', foods: ['shared cooking surfaces', 'shared fryers', 'bulk bins', 'toasters used for wheat bread'] },
      { name: 'Oats (for some)', mechanism: 'Pure oats are usually safe, but contamination is common and ~5% of celiac patients react to avenin', severity: 'moderate', foods: ['non-certified oats', 'granola', 'oat-based products without GF certification'] },
    ],
    protectiveFactors: [
      { name: 'Naturally Gluten-Free Grains', mechanism: 'Safe carbohydrate sources that do not trigger immune response', severity: 'high', foods: ['rice', 'quinoa', 'millet', 'buckwheat', 'amaranth', 'corn'] },
      { name: 'Fresh Fruits and Vegetables', mechanism: 'Naturally GF, rich in vitamins and minerals that may be depleted', severity: 'high', foods: ['all fresh fruits', 'all fresh vegetables', 'potatoes', 'sweet potatoes'] },
      { name: 'Iron-Rich Foods', mechanism: 'Helps correct iron-deficiency anemia, which is very common in celiac', severity: 'high', foods: ['red meat', 'lentils', 'spinach', 'fortified GF cereals'] },
      { name: 'Calcium and Vitamin D', mechanism: 'Supports bone health — celiac patients are at increased risk of osteoporosis', severity: 'high', foods: ['dairy (if tolerated)', 'fortified plant milks', 'sardines', 'leafy greens'] },
      { name: 'Probiotics', mechanism: 'Supports gut healing and microbiome recovery after gluten damage', severity: 'moderate', foods: ['yogurt', 'kefir', 'sauerkraut', 'kimchi'] },
    ],
    guidelines: [
      'A strict gluten-free diet is your primary treatment — there is no safe amount of gluten',
      'Always check labels for hidden gluten (soy sauce, salad dressings, processed foods)',
      'When eating out, communicate clearly about your needs — cross-contamination matters',
      'Focus on naturally GF whole foods rather than processed GF substitutes',
      'Supplement iron, B12, vitamin D, and calcium as guided by your blood tests',
    ],
    nutrientWarnings: [
      { nutrientName: 'Iron, Fe', threshold: 8, unit: 'mg', direction: 'below', warning: 'Low iron is very common in celiac — your gut may not absorb it well yet', riskIncrease: 10 },
      { nutrientName: 'Calcium, Ca', threshold: 800, unit: 'mg', direction: 'below', warning: 'Low calcium increases your osteoporosis risk', riskIncrease: 8 },
      { nutrientName: 'Vitamin D (D2 + D3)', threshold: 15, unit: 'mcg', direction: 'below', warning: 'Vitamin D is often low in celiac and important for bone health', riskIncrease: 8 },
      { nutrientName: 'Vitamin B-12', threshold: 2, unit: 'mcg', direction: 'below', warning: 'B12 deficiency can cause fatigue and neurological symptoms', riskIncrease: 10 },
    ],
  },

  cycleImpact: {
    hasImpact: true,
    prevalencePercent: 35,
    phases: [
      { phase: 'menstrual', riskMultiplier: 1.3, commonSymptoms: ['Worse bloating', 'More tummy pain', 'Heavier periods (if iron-deficient)'], mechanism: 'Prostaglandins increase GI motility and sensitivity. Iron loss from menstruation compounds celiac-related anemia.', tip: 'Be extra careful about what you eat during your period and keep up with iron-rich foods' },
      { phase: 'follicular', riskMultiplier: 0.9, commonSymptoms: ['GI symptoms often improve', 'Better energy'], mechanism: 'Rising estrogen has anti-inflammatory effects on the gut lining.', tip: 'A good time to try new GF recipes or explore new restaurants' },
      { phase: 'ovulatory', riskMultiplier: 0.9, commonSymptoms: ['Generally stable', 'Best digestion'], mechanism: 'Peak estrogen supports gut barrier function.', tip: 'Your digestion is at its strongest point in the cycle' },
      { phase: 'luteal', riskMultiplier: 1.1, commonSymptoms: ['Mild bloating returns', 'Slightly more sensitive to foods'], mechanism: 'Progesterone slows gut motility and may increase bloating.', tip: 'Stick to familiar safe foods and eat smaller meals' },
      { phase: 'premenstrual', riskMultiplier: 1.2, commonSymptoms: ['Increased bloating', 'More GI sensitivity', 'Cravings may lead to risky food choices'], mechanism: 'Hormonal changes increase gut sensitivity and food cravings.', tip: 'Have safe GF snacks ready for cravings — planning ahead prevents accidental exposure' },
    ],
  },

  commonMedications: [
    { name: 'Strict Gluten-Free Diet', class: 'Primary Treatment', description: 'The only proven treatment — lifelong complete avoidance of gluten' },
    { name: 'Iron Supplement', class: 'Supplement', description: 'To correct iron-deficiency anemia' },
    { name: 'Vitamin B12', class: 'Supplement', description: 'For B12 deficiency from malabsorption' },
    { name: 'Vitamin D', class: 'Supplement', description: 'For bone health and immune function' },
    { name: 'Calcium', class: 'Supplement', description: 'For bone health and osteoporosis prevention' },
    { name: 'Folic Acid', class: 'Supplement', description: 'Often depleted due to malabsorption' },
    { name: 'Dapsone', class: 'Antibiotic', description: 'For dermatitis herpetiformis (celiac skin rash)' },
  ],

  populationStats: [
    { stat: 'Prevalence', value: '~1% of population', source: 'CDF', context: 'Celiac is common, but ~80% of people with it remain undiagnosed' },
    { stat: 'Time to diagnosis', value: 'Average 6-10 years', source: 'CDF', context: 'A long journey to diagnosis is very common — you are not alone' },
    { stat: 'GF diet adherence and healing', value: '70-80% achieve mucosal healing', source: 'AGA', context: 'Your gut can heal on a strict GF diet — it takes time but it works' },
    { stat: 'Accidental gluten exposure', value: '30-50% per year on GF diet', source: 'JAMA', context: 'Accidental exposure happens to most people — forgive yourself and move forward' },
    { stat: 'Anemia prevalence', value: '30-50% at diagnosis', source: 'AGA', context: 'Iron levels often improve significantly on a GF diet' },
    { stat: 'Other autoimmune co-occurrence', value: '15-25%', source: 'CDF', context: 'Mention any new symptoms to your doctor' },
  ],

  emergencyProtocol: {
    severityQuestions: [
      { question: 'Did you accidentally eat gluten?', options: [
        { label: 'No, symptoms are mild', severity: 'mild' }, { label: 'Possibly, not sure', severity: 'moderate' }, { label: 'Yes, a significant amount', severity: 'severe' }, { label: 'Yes, and having severe reaction', severity: 'emergency' },
      ]},
      { question: 'How severe are your GI symptoms?', options: [
        { label: 'Mild discomfort', severity: 'mild' }, { label: 'Moderate pain and bloating', severity: 'moderate' }, { label: 'Severe pain, vomiting, or diarrhea', severity: 'severe' }, { label: 'Cannot keep anything down, dehydrated', severity: 'emergency' },
      ]},
      { question: 'How is your skin rash (if you have DH)?', options: [
        { label: 'None or minimal', severity: 'mild' }, { label: 'Mild itch', severity: 'moderate' }, { label: 'Widespread, very itchy', severity: 'severe' }, { label: 'Blistering and painful', severity: 'emergency' },
      ]},
      { question: 'Any signs of severe malabsorption?', options: [
        { label: 'No', severity: 'mild' }, { label: 'Some fatigue', severity: 'moderate' }, { label: 'Significant weight loss or weakness', severity: 'severe' }, { label: 'Extreme weakness, fainting, numbness', severity: 'emergency' },
      ]},
    ],
    immediateActions: [
      'If you ate gluten — it is done, do not panic. Your body will process it',
      'Drink plenty of water and clear fluids',
      'Eat simple, safe foods: rice, bananas, plain chicken, GF crackers',
      'Rest and be gentle with your tummy',
      'Note what you ate so you can avoid it in the future',
    ],
    whenToCallDoctor: [
      'Symptoms are not resolving after a few days of strict GF eating',
      'You are having persistent GI symptoms despite a strict GF diet',
      'You suspect a nutrient deficiency (extreme fatigue, hair loss, bruising)',
      'Your skin rash is worsening or not responding to GF diet',
      'You are losing weight unintentionally',
    ],
    whenToGoER: [
      'Severe dehydration from vomiting or diarrhea (dizziness, no urine, rapid heart)',
      'Severe abdominal pain that is getting worse',
      'Signs of severe anemia (extreme pallor, shortness of breath, chest pain)',
      'Severe allergic-type reaction to food (note: this is different from celiac — could be wheat allergy)',
      'Fainting or confusion',
    ],
    whatToTellER: [
      'That you have celiac disease',
      'Whether you had a known gluten exposure and when',
      'Your current supplements and any medications',
      'Your most recent blood work results if available',
    ],
    doNotDo: [
      'Do NOT deliberately eat gluten to "test" yourself — the damage is real even if you feel okay',
      'Do NOT assume "a little bit" is fine — trace amounts matter in celiac',
      'Do NOT rely on symptoms to know if you are getting gluten — silent damage can occur',
      'Do NOT stop your GF diet because you feel better — you feel better BECAUSE of the diet',
    ],
    dietDuringFlare: [
      'Strict GF — double-check everything you are eating',
      'Simple, easy-to-digest foods: rice, bananas, boiled potatoes, plain chicken',
      'Stay very well-hydrated: water, GF broth, herbal tea',
      'Avoid dairy temporarily if you suspect secondary lactose intolerance',
      'Small, frequent meals are easier on your system than large ones',
    ],
  },

  aiContext: {
    gentleLanguage: {
      'celiac disease': 'your condition',
      'villous atrophy': 'gut healing changes',
      'malabsorption': 'difficulty absorbing nutrients',
      'dermatitis herpetiformis': 'the celiac skin rash',
      'gluten exposure': 'getting glutened',
      'intestinal damage': 'tummy changes',
      'autoimmune enteropathy': 'your condition',
    },
    avoidTerms: ['villous atrophy', 'intestinal destruction', 'malabsorption syndrome', 'disease', 'damaged intestine', 'autoimmune enteropathy'],
    systemPromptContext: `The user has celiac disease. The ONLY treatment is a strict gluten-free diet — this is not a preference, it is a medical necessity. Even trace amounts of gluten (>20 ppm) trigger immune-mediated intestinal damage. Common deficiencies: iron, B12, vitamin D, calcium, folate. ~30-50% of patients experience accidental exposure yearly. Dermatitis herpetiformis is the skin manifestation. Cross-contamination is a major practical challenge. The user may experience grief, frustration, or social anxiety around food — be empathetic and practical.`,
    symptomTriggerPhrases: ['bloated', 'tummy', 'diarrhea', 'constipated', 'glutened', 'ate gluten', 'stomach', 'rash', 'itchy', 'tired', 'brain fog', 'headache', 'nauseous', 'ate out'],
    followUpQuestions: ['Do you think you might have eaten something with gluten?', 'How is your tummy feeling?', 'Did you eat anywhere new recently?', 'How is your energy?'],
  },

  experimentTemplates: [
    { title: 'Does removing dairy improve residual symptoms?', hypothesis: 'Eliminating dairy reduces bloating and GI symptoms on top of GF diet', variable: 'dairy_elimination', baselineDays: 14, interventionDays: 21 },
    { title: 'Do certified GF oats work for me?', hypothesis: 'Certified GF oats can be safely added without triggering symptoms', variable: 'gf_oats_trial', baselineDays: 14, interventionDays: 14 },
    { title: 'Does probiotic supplementation help?', hypothesis: 'Daily probiotics reduce residual GI symptoms and improve digestion', variable: 'probiotic_supplementation', baselineDays: 14, interventionDays: 28 },
    { title: 'Does meal planning reduce accidental exposure?', hypothesis: 'Weekly meal planning reduces symptom flare-ups from hidden gluten', variable: 'meal_planning', baselineDays: 14, interventionDays: 28 },
    { title: 'Does digestive enzyme supplement help with cross-contamination?', hypothesis: 'GF-specific enzyme supplement reduces symptoms from minor exposure', variable: 'enzyme_supplement', baselineDays: 14, interventionDays: 21 },
  ],
};
