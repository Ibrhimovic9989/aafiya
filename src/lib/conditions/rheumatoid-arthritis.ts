import type { ConditionProfile } from './types';

export const rheumatoidArthritisProfile: ConditionProfile = {
  id: 'rheumatoid_arthritis',
  name: 'Rheumatoid Arthritis',
  shortName: 'RA',
  category: 'rheumatic',
  description: 'A chronic autoimmune condition where the immune system mistakenly attacks the lining of the joints, causing pain, swelling, and stiffness — most often in the hands, wrists, and feet.',
  icon: '🦴',

  scoring: {
    name: 'DAS28',
    fullName: 'Disease Activity Score 28 Joints (Simplified)',
    maxScore: 10,
    components: [
      { id: 'tenderJoints', label: 'Tender Joints', description: 'How many joints feel sore or tender when you press on them?', type: 'count', min: 0, max: 28 },
      { id: 'swollenJoints', label: 'Swollen Joints', description: 'How many joints look or feel swollen today?', type: 'count', min: 0, max: 28 },
      { id: 'morningStiffness', label: 'Morning Stiffness', description: 'How long did your morning stiffness last today (in minutes)?', type: 'count', min: 0, max: 180 },
      { id: 'overallPain', label: 'Overall Pain', description: 'How would you rate your overall joint pain?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'No pain' }, { value: 2, label: 'Mild' }, { value: 5, label: 'Moderate' }, { value: 7, label: 'Severe' }, { value: 10, label: 'Worst imaginable' },
      ]},
      { id: 'fatigue', label: 'Fatigue', description: 'How tired or drained do you feel?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'Full of energy' }, { value: 2, label: 'A little tired' }, { value: 5, label: 'Quite tired' }, { value: 7, label: 'Very tired' }, { value: 10, label: 'Completely exhausted' },
      ]},
    ],
    severityLevels: [
      { id: 'remission', label: 'Remission', range: [0, 2.5], color: 'text-sage-dark', bgColor: 'bg-sage-light' },
      { id: 'low', label: 'Low Activity', range: [2.6, 3.2], color: 'text-risk-watch', bgColor: 'bg-yellow-100' },
      { id: 'moderate', label: 'Moderate Activity', range: [3.3, 5.1], color: 'text-coral', bgColor: 'bg-coral/20' },
      { id: 'high', label: 'High Activity', range: [5.2, 10], color: 'text-rose-dark', bgColor: 'bg-rose/20' },
    ],
  },

  symptoms: {
    coreSymptoms: [
      { id: 'jointPain', label: 'Joint Pain', gentleLabel: 'How much are your joints hurting?', type: 'scale', min: 0, max: 10 },
      { id: 'jointSwelling', label: 'Joint Swelling', gentleLabel: 'How swollen do your joints feel?', type: 'scale', min: 0, max: 10 },
      { id: 'morningStiffness', label: 'Morning Stiffness', gentleLabel: 'How long were your joints stiff this morning?', type: 'count', min: 0, max: 180, unit: 'minutes' },
      { id: 'fatigue', label: 'Fatigue', gentleLabel: 'How tired or drained are you feeling?', type: 'scale', min: 0, max: 10 },
      { id: 'gripStrength', label: 'Grip Strength', gentleLabel: 'How is your grip strength today?', type: 'scale', min: 0, max: 10 },
      { id: 'jointWarmth', label: 'Joint Warmth', gentleLabel: 'Do any of your joints feel warm to the touch?', type: 'select', options: [
        { value: 'none', label: 'None' }, { value: 'mild', label: 'A little warm' }, { value: 'moderate', label: 'Noticeably warm' }, { value: 'severe', label: 'Very warm and red' },
      ]},
    ],
    complications: [
      { id: 'rheumatoidNodules', label: 'Rheumatoid Nodules', gentleLabel: 'Firm bumps under the skin near joints' },
      { id: 'dryEyes', label: 'Dry Eyes', gentleLabel: 'Dry, gritty, or irritated eyes' },
      { id: 'lungInvolvement', label: 'Lung Involvement', gentleLabel: 'Shortness of breath or dry cough' },
      { id: 'carpalTunnel', label: 'Carpal Tunnel', gentleLabel: 'Tingling or numbness in your hands' },
    ],
    customFields: [
      { id: 'tenderJointCount', label: 'Tender Joint Count', type: 'number', defaultValue: 0 },
      { id: 'swollenJointCount', label: 'Swollen Joint Count', type: 'number', defaultValue: 0 },
      { id: 'symmetricPattern', label: 'Symmetric Pattern', type: 'boolean', defaultValue: true },
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
      { id: 'weatherChange', label: 'Weather / Barometric Pressure Change', weight: 10 },
      { id: 'physicalOverexertion', label: 'Physical Overexertion', weight: 8 },
    ],
  },

  dietaryProfile: {
    riskFactors: [
      { name: 'Refined Sugar', mechanism: 'Increases C-reactive protein (CRP) and systemic inflammation, worsening joint swelling', severity: 'high', foods: ['soft drinks', 'sweets', 'pastries', 'packaged juices'] },
      { name: 'Processed Meat', mechanism: 'Contains advanced glycation end-products (AGEs) that drive inflammatory cytokines', severity: 'high', foods: ['bacon', 'sausage', 'deli meats', 'hot dogs'] },
      { name: 'Excess Alcohol', mechanism: 'Impairs immune regulation and may interact with RA medications like methotrexate', severity: 'high', foods: ['beer', 'wine', 'spirits'] },
      { name: 'Trans & Saturated Fats', mechanism: 'Promotes pro-inflammatory pathways including NF-kB activation', severity: 'moderate', foods: ['fried foods', 'margarine', 'fast food', 'palm oil'] },
      { name: 'Nightshades (Controversial)', mechanism: 'Some patients report worsening; solanine may affect joint inflammation in sensitive individuals', severity: 'low', foods: ['tomatoes', 'peppers', 'aubergine', 'potatoes'] },
    ],
    protectiveFactors: [
      { name: 'Omega-3 Fatty Acids', mechanism: 'Competes with arachidonic acid, reducing pro-inflammatory prostaglandins and leukotrienes', severity: 'high', foods: ['salmon', 'mackerel', 'sardines', 'flaxseed', 'walnuts'] },
      { name: 'Curcumin', mechanism: 'Inhibits NF-kB and TNF-alpha pathways; clinical evidence for reducing joint tenderness', severity: 'high', foods: ['turmeric', 'haldi doodh', 'golden milk', 'curry'] },
      { name: 'Extra Virgin Olive Oil', mechanism: 'Contains oleocanthal, a natural COX inhibitor with ibuprofen-like anti-inflammatory action', severity: 'high', foods: ['olive oil', 'olives'] },
      { name: 'Berries & Polyphenols', mechanism: 'Rich in anthocyanins that reduce oxidative stress and inflammatory markers', severity: 'moderate', foods: ['blueberries', 'strawberries', 'cherries', 'pomegranate'] },
      { name: 'Vitamin D', mechanism: 'Modulates immune response; deficiency is associated with higher RA disease activity', severity: 'moderate', foods: ['fortified milk', 'egg yolks', 'mushrooms', 'sunlight exposure'] },
    ],
    guidelines: [
      'A Mediterranean-style diet is one of the best-studied dietary patterns for RA — rich in fish, olive oil, vegetables, and whole grains',
      'Aim for at least two servings of fatty fish per week for omega-3 benefits',
      'Keep a food diary to identify personal triggers, especially if nightshades bother you',
      'Stay well-hydrated — dehydration can worsen joint stiffness',
      'Discuss alcohol intake with your rheumatologist, especially if you are on methotrexate',
    ],
    nutrientWarnings: [
      { nutrientName: 'Sugars, total', threshold: 25, unit: 'g', direction: 'above', warning: 'High sugar intake can increase inflammation markers like CRP', riskIncrease: 12 },
      { nutrientName: 'Fatty acids, total saturated', threshold: 15, unit: 'g', direction: 'above', warning: 'Saturated fat may worsen joint inflammation', riskIncrease: 10 },
      { nutrientName: 'Alcohol, ethyl', threshold: 0, unit: 'g', direction: 'above', warning: 'Alcohol can interact with RA medications and increase liver strain', riskIncrease: 15 },
      { nutrientName: 'Vitamin D (D2 + D3)', threshold: 600, unit: 'IU', direction: 'below', warning: 'Low vitamin D is linked to higher RA disease activity', riskIncrease: 8 },
    ],
  },

  cycleImpact: {
    hasImpact: true,
    prevalencePercent: 50,
    phases: [
      { phase: 'menstrual', riskMultiplier: 1.35, commonSymptoms: ['Increased morning stiffness', 'More joint tenderness', 'Worse fatigue'], mechanism: 'Estrogen drops to its lowest, reducing its natural anti-inflammatory effect. Prostaglandin release worsens joint pain alongside period pain.', tip: 'Be gentle with yourself — warm baths and gentle stretching can help both period and joint discomfort' },
      { phase: 'follicular', riskMultiplier: 0.85, commonSymptoms: ['Stiffness often improves', 'Better grip strength', 'More energy'], mechanism: 'Rising estrogen has anti-inflammatory and immunomodulatory effects, often reducing RA symptoms.', tip: 'A good window for gentle exercise and trying new activities — your joints tend to cooperate more' },
      { phase: 'ovulatory', riskMultiplier: 0.8, commonSymptoms: ['Often the best days', 'Less joint swelling', 'Better mobility'], mechanism: 'Peak estrogen provides maximum anti-inflammatory benefit. Many women with RA feel their best around ovulation.', tip: 'Enjoy the good days — this is often when your body feels its most comfortable' },
      { phase: 'luteal', riskMultiplier: 1.1, commonSymptoms: ['Mild increase in stiffness', 'Slight joint swelling', 'Fatigue creeping back'], mechanism: 'Progesterone rises while estrogen starts declining, shifting the immune balance toward more inflammation.', tip: 'Listen to your body and pace yourself — gentle movement is better than pushing through' },
      { phase: 'premenstrual', riskMultiplier: 1.3, commonSymptoms: ['Worsening joint pain', 'Increased stiffness', 'Low mood and fatigue'], mechanism: 'Rapid drop in both estrogen and progesterone triggers a pro-inflammatory shift. TNF-alpha and IL-6 levels rise.', tip: 'Prioritize rest and anti-inflammatory foods — this is not the time to push your limits' },
    ],
  },

  commonMedications: [
    { name: 'Methotrexate', class: 'csDMARD', description: 'Cornerstone treatment for RA — reduces inflammation and slows joint damage' },
    { name: 'Hydroxychloroquine', class: 'csDMARD', description: 'Mild immunomodulator, often used in combination with methotrexate' },
    { name: 'Sulfasalazine', class: 'csDMARD', description: 'Anti-inflammatory used alone or in combination therapy' },
    { name: 'Leflunomide', class: 'csDMARD', description: 'Alternative to methotrexate for patients who cannot tolerate it' },
    { name: 'Adalimumab', class: 'Anti-TNF Biologic', description: 'Self-injection biologic that blocks TNF-alpha' },
    { name: 'Etanercept', class: 'Anti-TNF Biologic', description: 'TNF receptor blocker given as a weekly injection' },
    { name: 'Tocilizumab', class: 'IL-6 Inhibitor', description: 'Biologic that blocks IL-6, a key driver of RA inflammation' },
    { name: 'Abatacept', class: 'T-cell Co-stimulation Blocker', description: 'Biologic that modulates T-cell activation' },
    { name: 'Rituximab', class: 'Anti-CD20 Biologic', description: 'B-cell depleting therapy for refractory RA' },
    { name: 'Tofacitinib', class: 'JAK Inhibitor', description: 'Oral small molecule that blocks JAK1 and JAK3 signaling' },
    { name: 'Baricitinib', class: 'JAK Inhibitor', description: 'Oral JAK1/JAK2 inhibitor for moderate-to-severe RA' },
    { name: 'Upadacitinib', class: 'JAK Inhibitor', description: 'Selective JAK1 inhibitor with strong efficacy data' },
  ],

  populationStats: [
    { stat: 'Methotrexate response rate', value: '60-70%', source: 'ACR/EULAR', context: 'Methotrexate helps most people — give it time to work (8-12 weeks for full effect)' },
    { stat: 'Cardiovascular risk increase', value: '2x higher than general population', source: 'Lancet Rheumatology', context: 'Heart health matters — managing inflammation protects your heart too' },
    { stat: 'Work disability at 10 years', value: '30-40% report some work limitation', source: 'OHDSI', context: 'Early aggressive treatment dramatically reduces this risk' },
    { stat: 'Remission on combination therapy', value: '40-50% achieve remission', source: 'ACR', context: 'Remission is a realistic goal with modern treatments' },
    { stat: 'Anti-CCP positive patients', value: '70-80% of RA patients', source: 'ACR', context: 'Anti-CCP helps confirm the diagnosis and predict disease course' },
    { stat: 'Pregnancy and RA improvement', value: '~60% improve during pregnancy', source: 'Annals of Rheumatic Diseases', context: 'Hormonal changes during pregnancy often calm RA — but plan with your rheumatologist' },
    { stat: 'Fatigue prevalence', value: '80% of RA patients', source: 'OHDSI', context: 'Fatigue is one of the most common and under-recognised RA symptoms — you are not imagining it' },
  ],

  emergencyProtocol: {
    severityQuestions: [
      { question: 'How swollen is the affected joint?', options: [
        { label: 'A little puffy', severity: 'mild' }, { label: 'Noticeably swollen', severity: 'moderate' }, { label: 'Very swollen and painful', severity: 'severe' }, { label: 'Sudden, extreme swelling with redness and heat', severity: 'emergency' },
      ]},
      { question: 'How is your pain right now?', options: [
        { label: 'Mild and manageable', severity: 'mild' }, { label: 'Moderate but I can cope', severity: 'moderate' }, { label: 'Severe and hard to bear', severity: 'severe' }, { label: 'Excruciating — I cannot move the joint at all', severity: 'emergency' },
      ]},
      { question: 'Do you have a fever?', options: [
        { label: 'No', severity: 'mild' }, { label: 'Low grade (below 38.5C)', severity: 'moderate' }, { label: 'High (above 38.5C)', severity: 'severe' },
      ]},
      { question: 'Are you experiencing any eye symptoms?', options: [
        { label: 'No', severity: 'mild' }, { label: 'Mild dryness or grittiness', severity: 'moderate' }, { label: 'Red, painful eye with sensitivity to light', severity: 'severe' }, { label: 'Sudden vision changes or severe eye pain', severity: 'emergency' },
      ]},
    ],
    immediateActions: [
      'Rest the affected joints — avoid pushing through severe pain',
      'Apply cold packs (wrapped in a cloth) to swollen joints for 15-20 minutes',
      'Take your prescribed medications — do not skip doses',
      'Gentle range-of-motion exercises if tolerable, but stop if pain worsens',
      'Track which joints are affected so you can share the pattern with your doctor',
    ],
    whenToCallDoctor: [
      'Flare symptoms have been worsening for more than 2-3 days despite medication',
      'New joints are becoming involved that were not affected before',
      'Morning stiffness is lasting longer than 1 hour and getting worse',
      'You notice new firm lumps (nodules) under the skin',
      'You are experiencing side effects from your medications (mouth sores, unusual bruising, persistent nausea)',
    ],
    whenToGoER: [
      'A single joint becomes suddenly, severely swollen, red, and hot — this could be septic arthritis and needs urgent assessment',
      'High fever (above 39C / 102F) especially if you are on immunosuppressive medications',
      'Sudden severe eye pain, redness, or vision changes (possible scleritis)',
      'Chest pain or significant shortness of breath (possible lung or cardiac involvement)',
      'Signs of serious medication reaction (severe mouth sores, unexplained bleeding, jaundice)',
    ],
    whatToTellER: [
      'Your RA diagnosis and how long you have had it',
      'All current medications, especially immunosuppressants and biologics',
      'Which joints are affected and when the sudden worsening began',
      'Your most recent blood work results (CRP, ESR, anti-CCP) if available',
      'Whether you have had any recent infections or fevers',
    ],
    doNotDo: [
      'Do NOT ignore a single hot, swollen joint with fever — septic arthritis is a medical emergency',
      'Do NOT stop methotrexate or biologics on your own without consulting your rheumatologist',
      'Do NOT apply heat to actively inflamed, hot, swollen joints — use cold instead',
      'Do NOT push through severe pain with vigorous exercise — gentle movement only',
    ],
    dietDuringFlare: [
      'Focus on anti-inflammatory foods: fatty fish, olive oil, turmeric, berries',
      'Avoid processed foods, refined sugar, and excess red meat during flares',
      'Stay well-hydrated — dehydration can worsen stiffness',
      'Warm bone broth can be soothing and provides collagen and minerals',
      'Small, balanced meals are better than large heavy ones when you are flaring',
    ],
  },

  aiContext: {
    gentleLanguage: {
      'rheumatoid arthritis': 'your condition',
      'articular inflammation': 'stiff joints',
      'synovitis': 'joint swelling',
      'erosion': 'joint changes',
      'deformity': 'joint changes over time',
      'autoimmune': 'your immune system being overactive',
      'flare': 'a rough patch',
      'disease activity': 'how your joints are feeling',
      'disability': 'difficulty with daily activities',
      'joint destruction': 'joint changes',
    },
    avoidTerms: ['crippling', 'deformity', 'destruction', 'disability', 'degenerative', 'erosive disease', 'joint destruction', 'crippled', 'invalid'],
    systemPromptContext: `The user has rheumatoid arthritis. Key pathways: TNF-alpha (primary inflammatory driver), IL-6 (drives CRP and systemic inflammation), RANKL (bone erosion), citrullination (anti-CCP antibodies target citrullinated proteins). Methotrexate is the cornerstone DMARD with 60-70% response rate. RA carries 2x cardiovascular risk due to chronic inflammation. ~50% of women report menstrual-related worsening, and ~60% improve during pregnancy. Morning stiffness duration is a key disease activity marker. Anti-CCP antibodies are highly specific for RA. The DAS28 score guides treatment decisions. Omega-3 fatty acids and curcumin have the strongest dietary evidence.`,
    symptomTriggerPhrases: ['stiff', 'sore joints', 'swollen', 'pain', 'tired', 'fatigue', 'grip', 'morning stiffness', 'hands hurt', 'wrists', 'knees', 'aching', 'flare', 'can\'t open', 'hard to hold', 'fingers'],
    followUpQuestions: ['How long did your morning stiffness last today?', 'Which joints are bothering you the most?', 'How is your grip strength — can you open jars easily?', 'How is your energy level?', 'Have you noticed any new swelling?'],
  },

  experimentTemplates: [
    { title: 'Does omega-3 reduce morning stiffness?', hypothesis: 'Daily omega-3 supplementation will reduce the duration of morning stiffness', variable: 'omega3_supplementation', baselineDays: 14, interventionDays: 28 },
    { title: 'Does cold or heat therapy help joint pain?', hypothesis: 'Applying cold packs to inflamed joints will reduce pain scores', variable: 'cold_therapy', baselineDays: 7, interventionDays: 14 },
    { title: 'Does stress affect joint swelling?', hypothesis: 'Days with high stress will be followed by increased joint swelling within 48 hours', variable: 'stress_observation', baselineDays: 14, interventionDays: 14 },
    { title: 'Does gentle morning yoga reduce stiffness?', hypothesis: 'A 10-minute gentle stretching routine will shorten morning stiffness duration', variable: 'morning_stretching', baselineDays: 7, interventionDays: 14 },
    { title: 'Does turmeric/curcumin reduce joint tenderness?', hypothesis: 'Daily curcumin supplementation will lower tender joint count', variable: 'curcumin_supplementation', baselineDays: 14, interventionDays: 28 },
  ],
};
