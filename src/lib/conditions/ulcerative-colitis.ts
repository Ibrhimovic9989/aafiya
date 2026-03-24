import type { ConditionProfile } from './types';

export const ulcerativeColitisProfile: ConditionProfile = {
  id: 'ulcerative_colitis',
  name: 'Ulcerative Colitis',
  shortName: 'UC',
  category: 'gastrointestinal',
  description: 'Inflammatory bowel disease causing continuous inflammation and ulcers in the innermost lining of the large intestine and rectum.',
  icon: '🫄',

  scoring: {
    name: 'SCCAI',
    fullName: 'Simple Clinical Colitis Activity Index',
    maxScore: 19,
    components: [
      { id: 'bowelFrequencyDay', label: 'Daytime Loo Visits', description: 'How many times did you go to the loo during the day?', type: 'scale', min: 0, max: 3, options: [
        { value: 0, label: '1-3 times' }, { value: 1, label: '4-6 times' }, { value: 2, label: '7-9 times' }, { value: 3, label: 'More than 9' },
      ]},
      { id: 'bowelFrequencyNight', label: 'Nighttime Loo Visits', description: 'How many times did you wake up to go at night?', type: 'scale', min: 0, max: 2, options: [
        { value: 0, label: 'None' }, { value: 1, label: '1-3 times' }, { value: 2, label: '4 or more' },
      ]},
      { id: 'urgency', label: 'Urgency', description: 'How urgently did you need to go?', type: 'scale', min: 0, max: 3, options: [
        { value: 0, label: 'No rush' }, { value: 1, label: 'Need to hurry' }, { value: 2, label: 'Have to go right away' }, { value: 3, label: 'Had an accident' },
      ]},
      { id: 'bloodInStool', label: 'Blood When You Go', description: 'Any blood when you go to the loo?', type: 'scale', min: 0, max: 3, options: [
        { value: 0, label: 'None' }, { value: 1, label: 'A trace' }, { value: 2, label: 'Sometimes more than a trace' }, { value: 3, label: 'Usually a lot' },
      ]},
      { id: 'generalWellbeing', label: 'General Well-being', description: 'How are you feeling overall today?', type: 'scale', min: 0, max: 4, options: [
        { value: 0, label: 'Very well' }, { value: 1, label: 'Slightly below par' }, { value: 2, label: 'Poor' }, { value: 3, label: 'Very poor' }, { value: 4, label: 'Terrible' },
      ]},
      { id: 'extracolonicFeatures', label: 'Other Symptoms', description: 'Any of these today?', type: 'checklist', min: 0, max: 4, checklistItems: [
        { id: 'arthralgia', label: 'Joint aches' },
        { id: 'uveitis', label: 'Eye irritation' },
        { id: 'erythema_nodosum', label: 'Skin bumps/nodules' },
        { id: 'pyoderma_gangrenosum', label: 'Skin ulcers' },
      ]},
    ],
    severityLevels: [
      { id: 'remission', label: 'Remission', range: [0, 2], color: 'text-sage-dark', bgColor: 'bg-sage-light' },
      { id: 'mild', label: 'Mild Activity', range: [3, 5], color: 'text-risk-watch', bgColor: 'bg-yellow-100' },
      { id: 'moderate', label: 'Moderate Activity', range: [6, 11], color: 'text-coral', bgColor: 'bg-coral/20' },
      { id: 'severe', label: 'Severe Activity', range: [12, 19], color: 'text-rose-dark', bgColor: 'bg-rose/20' },
    ],
    estimateFormula: { name: 'Mayo (estimated)', calculate: (sccai: number) => Math.min(12, Math.round(sccai * 0.65)) },
  },

  symptoms: {
    coreSymptoms: [
      { id: 'bloodyDiarrhea', label: 'Bloody Diarrhea', gentleLabel: 'Any blood when you go to the loo?', type: 'select', options: [
        { value: 'none', label: 'None' }, { value: 'trace', label: 'A little' }, { value: 'moderate', label: 'Some' }, { value: 'severe', label: 'A lot' },
      ]},
      { id: 'bowelFrequency', label: 'Bowel Frequency', gentleLabel: 'How many times did you go to the loo?', type: 'count', min: 0, max: 30 },
      { id: 'urgency', label: 'Urgency', gentleLabel: 'How urgently did you need to go?', type: 'scale', min: 0, max: 10 },
      { id: 'tummyPain', label: 'Abdominal Pain', gentleLabel: 'How much does your tummy hurt?', type: 'scale', min: 0, max: 10 },
      { id: 'fatigue', label: 'Fatigue', gentleLabel: 'How tired are you?', type: 'scale', min: 0, max: 10 },
      { id: 'tenesmus', label: 'Tenesmus', gentleLabel: 'Do you feel like you need to go but nothing comes?', type: 'scale', min: 0, max: 10 },
    ],
    complications: [
      { id: 'arthralgia', label: 'Joint Pain', gentleLabel: 'Joint aches' },
      { id: 'uveitis', label: 'Eye Inflammation', gentleLabel: 'Eye irritation/redness' },
      { id: 'erythema_nodosum', label: 'Skin Nodules', gentleLabel: 'Skin bumps' },
      { id: 'pyoderma_gangrenosum', label: 'Skin Ulcers', gentleLabel: 'Skin ulcers' },
      { id: 'aphthous_ulcers', label: 'Mouth Ulcers', gentleLabel: 'Mouth sores' },
      { id: 'primary_sclerosing_cholangitis', label: 'Liver Inflammation', gentleLabel: 'Liver-related discomfort' },
      { id: 'anemia', label: 'Anemia', gentleLabel: 'Feeling lightheaded or very pale' },
    ],
    customFields: [
      { id: 'stoolConsistency', label: 'Stool Consistency', type: 'number', defaultValue: 4 },
      { id: 'nighttimeWaking', label: 'Nighttime Waking', type: 'number', defaultValue: 0 },
      { id: 'incontinence', label: 'Accidents', type: 'boolean', defaultValue: false },
    ],
  },

  flareWeights: {
    symptomTrend: 25,
    circadianDisruption: 18,
    dietaryRisk: 17,
    menstrualPhase: 15,
    stressMood: 12,
    medicationAdherence: 10,
    mealTiming: 3,
    customFactors: [
      { id: 'sulfiteExposure', label: 'Sulfite Exposure', weight: 8 },
    ],
  },

  dietaryProfile: {
    riskFactors: [
      { name: 'Sulfites', mechanism: 'Toxic to colonocytes and impair butyrate oxidation, especially harmful in UC', severity: 'high', foods: ['dried fruit', 'wine', 'processed meats', 'packaged juices'] },
      { name: 'Emulsifiers', mechanism: 'Strips the protective mucus layer lining the colon', severity: 'high', foods: ['processed foods', 'ice cream', 'instant noodles', 'packaged sauces'] },
      { name: 'Lactose', mechanism: 'Malabsorbed in many UC patients, worsens bloating and loose motions', severity: 'high', foods: ['milk', 'ice cream', 'soft cheese'] },
      { name: 'Carrageenan', mechanism: 'Triggers colonic inflammation even at low doses', severity: 'high', foods: ['ice cream', 'almond milk', 'processed dairy'] },
      { name: 'Alcohol', mechanism: 'Directly irritates the colon lining and increases permeability', severity: 'high', foods: ['beer', 'wine', 'spirits'] },
      { name: 'Refined Sugar', mechanism: 'Promotes pathogenic bacteria and worsens colonic inflammation', severity: 'moderate', foods: ['soft drinks', 'sweets', 'packaged juices'] },
      { name: 'Insoluble Fiber (during flare)', mechanism: 'Scratches inflamed colon lining and worsens bleeding', severity: 'moderate', foods: ['raw vegetables', 'popcorn', 'whole wheat bran', 'seeds'] },
      { name: 'Spicy Food', mechanism: 'Contains capsaicin which can irritate an inflamed colon', severity: 'moderate', foods: ['chili', 'hot sauce', 'spicy curries'] },
      { name: 'Caffeine (excess)', mechanism: 'Stimulates the colon and increases urgency', severity: 'low', foods: ['coffee', 'energy drinks', 'strong tea'] },
    ],
    protectiveFactors: [
      { name: 'Butyric Acid', mechanism: '#1 remission-associated compound, primary fuel for colonocytes — especially critical in UC', severity: 'high', foods: ['ghee', 'butter', 'parmesan'] },
      { name: 'Curcumin', mechanism: 'Natural anti-inflammatory, clinical evidence for maintaining UC remission', severity: 'high', foods: ['turmeric', 'haldi doodh', 'curry'] },
      { name: 'Soluble Fiber (in remission)', mechanism: 'Fermented into butyrate by gut bacteria, feeds colonocytes', severity: 'high', foods: ['oats', 'bananas', 'peeled apples', 'psyllium husk'] },
      { name: 'Omega-3 (EPA/DHA)', mechanism: 'Anti-inflammatory fatty acids that reduce colonic inflammation', severity: 'moderate', foods: ['salmon', 'sardines', 'flaxseed', 'walnuts'] },
      { name: 'EGCG', mechanism: 'Protects gut tight junctions and reduces oxidative stress in the colon', severity: 'moderate', foods: ['green tea'] },
      { name: 'Probiotics (E. coli Nissle)', mechanism: 'Clinically shown to maintain UC remission comparable to mesalamine', severity: 'moderate', foods: ['specific probiotic supplements', 'yogurt', 'kefir'] },
      { name: 'Gingerol', mechanism: 'COX-2 inhibitor, soothes colonic inflammation', severity: 'moderate', foods: ['ginger', 'ginger tea'] },
    ],
    guidelines: [
      'Eat small, frequent meals rather than large ones',
      'Keep a food diary to identify your personal triggers',
      'During flares, prefer cooked and peeled vegetables over raw ones',
      'Stay well-hydrated — loose motions can cause dehydration quickly',
      'Soluble fiber (oats, bananas) is your friend in remission; avoid insoluble fiber (bran, seeds) during flares',
      'Sulfites are particularly harmful for UC — check labels for sulfur dioxide and sodium bisulfite',
      'Consider a low-FODMAP trial if bloating is an issue',
    ],
    nutrientWarnings: [
      { nutrientName: 'Sulfite', threshold: 1, unit: 'mg', direction: 'above', warning: 'Contains sulfites which can be especially harmful for your colon', riskIncrease: 18 },
      { nutrientName: 'Lactose', threshold: 5, unit: 'g', direction: 'above', warning: 'Contains lactose which can be hard on your tummy', riskIncrease: 15 },
      { nutrientName: 'Fiber, total dietary', threshold: 10, unit: 'g', direction: 'above', warning: 'High fiber may worsen symptoms during a flare — stick to soluble fiber in remission', riskIncrease: 10 },
      { nutrientName: 'Caffeine', threshold: 100, unit: 'mg', direction: 'above', warning: 'High caffeine may increase urgency and how often you need the loo', riskIncrease: 8 },
      { nutrientName: 'Alcohol, ethyl', threshold: 0, unit: 'g', direction: 'above', warning: 'Alcohol can irritate your colon lining', riskIncrease: 12 },
    ],
  },

  cycleImpact: {
    hasImpact: true,
    prevalencePercent: 53,
    phases: [
      { phase: 'menstrual', riskMultiplier: 1.4, commonSymptoms: ['Increased tummy cramps', 'More bloody stools', 'Worse fatigue', 'Higher urgency'], mechanism: 'Prostaglandin release causes both uterine and colonic contractions. Low estrogen increases colonic permeability and worsens mucosal inflammation.', tip: 'Take it easy, warm compress helps both period and tummy cramps' },
      { phase: 'follicular', riskMultiplier: 0.9, commonSymptoms: ['Symptoms often improve', 'Better energy', 'Less urgency'], mechanism: 'Rising estrogen has anti-inflammatory effects and helps strengthen the colonic mucosal barrier.', tip: 'Good time for trying new foods or starting experiments' },
      { phase: 'ovulatory', riskMultiplier: 1.0, commonSymptoms: ['Generally stable'], mechanism: 'Peak estrogen provides maximum anti-inflammatory benefit to the colon.', tip: 'Your body is at its strongest point in the cycle' },
      { phase: 'luteal', riskMultiplier: 1.15, commonSymptoms: ['Mild bloating', 'Slight increase in urgency'], mechanism: 'Progesterone slows gut motility, can cause bloating and change stool patterns.', tip: 'Normal to feel slightly more bloated — gentle movement helps' },
      { phase: 'premenstrual', riskMultiplier: 1.3, commonSymptoms: ['Increased urgency', 'More tummy pain', 'Mood changes', 'More frequent loo visits'], mechanism: 'Rapid hormone drop triggers prostaglandin release, increasing colonic contractions and mucosal sensitivity.', tip: 'Stick to safe foods and prioritize rest' },
    ],
  },

  commonMedications: [
    { name: 'Mesalamine (oral)', class: 'Aminosalicylate', description: 'First-line anti-inflammatory for mild-to-moderate UC' },
    { name: 'Mesalamine (rectal)', class: 'Aminosalicylate', description: 'Suppository or enema for distal/left-sided disease — very effective locally' },
    { name: 'Sulfasalazine', class: 'Aminosalicylate', description: 'Older aminosalicylate, also helps joint symptoms' },
    { name: 'Budesonide MMX', class: 'Corticosteroid', description: 'Multi-matrix formulation that releases throughout the colon' },
    { name: 'Prednisone', class: 'Corticosteroid', description: 'Systemic steroid for flare management' },
    { name: 'Azathioprine', class: 'Immunomodulator', description: 'Long-term immune suppression for maintaining remission' },
    { name: 'Infliximab', class: 'Anti-TNF Biologic', description: 'IV infusion biologic for moderate-to-severe UC' },
    { name: 'Adalimumab', class: 'Anti-TNF Biologic', description: 'Self-injection biologic' },
    { name: 'Golimumab', class: 'Anti-TNF Biologic', description: 'Self-injection biologic FDA-approved specifically for UC' },
    { name: 'Vedolizumab', class: 'Integrin Inhibitor', description: 'Gut-selective biologic, often preferred in UC' },
    { name: 'Ustekinumab', class: 'IL-12/23 Inhibitor', description: 'Biologic targeting IL-12 and IL-23' },
    { name: 'Tofacitinib', class: 'JAK Inhibitor', description: 'Oral small molecule FDA-approved for UC — convenient pill form' },
    { name: 'Upadacitinib', class: 'JAK Inhibitor', description: 'Newer oral JAK inhibitor approved for UC' },
    { name: 'Ozanimod', class: 'S1P Modulator', description: 'Oral sphingosine-1-phosphate receptor modulator for UC' },
  ],

  populationStats: [
    { stat: 'Average disease activity in remission', value: 'SCCAI 1.2 ± 1.0', source: 'OHDSI', context: 'If your score is below 3, you are doing really well' },
    { stat: 'Annual flare rate on treatment', value: '20-40%', source: 'OHDSI', context: 'Flares happen even on treatment — you are not failing' },
    { stat: 'Aminosalicylate response rate', value: '40-70%', source: 'OHDSI', context: 'Mesalamine works well for many people, especially for mild-to-moderate UC' },
    { stat: 'Anti-TNF response rate', value: '65-70%', source: 'OHDSI', context: 'Biologics help most patients but not all' },
    { stat: 'Colectomy rate (10-year)', value: '10-15%', source: 'OHDSI', context: 'The vast majority of UC patients never need surgery' },
    { stat: 'Mucosal healing on biologics', value: '30-50%', source: 'OHDSI', context: 'Mucosal healing is the goal — it means your colon lining is recovering' },
    { stat: 'Steroid-free remission rate', value: '30-40%', source: 'OHDSI', context: 'Every dose of your medication counts towards getting off steroids' },
    { stat: 'Stress and flare risk', value: '2x higher within 3 months', source: 'TriNetX', context: 'Stress management is a real treatment for UC' },
    { stat: 'Sleep disruption in active disease', value: '72% of patients', source: 'NIHR', context: 'Sleep problems are very common — nighttime urgency is a key UC symptom' },
  ],

  emergencyProtocol: {
    severityQuestions: [
      { question: 'How many times are you going to the loo per day?', options: [
        { label: 'Less than 4', severity: 'mild' }, { label: '4-6', severity: 'moderate' }, { label: '7-10', severity: 'severe' }, { label: 'More than 10', severity: 'emergency' },
      ]},
      { question: 'How much blood are you seeing?', options: [
        { label: 'None', severity: 'mild' }, { label: 'A little streak', severity: 'moderate' }, { label: 'Mixed in with stool', severity: 'severe' }, { label: 'Passing mostly blood or large clots', severity: 'emergency' },
      ]},
      { question: 'How is your tummy pain?', options: [
        { label: 'Mild cramping', severity: 'mild' }, { label: 'Moderate, manageable', severity: 'moderate' }, { label: 'Severe cramping', severity: 'severe' }, { label: 'Unbearable pain or swollen, tight tummy', severity: 'emergency' },
      ]},
      { question: 'Do you have a fever?', options: [
        { label: 'No', severity: 'mild' }, { label: 'Low grade (below 38.5C)', severity: 'moderate' }, { label: 'High (above 38.5C)', severity: 'severe' },
      ]},
      { question: 'Is your tummy bloated or distended?', options: [
        { label: 'No', severity: 'mild' }, { label: 'A little bloated', severity: 'moderate' }, { label: 'Noticeably swollen', severity: 'severe' }, { label: 'Very swollen and painful to touch', severity: 'emergency' },
      ]},
    ],
    immediateActions: [
      'Switch to clear liquids (water, broth, electrolyte drinks)',
      'Take your prescribed medications — do not skip doses, especially mesalamine',
      'Rest and avoid physical exertion',
      'Apply a warm compress to your tummy if it helps with cramping',
      'Track your symptoms — note blood amount, urgency, and frequency',
      'If using rectal mesalamine, continue unless your doctor says otherwise',
    ],
    whenToCallDoctor: [
      'Symptoms have been worsening for more than 2-3 days',
      'You are having more than 6 bloody stools per day',
      'Pain is not controlled by your usual methods',
      'You are noticing more blood than usual when you go',
      'Nighttime urgency is waking you up more than 3 times',
      'You have been unable to keep food or liquids down for 24 hours',
    ],
    whenToGoER: [
      'Severe tummy pain with a swollen, tight tummy (possible toxic megacolon)',
      'High fever (above 39C / 102F) with bloody diarrhea',
      'Passing large amounts of blood or blood clots',
      'Signs of dehydration (dizziness, no urine, racing heart)',
      'Heart rate above 100 with bloody stools and fever',
      'Severe vomiting preventing medication or fluids',
    ],
    whatToTellER: [
      'Your diagnosis of ulcerative colitis and the extent (e.g., left-sided, pancolitis)',
      'Your current medications and doses — especially biologics and immunosuppressants',
      'When your symptoms started getting worse and how much blood you are seeing',
      'Recent lab results or colonoscopy findings if available',
      'Mention toxic megacolon risk if your tummy is very swollen and distended',
    ],
    doNotDo: [
      'Do NOT take NSAIDs (ibuprofen, naproxen) — they can trigger or worsen a UC flare',
      'Do NOT stop your biologic or immunomodulator without talking to your doctor',
      'Do NOT use anti-diarrheal medications (loperamide) during a severe flare — risk of toxic megacolon',
      'Do NOT use heating pads directly on skin',
      'Do NOT ignore a rapidly distending tummy — this needs urgent attention',
    ],
    dietDuringFlare: [
      'Clear liquids first (broth, water, oral rehydration solution)',
      'Gradually add: white rice, plain toast, bananas, boiled and peeled potatoes',
      'Avoid: dairy, raw vegetables, insoluble fiber, spicy food, alcohol, sulfite-containing foods',
      'Small, frequent meals are better than large ones',
      'Avoid caffeine — it increases colonic motility and urgency',
      'Well-cooked, peeled, and soft foods are gentlest on your colon',
    ],
  },

  aiContext: {
    gentleLanguage: {
      'ulcerative colitis': 'your condition',
      'UC': 'your condition',
      'IBD': 'your condition',
      'colitis': 'your condition',
      'stools': 'when you go to the loo',
      'bowel': 'tummy',
      'diarrhea': 'loose motions',
      'abdominal': 'tummy',
      'colon': 'large tummy',
      'rectal': 'back passage',
      'rectum': 'back passage',
      'bloody stool': 'blood when you go',
      'mucus': 'discharge',
      'tenesmus': 'feeling of needing to go',
      'colectomy': 'surgery',
      'toxic megacolon': 'serious swelling',
      'proctitis': 'inflammation near the back passage',
    },
    avoidTerms: ['ulcerative colitis', 'UC', 'IBD', 'inflammatory bowel disease', 'stools', 'bowel movements', 'diarrhea', 'abdominal', 'colectomy', 'toxic megacolon', 'mucosal erosion', 'rectal bleeding'],
    systemPromptContext: `The user has ulcerative colitis. Key pathways: IL-13 (epithelial barrier disruption), mucin depletion (MUC2 deficiency reduces protective mucus), IL-23R/Th17 (mucosal immunity), JAK/STAT (signaling, target of tofacitinib/upadacitinib), and integrin α4β7 (gut homing of immune cells, target of vedolizumab). Butyric acid is the #1 remission-associated compound — colonocytes rely on it for 70% of their energy. Sulfites are uniquely dangerous in UC as they impair butyrate oxidation in colonocytes. Unlike Crohn's, UC only affects the colon and rectum in a continuous pattern. Bloody loose motions are the hallmark symptom. Toxic megacolon is a rare but serious emergency. 53% of women experience worse symptoms during menstruation. Soluble fiber is protective in remission as gut bacteria ferment it into butyrate.`,
    symptomTriggerPhrases: ['pain', 'cramps', 'not feeling well', 'tummy', 'tired', 'blood', 'urgency', 'loo', 'toilet', 'bathroom', 'hurts', 'ache', 'fatigue', 'accident', 'can\'t hold', 'bleeding', 'mucus'],
    followUpQuestions: ['How many times did you go to the loo today?', 'Was there any blood?', 'How urgent was it?', 'Did you eat anything unusual?', 'Any nighttime waking to use the loo?'],
  },

  experimentTemplates: [
    { title: 'Does fiber supplementation help in remission?', hypothesis: 'Adding soluble fiber (psyllium) during remission will reduce symptom scores via increased butyrate production', variable: 'soluble_fiber_supplementation', baselineDays: 14, interventionDays: 21 },
    { title: 'Does removing sulfites reduce symptoms?', hypothesis: 'Eliminating sulfite-containing foods will reduce bloody stool frequency and urgency', variable: 'sulfite_elimination', baselineDays: 14, interventionDays: 14 },
    { title: 'Does removing dairy reduce symptoms?', hypothesis: 'Eliminating dairy will reduce bloating and urgency', variable: 'dairy_elimination', baselineDays: 14, interventionDays: 14 },
    { title: 'Does sleeping 1 hour earlier help?', hypothesis: 'Earlier sleep reduces next-day symptoms and nighttime urgency', variable: 'sleep_timing', baselineDays: 7, interventionDays: 7 },
    { title: 'Does stress above 7/10 predict a flare?', hypothesis: 'High stress predicts symptom worsening within 48h', variable: 'stress_observation', baselineDays: 14, interventionDays: 14 },
    { title: 'Does turmeric help maintain remission?', hypothesis: 'Daily turmeric/curcumin reduces SCCAI score and blood in stool', variable: 'turmeric_supplementation', baselineDays: 14, interventionDays: 21 },
    { title: 'Does rectal mesalamine timing matter?', hypothesis: 'Using rectal mesalamine at bedtime is more effective than morning use', variable: 'mesalamine_timing', baselineDays: 14, interventionDays: 14 },
    { title: 'Does a low-FODMAP diet help?', hypothesis: 'Low-FODMAP reduces bloating, urgency, and frequency', variable: 'low_fodmap', baselineDays: 7, interventionDays: 21 },
  ],
};
