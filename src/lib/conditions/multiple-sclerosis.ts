import type { ConditionProfile } from './types';

export const multipleSclerosisProfile: ConditionProfile = {
  id: 'multiple_sclerosis',
  name: 'Multiple Sclerosis',
  shortName: 'MS',
  category: 'neurological',
  description: 'A chronic condition where the immune system attacks the protective myelin covering of nerves, disrupting communication between the brain and body.',
  icon: '🧠',

  scoring: {
    name: 'PDDS',
    fullName: 'Patient-Determined Disease Steps (Simplified)',
    maxScore: 47,
    components: [
      { id: 'walking', label: 'Walking Ability', description: 'How is your walking today?', type: 'scale', min: 0, max: 8, options: [
        { value: 0, label: 'Normal walking' }, { value: 2, label: 'Slight difficulty' }, { value: 4, label: 'Need to rest sometimes' }, { value: 6, label: 'Need a cane or support' }, { value: 8, label: 'Cannot walk without major help' },
      ]},
      { id: 'handFunction', label: 'Hand Function', description: 'How are your hands working today?', type: 'scale', min: 0, max: 4, options: [
        { value: 0, label: 'Normal' }, { value: 1, label: 'Slightly clumsy' }, { value: 2, label: 'Noticeable difficulty' }, { value: 3, label: 'Significant difficulty' }, { value: 4, label: 'Very limited use' },
      ]},
      { id: 'fatigue', label: 'Fatigue', description: 'How is your energy and tiredness?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'Full of energy' }, { value: 2, label: 'Slightly tired' }, { value: 5, label: 'Moderately fatigued' }, { value: 7, label: 'Very fatigued' }, { value: 10, label: 'Completely exhausted' },
      ]},
      { id: 'cognitiveFunction', label: 'Cognitive Function', description: 'How is your thinking and concentration?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'Sharp and clear' }, { value: 2, label: 'Slightly foggy' }, { value: 5, label: 'Noticeably foggy' }, { value: 7, label: 'Very difficult to focus' }, { value: 10, label: 'Cannot concentrate at all' },
      ]},
      { id: 'vision', label: 'Vision', description: 'How is your vision today?', type: 'scale', min: 0, max: 5, options: [
        { value: 0, label: 'Normal' }, { value: 1, label: 'Slightly blurry' }, { value: 2, label: 'Noticeably affected' }, { value: 3, label: 'Significantly impaired' }, { value: 5, label: 'Severely impaired' },
      ]},
      { id: 'balance', label: 'Balance', description: 'How is your balance and coordination?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'Perfectly steady' }, { value: 2, label: 'Slightly unsteady' }, { value: 5, label: 'Noticeably unsteady' }, { value: 7, label: 'Very unsteady' }, { value: 10, label: 'Cannot balance without support' },
      ]},
    ],
    severityLevels: [
      { id: 'minimal', label: 'Minimal Impact', range: [0, 9], color: 'text-sage-dark', bgColor: 'bg-sage-light' },
      { id: 'moderate', label: 'Moderate Impact', range: [10, 19], color: 'text-risk-watch', bgColor: 'bg-yellow-100' },
      { id: 'significant', label: 'Significant Impact', range: [20, 32], color: 'text-coral', bgColor: 'bg-coral/20' },
      { id: 'severe', label: 'Severe Impact', range: [33, 47], color: 'text-rose-dark', bgColor: 'bg-rose/20' },
    ],
  },

  symptoms: {
    coreSymptoms: [
      { id: 'fatigue', label: 'Fatigue', gentleLabel: 'How is your energy today?', type: 'scale', min: 0, max: 10 },
      { id: 'numbness', label: 'Numbness/Tingling', gentleLabel: 'Any numbness or tingling sensations?', type: 'scale', min: 0, max: 10 },
      { id: 'vision', label: 'Vision', gentleLabel: 'How is your eyesight today?', type: 'scale', min: 0, max: 10 },
      { id: 'balance', label: 'Balance', gentleLabel: 'How is your balance and steadiness?', type: 'scale', min: 0, max: 10 },
      { id: 'cognitiveFog', label: 'Cognitive Fog', gentleLabel: 'How clear is your thinking?', type: 'scale', min: 0, max: 10 },
      { id: 'heatSensitivity', label: 'Heat Sensitivity', gentleLabel: 'Are you affected by heat today?', type: 'select', options: [
        { value: 'none', label: 'Not at all' }, { value: 'mild', label: 'A little' }, { value: 'moderate', label: 'Noticeable' }, { value: 'severe', label: 'Really struggling' },
      ]},
      { id: 'bladder', label: 'Bladder Issues', gentleLabel: 'Any bladder concerns?', type: 'select', options: [
        { value: 'none', label: 'None' }, { value: 'mild', label: 'Mild urgency' }, { value: 'moderate', label: 'Frequent urgency' }, { value: 'severe', label: 'Difficult to manage' },
      ]},
    ],
    complications: [
      { id: 'spasticity', label: 'Spasticity', gentleLabel: 'Muscle tightness or spasms' },
      { id: 'depression', label: 'Depression', gentleLabel: 'Feeling low or depressed' },
      { id: 'pain_syndrome', label: 'Pain', gentleLabel: 'Nerve pain or uncomfortable sensations' },
      { id: 'swallowing', label: 'Swallowing Difficulty', gentleLabel: 'Trouble swallowing' },
      { id: 'tremor', label: 'Tremor', gentleLabel: 'Shaking or tremor in hands' },
    ],
    customFields: [
      { id: 'heatExposure', label: 'Heat Exposure Today', type: 'boolean', defaultValue: false },
      { id: 'newSymptom', label: 'New Symptom Noticed', type: 'boolean', defaultValue: false },
      { id: 'symptomDurationHours', label: 'New Symptom Duration (hours)', type: 'number', defaultValue: 0 },
    ],
  },

  flareWeights: {
    symptomTrend: 30,
    circadianDisruption: 15,
    dietaryRisk: 10,
    menstrualPhase: 10,
    stressMood: 20,
    medicationAdherence: 10,
    mealTiming: 5,
    customFactors: [
      { id: 'heatExposure', label: 'Heat exposure (Uhthoff phenomenon)', weight: 15 },
      { id: 'infection', label: 'Recent infection or illness', weight: 20 },
    ],
  },

  dietaryProfile: {
    riskFactors: [
      { name: 'Saturated Fat', mechanism: 'Promotes pro-inflammatory immune responses and may worsen neuroinflammation', severity: 'moderate', foods: ['red meat', 'butter', 'full-fat dairy', 'fried foods'] },
      { name: 'Processed Foods', mechanism: 'Additives and preservatives may promote inflammation and gut dysbiosis', severity: 'moderate', foods: ['fast food', 'packaged snacks', 'processed meats'] },
      { name: 'Excess Salt', mechanism: 'High sodium may increase inflammatory Th17 cell activity', severity: 'moderate', foods: ['processed foods', 'canned soups', 'salty snacks'] },
      { name: 'Smoking/Nicotine', mechanism: 'Accelerates disease progression and reduces treatment effectiveness', severity: 'high', foods: ['cigarettes', 'nicotine products'] },
    ],
    protectiveFactors: [
      { name: 'Vitamin D', mechanism: 'Crucial immunomodulator — deficiency strongly linked to MS risk and relapses', severity: 'high', foods: ['fatty fish', 'egg yolks', 'fortified foods', 'sunlight exposure'] },
      { name: 'Omega-3 Fatty Acids', mechanism: 'Anti-inflammatory, supports myelin health and neuroprotection', severity: 'high', foods: ['salmon', 'mackerel', 'sardines', 'flaxseed', 'walnuts'] },
      { name: 'Fruits and Vegetables', mechanism: 'Rich in antioxidants that protect against oxidative damage to neurons', severity: 'high', foods: ['berries', 'leafy greens', 'colorful vegetables', 'citrus'] },
      { name: 'Fiber', mechanism: 'Supports gut microbiome health, which influences neuroinflammation', severity: 'moderate', foods: ['whole grains', 'legumes', 'vegetables', 'fruits'] },
      { name: 'Polyphenols', mechanism: 'Neuroprotective and anti-inflammatory properties', severity: 'moderate', foods: ['green tea', 'dark chocolate', 'berries', 'olive oil'] },
    ],
    guidelines: [
      'Vitamin D is especially important — talk to your doctor about getting levels tested',
      'Focus on a diet rich in fruits, vegetables, and fish (Wahls Protocol or Mediterranean diet)',
      'Limit saturated fat and processed foods',
      'Stay well-hydrated, but be mindful of bladder management',
      'Small, nutrient-dense meals can help with fatigue management',
    ],
    nutrientWarnings: [
      { nutrientName: 'Vitamin D (D2 + D3)', threshold: 20, unit: 'mcg', direction: 'below', warning: 'Vitamin D is especially important in MS — many experts recommend higher levels', riskIncrease: 15 },
      { nutrientName: 'Fatty acids, total saturated', threshold: 20, unit: 'g', direction: 'above', warning: 'High saturated fat may worsen neuroinflammation', riskIncrease: 8 },
      { nutrientName: 'Sodium, Na', threshold: 2300, unit: 'mg', direction: 'above', warning: 'High sodium may increase inflammatory immune activity', riskIncrease: 5 },
    ],
  },

  cycleImpact: {
    hasImpact: true,
    prevalencePercent: 35,
    phases: [
      { phase: 'menstrual', riskMultiplier: 1.3, commonSymptoms: ['Worsened fatigue', 'Increased numbness/tingling', 'More cognitive fog'], mechanism: 'Low estrogen reduces its neuroprotective and anti-inflammatory effects. Some women experience pseudorelapses around menstruation.', tip: 'This is a temporary worsening, not a true relapse — rest and be gentle with yourself' },
      { phase: 'follicular', riskMultiplier: 0.85, commonSymptoms: ['Improved energy', 'Better cognitive clarity', 'Reduced symptoms'], mechanism: 'Rising estrogen has neuroprotective effects and reduces inflammation.', tip: 'You may feel more capable during this phase — enjoy it without overdoing it' },
      { phase: 'ovulatory', riskMultiplier: 0.8, commonSymptoms: ['Often the best phase', 'Clearest thinking', 'Best energy'], mechanism: 'Peak estrogen provides maximum neuroprotective benefit.', tip: 'A great time for activities that require focus and energy' },
      { phase: 'luteal', riskMultiplier: 1.1, commonSymptoms: ['Gradual increase in fatigue', 'Mild symptom increase'], mechanism: 'Progesterone has some immunosuppressive effects but the shift from estrogen dominance may cause mild worsening.', tip: 'Plan lighter activities and build in more rest' },
      { phase: 'premenstrual', riskMultiplier: 1.25, commonSymptoms: ['Pseudorelapse symptoms', 'Increased fatigue', 'More tingling', 'Worse brain fog'], mechanism: 'Rapid hormone drop removes neuroprotective estrogen effect. Temperature regulation may be affected.', tip: 'Track whether symptoms around this time resolve with your period — this helps distinguish pseudorelapse from true relapse' },
    ],
  },

  commonMedications: [
    { name: 'Interferon beta-1a', class: 'Disease-Modifying Therapy', description: 'Injectable DMT that reduces relapse rate' },
    { name: 'Glatiramer Acetate', class: 'Disease-Modifying Therapy', description: 'Injectable therapy that modulates immune response' },
    { name: 'Dimethyl Fumarate', class: 'Disease-Modifying Therapy', description: 'Oral DMT with neuroprotective properties' },
    { name: 'Fingolimod', class: 'S1P Receptor Modulator', description: 'Oral therapy that traps immune cells in lymph nodes' },
    { name: 'Natalizumab', class: 'Integrin Inhibitor', description: 'High-efficacy infusion therapy' },
    { name: 'Ocrelizumab', class: 'Anti-CD20 Biologic', description: 'Infusion targeting B cells, effective for relapsing and progressive MS' },
    { name: 'Ofatumumab', class: 'Anti-CD20 Biologic', description: 'Self-injection B cell therapy' },
    { name: 'Methylprednisolone', class: 'Corticosteroid', description: 'IV steroids for acute relapses' },
    { name: 'Baclofen', class: 'Antispasmodic', description: 'For spasticity management' },
    { name: 'Modafinil', class: 'Stimulant', description: 'For MS-related fatigue' },
  ],

  populationStats: [
    { stat: 'Prevalence', value: '~2.8 million worldwide', source: 'MSIF', context: 'There is a large and supportive community of people living with MS' },
    { stat: 'Female-to-male ratio', value: '3:1', source: 'MSIF', context: 'MS affects women significantly more often than men' },
    { stat: 'Fatigue prevalence', value: '75-95% of patients', source: 'NMSS', context: 'Fatigue is the most common and often most disabling symptom' },
    { stat: 'Vitamin D deficiency', value: 'Up to 80% of MS patients', source: 'Neurology', context: 'Vitamin D optimization is a priority in MS management' },
    { stat: 'DMT relapse reduction', value: '30-70% depending on therapy', source: 'AAN', context: 'Disease-modifying therapies make a real difference in long-term outcomes' },
    { stat: 'Pregnancy and MS', value: 'Relapse rate drops ~70% in 3rd trimester', source: 'NMSS', context: 'Many women with MS have healthy pregnancies with proper planning' },
  ],

  emergencyProtocol: {
    severityQuestions: [
      { question: 'Are you experiencing new or worsening neurological symptoms?', options: [
        { label: 'No change from usual', severity: 'mild' }, { label: 'Mild new symptoms', severity: 'moderate' }, { label: 'Significant new symptoms lasting hours', severity: 'severe' }, { label: 'Sudden severe symptoms (vision loss, weakness)', severity: 'emergency' },
      ]},
      { question: 'How long have the new symptoms lasted?', options: [
        { label: 'Minutes (likely heat or fatigue)', severity: 'mild' }, { label: 'Several hours', severity: 'moderate' }, { label: '12-24 hours', severity: 'severe' }, { label: 'More than 24 hours', severity: 'emergency' },
      ]},
      { question: 'Is your vision affected?', options: [
        { label: 'No', severity: 'mild' }, { label: 'Slightly blurry', severity: 'moderate' }, { label: 'Significantly impaired', severity: 'severe' }, { label: 'Sudden loss of vision in one eye', severity: 'emergency' },
      ]},
      { question: 'Do you have new weakness or difficulty walking?', options: [
        { label: 'No', severity: 'mild' }, { label: 'Mild, I can still manage', severity: 'moderate' }, { label: 'Significant difficulty', severity: 'severe' }, { label: 'Cannot walk or use a limb', severity: 'emergency' },
      ]},
    ],
    immediateActions: [
      'Cool down if you are overheated — Uhthoff phenomenon is temporary',
      'Rest in a cool, quiet environment',
      'Note when symptoms started and what you were doing',
      'Take prescribed symptom management medications',
      'Do not panic — many symptom fluctuations are temporary and not true relapses',
    ],
    whenToCallDoctor: [
      'New symptoms lasting more than 24 hours (this may be a relapse)',
      'Worsening of existing symptoms that does not resolve with rest or cooling',
      'New numbness, tingling, or weakness in a new area',
      'Increased difficulty with walking or balance',
      'Changes in bladder function',
    ],
    whenToGoER: [
      'Sudden vision loss in one or both eyes',
      'Sudden severe weakness or paralysis',
      'Difficulty breathing or swallowing',
      'Severe, sudden headache (different from usual MS symptoms)',
      'Loss of consciousness or seizure',
    ],
    whatToTellER: [
      'That you have multiple sclerosis and which type (relapsing-remitting, progressive, etc.)',
      'Your current disease-modifying therapy and any recent changes',
      'Exactly when symptoms started and how they have progressed',
      'Your most recent MRI results if available',
    ],
    doNotDo: [
      'Do NOT expose yourself to excessive heat during symptom worsening',
      'Do NOT assume every new symptom is a relapse — heat, stress, and infections can cause pseudorelapses',
      'Do NOT stop your disease-modifying therapy without talking to your neurologist',
      'Do NOT push through severe fatigue — rest is genuinely needed',
    ],
    dietDuringFlare: [
      'Focus on easy-to-prepare, nutrient-dense foods — cooking fatigue is real',
      'Prioritize vitamin D-rich foods and omega-3 sources',
      'Stay hydrated but manage intake if bladder symptoms are worsening',
      'Anti-inflammatory foods: colorful vegetables, fish, olive oil, nuts',
      'Ask for help with meal preparation — flares are when support matters most',
    ],
  },

  aiContext: {
    gentleLanguage: {
      'multiple sclerosis': 'your condition',
      'MS': 'your condition',
      'demyelination': 'nerve coating changes',
      'lesions': 'areas of activity',
      'relapse': 'flare-up',
      'spasticity': 'muscle tightness',
      'optic neuritis': 'eye inflammation',
      'paresthesia': 'tingling sensations',
      'ataxia': 'coordination difficulty',
    },
    avoidTerms: ['demyelination', 'lesions', 'brain damage', 'disability', 'degeneration', 'atrophy', 'progressive decline', 'paralysis'],
    systemPromptContext: `The user has multiple sclerosis. Key concepts: autoimmune attack on myelin (nerve insulation), relapsing-remitting vs progressive forms, Uhthoff phenomenon (heat sensitivity), pseudorelapses vs true relapses (>24h duration). Vitamin D is critically important. Fatigue is the #1 symptom. ~35% of women report menstrual cycle-related symptom changes. Pregnancy often improves MS (especially 3rd trimester). Stress and infections can trigger relapses. Disease-modifying therapies reduce long-term disability.`,
    symptomTriggerPhrases: ['numb', 'tingling', 'vision', 'blurry', 'tired', 'exhausted', 'fog', 'can\'t think', 'balance', 'dizzy', 'weak', 'hot', 'heat', 'spasm', 'tight', 'bladder'],
    followUpQuestions: ['How is your energy today?', 'Any new tingling or numbness?', 'How is your vision?', 'Were you exposed to heat today?'],
  },

  experimentTemplates: [
    { title: 'Does vitamin D supplementation improve symptoms?', hypothesis: 'Higher vitamin D levels reduce fatigue and symptom severity', variable: 'vitamin_d_supplementation', baselineDays: 14, interventionDays: 28 },
    { title: 'Does cooling help during warm days?', hypothesis: 'Active cooling strategies reduce Uhthoff-related symptom worsening', variable: 'cooling_strategies', baselineDays: 7, interventionDays: 14 },
    { title: 'Does a Mediterranean diet improve fatigue?', hypothesis: 'An anti-inflammatory diet reduces MS fatigue', variable: 'mediterranean_diet', baselineDays: 14, interventionDays: 28 },
    { title: 'Does pacing activities reduce fatigue?', hypothesis: 'Planned rest breaks between activities improve overall energy', variable: 'activity_pacing', baselineDays: 7, interventionDays: 14 },
    { title: 'Does stress management reduce symptom flares?', hypothesis: 'Daily mindfulness reduces frequency of symptom worsening', variable: 'stress_management', baselineDays: 14, interventionDays: 21 },
  ],
};
