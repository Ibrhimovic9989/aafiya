import type { ConditionProfile } from './types';

export const hashimotosProfile: ConditionProfile = {
  id: 'hashimotos',
  name: "Hashimoto's Thyroiditis",
  shortName: "Hashimoto's",
  category: 'endocrine',
  description: 'An autoimmune condition where the immune system gradually attacks the thyroid gland, leading to underactive thyroid (hypothyroidism) over time.',
  icon: '🦋',

  scoring: {
    name: 'HSI',
    fullName: 'Hashimoto\'s Symptom Index',
    maxScore: 55,
    components: [
      { id: 'fatigue', label: 'Fatigue', description: 'How tired are you feeling?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'Full of energy' }, { value: 2, label: 'Slightly tired' }, { value: 5, label: 'Moderately fatigued' }, { value: 7, label: 'Very fatigued' }, { value: 10, label: 'Completely exhausted' },
      ]},
      { id: 'weightChanges', label: 'Weight Changes', description: 'Are you noticing unexplained weight changes?', type: 'scale', min: 0, max: 5, options: [
        { value: 0, label: 'Stable' }, { value: 1, label: 'Slight change' }, { value: 3, label: 'Noticeable change' }, { value: 5, label: 'Significant change' },
      ]},
      { id: 'coldSensitivity', label: 'Cold Sensitivity', description: 'How sensitive are you to cold?', type: 'scale', min: 0, max: 5, options: [
        { value: 0, label: 'Normal' }, { value: 1, label: 'Slightly chilly' }, { value: 3, label: 'Often cold' }, { value: 5, label: 'Always freezing' },
      ]},
      { id: 'brainFog', label: 'Brain Fog', description: 'How clear is your thinking?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'Sharp and clear' }, { value: 2, label: 'Slightly foggy' }, { value: 5, label: 'Noticeably foggy' }, { value: 7, label: 'Very foggy' }, { value: 10, label: 'Cannot think clearly at all' },
      ]},
      { id: 'hairLoss', label: 'Hair Changes', description: 'Any hair thinning or loss?', type: 'scale', min: 0, max: 5, options: [
        { value: 0, label: 'None' }, { value: 1, label: 'Slightly more shedding' }, { value: 3, label: 'Noticeable thinning' }, { value: 5, label: 'Significant loss' },
      ]},
      { id: 'mood', label: 'Mood', description: 'How is your mood overall?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'Positive and stable' }, { value: 2, label: 'Slightly low' }, { value: 5, label: 'Noticeably low or flat' }, { value: 7, label: 'Quite low' }, { value: 10, label: 'Very depressed or anxious' },
      ]},
      { id: 'muscleJointAches', label: 'Muscle/Joint Aches', description: 'Any aches in your muscles or joints?', type: 'scale', min: 0, max: 5, options: [
        { value: 0, label: 'None' }, { value: 1, label: 'Mild' }, { value: 3, label: 'Moderate' }, { value: 5, label: 'Significant' },
      ]},
      { id: 'constipation', label: 'Digestion', description: 'How is your digestion?', type: 'scale', min: 0, max: 5, options: [
        { value: 0, label: 'Normal' }, { value: 1, label: 'Slightly sluggish' }, { value: 3, label: 'Constipated' }, { value: 5, label: 'Very constipated' },
      ]},
    ],
    severityLevels: [
      { id: 'well_managed', label: 'Well Managed', range: [0, 10], color: 'text-sage-dark', bgColor: 'bg-sage-light' },
      { id: 'mild', label: 'Mild Symptoms', range: [11, 20], color: 'text-risk-watch', bgColor: 'bg-yellow-100' },
      { id: 'moderate', label: 'Moderate Symptoms', range: [21, 35], color: 'text-coral', bgColor: 'bg-coral/20' },
      { id: 'severe', label: 'Significant Symptoms', range: [36, 55], color: 'text-rose-dark', bgColor: 'bg-rose/20' },
    ],
  },

  symptoms: {
    coreSymptoms: [
      { id: 'fatigue', label: 'Fatigue', gentleLabel: 'How is your energy today?', type: 'scale', min: 0, max: 10 },
      { id: 'weightChange', label: 'Weight', gentleLabel: 'Any changes in your weight?', type: 'select', options: [
        { value: 'stable', label: 'Stable' }, { value: 'slight_gain', label: 'Slight gain' }, { value: 'noticeable_gain', label: 'Noticeable gain' }, { value: 'loss', label: 'Weight loss' },
      ]},
      { id: 'coldIntolerance', label: 'Cold Sensitivity', gentleLabel: 'Are you feeling colder than usual?', type: 'scale', min: 0, max: 10 },
      { id: 'brainFog', label: 'Brain Fog', gentleLabel: 'How clear is your thinking?', type: 'scale', min: 0, max: 10 },
      { id: 'hairThinning', label: 'Hair Changes', gentleLabel: 'How is your hair?', type: 'select', options: [
        { value: 'normal', label: 'Normal' }, { value: 'more_shedding', label: 'More shedding' }, { value: 'thinning', label: 'Noticeable thinning' }, { value: 'significant', label: 'Significant changes' },
      ]},
      { id: 'mood', label: 'Mood', gentleLabel: 'How is your mood?', type: 'scale', min: 0, max: 10 },
      { id: 'drySkin', label: 'Dry Skin', gentleLabel: 'How is your skin feeling?', type: 'scale', min: 0, max: 10 },
    ],
    complications: [
      { id: 'goiter', label: 'Goiter', gentleLabel: 'Swelling or fullness in your neck' },
      { id: 'thyroid_nodules', label: 'Thyroid Nodules', gentleLabel: 'Lumps in your thyroid area' },
      { id: 'other_autoimmune', label: 'Other Autoimmune Symptoms', gentleLabel: 'Symptoms of other autoimmune conditions' },
      { id: 'depression', label: 'Depression', gentleLabel: 'Feeling persistently low or hopeless' },
      { id: 'menstrual_changes', label: 'Menstrual Changes', gentleLabel: 'Changes to your period' },
    ],
    customFields: [
      { id: 'medicationTiming', label: 'Took Medication on Empty Stomach', type: 'boolean', defaultValue: true },
      { id: 'heartRate', label: 'Resting Heart Rate', type: 'number', defaultValue: 70 },
      { id: 'bodyTemp', label: 'Body Temperature Feel', type: 'string', defaultValue: 'normal' },
    ],
  },

  flareWeights: {
    symptomTrend: 25,
    circadianDisruption: 15,
    dietaryRisk: 15,
    menstrualPhase: 15,
    stressMood: 15,
    medicationAdherence: 10,
    mealTiming: 5,
    customFactors: [
      { id: 'medicationTiming', label: 'Medication timing (empty stomach)', weight: 10 },
      { id: 'iodineExposure', label: 'Excess iodine exposure', weight: 10 },
    ],
  },

  dietaryProfile: {
    riskFactors: [
      { name: 'Excess Iodine', mechanism: 'Too much iodine can worsen thyroid inflammation and autoimmune attack in Hashimoto\'s', severity: 'high', foods: ['seaweed', 'kelp supplements', 'iodized salt (excess)', 'some multivitamins'] },
      { name: 'Soy (with medication)', mechanism: 'Soy isoflavones can interfere with levothyroxine absorption and thyroid hormone production', severity: 'moderate', foods: ['soy milk', 'tofu', 'edamame', 'soy protein'] },
      { name: 'Raw Cruciferous (large amounts)', mechanism: 'Goitrogens can interfere with iodine uptake — cooking reduces the effect significantly', severity: 'low', foods: ['raw broccoli', 'raw kale', 'raw cauliflower', 'raw Brussels sprouts'] },
      { name: 'Gluten', mechanism: 'Molecular mimicry between gliadin and thyroid tissue — some patients improve on GF diet', severity: 'moderate', foods: ['bread', 'pasta', 'wheat flour', 'barley', 'rye'] },
      { name: 'Highly Processed Foods', mechanism: 'Promotes inflammation and gut permeability, which may worsen autoimmune activity', severity: 'moderate', foods: ['fast food', 'packaged snacks', 'processed meats'] },
    ],
    protectiveFactors: [
      { name: 'Selenium', mechanism: 'Essential for thyroid hormone conversion (T4 to T3) and reduces thyroid antibodies', severity: 'high', foods: ['Brazil nuts (1-2 daily)', 'seafood', 'sunflower seeds', 'eggs'] },
      { name: 'Zinc', mechanism: 'Supports thyroid hormone production and immune regulation', severity: 'moderate', foods: ['pumpkin seeds', 'cashews', 'chickpeas', 'oysters'] },
      { name: 'Vitamin D', mechanism: 'Immune modulator — deficiency common in Hashimoto\'s and linked to higher antibody levels', severity: 'high', foods: ['fatty fish', 'egg yolks', 'fortified foods', 'sunlight'] },
      { name: 'Iron', mechanism: 'Required for thyroid hormone synthesis — deficiency is common and worsens symptoms', severity: 'high', foods: ['red meat', 'lentils', 'spinach', 'fortified cereals'] },
      { name: 'Anti-inflammatory Foods', mechanism: 'Reduces systemic inflammation that drives autoimmune thyroid attack', severity: 'moderate', foods: ['turmeric', 'ginger', 'berries', 'leafy greens', 'olive oil'] },
    ],
    guidelines: [
      'Take levothyroxine on an empty stomach, 30-60 minutes before food, with water only',
      'Selenium from 1-2 Brazil nuts daily may help reduce thyroid antibodies',
      'If you eat soy, separate it from your thyroid medication by at least 4 hours',
      'Cooking cruciferous vegetables reduces goitrogenic effect — you do not need to avoid them entirely',
      'Consider trialing a gluten-free diet for 3 months to see if it helps your symptoms',
    ],
    nutrientWarnings: [
      { nutrientName: 'Iodine, I', threshold: 300, unit: 'mcg', direction: 'above', warning: 'Excess iodine may worsen thyroid inflammation in Hashimoto\'s', riskIncrease: 15 },
      { nutrientName: 'Selenium, Se', threshold: 55, unit: 'mcg', direction: 'below', warning: 'Low selenium impairs thyroid hormone conversion', riskIncrease: 10 },
      { nutrientName: 'Vitamin D (D2 + D3)', threshold: 15, unit: 'mcg', direction: 'below', warning: 'Low vitamin D is linked to higher thyroid antibodies', riskIncrease: 10 },
      { nutrientName: 'Iron, Fe', threshold: 8, unit: 'mg', direction: 'below', warning: 'Low iron can worsen hypothyroid symptoms', riskIncrease: 8 },
    ],
  },

  cycleImpact: {
    hasImpact: true,
    prevalencePercent: 60,
    phases: [
      { phase: 'menstrual', riskMultiplier: 1.3, commonSymptoms: ['Heavier or longer periods', 'Worse fatigue', 'Increased cold sensitivity'], mechanism: 'Hypothyroidism directly affects menstrual regularity and flow. Low estrogen further reduces thyroid hormone binding.', tip: 'Heavier periods are common with hypothyroid — track flow to share with your doctor' },
      { phase: 'follicular', riskMultiplier: 0.9, commonSymptoms: ['Better energy', 'Improved mood', 'Less brain fog'], mechanism: 'Rising estrogen increases thyroid binding globulin, which helps regulate hormone levels.', tip: 'Take advantage of better energy for activities you enjoy' },
      { phase: 'ovulatory', riskMultiplier: 0.85, commonSymptoms: ['Best energy', 'Clearest thinking', 'Stable mood'], mechanism: 'Peak estrogen supports thyroid function and overall hormonal balance.', tip: 'You may feel your best around ovulation' },
      { phase: 'luteal', riskMultiplier: 1.15, commonSymptoms: ['Gradual fatigue increase', 'More brain fog', 'Weight fluctuation'], mechanism: 'Progesterone can slow metabolism further, compounding hypothyroid symptoms.', tip: 'Increased fatigue is expected — adjust your schedule if you can' },
      { phase: 'premenstrual', riskMultiplier: 1.25, commonSymptoms: ['Significant fatigue', 'Mood changes', 'Worse brain fog', 'Cold sensitivity'], mechanism: 'Dropping hormones compound hypothyroid symptoms. TSH may fluctuate.', tip: 'This is often when Hashimoto\'s symptoms feel hardest — be kind to yourself' },
    ],
  },

  commonMedications: [
    { name: 'Levothyroxine', class: 'Thyroid Hormone (T4)', description: 'Primary treatment — synthetic T4 to replace what your thyroid cannot make' },
    { name: 'Liothyronine', class: 'Thyroid Hormone (T3)', description: 'Synthetic T3, sometimes added if T4-only is not enough' },
    { name: 'Desiccated Thyroid (NDT)', class: 'Combination T4/T3', description: 'Natural thyroid extract containing both T4 and T3' },
    { name: 'Selenium Supplement', class: 'Supplement', description: 'May help reduce thyroid antibodies' },
    { name: 'Vitamin D Supplement', class: 'Supplement', description: 'Often needed to correct common deficiency' },
    { name: 'Iron Supplement', class: 'Supplement', description: 'For iron deficiency, which is common in Hashimoto\'s' },
  ],

  populationStats: [
    { stat: 'Prevalence', value: '5% of population (most common autoimmune condition)', source: 'ATA', context: 'You are far from alone — Hashimoto\'s is incredibly common' },
    { stat: 'Female-to-male ratio', value: '10:1', source: 'ATA', context: 'Hashimoto\'s overwhelmingly affects women' },
    { stat: 'Antibody prevalence', value: 'TPO antibodies in 90%+ of patients', source: 'ATA', context: 'Antibodies confirm the autoimmune nature of your thyroid condition' },
    { stat: 'Gluten-free benefit', value: '~20-30% report improvement', source: 'Thyroid Research', context: 'Worth trying, but not everyone benefits — you can test it for yourself' },
    { stat: 'Selenium supplementation', value: 'Reduces TPO antibodies by 20-40%', source: 'Cochrane', context: 'Just 1-2 Brazil nuts daily provides therapeutic selenium' },
    { stat: 'Co-occurring autoimmune conditions', value: '15-20% develop another autoimmune condition', source: 'JCEM', context: 'Mention any new symptoms to your doctor, even if they seem unrelated' },
  ],

  emergencyProtocol: {
    severityQuestions: [
      { question: 'How severe is your fatigue?', options: [
        { label: 'Manageable tiredness', severity: 'mild' }, { label: 'Significantly affecting daily life', severity: 'moderate' }, { label: 'Barely able to function', severity: 'severe' }, { label: 'Cannot stay awake, confused, or very cold', severity: 'emergency' },
      ]},
      { question: 'Are you experiencing swelling in your neck?', options: [
        { label: 'No', severity: 'mild' }, { label: 'Mild fullness', severity: 'moderate' }, { label: 'Noticeable swelling', severity: 'severe' }, { label: 'Swelling with difficulty swallowing or breathing', severity: 'emergency' },
      ]},
      { question: 'How is your mood?', options: [
        { label: 'Generally okay', severity: 'mild' }, { label: 'Feeling low', severity: 'moderate' }, { label: 'Very depressed or anxious', severity: 'severe' }, { label: 'Having thoughts of self-harm', severity: 'emergency' },
      ]},
      { question: 'Any unusual symptoms?', options: [
        { label: 'Same as usual', severity: 'mild' }, { label: 'Feeling more unwell than typical', severity: 'moderate' }, { label: 'Heart racing, tremors, or anxiety (possible Hashitoxicosis)', severity: 'severe' }, { label: 'Extreme cold, confusion, or drowsiness (possible myxedema)', severity: 'emergency' },
      ]},
    ],
    immediateActions: [
      'Take your thyroid medication if you have missed a dose',
      'Stay warm and rest if you are feeling very cold and fatigued',
      'Hydrate well, especially if constipated',
      'Note any new symptoms — changes can indicate medication adjustment is needed',
      'If experiencing rapid heart rate or tremors, this may be Hashitoxicosis — contact your doctor',
    ],
    whenToCallDoctor: [
      'Your symptoms are worsening despite taking medication regularly',
      'You notice a change in neck swelling or a new lump',
      'Your mood is persistently low and affecting daily life',
      'You are experiencing new symptoms like heart racing or tremors',
      'Your periods have become significantly heavier or more irregular',
    ],
    whenToGoER: [
      'Extreme fatigue with confusion, drowsiness, or hypothermia (possible myxedema crisis)',
      'Severe difficulty swallowing or breathing due to thyroid swelling',
      'Rapid heart rate with tremors and agitation (possible thyroid storm from Hashitoxicosis)',
      'Severe depression with thoughts of self-harm — please reach out for help',
      'Signs of severe anemia (extreme pallor, shortness of breath, chest pain)',
    ],
    whatToTellER: [
      'That you have Hashimoto\'s thyroiditis',
      'Your thyroid medication name and dose',
      'Your most recent TSH and thyroid hormone levels if available',
      'When your symptoms changed and any recent medication adjustments',
    ],
    doNotDo: [
      'Do NOT stop your thyroid medication — even if you feel well, your body needs it',
      'Do NOT take your thyroid medication with coffee, calcium, or iron — wait 30-60 minutes',
      'Do NOT take excess iodine supplements — this can worsen Hashimoto\'s',
      'Do NOT ignore persistent mood changes — they may be thyroid-related and treatable',
    ],
    dietDuringFlare: [
      'Focus on selenium-rich foods: Brazil nuts, seafood, eggs',
      'Ensure adequate iron: lentils, spinach, red meat (separate from thyroid medication)',
      'Anti-inflammatory foods: berries, turmeric, ginger, leafy greens',
      'Stay hydrated and include fiber for constipation: fruits, cooked vegetables',
      'Warm, nourishing meals — soups and stews are comforting and easy to digest',
    ],
  },

  aiContext: {
    gentleLanguage: {
      'Hashimoto\'s thyroiditis': 'your thyroid condition',
      'hypothyroidism': 'underactive thyroid',
      'goiter': 'thyroid swelling',
      'thyroid antibodies': 'immune markers',
      'myxedema': 'severe thyroid underactivity',
      'autoimmune thyroiditis': 'your thyroid condition',
      'TSH': 'thyroid level',
    },
    avoidTerms: ['Hashimoto\'s disease', 'thyroiditis', 'goiter', 'myxedema', 'autoimmune destruction', 'gland failure', 'thyroid attack'],
    systemPromptContext: `The user has Hashimoto's thyroiditis. Key concepts: autoimmune attack on thyroid gland, progressive hypothyroidism, TPO and thyroglobulin antibodies. Levothyroxine is the mainstay treatment — absorption matters (empty stomach, no coffee/calcium/iron for 30-60 min). Selenium (Brazil nuts) can reduce antibodies. Excess iodine worsens the condition. ~60% of women report menstrual cycle interaction — hypothyroidism causes heavier/irregular periods. Gluten-free diet helps some patients. Watch for Hashitoxicosis phases (temporary hyperthyroid symptoms as thyroid cells are destroyed).`,
    symptomTriggerPhrases: ['tired', 'exhausted', 'cold', 'freezing', 'foggy', 'brain fog', 'hair', 'weight', 'gaining weight', 'constipated', 'depressed', 'low mood', 'dry skin', 'puffy', 'swollen', 'period'],
    followUpQuestions: ['How is your energy today?', 'Did you take your medication on an empty stomach this morning?', 'How is your mood?', 'Any changes in how cold you feel?'],
  },

  experimentTemplates: [
    { title: 'Does going gluten-free improve symptoms?', hypothesis: 'Eliminating gluten reduces fatigue and brain fog', variable: 'gluten_free_diet', baselineDays: 14, interventionDays: 90 },
    { title: 'Do Brazil nuts reduce my antibodies?', hypothesis: 'Daily selenium from 1-2 Brazil nuts improves thyroid symptoms', variable: 'selenium_supplementation', baselineDays: 14, interventionDays: 28 },
    { title: 'Does medication timing matter?', hypothesis: 'Taking levothyroxine 60 min before breakfast improves symptoms vs 30 min', variable: 'medication_timing', baselineDays: 14, interventionDays: 14 },
    { title: 'Does reducing iodine intake help?', hypothesis: 'Lowering iodine-rich food intake reduces thyroid symptoms', variable: 'iodine_reduction', baselineDays: 14, interventionDays: 21 },
    { title: 'Does stress management help thyroid symptoms?', hypothesis: 'Daily relaxation reduces fatigue and brain fog', variable: 'stress_management', baselineDays: 14, interventionDays: 21 },
  ],
};
