import type { ConditionProfile } from './types';

export const lupusProfile: ConditionProfile = {
  id: 'lupus',
  name: 'Lupus (SLE)',
  shortName: 'Lupus',
  category: 'rheumatic',
  description: 'Systemic autoimmune condition where the immune system can affect joints, skin, kidneys, heart, lungs, and other organs. Often called the "great imitator" because it can look like many other conditions.',
  icon: '🦋',

  scoring: {
    name: 'SLEDAI-2K',
    fullName: 'SLEDAI-2K Simplified Self-Tracking',
    maxScore: 30,
    components: [
      { id: 'jointPain', label: 'Joint Pain', description: 'How much are your joints hurting?', type: 'scale', min: 0, max: 4, options: [
        { value: 0, label: 'No pain' }, { value: 1, label: 'Slight aches' }, { value: 2, label: 'Noticeable pain' }, { value: 3, label: 'Significant pain' }, { value: 4, label: 'Severe pain' },
      ]},
      { id: 'skinRash', label: 'Skin Rash', description: 'Any rash or butterfly mark today?', type: 'scale', min: 0, max: 2, options: [
        { value: 0, label: 'None' }, { value: 1, label: 'Mild or fading' }, { value: 2, label: 'Active or spreading' },
      ]},
      { id: 'fatigue', label: 'Fatigue', description: 'How is your energy today?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'Full of energy' }, { value: 2, label: 'A bit tired' }, { value: 4, label: 'Noticeably tired' }, { value: 6, label: 'Very tired' }, { value: 8, label: 'Exhausted' }, { value: 10, label: 'Cannot get out of bed' },
      ]},
      { id: 'fever', label: 'Fever', description: 'Do you have a fever today?', type: 'boolean', min: 0, max: 1 },
      { id: 'hairLoss', label: 'Hair Loss', description: 'Noticing more hair coming out than usual?', type: 'boolean', min: 0, max: 1 },
      { id: 'mouthSores', label: 'Mouth Sores', description: 'Any sores in your mouth or nose?', type: 'boolean', min: 0, max: 1 },
      { id: 'photosensitivity', label: 'Sun Sensitivity', description: 'How is your skin reacting to light?', type: 'scale', min: 0, max: 3, options: [
        { value: 0, label: 'No reaction' }, { value: 1, label: 'Mild sensitivity' }, { value: 2, label: 'Noticeable reaction' }, { value: 3, label: 'Severe reaction or new rash from sun' },
      ]},
      { id: 'brainFog', label: 'Brain Fog / Headaches', description: 'Any trouble thinking clearly or headaches?', type: 'scale', min: 0, max: 3, options: [
        { value: 0, label: 'Thinking clearly' }, { value: 1, label: 'A bit foggy' }, { value: 2, label: 'Hard to concentrate' }, { value: 3, label: 'Severe fog or bad headache' },
      ]},
    ],
    severityLevels: [
      { id: 'inactive', label: 'Inactive', range: [0, 0], color: 'text-sage-dark', bgColor: 'bg-sage-light' },
      { id: 'mild', label: 'Mild Activity', range: [1, 5], color: 'text-risk-watch', bgColor: 'bg-yellow-100' },
      { id: 'moderate', label: 'Moderate Activity', range: [6, 10], color: 'text-coral', bgColor: 'bg-coral/20' },
      { id: 'high', label: 'High Activity', range: [11, 19], color: 'text-rose-dark', bgColor: 'bg-rose/20' },
      { id: 'severe', label: 'Severe Activity', range: [20, 30], color: 'text-red-700', bgColor: 'bg-red-100' },
    ],
  },

  symptoms: {
    coreSymptoms: [
      { id: 'fatigue', label: 'Fatigue', gentleLabel: 'How is your energy today?', type: 'scale', min: 0, max: 10 },
      { id: 'jointPain', label: 'Joint Pain', gentleLabel: 'How are your joints feeling?', type: 'scale', min: 0, max: 10 },
      { id: 'butterflyRash', label: 'Butterfly Rash', gentleLabel: 'Any butterfly mark on your cheeks?', type: 'select', options: [
        { value: 'none', label: 'None' }, { value: 'faint', label: 'Faint or fading' }, { value: 'visible', label: 'Clearly visible' }, { value: 'severe', label: 'Raised or spreading' },
      ]},
      { id: 'photosensitivity', label: 'Photosensitivity', gentleLabel: 'Any skin reaction from light or sun?', type: 'scale', min: 0, max: 10 },
      { id: 'hairLoss', label: 'Hair Loss', gentleLabel: 'Noticing more hair loss than usual?', type: 'boolean' },
      { id: 'mouthSores', label: 'Mouth Sores', gentleLabel: 'Any sores in your mouth or nose?', type: 'boolean' },
      { id: 'raynauds', label: "Raynaud's", gentleLabel: 'Fingers or toes turning white or blue in the cold?', type: 'boolean' },
      { id: 'brainFog', label: 'Brain Fog', gentleLabel: 'Any trouble with thinking clearly or memory?', type: 'scale', min: 0, max: 10 },
    ],
    complications: [
      { id: 'nephritis', label: 'Kidney Involvement (Nephritis)', gentleLabel: 'Signs of kidney strain (swelling, foamy urine)' },
      { id: 'pericarditis', label: 'Pericarditis', gentleLabel: 'Chest pain or discomfort around the heart' },
      { id: 'pleurisy', label: 'Pleurisy', gentleLabel: 'Sharp chest pain when breathing deeply' },
      { id: 'bloodClots', label: 'Blood Clots', gentleLabel: 'Swelling, warmth, or pain in legs' },
    ],
    customFields: [
      { id: 'sunExposure', label: 'Sun Exposure (minutes)', type: 'number', defaultValue: 0 },
      { id: 'spfUsed', label: 'SPF Used Today', type: 'boolean', defaultValue: false },
      { id: 'jointSwelling', label: 'Number of Swollen Joints', type: 'number', defaultValue: 0 },
    ],
  },

  flareWeights: {
    symptomTrend: 25,
    circadianDisruption: 10,
    dietaryRisk: 10,
    menstrualPhase: 20,
    stressMood: 15,
    medicationAdherence: 15,
    mealTiming: 5,
    customFactors: [
      { id: 'uvExposure', label: 'UV / Sun Exposure', weight: 20 },
      { id: 'infection', label: 'Recent Infection', weight: 15 },
    ],
  },

  dietaryProfile: {
    riskFactors: [
      { name: 'Alfalfa Sprouts', mechanism: 'Contains L-canavanine which stimulates the immune system and can trigger lupus flares', severity: 'high', foods: ['alfalfa sprouts', 'alfalfa supplements', 'alfalfa tea'] },
      { name: 'Excess Salt', mechanism: 'High sodium intake worsens kidney strain, especially with nephritis', severity: 'high', foods: ['processed foods', 'canned soups', 'salty snacks', 'fast food'] },
      { name: 'Saturated & Trans Fats', mechanism: 'Increases cardiovascular risk, which is already elevated in lupus', severity: 'moderate', foods: ['fried food', 'red meat', 'full-fat dairy', 'processed baked goods'] },
      { name: 'Alcohol', mechanism: 'Can interact with medications and worsen liver strain', severity: 'moderate', foods: ['beer', 'wine', 'spirits'] },
      { name: 'Excess Sugar', mechanism: 'Promotes systemic inflammation and weight gain', severity: 'moderate', foods: ['soft drinks', 'sweets', 'packaged juices', 'pastries'] },
    ],
    protectiveFactors: [
      { name: 'Omega-3 Fatty Acids', mechanism: 'Reduces inflammation and may lower cardiovascular risk in lupus', severity: 'high', foods: ['salmon', 'mackerel', 'sardines', 'flaxseed', 'walnuts', 'chia seeds'] },
      { name: 'Vitamin D', mechanism: 'Crucial for lupus — most patients are deficient. Supports immune regulation and bone health (especially on steroids)', severity: 'high', foods: ['fortified milk', 'egg yolks', 'mushrooms (sun-exposed)', 'fortified cereals'] },
      { name: 'Curcumin / Turmeric', mechanism: 'Anti-inflammatory, may reduce proteinuria and modulate immune response', severity: 'moderate', foods: ['turmeric', 'golden milk', 'curry'] },
      { name: 'Green Tea (EGCG)', mechanism: 'Anti-inflammatory and antioxidant properties, may help modulate autoimmunity', severity: 'moderate', foods: ['green tea', 'matcha'] },
      { name: 'Antioxidant-Rich Foods', mechanism: 'Counteract oxidative stress which is elevated in lupus', severity: 'moderate', foods: ['berries', 'dark leafy greens', 'bell peppers', 'sweet potatoes', 'tomatoes'] },
      { name: 'Calcium-Rich Foods', mechanism: 'Protects bone density, especially important when on corticosteroids', severity: 'moderate', foods: ['yogurt', 'kale', 'fortified plant milk', 'almonds', 'tofu'] },
    ],
    guidelines: [
      'Follow an anti-inflammatory diet rich in fruits, vegetables, and whole grains',
      'Prioritize vitamin D — talk to your doctor about supplementation',
      'Avoid alfalfa sprouts entirely (they can stimulate your immune system)',
      'Limit sodium, especially if you have kidney involvement',
      'Choose heart-healthy fats (olive oil, avocado, nuts) over saturated fats',
      'Stay well-hydrated to support kidney health',
    ],
    nutrientWarnings: [
      { nutrientName: 'Sodium, Na', threshold: 800, unit: 'mg', direction: 'above', warning: 'High sodium can strain your kidneys — try to keep intake gentle', riskIncrease: 12 },
      { nutrientName: 'Vitamin D (D2 + D3)', threshold: 15, unit: 'mcg', direction: 'below', warning: 'Your vitamin D may be low — this is very common in lupus and worth checking', riskIncrease: 10 },
      { nutrientName: 'Total lipid (fat)', threshold: 40, unit: 'g', direction: 'above', warning: 'High fat intake increases cardiovascular risk, which lupus already raises', riskIncrease: 8 },
      { nutrientName: 'Alcohol, ethyl', threshold: 0, unit: 'g', direction: 'above', warning: 'Alcohol can interact with your medications and add strain', riskIncrease: 10 },
    ],
  },

  cycleImpact: {
    hasImpact: true,
    prevalencePercent: 40,
    phases: [
      { phase: 'menstrual', riskMultiplier: 1.5, commonSymptoms: ['Increased joint pain', 'Worse fatigue', 'Skin flares', 'More brain fog'], mechanism: 'Estrogen drops sharply during menstruation. Since estrogen stimulates B cells and autoantibody production, the hormonal shift can destabilize immune regulation and trigger flares.', tip: 'Be extra gentle with yourself — rest more, protect your skin from light, and keep your medications on schedule' },
      { phase: 'follicular', riskMultiplier: 1.0, commonSymptoms: ['Symptoms may stabilize', 'Energy slowly returns'], mechanism: 'Rising estrogen levels begin to re-engage immune pathways. For most, this is a neutral to slightly improved phase.', tip: 'A good window to rebuild your routine and gently increase activity' },
      { phase: 'ovulatory', riskMultiplier: 1.15, commonSymptoms: ['Some may notice increased symptoms', 'Mild joint stiffness'], mechanism: 'Peak estrogen can stimulate B cell activity and increase autoantibody levels, potentially triggering mild immune activation.', tip: 'Monitor how you feel — some notice a mild uptick in symptoms around ovulation' },
      { phase: 'luteal', riskMultiplier: 1.1, commonSymptoms: ['Mild fatigue', 'Slight increase in joint aches'], mechanism: 'Progesterone dominance has mild immunosuppressive effects, but the gradual estrogen decline can begin to destabilize.', tip: 'Maintain your routine and get enough rest — your body is preparing for a shift' },
      { phase: 'premenstrual', riskMultiplier: 1.35, commonSymptoms: ['Rising fatigue', 'Joint pain returning', 'Mood changes', 'Skin sensitivity'], mechanism: 'Rapid drop in both estrogen and progesterone disrupts immune regulation. The hormonal withdrawal can trigger increased autoantibody production and complement activation.', tip: 'Stick to your safe foods, protect your skin, and prioritize sleep — a flare window is opening' },
    ],
  },

  commonMedications: [
    { name: 'Hydroxychloroquine', class: 'Antimalarial', description: 'Cornerstone of lupus treatment — reduces flares, protects organs, and improves long-term survival' },
    { name: 'Prednisone', class: 'Corticosteroid', description: 'Manages flares and inflammation; goal is always to use the lowest dose possible' },
    { name: 'Mycophenolate Mofetil', class: 'Immunosuppressant', description: 'Used for kidney involvement and as a steroid-sparing agent' },
    { name: 'Azathioprine', class: 'Immunosuppressant', description: 'Helps maintain remission and reduce steroid dependence' },
    { name: 'Belimumab', class: 'BLyS Inhibitor (Biologic)', description: 'First biologic approved for lupus — targets B cell survival factor' },
    { name: 'Anifrolumab', class: 'Type I Interferon Inhibitor (Biologic)', description: 'Targets the interferon pathway, which is overactive in most lupus patients' },
    { name: 'Cyclophosphamide', class: 'Immunosuppressant', description: 'Reserved for severe lupus, especially life-threatening kidney or CNS involvement' },
    { name: 'Voclosporin', class: 'Calcineurin Inhibitor', description: 'Specifically approved for lupus nephritis (kidney involvement)' },
  ],

  populationStats: [
    { stat: 'Female prevalence', value: '~90% of lupus patients are female', source: 'Lupus Foundation of America', context: 'Hormones play a significant role — you are not alone in this' },
    { stat: '10-year survival rate', value: '95%', source: 'Johns Hopkins Lupus Center', context: 'With proper treatment, most people with lupus live full, long lives' },
    { stat: 'Kidney involvement', value: 'Up to 50% of patients', source: 'ACR / Lupus Foundation', context: 'Regular kidney checks (urine and blood) are important even when you feel well' },
    { stat: 'Hydroxychloroquine benefit', value: 'Reduces flares by ~50%', source: 'Canadian Hydroxychloroquine Study', context: 'This medication is a true cornerstone — staying on it consistently makes a real difference' },
    { stat: 'Vitamin D deficiency', value: 'Found in 67-96% of lupus patients', source: 'Lupus Science & Medicine', context: 'Ask your doctor to check your vitamin D levels — supplementation often helps' },
    { stat: 'Menstrual cycle flare association', value: '~40% report perimenstrual flares', source: 'Rheumatology Research', context: 'Tracking your cycle alongside symptoms can reveal important patterns' },
  ],

  emergencyProtocol: {
    severityQuestions: [
      { question: 'Are you noticing swelling in your face, ankles, or legs?', options: [
        { label: 'No swelling', severity: 'mild' }, { label: 'Mild puffiness', severity: 'moderate' }, { label: 'Noticeable swelling', severity: 'severe' }, { label: 'Severe swelling with reduced urination', severity: 'emergency' },
      ]},
      { question: 'How is your urine?', options: [
        { label: 'Normal', severity: 'mild' }, { label: 'Slightly darker than usual', severity: 'moderate' }, { label: 'Dark, foamy, or reduced amount', severity: 'severe' }, { label: 'Very dark, bloody, or almost no urine', severity: 'emergency' },
      ]},
      { question: 'Any chest pain or trouble breathing?', options: [
        { label: 'None', severity: 'mild' }, { label: 'Mild discomfort', severity: 'moderate' }, { label: 'Pain when breathing deeply', severity: 'severe' }, { label: 'Severe chest pain or shortness of breath', severity: 'emergency' },
      ]},
      { question: 'Any severe headache, confusion, or seizures?', options: [
        { label: 'No', severity: 'mild' }, { label: 'Mild headache', severity: 'moderate' }, { label: 'Severe headache or confusion', severity: 'severe' }, { label: 'Seizure, loss of consciousness, or extreme confusion', severity: 'emergency' },
      ]},
      { question: 'Any signs of a blood clot (leg swelling, warmth, pain)?', options: [
        { label: 'No', severity: 'mild' }, { label: 'Mild leg ache', severity: 'moderate' }, { label: 'One leg noticeably swollen, warm, or painful', severity: 'severe' }, { label: 'Sudden shortness of breath with leg swelling', severity: 'emergency' },
      ]},
    ],
    immediateActions: [
      'Rest and avoid sun or bright light exposure',
      'Take your prescribed medications — do not skip or stop hydroxychloroquine',
      'Stay hydrated with water (gentle on kidneys)',
      'Monitor your urine output and color',
      'Track your symptoms carefully so you can share with your doctor',
    ],
    whenToCallDoctor: [
      'New or worsening rash, especially after sun exposure',
      'Increasing joint pain or swelling in multiple joints',
      'Persistent fatigue that is worse than your baseline',
      'New hair loss or mouth sores appearing',
      'Swelling in ankles, legs, or face (possible kidney sign)',
      'Fever that is not from an obvious infection',
    ],
    whenToGoER: [
      'Severe chest pain, especially pain that worsens when breathing',
      'Sudden severe headache, confusion, or seizure (CNS lupus)',
      'Very dark or bloody urine, or very little urine output',
      'One leg suddenly swollen, warm, and painful (possible blood clot)',
      'Sudden shortness of breath (possible pulmonary embolism or pleurisy)',
      'High fever (above 39C / 102F) with active lupus symptoms',
    ],
    whatToTellER: [
      'That you have lupus (SLE) and which organs are involved',
      'Your current medications, especially hydroxychloroquine, steroids, and immunosuppressants',
      'When your symptoms started getting worse',
      'Your most recent lab results (complement levels, anti-dsDNA, kidney function) if available',
      'Whether you have antiphospholipid antibodies (blood clot risk)',
    ],
    doNotDo: [
      'Do NOT stop hydroxychloroquine — it protects your organs even during flares',
      'Do NOT spend time in direct sunlight or under fluorescent lights without protection',
      'Do NOT take sulfa antibiotics (trimethoprim-sulfamethoxazole) without checking with your doctor — they can trigger flares',
      'Do NOT ignore swelling or urine changes — kidney involvement needs early attention',
      'Do NOT take NSAIDs regularly without guidance — they can affect your kidneys',
    ],
    dietDuringFlare: [
      'Focus on anti-inflammatory foods: salmon, leafy greens, berries, turmeric',
      'Stay well-hydrated with water — aim for pale yellow urine',
      'Avoid alfalfa sprouts entirely',
      'Limit salt to reduce swelling and support your kidneys',
      'Eat small, nourishing meals if appetite is low',
      'Prioritize vitamin D and omega-3 rich foods',
    ],
  },

  aiContext: {
    gentleLanguage: {
      'malar rash': 'butterfly mark',
      'SLE': 'your condition',
      'lupus': 'your condition',
      'nephritis': 'kidney strain',
      'alopecia': 'hair thinning',
      'serositis': 'chest discomfort',
      'photosensitivity': 'sun sensitivity',
      'arthralgia': 'joint aches',
      'thrombosis': 'blood clot concern',
      'CNS lupus': 'neurological involvement',
      'anti-dsDNA': 'antibody levels',
      'complement': 'immune markers',
      'proteinuria': 'protein in urine',
      'flare': 'a rough patch',
    },
    avoidTerms: ['systemic lupus erythematosus', 'malar rash', 'discoid', 'nephritis', 'alopecia', 'serositis', 'thrombocytopenia', 'anti-dsDNA antibodies'],
    systemPromptContext: `The user has lupus (SLE). Key pathways: type I interferon signaling (overactive in most patients), anti-dsDNA antibodies (correlate with disease activity and kidney involvement), complement system (C3/C4 consumption during flares), B cell hyperactivity (drive autoantibody production). Estrogen directly stimulates B cells and autoantibody production, explaining the strong female predominance and menstrual flare patterns. UV light triggers flares by causing keratinocyte apoptosis and exposing nuclear antigens. Hydroxychloroquine is the cornerstone medication — it reduces flares by ~50% and should never be stopped. Vitamin D deficiency is nearly universal and supplementation is important. ~40% of patients report perimenstrual flares. Kidney involvement affects up to 50% of patients — urine monitoring matters. Sun protection is not optional, it is a core part of treatment. Use warm, gentle language. Say "butterfly mark" not "malar rash." Be encouraging and remind the user that lupus is manageable with consistent care.`,
    symptomTriggerPhrases: ['pain', 'joints', 'rash', 'tired', 'exhausted', 'fatigue', 'sun', 'hair', 'sores', 'foggy', 'headache', 'swelling', 'puffy', 'chest', 'breathing', 'fever', 'cold fingers'],
    followUpQuestions: ['How is your energy compared to yesterday?', 'Did you get any sun exposure today?', 'Are any joints swollen or stiff?', 'How is your skin looking today?', 'Have you been remembering your hydroxychloroquine?'],
  },

  experimentTemplates: [
    { title: 'Does strict sun protection reduce flares?', hypothesis: 'Consistent SPF 50+ and UV-protective clothing will reduce skin and systemic flare frequency', variable: 'sun_protection', baselineDays: 14, interventionDays: 28 },
    { title: 'Does vitamin D supplementation help?', hypothesis: 'Daily vitamin D supplementation (with doctor guidance) will improve fatigue and overall activity score', variable: 'vitamin_d_supplementation', baselineDays: 14, interventionDays: 28 },
    { title: 'Does stress management reduce symptoms?', hypothesis: 'Daily stress-reduction practice (meditation, breathing, gentle yoga) will lower symptom scores', variable: 'stress_management', baselineDays: 14, interventionDays: 21 },
    { title: 'Does omega-3 supplementation reduce joint pain?', hypothesis: 'Daily omega-3 intake will reduce joint pain and stiffness scores', variable: 'omega3_supplementation', baselineDays: 14, interventionDays: 28 },
    { title: 'Does sleep quality affect next-day fatigue?', hypothesis: 'Nights with 7+ hours of sleep will be followed by lower fatigue scores', variable: 'sleep_quality_observation', baselineDays: 14, interventionDays: 14 },
  ],
};
