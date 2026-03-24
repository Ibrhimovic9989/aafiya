import type { ConditionProfile } from './types';

export const ankylosingSpondylitisProfile: ConditionProfile = {
  id: 'ankylosing_spondylitis',
  name: 'Ankylosing Spondylitis',
  shortName: 'AS',
  category: 'rheumatic',
  description: 'A chronic inflammatory condition primarily affecting the spine and sacroiliac joints, causing pain, stiffness, and potentially spinal fusion over time.',
  icon: '🦴',

  scoring: {
    name: 'BASDAI',
    fullName: 'Bath Ankylosing Spondylitis Disease Activity Index',
    maxScore: 10,
    components: [
      { id: 'fatigue', label: 'Fatigue', description: 'How tired have you been overall?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'No fatigue' }, { value: 2, label: 'Mild' }, { value: 5, label: 'Moderate' }, { value: 7, label: 'Significant' }, { value: 10, label: 'Extreme fatigue' },
      ]},
      { id: 'spinalPain', label: 'Spinal Pain', description: 'How much neck, back, or hip pain have you had?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'None' }, { value: 2, label: 'Mild' }, { value: 5, label: 'Moderate' }, { value: 7, label: 'Significant' }, { value: 10, label: 'Very severe' },
      ]},
      { id: 'peripheralPain', label: 'Joint Pain/Swelling', description: 'How much pain or swelling in joints other than your spine?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'None' }, { value: 2, label: 'Mild' }, { value: 5, label: 'Moderate' }, { value: 7, label: 'Significant' }, { value: 10, label: 'Very severe' },
      ]},
      { id: 'enthesitis', label: 'Tenderness', description: 'How much discomfort from areas tender to touch or pressure?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'None' }, { value: 2, label: 'Mild' }, { value: 5, label: 'Moderate' }, { value: 7, label: 'Significant' }, { value: 10, label: 'Very severe' },
      ]},
      { id: 'morningStiffnessDuration', label: 'Morning Stiffness Duration', description: 'How long does your morning stiffness last?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'None' }, { value: 2, label: '15-30 minutes' }, { value: 5, label: '30-60 minutes' }, { value: 7, label: '1-2 hours' }, { value: 10, label: '2+ hours' },
      ]},
      { id: 'morningStiffnessSeverity', label: 'Morning Stiffness Severity', description: 'How severe is your morning stiffness?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'None' }, { value: 2, label: 'Mild' }, { value: 5, label: 'Moderate' }, { value: 7, label: 'Significant' }, { value: 10, label: 'Very severe' },
      ]},
    ],
    severityLevels: [
      { id: 'controlled', label: 'Controlled', range: [0, 3], color: 'text-sage-dark', bgColor: 'bg-sage-light' },
      { id: 'active', label: 'Active Disease', range: [4, 6], color: 'text-risk-watch', bgColor: 'bg-yellow-100' },
      { id: 'very_active', label: 'Very Active', range: [7, 8], color: 'text-coral', bgColor: 'bg-coral/20' },
      { id: 'severe', label: 'Severe Activity', range: [9, 10], color: 'text-rose-dark', bgColor: 'bg-rose/20' },
    ],
  },

  symptoms: {
    coreSymptoms: [
      { id: 'backPain', label: 'Back Pain', gentleLabel: 'How is your back feeling?', type: 'scale', min: 0, max: 10 },
      { id: 'morningStiffness', label: 'Morning Stiffness', gentleLabel: 'How stiff were you this morning?', type: 'scale', min: 0, max: 10 },
      { id: 'spinalMobility', label: 'Spinal Mobility', gentleLabel: 'How easily can you move and bend?', type: 'scale', min: 0, max: 10 },
      { id: 'fatigue', label: 'Fatigue', gentleLabel: 'How tired are you?', type: 'scale', min: 0, max: 10 },
      { id: 'enthesitis', label: 'Enthesitis', gentleLabel: 'Any tenderness where tendons meet bone? (heel, ribs)', type: 'scale', min: 0, max: 10 },
      { id: 'peripheralJoints', label: 'Peripheral Joints', gentleLabel: 'Any pain in other joints (knees, shoulders)?', type: 'scale', min: 0, max: 10 },
    ],
    complications: [
      { id: 'anterior_uveitis', label: 'Anterior Uveitis', gentleLabel: 'Eye redness, pain, or light sensitivity' },
      { id: 'ibd_symptoms', label: 'IBD Symptoms', gentleLabel: 'Tummy symptoms (gut inflammation overlap)' },
      { id: 'chest_restriction', label: 'Chest Restriction', gentleLabel: 'Difficulty taking a deep breath' },
      { id: 'heel_pain', label: 'Heel Pain', gentleLabel: 'Pain at the back of your heel' },
      { id: 'rib_pain', label: 'Rib/Chest Pain', gentleLabel: 'Pain around your ribs' },
    ],
    customFields: [
      { id: 'stiffnessDurationMinutes', label: 'Morning Stiffness (minutes)', type: 'number', defaultValue: 0 },
      { id: 'exerciseCompleted', label: 'Exercise Done Today', type: 'boolean', defaultValue: false },
      { id: 'nightPainWoke', label: 'Woke From Pain', type: 'boolean', defaultValue: false },
    ],
  },

  flareWeights: {
    symptomTrend: 30,
    circadianDisruption: 15,
    dietaryRisk: 10,
    menstrualPhase: 5,
    stressMood: 15,
    medicationAdherence: 15,
    mealTiming: 5,
    customFactors: [
      { id: 'physicalInactivity', label: 'Physical inactivity', weight: 15 },
      { id: 'prolongedSitting', label: 'Prolonged sitting/immobility', weight: 10 },
    ],
  },

  dietaryProfile: {
    riskFactors: [
      { name: 'High Starch (London AS Diet theory)', mechanism: 'Proposed link between starch, Klebsiella bacteria, and AS inflammation — evidence is limited but some patients report benefit from reduction', severity: 'moderate', foods: ['bread', 'potatoes', 'pasta', 'rice', 'cereals'] },
      { name: 'Processed Foods', mechanism: 'Promotes systemic inflammation and gut dysbiosis', severity: 'moderate', foods: ['processed snacks', 'fast food', 'packaged meals'] },
      { name: 'Excess Sugar', mechanism: 'Drives inflammatory pathways and worsens fatigue', severity: 'moderate', foods: ['soft drinks', 'sweets', 'pastries'] },
      { name: 'Alcohol (excess)', mechanism: 'Increases gut permeability and systemic inflammation', severity: 'moderate', foods: ['beer', 'wine', 'spirits'] },
    ],
    protectiveFactors: [
      { name: 'Omega-3 Fatty Acids', mechanism: 'Reduces inflammatory cytokines (TNF-alpha, IL-1) that drive AS', severity: 'high', foods: ['salmon', 'mackerel', 'sardines', 'flaxseed', 'walnuts'] },
      { name: 'Vitamin D', mechanism: 'Immune modulator — AS patients frequently deficient, supplementation may reduce disease activity', severity: 'high', foods: ['fatty fish', 'egg yolks', 'fortified foods', 'sunlight'] },
      { name: 'Anti-inflammatory Spices', mechanism: 'Natural COX and NF-kB inhibitors', severity: 'moderate', foods: ['turmeric', 'ginger', 'garlic'] },
      { name: 'Probiotics', mechanism: 'Supports gut health, which is closely linked to AS activity', severity: 'moderate', foods: ['yogurt', 'kefir', 'kimchi', 'sauerkraut'] },
    ],
    guidelines: [
      'Focus on anti-inflammatory foods — fruits, vegetables, fish, and healthy fats',
      'Some patients find benefit from reducing starch (London AS Diet), but evidence is limited — try it as a personal experiment',
      'Stay well-hydrated to support joint and spinal health',
      'Ensure adequate calcium and vitamin D for bone health',
      'Maintain a healthy weight to reduce mechanical stress on joints',
    ],
    nutrientWarnings: [
      { nutrientName: 'Vitamin D (D2 + D3)', threshold: 15, unit: 'mcg', direction: 'below', warning: 'Low vitamin D is common in AS and may worsen disease activity', riskIncrease: 10 },
      { nutrientName: 'Calcium, Ca', threshold: 800, unit: 'mg', direction: 'below', warning: 'Adequate calcium is important for bone health in AS', riskIncrease: 5 },
      { nutrientName: 'Alcohol, ethyl', threshold: 14, unit: 'g', direction: 'above', warning: 'Excess alcohol increases inflammation', riskIncrease: 8 },
    ],
  },

  cycleImpact: {
    hasImpact: true,
    prevalencePercent: 30,
    phases: [
      { phase: 'menstrual', riskMultiplier: 1.2, commonSymptoms: ['Increased back pain', 'Worse stiffness', 'More fatigue'], mechanism: 'Low estrogen reduces its protective anti-inflammatory effects on joints and spine.', tip: 'Gentle stretching and heat packs can help both period pain and back stiffness' },
      { phase: 'follicular', riskMultiplier: 0.9, commonSymptoms: ['Symptoms often ease', 'Better mobility'], mechanism: 'Rising estrogen provides anti-inflammatory benefit.', tip: 'A good time to be more active with your exercise routine' },
      { phase: 'ovulatory', riskMultiplier: 0.9, commonSymptoms: ['Generally stable', 'Good energy'], mechanism: 'Peak estrogen supports anti-inflammatory state.', tip: 'Make the most of this phase for physical activity' },
      { phase: 'luteal', riskMultiplier: 1.05, commonSymptoms: ['Mild increase in stiffness', 'Slight fatigue'], mechanism: 'Progesterone can cause mild fluid retention and joint stiffness.', tip: 'Keep up with your stretches and stay hydrated' },
      { phase: 'premenstrual', riskMultiplier: 1.15, commonSymptoms: ['More stiffness', 'Increased pain', 'Lower mood'], mechanism: 'Dropping estrogen and progesterone may increase pain sensitivity.', tip: 'Be gentle with yourself — warm baths and rest are good choices' },
    ],
  },

  commonMedications: [
    { name: 'Naproxen', class: 'NSAID', description: 'First-line treatment — reduces pain and stiffness' },
    { name: 'Indomethacin', class: 'NSAID', description: 'Effective NSAID for AS, especially for night pain' },
    { name: 'Celecoxib', class: 'NSAID (COX-2)', description: 'Selective NSAID, may be gentler on the stomach' },
    { name: 'Sulfasalazine', class: 'DMARD', description: 'For peripheral joint involvement' },
    { name: 'Adalimumab', class: 'Anti-TNF Biologic', description: 'Biologic for active disease not responding to NSAIDs' },
    { name: 'Secukinumab', class: 'IL-17A Inhibitor', description: 'Biologic targeting IL-17, effective for spinal disease' },
    { name: 'Ixekizumab', class: 'IL-17A Inhibitor', description: 'Alternative IL-17 biologic' },
    { name: 'Tofacitinib', class: 'JAK Inhibitor', description: 'Oral small molecule for active AS' },
    { name: 'Upadacitinib', class: 'JAK Inhibitor', description: 'Selective JAK1 inhibitor' },
  ],

  populationStats: [
    { stat: 'Prevalence', value: '0.1-0.5% of population', source: 'SAA', context: 'AS is more common than many people realize' },
    { stat: 'Average diagnosis delay', value: '7-10 years', source: 'ASAS', context: 'A long road to diagnosis is unfortunately very common — you are not alone' },
    { stat: 'HLA-B27 positive', value: '~90% of AS patients', source: 'ASAS', context: 'The genetic link is strong, but HLA-B27 alone does not cause AS' },
    { stat: 'Anterior uveitis occurrence', value: '25-40% of patients', source: 'SAA', context: 'Eye symptoms should always be checked promptly' },
    { stat: 'Exercise benefit', value: 'Reduces BASDAI by 1-2 points', source: 'Cochrane', context: 'Regular movement is one of the most effective treatments' },
    { stat: 'NSAID response rate', value: '70-80%', source: 'ASAS', context: 'NSAIDs are genuinely effective for AS, unlike many other autoimmune conditions' },
  ],

  emergencyProtocol: {
    severityQuestions: [
      { question: 'How severe is your back or spine pain?', options: [
        { label: 'Mild, manageable', severity: 'mild' }, { label: 'Moderate, limiting activity', severity: 'moderate' }, { label: 'Severe, very limiting', severity: 'severe' }, { label: 'Sudden severe pain, especially after trauma', severity: 'emergency' },
      ]},
      { question: 'Are you having any eye symptoms?', options: [
        { label: 'No', severity: 'mild' }, { label: 'Mild irritation', severity: 'moderate' }, { label: 'Red, painful, or light-sensitive', severity: 'severe' }, { label: 'Sudden vision change or severe eye pain', severity: 'emergency' },
      ]},
      { question: 'How is your mobility?', options: [
        { label: 'Normal for me', severity: 'mild' }, { label: 'More limited than usual', severity: 'moderate' }, { label: 'Significantly restricted', severity: 'severe' }, { label: 'Cannot move my spine at all', severity: 'emergency' },
      ]},
      { question: 'Any chest pain or breathing difficulty?', options: [
        { label: 'No', severity: 'mild' }, { label: 'Mild chest tightness', severity: 'moderate' }, { label: 'Difficulty taking deep breaths', severity: 'severe' }, { label: 'Chest pain at rest', severity: 'emergency' },
      ]},
    ],
    immediateActions: [
      'Apply heat to stiff, painful areas (warm bath, heat packs)',
      'Gentle stretching if tolerable — movement helps AS more than rest',
      'Take your prescribed NSAIDs or pain relief',
      'Avoid prolonged sitting or lying in one position',
      'Track your symptoms to share with your doctor',
    ],
    whenToCallDoctor: [
      'Your usual medications are not controlling your pain',
      'Morning stiffness is lasting significantly longer than usual',
      'You notice new or worsening symptoms',
      'You are having recurring eye redness or pain',
      'Your mobility is decreasing over time',
    ],
    whenToGoER: [
      'Sudden severe spinal pain, especially after a fall or impact — fused spines are fracture-prone',
      'Acute eye pain with redness and light sensitivity (anterior uveitis is an eye emergency)',
      'Chest pain that does not feel like your usual rib stiffness',
      'Sudden numbness or weakness in your legs',
      'Signs of cauda equina syndrome (loss of bladder/bowel control)',
    ],
    whatToTellER: [
      'That you have ankylosing spondylitis',
      'Whether your spine is partially or fully fused',
      'Your current medications, especially NSAIDs and biologics',
      'When the new symptoms started',
    ],
    doNotDo: [
      'Do NOT stay completely still — gentle movement is usually better than total rest for AS',
      'Do NOT ignore eye symptoms — uveitis needs urgent treatment to prevent vision damage',
      'Do NOT attempt forceful stretching or manipulation of a stiff spine',
      'Do NOT stop your biologic without talking to your doctor',
    ],
    dietDuringFlare: [
      'Focus on anti-inflammatory foods: fish, olive oil, vegetables, fruits',
      'Stay well-hydrated',
      'Consider omega-3 supplementation if not already taking it',
      'Avoid excess alcohol and processed foods',
      'Warm, easy-to-prepare meals — you need your energy for healing',
    ],
  },

  aiContext: {
    gentleLanguage: {
      'ankylosing spondylitis': 'your back condition',
      'spondylitis': 'spinal inflammation',
      'ankylosis': 'stiffening',
      'fusion': 'stiffening of the spine',
      'enthesitis': 'tenderness where tendons meet bone',
      'sacroiliitis': 'lower back inflammation',
      'uveitis': 'eye inflammation',
      'kyphosis': 'forward curvature',
    },
    avoidTerms: ['ankylosing spondylitis', 'ankylosis', 'fusion', 'deformity', 'kyphosis', 'sacroiliitis', 'spondyloarthropathy'],
    systemPromptContext: `The user has ankylosing spondylitis. Key pathways: HLA-B27 (genetic), IL-17/IL-23 axis, TNF-alpha, entheseal inflammation. NSAIDs are first-line (unlike IBD where they are avoided). Movement and exercise are critical — inactivity worsens symptoms. Morning stiffness improving with movement is the hallmark pattern. ~25-40% develop anterior uveitis. Fused spines are at high fracture risk. The London AS Diet (low starch) has anecdotal support but limited evidence.`,
    symptomTriggerPhrases: ['back pain', 'stiff', 'stiffness', 'spine', 'hip', 'eye', 'red eye', 'heel', 'tired', 'fatigue', 'can\'t bend', 'morning', 'ache', 'ribs'],
    followUpQuestions: ['How long did your morning stiffness last today?', 'Were you able to do any exercise?', 'Any eye redness or sensitivity?', 'Did pain wake you up at night?'],
  },

  experimentTemplates: [
    { title: 'Does daily exercise reduce my BASDAI?', hypothesis: 'Consistent daily stretching/exercise reduces disease activity', variable: 'daily_exercise', baselineDays: 14, interventionDays: 28 },
    { title: 'Does a low-starch diet help?', hypothesis: 'Reducing starch intake reduces spinal pain and stiffness', variable: 'low_starch_diet', baselineDays: 14, interventionDays: 28 },
    { title: 'Does morning stretching reduce stiffness?', hypothesis: 'A 15-minute morning stretching routine reduces stiffness duration', variable: 'morning_stretches', baselineDays: 7, interventionDays: 14 },
    { title: 'Does omega-3 improve symptoms?', hypothesis: 'Daily omega-3 supplementation reduces pain and stiffness', variable: 'omega3_supplementation', baselineDays: 14, interventionDays: 28 },
    { title: 'Does heat therapy before bed improve sleep?', hypothesis: 'A warm bath before bed reduces night pain and improves sleep', variable: 'heat_therapy', baselineDays: 7, interventionDays: 14 },
  ],
};
