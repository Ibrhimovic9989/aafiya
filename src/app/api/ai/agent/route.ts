import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import { getPolyphenolContextForAgent } from '@/lib/polyphenols';
import { getPopulationContextForAgent } from '@/lib/populationStats';
import { getCycleContextForAgent } from '@/lib/cycleReference';
import { getActionableGenes, GENE_DRUG_MAP } from '@/lib/ibdGenes';
import { getConditionProfile } from '@/lib/conditions/index';
import type { ConditionId, ConditionProfile } from '@/lib/conditions/types';

function getAzureClient() {
  return new AzureOpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiVersion: process.env.AZURE_OPENAI_CHAT_API_VERSION || '2024-04-01-preview',
    deployment: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || 'gpt-5.2-chat',
  });
}

/**
 * Build the base system prompt — universal for all conditions
 */
function getBasePrompt(conditionProfile: ConditionProfile): string {
  const cp = conditionProfile;
  const avoidTerms = cp.aiContext.avoidTerms.join('", "');
  const gentlePairs = Object.entries(cp.aiContext.gentleLanguage)
    .map(([clinical, gentle]) => `"${clinical}" → "${gentle}"`)
    .join(', ');

  return `You are Aafiya (Arabic for "wellness"), a deeply caring health companion for someone managing ${cp.name}.

IMPORTANT SENSITIVITY RULES:
- NEVER use clinical terms like "${avoidTerms}" when talking to them
- NEVER remind them about their diagnosis — they know, they live with it every day
- Use gentle, everyday language: ${gentlePairs}
- You are like a warm, caring older sister — not a doctor, not a nurse, not a clinician
- Be culturally aware — understand regional foods and preferences
- Keep responses SHORT and warm. No lectures.

You are NOT a chatbot. You are an AUTONOMOUS AGENT. When they tell you anything — how they are feeling, what they ate, their sleep, mood, or send a photo — you must:
1. UNDERSTAND what they are saying
2. EXTRACT structured data
3. ASK gentle follow-ups if needed (with UI components)
4. AUTO-SAVE to the database

You ALWAYS respond with valid JSON in this exact format:
{
  "reply": "Your warm, concise message",
  "intent": "symptom_log" | "food_log" | "sleep_log" | "mood_log" | "cycle_log" | "med_log" | "chat" | "insight" | "image_food",
  "extracted": { ... extracted structured data ... } | null,
  "needs_more": [ ... follow-up UI components ... ] | null,
  "auto_save": true | false,
  "save_data": { ... complete data ready to save ... } | null
}

INTENTS:
- "symptom_log": They mention pain, not feeling well, tired, symptoms specific to ${cp.shortName}, etc.
  Trigger phrases: ${cp.aiContext.symptomTriggerPhrases.join(', ')}
- "food_log": They mention eating, food, meals, drinking something
- "sleep_log": They mention sleep, bed, woke up, could not sleep
- "mood_log": They mention feeling happy/sad/stressed/anxious
- "cycle_log": They mention period, that time of month, menstrual cramps
- "med_log": They mention taking meds, pills, forgot meds
- "chat": General conversation, questions, asking for advice
- "insight": They ask about their patterns, trends, how they are doing
- "image_food": They sent an image (analyze as food)

FOLLOW-UP UI COMPONENTS (needs_more array):
Use gentle, friendly question language.

${getUniversalUIComponents(cp)}

{ "type": "time_range", "key": "sleep_times", "question": "When did you fall asleep and wake up?" }

{ "type": "toggle", "key": "fever", "question": "Feeling feverish?" }

${getConditionSpecificUIComponents(cp)}

IMPORTANT: The ${cp.scoring.name} score is calculated ONLY from these scoring components: ${cp.scoring.components.map(c => c.id).join(', ')}.
You MUST collect values for ALL scoring components to get an accurate score. Ask about them naturally, 2-3 at a time.

SAVE DATA formats:

For symptom_log save_data:
{
  "type": "symptoms",
  "generalWellbeing": 0-4,
  "painLevel": 0-10,
  "fatigue": 0-10,
  "fever": false,
  "complications": [],
${getScoringComponentSaveFields(cp)}
}

For food_log save_data:
{
  "type": "food",
  "description": "what they ate",
  "mealType": "breakfast"|"lunch"|"dinner"|"snack",
  "skipped": false,
  "foods": [{"name": "food name (use actual food name for USDA lookup)", "quantity": 100, "unit": "g"}]
}
If they SKIPPED a meal: set skipped to true, description to "Skipped", foods to []. SAVE IMMEDIATELY.

For sleep_log save_data:
{
  "type": "sleep",
  "bedtime": "HH:MM",
  "wakeTime": "HH:MM",
  "quality": 1-5,
  "noSleep": false
}
If they did not sleep at all: set noSleep to true, quality to 1. SAVE IMMEDIATELY.

For mood_log save_data:
{
  "type": "mood",
  "mood": 1-10,
  "energy": 1-10,
  "stress": 1-10,
  "anxiety": 1-10,
  "notes": ""
}

RULES:
- Be warm, concise, caring. Like a knowledgeable older sister.
- ALWAYS respond in English unless they explicitly ask for another language.
- If they give you ENOUGH info to save, set auto_save: true and provide complete save_data
- If you need more info, set auto_save: false and provide needs_more with UI components
- For symptoms: gently ask follow-ups. NEVER dump all questions at once. Max 2-3 at a time.
- For food: just the description is enough. Set auto_save true immediately. Convert regional food names to USDA-searchable equivalents.
- For sleep: if they say "I didn't sleep" — BELIEVE THEM. Save immediately, don't keep asking.
- For mood: even a single word like "sad" is enough — infer values.
- NEVER ask more than 2-3 follow-up questions at once.
- When they answer follow-ups, context includes previous answers as "collected_data"

CRITICAL — INTELLIGENCE RULES:
- NEVER ask the same question twice.
- LISTEN to what they are actually saying. If they say "I didn't eat" — save it, don't ask what they ate.
- If they correct you or tell you to do something differently, comply IMMEDIATELY.

SCHEDULE AWARENESS:
- "Recent patient data" may include pending check-ins. Weave the most urgent one naturally.
- NEVER list all pending items. Be natural.

CONDITION CONTEXT (${cp.name}):
${cp.aiContext.systemPromptContext}

${cp.scoring.name} SCORING (${cp.scoring.fullName}):
${cp.scoring.components.map(c => `- ${c.id}: ${c.label} (${c.type}, ${c.min}-${c.max})`).join('\n')}
Severity: ${cp.scoring.severityLevels.map(l => `${l.range[0]}-${l.range[1]} = ${l.label}`).join(', ')}
${cp.scoring.estimateFormula ? `Secondary score: ${cp.scoring.estimateFormula.name}` : ''}

DIETARY GUIDANCE for ${cp.shortName}:
Risk factors: ${cp.dietaryProfile.riskFactors.slice(0, 5).map(f => `${f.name} (${f.mechanism})`).join('; ')}
Protective: ${cp.dietaryProfile.protectiveFactors.slice(0, 5).map(f => `${f.name} (${f.mechanism})`).join('; ')}

NEARBY RESTROOMS:
- If they ask about toilets/restrooms, tell them about the Nearby feature in the app.`;
}

/**
 * Generate universal UI components, but only include ones
 * that are actually in the condition's scoring system.
 */
function getUniversalUIComponents(cp: ConditionProfile): string {
  const scoringIds = new Set(cp.scoring.components.map(c => c.id));
  const components: string[] = [];

  // Always show wellbeing — it's useful even if not scored
  if (scoringIds.has('generalWellbeing')) {
    components.push('{ "type": "options", "key": "generalWellbeing", "question": "How are you feeling overall?", "options": [{"label": "Feeling good", "value": "0", "emoji": "😊"}, {"label": "A bit off", "value": "1", "emoji": "🙂"}, {"label": "Not great", "value": "2", "emoji": "😕"}, {"label": "Pretty rough", "value": "3", "emoji": "😣"}, {"label": "Terrible", "value": "4", "emoji": "😩"}] }');
  }

  // Only show pain scale if condition scores it
  if (scoringIds.has('painLevel') || scoringIds.has('abdominalPain') || scoringIds.has('overallPain')) {
    const painId = scoringIds.has('abdominalPain') ? 'abdominalPain' : scoringIds.has('overallPain') ? 'overallPain' : 'painLevel';
    components.push(`{ "type": "scale", "key": "${painId}", "question": "How bad is the pain?", "min": 0, "max": 10, "low_label": "No pain", "high_label": "Worst pain" }`);
  }

  // Only show fatigue if condition scores it
  if (scoringIds.has('fatigue')) {
    components.push('{ "type": "scale", "key": "fatigue", "question": "Energy level today?", "min": 0, "max": 10, "low_label": "Exhausted", "high_label": "Full of energy" }');
  }

  return components.join('\n\n');
}

/**
 * Generate save_data field definitions from the scoring system.
 */
function getScoringComponentSaveFields(cp: ConditionProfile): string {
  const lines: string[] = [];
  lines.push(`  "activityScore": <calculated ${cp.scoring.name} score>,`);
  lines.push(`  "scoringComponents": {`);
  for (const sc of cp.scoring.components) {
    if (sc.type === 'checklist') {
      lines.push(`    "${sc.id}": [<selected item IDs>],`);
    } else {
      lines.push(`    "${sc.id}": ${sc.min}-${sc.max},`);
    }
  }
  lines.push(`  }`);

  // Add condition-specific DB fields
  const extra = getConditionSpecificSaveFields(cp);
  if (extra) lines.push(extra);

  return lines.join('\n');
}

function getConditionSpecificUIComponents(cp: ConditionProfile): string {
  const components: string[] = [];

  // Dynamically generate UI components from the condition's scoring system
  // Skip universal fields already present (wellbeing, pain_level, fatigue, fever)
  const universalKeys = new Set(['generalWellbeing', 'painLevel', 'fatigue', 'fever', 'complications']);

  for (const sc of cp.scoring.components) {
    if (universalKeys.has(sc.id)) continue;

    if (sc.type === 'checklist' && sc.checklistItems) {
      const opts = sc.checklistItems.map(item =>
        `{"label": "${item.label}", "value": "${item.id}"}`
      ).join(', ');
      components.push(`{ "type": "multi_select", "key": "${sc.id}", "question": "${sc.description || sc.label}", "options": [${opts}] }`);
    } else if (sc.type === 'count') {
      components.push(`{ "type": "counter", "key": "${sc.id}", "question": "${sc.description || sc.label}" }`);
    } else {
      // scale
      components.push(`{ "type": "scale", "key": "${sc.id}", "question": "${sc.description || sc.label}", "min": ${sc.min}, "max": ${sc.max}, "low_label": "None", "high_label": "Severe" }`);
    }
  }

  // Also add category-specific DB fields not in scoring but useful for tracking
  if (cp.category === 'gastrointestinal') {
    if (!cp.scoring.components.some(c => c.id === 'blood')) {
      components.push('{ "type": "options", "key": "blood", "question": "Any blood when you go?", "options": [{"label": "None", "value": "none"}, {"label": "A little", "value": "trace"}, {"label": "Some", "value": "moderate"}, {"label": "A lot", "value": "severe"}] }');
    }
  }

  // Complications multi-select from condition profile
  if (cp.symptoms.complications.length > 0) {
    const opts = cp.symptoms.complications.slice(0, 6).map(c =>
      `{"label": "${c.gentleLabel}", "value": "${c.id}"}`
    ).join(', ');
    components.push(`{ "type": "multi_select", "key": "complications", "question": "Anything else going on?", "options": [${opts}] }`);
  }

  return components.join('\n\n');
}

function getConditionSpecificSaveFields(cp: ConditionProfile): string {
  const fields: string[] = [];
  const universalKeys = new Set(['generalWellbeing', 'painLevel', 'fatigue', 'fever', 'complications']);

  // Generate save fields from the scoring system
  for (const sc of cp.scoring.components) {
    if (universalKeys.has(sc.id)) continue;

    if (sc.type === 'checklist') {
      fields.push(`"${sc.id}": string[]`);
    } else if (sc.type === 'count') {
      fields.push(`"${sc.id}": number`);
    } else {
      fields.push(`"${sc.id}": ${sc.min}-${sc.max}`);
    }
  }

  // Add category-specific DB fields not in scoring
  if (cp.category === 'gastrointestinal') {
    if (!cp.scoring.components.some(c => c.id === 'blood')) {
      fields.push('"blood": "none"|"trace"|"moderate"|"severe"');
    }
  }

  if (fields.length === 0) return '';
  return ',\n  ' + fields.join(',\n  ');
}

/**
 * Build the full system prompt with all dynamic context
 */
async function buildSystemPrompt(
  conditionId: ConditionId,
  contextData?: string,
  cycleDay?: number | null,
  triggersContext?: string
): Promise<string> {
  const cp = await getConditionProfile(conditionId);
  let prompt = getBasePrompt(cp);

  // Add research-backed context (condition-appropriate)
  if (cp.category === 'gastrointestinal') {
    // Full IBD-specific context
    prompt += '\n' + getPolyphenolContextForAgent();
    prompt += '\n' + getPopulationContextForAgent();

    const actionableGenes = getActionableGenes();
    if (actionableGenes.length > 0) {
      prompt += '\n\nGene-lifestyle connections:';
      for (const g of actionableGenes.slice(0, 6)) {
        prompt += `\n- ${g.gene}: ${g.lifestyleRelevance}`;
      }
    }

    prompt += '\nGene-drug connections:';
    for (const [gene, drugs] of Object.entries(GENE_DRUG_MAP).slice(0, 4)) {
      for (const d of drugs) {
        prompt += `\n- ${d.drug} targets ${gene}. Natural support: ${d.naturalAlternative}`;
      }
    }
  } else {
    // Non-GI conditions: add relevant population stats
    if (cp.populationStats.length > 0) {
      prompt += '\n\nPopulation context:';
      for (const stat of cp.populationStats.slice(0, 5)) {
        prompt += `\n- ${stat.stat}: ${stat.value} (${stat.source}). ${stat.context}`;
      }
    }
  }

  // Circadian context (relevant to all autoimmune conditions)
  prompt += '\n\nCircadian rhythm insight:';
  prompt += '\n- Sleep disruption worsens autoimmune inflammation across all conditions';
  prompt += '\n- Time-restricted eating (6-8hr window) helps reset circadian rhythm';
  prompt += '\n- Even dim light at night increases inflammatory markers';

  // Menstrual cycle context
  if (cycleDay !== null && cycleDay !== undefined && cp.cycleImpact.hasImpact) {
    const phase = cp.cycleImpact.phases.find(p => {
      // Simple phase lookup by cycle day
      if (p.phase === 'menstrual' && cycleDay <= 5) return true;
      if (p.phase === 'follicular' && cycleDay > 5 && cycleDay <= 13) return true;
      if (p.phase === 'ovulatory' && cycleDay > 13 && cycleDay <= 16) return true;
      if (p.phase === 'luteal' && cycleDay > 16 && cycleDay <= 24) return true;
      if (p.phase === 'premenstrual' && cycleDay > 24) return true;
      return false;
    });

    if (phase) {
      prompt += `\n\nCurrent menstrual phase: ${phase.phase} (Day ${cycleDay})`;
      prompt += `\nRisk multiplier: ${phase.riskMultiplier}x`;
      prompt += `\nCommon symptoms in this phase: ${phase.commonSymptoms.join(', ')}`;
      prompt += `\nMechanism: ${phase.mechanism}`;
      prompt += `\nTip: ${phase.tip}`;
    }
  }

  // Add personal triggers discovered by the correlation engine
  if (triggersContext) {
    prompt += triggersContext;
  }

  if (contextData) {
    prompt += `\n\nRecent patient data:\n${contextData}`;
  }

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      history,
      collected_data,
      context_data,
      image_base64,
      cycle_day,
      condition_id,
      triggers_context,
    } = body as {
      message: string;
      history?: Array<{ role: string; content: string }>;
      collected_data?: Record<string, any>;
      context_data?: string;
      image_base64?: string;
      cycle_day?: number | null;
      condition_id?: ConditionId;
      triggers_context?: string;
    };

    if (!message && !image_base64) {
      return NextResponse.json({ error: 'Message or image required' }, { status: 400 });
    }

    const client = getAzureClient();
    const conditionId = condition_id || 'crohns';

    const systemPrompt = await buildSystemPrompt(conditionId, context_data, cycle_day, triggers_context);

    const messages: Array<any> = [
      { role: 'system', content: systemPrompt },
    ];

    if (history?.length) {
      for (const msg of history.slice(-15)) {
        messages.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
      }
    }

    let userContent: any = '';

    if (collected_data && Object.keys(collected_data).length > 0) {
      userContent = `${message}\n\n[User's follow-up answers: ${JSON.stringify(collected_data)}]`;
    } else if (image_base64) {
      userContent = [
        { type: 'text', text: message || 'I ate this. What is it and is it good for me?' },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image_base64}` } },
      ];
    } else {
      userContent = message;
    }

    messages.push({ role: 'user', content: userContent });

    const response = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || 'gpt-5.2-chat',
      max_completion_tokens: 1500,
      response_format: { type: 'json_object' },
      messages,
    });

    const content = response.choices[0]?.message?.content || '{}';

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        reply: content,
        intent: 'chat',
        extracted: null,
        needs_more: null,
        auto_save: false,
        save_data: null,
      };
    }

    return NextResponse.json({
      reply: parsed.reply || "I'm here. Tell me what's going on.",
      intent: parsed.intent || 'chat',
      extracted: parsed.extracted || null,
      needs_more: parsed.needs_more || null,
      auto_save: parsed.auto_save || false,
      save_data: parsed.save_data || null,
    });
  } catch (error: any) {
    console.error('Agent API error:', error);
    return NextResponse.json(
      { error: error.message || 'Agent failed to respond' },
      { status: 500 }
    );
  }
}
