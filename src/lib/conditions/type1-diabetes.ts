import type { ConditionProfile } from './types';

export const type1DiabetesProfile: ConditionProfile = {
  id: 'type1_diabetes',
  name: 'Type 1 Diabetes',
  shortName: 'T1D',
  category: 'endocrine',
  description: 'An autoimmune condition where the immune system destroys insulin-producing beta cells in the pancreas, requiring lifelong insulin therapy for blood sugar management.',
  icon: '💉',

  scoring: {
    name: 'DMS',
    fullName: 'Daily Management Score',
    maxScore: 50,
    components: [
      { id: 'timeInRange', label: 'Time in Range', description: 'How much of the day was your blood sugar in your target range?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: '80%+ in range (excellent)' }, { value: 2, label: '70-80% in range' }, { value: 5, label: '50-70% in range' }, { value: 7, label: '30-50% in range' }, { value: 10, label: '<30% in range' },
      ]},
      { id: 'hypoEvents', label: 'Low Blood Sugar Events', description: 'Any low blood sugar episodes today?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'None' }, { value: 3, label: 'One mild low' }, { value: 5, label: 'Multiple mild lows' }, { value: 7, label: 'One significant low' }, { value: 10, label: 'Severe low requiring help' },
      ]},
      { id: 'hyperEvents', label: 'High Blood Sugar Episodes', description: 'Any prolonged high blood sugar today?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'None' }, { value: 2, label: 'Brief spike, corrected quickly' }, { value: 5, label: 'Extended high (2-4 hours)' }, { value: 7, label: 'Prolonged high (4+ hours)' }, { value: 10, label: 'Very high with ketones' },
      ]},
      { id: 'insulinAdherence', label: 'Insulin Management', description: 'How well did you manage insulin today?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'All doses on time and accurate' }, { value: 2, label: 'Minor timing issues' }, { value: 5, label: 'Missed or late bolus' }, { value: 7, label: 'Multiple missed doses' }, { value: 10, label: 'Could not manage insulin today' },
      ]},
      { id: 'carbCounting', label: 'Carb Counting Accuracy', description: 'How well did you estimate carbs today?', type: 'scale', min: 0, max: 10, options: [
        { value: 0, label: 'Very accurate' }, { value: 2, label: 'Mostly accurate' }, { value: 5, label: 'Some guessing' }, { value: 7, label: 'Quite uncertain' }, { value: 10, label: 'Could not count carbs today' },
      ]},
    ],
    severityLevels: [
      { id: 'well_managed', label: 'Well Managed', range: [0, 10], color: 'text-sage-dark', bgColor: 'bg-sage-light' },
      { id: 'fair', label: 'Fair Day', range: [11, 20], color: 'text-risk-watch', bgColor: 'bg-yellow-100' },
      { id: 'difficult', label: 'Difficult Day', range: [21, 35], color: 'text-coral', bgColor: 'bg-coral/20' },
      { id: 'very_difficult', label: 'Very Difficult Day', range: [36, 50], color: 'text-rose-dark', bgColor: 'bg-rose/20' },
    ],
  },

  symptoms: {
    coreSymptoms: [
      { id: 'bloodSugar', label: 'Blood Sugar Stability', gentleLabel: 'How stable has your blood sugar been?', type: 'scale', min: 0, max: 10 },
      { id: 'fatigue', label: 'Fatigue', gentleLabel: 'How is your energy?', type: 'scale', min: 0, max: 10 },
      { id: 'thirst', label: 'Thirst', gentleLabel: 'Are you unusually thirsty?', type: 'scale', min: 0, max: 10 },
      { id: 'urination', label: 'Frequent Urination', gentleLabel: 'Going to the loo more often than usual?', type: 'select', options: [
        { value: 'normal', label: 'Normal' }, { value: 'slightly_more', label: 'Slightly more' }, { value: 'frequent', label: 'Quite frequent' }, { value: 'very_frequent', label: 'Very frequent' },
      ]},
      { id: 'moodSwings', label: 'Mood', gentleLabel: 'How is your mood stability?', type: 'scale', min: 0, max: 10 },
      { id: 'brainFog', label: 'Brain Fog', gentleLabel: 'How clear is your thinking?', type: 'scale', min: 0, max: 10 },
    ],
    complications: [
      { id: 'numbness', label: 'Neuropathy', gentleLabel: 'Tingling or numbness in hands/feet' },
      { id: 'vision_changes', label: 'Vision Changes', gentleLabel: 'Blurry vision or eye changes' },
      { id: 'slow_healing', label: 'Slow Healing', gentleLabel: 'Cuts or wounds healing slowly' },
      { id: 'skin_issues', label: 'Skin Issues', gentleLabel: 'Dry skin or injection site problems' },
      { id: 'dawn_phenomenon', label: 'Dawn Phenomenon', gentleLabel: 'High blood sugar on waking' },
    ],
    customFields: [
      { id: 'fastingGlucose', label: 'Fasting Glucose (mg/dL)', type: 'number', defaultValue: 100 },
      { id: 'hypoCount', label: 'Hypo Episodes Today', type: 'number', defaultValue: 0 },
      { id: 'ketones', label: 'Ketones Detected', type: 'boolean', defaultValue: false },
    ],
  },

  flareWeights: {
    symptomTrend: 20,
    circadianDisruption: 15,
    dietaryRisk: 20,
    menstrualPhase: 10,
    stressMood: 15,
    medicationAdherence: 15,
    mealTiming: 5,
    customFactors: [
      { id: 'exerciseVariation', label: 'Unusual exercise or activity', weight: 10 },
      { id: 'illness', label: 'Current illness or infection', weight: 20 },
    ],
  },

  dietaryProfile: {
    riskFactors: [
      { name: 'High Glycemic Index Foods', mechanism: 'Cause rapid blood sugar spikes that are hard to match with insulin dosing', severity: 'high', foods: ['white bread', 'white rice', 'sugary cereals', 'candy', 'fruit juice'] },
      { name: 'Excess Carbohydrates (without insulin)', mechanism: 'Large carb loads without adequate insulin lead to dangerous hyperglycemia', severity: 'high', foods: ['large pasta portions', 'multiple bread servings', 'sugary drinks', 'pizza'] },
      { name: 'Hidden Sugars', mechanism: 'Unexpected carbs make insulin dosing inaccurate', severity: 'moderate', foods: ['sauces', 'condiments', 'low-fat products', 'some medications'] },
      { name: 'Alcohol', mechanism: 'Can cause delayed hypoglycemia hours later, especially overnight', severity: 'moderate', foods: ['beer', 'cocktails', 'wine', 'spirits'] },
    ],
    protectiveFactors: [
      { name: 'Low Glycemic Index Foods', mechanism: 'Slower, more predictable blood sugar rise that is easier to manage with insulin', severity: 'high', foods: ['sweet potatoes', 'legumes', 'whole grains', 'most vegetables'] },
      { name: 'Fiber', mechanism: 'Slows carbohydrate absorption and helps stabilize blood sugar', severity: 'high', foods: ['vegetables', 'legumes', 'nuts', 'seeds', 'whole grains'] },
      { name: 'Protein with Meals', mechanism: 'Slows gastric emptying and creates a more gradual glucose response', severity: 'moderate', foods: ['chicken', 'fish', 'eggs', 'tofu', 'Greek yogurt'] },
      { name: 'Healthy Fats', mechanism: 'Slows carb absorption and improves satiety without blood sugar impact', severity: 'moderate', foods: ['avocado', 'olive oil', 'nuts', 'salmon'] },
      { name: 'Consistent Meal Timing', mechanism: 'Predictable eating patterns make insulin dosing more reliable', severity: 'high', foods: ['regular meals', 'planned snacks'] },
    ],
    guidelines: [
      'Carbohydrate counting is key — accurate carb estimation improves blood sugar control',
      'Pair carbohydrates with protein and healthy fats to slow glucose absorption',
      'Learn the glycemic index of your commonly eaten foods',
      'Plan for exercise — adjust insulin and carbs before, during, and after activity',
      'Always carry fast-acting glucose for hypoglycemia treatment',
    ],
    nutrientWarnings: [
      { nutrientName: 'Carbohydrate, by difference', threshold: 60, unit: 'g', direction: 'above', warning: 'Large carb load — make sure your insulin dose matches', riskIncrease: 10 },
      { nutrientName: 'Sugars, total', threshold: 30, unit: 'g', direction: 'above', warning: 'High sugar content will cause a rapid blood sugar rise', riskIncrease: 12 },
      { nutrientName: 'Fiber, total dietary', threshold: 3, unit: 'g', direction: 'below', warning: 'Low fiber means faster carb absorption — blood sugar may spike quickly', riskIncrease: 5 },
      { nutrientName: 'Alcohol, ethyl', threshold: 14, unit: 'g', direction: 'above', warning: 'Alcohol can cause delayed hypoglycemia — monitor blood sugar overnight', riskIncrease: 10 },
    ],
  },

  cycleImpact: {
    hasImpact: true,
    prevalencePercent: 65,
    phases: [
      { phase: 'menstrual', riskMultiplier: 1.15, commonSymptoms: ['Blood sugar may drop as hormones reset', 'Increased hypo risk for some', 'Fatigue'], mechanism: 'Falling progesterone reduces insulin resistance. Some women need LESS insulin during menstruation.', tip: 'Watch for unexpected lows — you may need to reduce your basal insulin slightly' },
      { phase: 'follicular', riskMultiplier: 0.9, commonSymptoms: ['Better insulin sensitivity', 'Easier blood sugar management', 'More predictable readings'], mechanism: 'Rising estrogen improves insulin sensitivity.', tip: 'Your blood sugar may be easier to manage — enjoy the smoother ride' },
      { phase: 'ovulatory', riskMultiplier: 0.95, commonSymptoms: ['Generally stable', 'Good insulin sensitivity'], mechanism: 'Balanced hormones support stable insulin action.', tip: 'A good baseline phase for testing new foods or insulin ratios' },
      { phase: 'luteal', riskMultiplier: 1.3, commonSymptoms: ['Increasing insulin resistance', 'Higher blood sugar readings', 'May need 15-20% more insulin', 'More cravings'], mechanism: 'Rising progesterone significantly increases insulin resistance. This is the most challenging phase for blood sugar management.', tip: 'You may need to increase your basal rate and insulin-to-carb ratios — track the pattern' },
      { phase: 'premenstrual', riskMultiplier: 1.25, commonSymptoms: ['Peak insulin resistance then sudden drop', 'Unpredictable blood sugars', 'Carb cravings'], mechanism: 'Progesterone peaks then drops rapidly, causing shifting insulin needs. This transition is the hardest to manage.', tip: 'Be extra vigilant about blood sugar monitoring during the progesterone drop' },
    ],
  },

  commonMedications: [
    { name: 'Rapid-Acting Insulin (Humalog, NovoRapid)', class: 'Insulin', description: 'Bolus insulin for meals and corrections' },
    { name: 'Long-Acting Insulin (Lantus, Tresiba)', class: 'Insulin', description: 'Basal insulin for background coverage' },
    { name: 'Insulin Pump', class: 'Insulin Delivery', description: 'Continuous subcutaneous insulin delivery' },
    { name: 'CGM (Dexcom, Libre)', class: 'Monitoring Device', description: 'Continuous glucose monitoring for real-time feedback' },
    { name: 'Glucagon Kit/Nasal Spray', class: 'Emergency', description: 'For severe hypoglycemia requiring outside help' },
    { name: 'Pramlintide (Symlin)', class: 'Amylin Analog', description: 'Slows gastric emptying and reduces post-meal spikes' },
  ],

  populationStats: [
    { stat: 'Prevalence', value: '~8.7 million worldwide', source: 'IDF', context: 'There is a large, supportive T1D community' },
    { stat: 'Target time in range', value: '>70% between 70-180 mg/dL', source: 'ADA', context: 'Every percentage point of TIR improvement matters' },
    { stat: 'A1C target', value: '<7% (individual targets may differ)', source: 'ADA', context: 'Your target is personalized — work with your endocrinologist' },
    { stat: 'CGM benefit', value: 'Reduces A1C by 0.3-0.5%', source: 'ADA', context: 'CGM is one of the most impactful tools for T1D management' },
    { stat: 'Menstrual cycle insulin changes', value: '~65% of women report needing more insulin in luteal phase', source: 'Diabetes Care', context: 'Adjusting insulin around your cycle is a real management strategy' },
    { stat: 'DKA incidence', value: '1-5% per year in adults', source: 'ADA', context: 'DKA is preventable with proper monitoring and sick-day management' },
  ],

  emergencyProtocol: {
    severityQuestions: [
      { question: 'What is your blood sugar reading?', options: [
        { label: 'In range (70-180)', severity: 'mild' }, { label: 'High (180-300)', severity: 'moderate' }, { label: 'Very high (>300)', severity: 'severe' }, { label: 'Very high with ketones', severity: 'emergency' },
      ]},
      { question: 'Are you experiencing low blood sugar symptoms?', options: [
        { label: 'No', severity: 'mild' }, { label: 'Mild shakiness or hunger', severity: 'moderate' }, { label: 'Significant symptoms (sweating, confusion)', severity: 'severe' }, { label: 'Cannot treat myself / someone else is reading this', severity: 'emergency' },
      ]},
      { question: 'Have you checked for ketones?', options: [
        { label: 'No ketones or not applicable', severity: 'mild' }, { label: 'Trace ketones', severity: 'moderate' }, { label: 'Moderate ketones', severity: 'severe' }, { label: 'Large ketones with nausea/vomiting', severity: 'emergency' },
      ]},
      { question: 'Are you feeling nauseous or vomiting?', options: [
        { label: 'No', severity: 'mild' }, { label: 'Slightly nauseous', severity: 'moderate' }, { label: 'Vomiting', severity: 'severe' }, { label: 'Cannot keep anything down', severity: 'emergency' },
      ]},
    ],
    immediateActions: [
      'For LOW blood sugar: take 15g fast-acting carbs (glucose tabs, juice), wait 15 min, recheck',
      'For HIGH blood sugar: take correction dose, drink water, check for ketones if >300',
      'Check your insulin pump site if using one — could be a site failure',
      'Do not exercise if blood sugar is >250 with ketones',
      'Track what led to this so you can adjust your plan',
    ],
    whenToCallDoctor: [
      'Blood sugar is consistently above 250 despite correction doses',
      'You are having frequent unexplained hypoglycemia',
      'Ketones are present and not clearing with insulin and fluids',
      'You are ill and having trouble managing blood sugar',
      'Your insulin needs have changed significantly without clear reason',
    ],
    whenToGoER: [
      'Suspected DKA: high blood sugar + ketones + nausea/vomiting + fruity breath',
      'Severe hypoglycemia: confusion, seizure, loss of consciousness',
      'Blood sugar >500 mg/dL that is not coming down with insulin',
      'Continuous vomiting preventing you from keeping fluids or food down',
      'Chest pain, difficulty breathing, or extreme dehydration',
    ],
    whatToTellER: [
      'That you have Type 1 diabetes (not Type 2 — they are managed differently)',
      'Your current insulin regimen (basal and bolus doses or pump settings)',
      'Your most recent blood sugar and ketone readings',
      'When you last ate and took insulin',
      'Whether you use an insulin pump or CGM',
    ],
    doNotDo: [
      'Do NOT skip insulin, even when you are not eating — you still need basal insulin',
      'Do NOT exercise with blood sugar >250 and ketones — this can worsen DKA',
      'Do NOT go to sleep with very low or very high blood sugar without treating it',
      'Do NOT drive when your blood sugar is low — treat it first',
      'Do NOT ignore ketones — they are a warning sign of DKA',
    ],
    dietDuringFlare: [
      'For high blood sugar: drink plenty of water, avoid additional carbs until corrected',
      'For low blood sugar: 15g fast-acting carbs, then a balanced snack once stable',
      'During illness: follow your sick-day plan, keep hydrated, check blood sugar and ketones frequently',
      'Easy-to-manage foods with predictable carb counts: measured portions of rice, bread, crackers',
      'Always have fast-acting glucose available: glucose tablets, juice boxes, gel packs',
    ],
  },

  aiContext: {
    gentleLanguage: {
      'type 1 diabetes': 'your condition',
      'diabetic': 'someone with T1D',
      'blood sugar': 'blood sugar',
      'hyperglycemia': 'high blood sugar',
      'hypoglycemia': 'low blood sugar',
      'DKA': 'a serious high blood sugar emergency',
      'diabetic ketoacidosis': 'a serious high blood sugar emergency',
      'neuropathy': 'nerve sensitivity',
      'retinopathy': 'eye changes',
      'nephropathy': 'kidney changes',
      'non-compliant': 'having a tough time managing',
    },
    avoidTerms: ['diabetic' , 'non-compliant', 'poorly controlled', 'uncontrolled diabetes', 'brittle', 'diabetic complications', 'failure'],
    systemPromptContext: `The user has Type 1 diabetes — an autoimmune condition, NOT a lifestyle condition. They require insulin to survive. Key concepts: basal-bolus insulin therapy or insulin pump, CGM (continuous glucose monitor), carb counting, time in range (70-180 mg/dL), A1C. DKA is the most dangerous acute complication. ~65% of women report menstrual cycle effects on insulin sensitivity — the luteal phase typically increases insulin resistance by 15-20%. Hypoglycemia unawareness can develop over time. Emotional burden ("diabetes distress") is very real. Never blame the user for blood sugar readings — T1D is inherently unpredictable.`,
    symptomTriggerPhrases: ['blood sugar', 'high', 'low', 'hypo', 'shaky', 'dizzy', 'thirsty', 'ketones', 'nauseous', 'tired', 'blurry', 'hungry', 'sweaty', 'confused', 'insulin', 'pump'],
    followUpQuestions: ['What is your blood sugar right now?', 'Have you been able to stay in range today?', 'Any lows or highs?', 'How is your energy?'],
  },

  experimentTemplates: [
    { title: 'Does eating low GI improve my time in range?', hypothesis: 'Switching to low GI carbohydrates increases time in range', variable: 'low_gi_diet', baselineDays: 14, interventionDays: 14 },
    { title: 'Does pre-bolusing improve post-meal spikes?', hypothesis: 'Taking insulin 15 min before eating reduces post-meal blood sugar peaks', variable: 'pre_bolusing', baselineDays: 7, interventionDays: 14 },
    { title: 'Do cycle-based insulin adjustments help?', hypothesis: 'Increasing basal insulin by 10-15% in luteal phase improves time in range', variable: 'cycle_insulin_adjustment', baselineDays: 28, interventionDays: 28 },
    { title: 'Does walking after meals reduce spikes?', hypothesis: 'A 15-minute walk after meals reduces post-meal blood sugar rise', variable: 'post_meal_walk', baselineDays: 7, interventionDays: 14 },
    { title: 'Does consistent meal timing improve control?', hypothesis: 'Eating at regular times improves overall blood sugar stability', variable: 'meal_timing', baselineDays: 7, interventionDays: 14 },
  ],
};
