'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { type FoodItem, type CompoundProfile } from '@/lib/db';
import { calculateActivityScore, getSeverity, getSecondaryScore } from '@/lib/scoring';
import { useCondition } from '@/lib/useCondition';
import { calculateCircadianScore, calculateSocialJetLag, getSleepDuration, getProgressiveBedtimeTarget } from '@/lib/circadian';
import { analyzeWithFooDB } from '@/lib/compounds';
import { calculateFlareRisk, type FlareRiskResult, getRiskColor, getRiskLabel } from '@/lib/flarePredictor';
import { getCycleInfo } from '@/lib/cyclePhase';
import { getPendingCheckins, generateScheduleContext, getMostUrgentCheckin, type PendingCheckin } from '@/lib/schedule';
import { getProfile } from '@/actions/profile';
import { addSymptom, getSymptomsByDateRange } from '@/actions/symptoms';
import { addFoodEntry, getFoodByDateRange } from '@/actions/food';
import { addSleepEntry, getSleepByDateRange } from '@/actions/sleep';
import { addMoodEntry, getMoodByDateRange } from '@/actions/mood';
import { getMedicationsByDateRange } from '@/actions/medications';
import { addChatMessage, getChatHistory } from '@/actions/chat';
import { runCorrelationAnalysisAction, recordPredictionFeedbackAction, getLearnedWeightsAction, getPersonalTriggersForAgentAction } from '@/actions/learning';

/* ═══════════════════════ TYPES ═══════════════════════ */

interface UIAction {
  type: 'options' | 'counter' | 'scale' | 'time_range' | 'toggle' | 'multi_select';
  key: string;
  question: string;
  options?: { label: string; value: string; emoji?: string }[];
  min?: number;
  max?: number;
  low_label?: string;
  high_label?: string;
}

interface AgentMessage {
  id: string;
  role: 'user' | 'aafiya';
  text: string;
  timestamp: number;
  image?: string;
  actions?: UIAction[];
  savedType?: string;
  savedSummary?: string;
  riskResult?: { score: number; level: string; label: string };
}

/* ═══════════════════════ SUBCOMPONENTS ═══════════════════════ */

function AafiyaBubble({ msg }: { msg: AgentMessage }) {
  return (
    <div className="animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] text-text-primary leading-[1.7] whitespace-pre-wrap">{msg.text}</p>
        </div>
      </div>
      {msg.savedType && (
        <div className="ml-10 mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-light border border-accent/15">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10A37F" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
          <span className="text-[12px] font-medium text-accent">{msg.savedSummary}</span>
        </div>
      )}
      {msg.riskResult && (
        <div className="ml-10 mt-3 flex items-center gap-4 p-4 rounded-xl border border-border bg-bg-secondary">
          <div className="relative">
            <svg width="52" height="52" viewBox="0 0 100 100" className="-rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E5E6" strokeWidth="5" />
              <circle cx="50" cy="50" r="40" fill="none" stroke={getRiskColor(msg.riskResult.level)} strokeWidth="5"
                strokeDasharray={`${2*Math.PI*40*(msg.riskResult.score/100)} ${2*Math.PI*40}`}
                strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: getRiskColor(msg.riskResult.level) }}>{msg.riskResult.score}</span>
          </div>
          <div>
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Flare Risk</p>
            <p className="text-sm font-semibold mt-0.5" style={{ color: getRiskColor(msg.riskResult.level) }}>{msg.riskResult.label}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function UserBubble({ msg }: { msg: AgentMessage }) {
  return (
    <div className="flex justify-end animate-slide-up">
      <div className="max-w-[80%]">
        {msg.image && (
          <img src={msg.image} alt="uploaded" className="rounded-xl max-h-48 ml-auto mb-2" />
        )}
        {msg.text && (
          <div className="bg-bg-secondary rounded-2xl rounded-br-sm px-4 py-2.5">
            <p className="text-[13.5px] text-text-primary whitespace-pre-wrap">{msg.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionUI({ actions, onRespond }: { actions: UIAction[]; onRespond: (data: Record<string, any>) => void }) {
  const [collected, setCollected] = useState<Record<string, any>>({});
  const [multiSelects, setMultiSelects] = useState<Record<string, string[]>>({});
  const [counters, setCounters] = useState<Record<string, number>>({});

  function submit() {
    const data = { ...collected };
    for (const [k, v] of Object.entries(multiSelects)) data[k] = v;
    for (const [k, v] of Object.entries(counters)) data[k] = v;
    onRespond(data);
  }

  return (
    <div className="ml-10 space-y-4 animate-slide-up">
      {actions.map(action => (
        <div key={action.key}>
          {action.type === 'options' && (
            <div>
              <p className="text-[12.5px] font-medium text-text-secondary mb-2.5">{action.question}</p>
              <div className="flex flex-wrap gap-2">
                {action.options?.map(opt => (
                  <button key={opt.value} onClick={() => setCollected(p => ({ ...p, [action.key]: opt.value }))}
                    className={`px-3.5 py-2 rounded-lg text-[12.5px] font-medium transition-all ${
                      collected[action.key] === opt.value
                        ? 'bg-accent text-white'
                        : 'bg-bg-secondary text-text-primary border border-border hover:border-text-quaternary'
                    }`}>
                    {opt.emoji && <span className="mr-1.5">{opt.emoji}</span>}{opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {action.type === 'counter' && (
            <div>
              <p className="text-[12.5px] font-medium text-text-secondary mb-2.5">{action.question}</p>
              <div className="flex items-center gap-4 p-3 rounded-xl border border-border bg-bg-secondary w-fit">
                <button onClick={() => setCounters(p => ({ ...p, [action.key]: Math.max(0, (p[action.key] || 0) - 1) }))}
                  className="w-9 h-9 rounded-lg border border-border bg-bg flex items-center justify-center text-lg font-medium text-text-secondary tap hover:bg-bg-tertiary">−</button>
                <span className="text-2xl font-semibold text-text-primary tabular-nums w-8 text-center">{counters[action.key] || 0}</span>
                <button onClick={() => setCounters(p => ({ ...p, [action.key]: (p[action.key] || 0) + 1 }))}
                  className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-lg font-medium text-white tap">+</button>
              </div>
            </div>
          )}

          {action.type === 'scale' && (
            <div>
              <p className="text-[12.5px] font-medium text-text-secondary mb-2.5">{action.question}</p>
              <div className="flex gap-1">
                {Array.from({ length: (action.max || 10) - (action.min || 0) + 1 }, (_, i) => i + (action.min || 0)).map(v => (
                  <button key={v} onClick={() => setCollected(p => ({ ...p, [action.key]: v }))}
                    className={`flex-1 py-2 rounded-md text-[11px] font-medium transition-all ${
                      collected[action.key] === v
                        ? v <= 3 ? 'bg-green text-white' : v <= 6 ? 'bg-amber text-white' : 'bg-red text-white'
                        : 'bg-bg-secondary text-text-secondary border border-border hover:bg-bg-tertiary'
                    }`}>{v}</button>
                ))}
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-text-tertiary">{action.low_label || 'Low'}</span>
                <span className="text-[10px] text-text-tertiary">{action.high_label || 'High'}</span>
              </div>
            </div>
          )}

          {action.type === 'toggle' && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-bg-secondary">
              <p className="text-[12.5px] font-medium text-text-primary">{action.question}</p>
              <button onClick={() => setCollected(p => ({ ...p, [action.key]: !p[action.key] }))}
                className={`w-11 h-6 rounded-full transition-all relative ${collected[action.key] ? 'bg-accent' : 'bg-bg-tertiary border border-border'}`}>
                <div className={`w-4.5 h-4.5 rounded-full bg-bg shadow-sm absolute top-[3px] transition-transform ${collected[action.key] ? 'translate-x-[22px]' : 'translate-x-[3px]'}`} />
              </button>
            </div>
          )}

          {action.type === 'multi_select' && (
            <div>
              <p className="text-[12.5px] font-medium text-text-secondary mb-2.5">{action.question}</p>
              <div className="flex flex-wrap gap-2">
                {action.options?.map(opt => {
                  const selected = (multiSelects[action.key] || []).includes(opt.value);
                  return (
                    <button key={opt.value}
                      onClick={() => setMultiSelects(p => {
                        const current = p[action.key] || [];
                        return { ...p, [action.key]: selected ? current.filter(v => v !== opt.value) : [...current, opt.value] };
                      })}
                      className={`px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                        selected ? 'bg-accent text-white' : 'bg-bg-secondary text-text-primary border border-border hover:border-text-quaternary'
                      }`}>
                      {opt.emoji && <span className="mr-1">{opt.emoji}</span>}{opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {action.type === 'time_range' && (
            <div>
              <p className="text-[12.5px] font-medium text-text-secondary mb-2.5">{action.question}</p>
              <div className="flex gap-3 p-3 rounded-xl border border-border bg-bg-secondary">
                <div className="flex-1">
                  <label className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider mb-1.5 block">Bedtime</label>
                  <input type="time" value={collected[`${action.key}_bed`] || '23:00'}
                    onChange={e => setCollected(p => ({ ...p, [`${action.key}_bed`]: e.target.value, [action.key]: true }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm font-medium text-text-primary" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider mb-1.5 block">Wake up</label>
                  <input type="time" value={collected[`${action.key}_wake`] || '07:00'}
                    onChange={e => setCollected(p => ({ ...p, [`${action.key}_wake`]: e.target.value, [action.key]: true }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm font-medium text-text-primary" />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      <button onClick={submit}
        className="px-6 py-2.5 rounded-lg bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-colors">
        Continue
      </button>
    </div>
  );
}

function DashboardCard({ flareRisk }: { flareRisk: FlareRiskResult | null }) {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    // Show feedback prompt after 2 seconds if risk is shown
    if (flareRisk) {
      const timer = setTimeout(() => setShowFeedback(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [flareRisk]);

  if (!flareRisk) return null;
  const color = getRiskColor(flareRisk.level);

  async function giveFeedback(outcome: 'no_flare' | 'mild_flare' | 'moderate_flare' | 'severe_flare') {
    await recordPredictionFeedbackAction({
      predictedLevel: flareRisk!.level,
      predictedScore: flareRisk!.score,
      actualOutcome: outcome,
      factors: flareRisk!.factors.map(f => ({ factor: f.factor, contribution: f.contribution })),
    });
    setFeedbackGiven(true);
  }

  return (
    <div className="rounded-xl border border-border p-4 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="relative">
          <svg width="56" height="56" viewBox="0 0 100 100" className="-rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E5E6" strokeWidth="5" />
            <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="5"
              strokeDasharray={`${2*Math.PI*40*(flareRisk.score/100)} ${2*Math.PI*40}`}
              strokeLinecap="round" className="animate-gauge" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-base font-bold" style={{ color }}>{flareRisk.score}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-sm font-semibold" style={{ color }}>{getRiskLabel(flareRisk.level)}</span>
          </div>
          <p className="text-[12px] text-text-secondary mt-1 leading-relaxed line-clamp-2">{flareRisk.recommendation}</p>
        </div>
      </div>
      {/* Prediction Feedback */}
      {showFeedback && !feedbackGiven && (
        <div className="mt-3 pt-3 border-t border-border animate-slide-up">
          <p className="text-[11px] text-text-tertiary mb-2">How did yesterday go? This helps Aafiya learn.</p>
          <div className="flex gap-1.5">
            {[
              { label: 'No flare', value: 'no_flare' as const, emoji: '😊' },
              { label: 'Mild', value: 'mild_flare' as const, emoji: '🙂' },
              { label: 'Moderate', value: 'moderate_flare' as const, emoji: '😕' },
              { label: 'Severe', value: 'severe_flare' as const, emoji: '😣' },
            ].map(opt => (
              <button key={opt.value} onClick={() => giveFeedback(opt.value)}
                className="flex-1 py-1.5 rounded-lg bg-bg-secondary text-[10px] font-medium text-text-secondary hover:bg-bg-tertiary transition-colors">
                <span className="block text-sm">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {feedbackGiven && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-[11px] text-accent font-medium text-center">Thanks! Aafiya is learning from your feedback.</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ MAIN AGENT ═══════════════════════ */

export default function AafiyaAgent() {
  const router = useRouter();
  const { conditionId, profile: conditionProfile } = useCondition();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [pendingActions, setPendingActions] = useState<UIAction[] | null>(null);
  const [pendingContext, setPendingContext] = useState<Record<string, any>>({});
  const [isListening, setIsListening] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [flareRisk, setFlareRisk] = useState<FlareRiskResult | null>(null);
  const [pendingSchedule, setPendingSchedule] = useState<PendingCheckin[]>([]);
  const [loaded, setLoaded] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Speech-to-text via Azure STT
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Load profile + flare risk + chat history
  useEffect(() => {
    async function init() {
      const p = await getProfile();
      setProfile(p || null);
      if (!p?.onboardingComplete) { router.push('/onboarding'); return; }

      const history = await getChatHistory();
      const mapped: AgentMessage[] = history.map((h: any) => ({
        id: h.id, role: h.role === 'assistant' ? 'aafiya' : 'user', text: h.content, timestamp: h.timestamp,
      }));
      setMessages(mapped);

      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      const [symptoms, sleep, food, mood, meds] = await Promise.all([
        getSymptomsByDateRange(weekAgo, today + '\uffff'),
        getSleepByDateRange(weekAgo, today + '\uffff'),
        getFoodByDateRange(weekAgo, today + '\uffff'),
        getMoodByDateRange(weekAgo, today + '\uffff'),
        getMedicationsByDateRange(weekAgo, today + '\uffff'),
      ]);
      const learnedW = await getLearnedWeightsAction();
      const risk = calculateFlareRisk({
        recentSymptoms: symptoms, recentSleep: sleep, recentFood: food, recentMood: mood, recentMeds: meds,
        cycleStartDate: p?.cycleStartDate, cycleLength: p?.cycleLength, currentDate: today,
        targetBedtime: p?.targetBedtime || '22:00', targetWakeTime: p?.targetWakeTime || '07:00',
        learnedWeights: learnedW,
      });
      setFlareRisk(risk);

      // Check pending check-ins
      const pending = await getPendingCheckins();
      setPendingSchedule(pending);
      setLoaded(true);

      // Build welcome message based on what's pending
      if (history.length === 0) {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
        const urgent = getMostUrgentCheckin(pending);

        let welcomeText = `${greeting}${p?.name ? `, ${p.name}` : ''}! I'm Aafiya, and I'm here for you.`;

        if (urgent) {
          welcomeText += `\n\n${urgent.item.aafiyaPrompt}`;
        } else {
          welcomeText += `\n\nJust tell me what's going on — what you ate, how you're feeling, your sleep, your mood. You can also snap a photo of your food or use the mic.`;
        }

        const welcome: AgentMessage = {
          id: crypto.randomUUID(), role: 'aafiya', timestamp: Date.now(),
          text: welcomeText,
        };
        setMessages([welcome]);
      } else {
        // Returning user — check if there's something urgent to prompt
        const lastMsg = history[history.length - 1];
        const timeSinceLastMsg = Date.now() - lastMsg.timestamp;
        const urgent = getMostUrgentCheckin(pending);

        // If it's been more than 30 minutes since last message and something is pending
        if (urgent && timeSinceLastMsg > 30 * 60 * 1000) {
          const prompt: AgentMessage = {
            id: crypto.randomUUID(), role: 'aafiya', timestamp: Date.now(),
            text: urgent.status === 'overdue' ? urgent.item.aafiyaReminder : urgent.item.aafiyaPrompt,
          };
          setMessages(prev => [...prev, prompt]);
          await addChatMessage({ timestamp: prompt.timestamp, role: 'assistant', content: prompt.text });
        }
      }
    }
    init();
  }, [router]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, pendingActions]);

  async function getContextData(): Promise<string> {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const [symptoms, sleep, food, mood] = await Promise.all([
      getSymptomsByDateRange(weekAgo, today + '\uffff'),
      getSleepByDateRange(weekAgo, today + '\uffff'),
      getFoodByDateRange(weekAgo, today + '\uffff'),
      getMoodByDateRange(weekAgo, today + '\uffff'),
    ]);
    let ctx = '';
    if (symptoms.length) ctx += `Recent symptoms: ${symptoms.slice(-3).map((s: any) => `${s.date}: HBI=${s.hbiScore}, pain=${s.painLevel}`).join('; ')}\n`;
    if (sleep.length) ctx += `Recent sleep: ${sleep.slice(-3).map((s: any) => `${s.date}: ${s.bedtime}-${s.wakeTime}, score=${s.circadianScore}`).join('; ')}\n`;
    if (food.length) ctx += `Recent meals: ${food.slice(-3).map((f: any) => `${f.date} ${f.mealType}: ${f.description}`).join('; ')}\n`;
    if (mood.length) ctx += `Recent mood: ${mood.slice(-2).map((m: any) => `${m.date}: mood=${m.mood}, energy=${m.energy}, stress=${m.stress}`).join('; ')}\n`;
    if (profile?.cycleStartDate) {
      const info = getCycleInfo(profile.cycleStartDate, today, profile.cycleLength || 28);
      ctx += `Cycle: Day ${info.cycleDay} (${info.phase} phase)\n`;
    }

    // Add schedule context
    const pending = await getPendingCheckins();
    setPendingSchedule(pending);
    ctx += `\n${generateScheduleContext(pending)}`;

    return ctx;
  }

  async function saveData(data: any): Promise<string> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (data.type === 'symptoms') {
      // Normalize keys: the AI may send snake_case or camelCase
      const norm = (key: string) => {
        // Try camelCase, then snake_case
        if (data[key] !== undefined) return data[key];
        const snake = key.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`);
        if (data[snake] !== undefined) return data[snake];
        return undefined;
      };

      const score = calculateActivityScore(conditionProfile.scoring, { components: data });
      const severity = getSeverity(conditionProfile.scoring, score);
      const secondary = getSecondaryScore(conditionProfile.scoring, score) ?? 0;
      const isCrohns = conditionId === 'crohns';

      // Build scoringComponents from the condition's scoring system
      const scoringComponents: Record<string, number> = {};
      for (const sc of conditionProfile.scoring.components) {
        const val = norm(sc.id);
        if (typeof val === 'number') scoringComponents[sc.id] = val;
      }

      await addSymptom({
        date: today, timestamp: now.getTime(),
        generalWellbeing: norm('generalWellbeing') || 0, painLevel: norm('painLevel') || 0,
        painLocation: norm('painLocation') || 'none', liquidStools: norm('liquidStools') || 0,
        abdominalMass: norm('abdominalMass') || 0, complications: data.complications || [],
        bowelFrequency: norm('liquidStools') || 0, bristolScale: 4,
        blood: norm('blood') || 'none', urgency: norm('urgency') || 0, fatigue: norm('fatigue') || 0,
        nausea: norm('nausea') || 0,
        jointPain: norm('jointPain') || norm('muscleJointAches') || ((data.complications || []).includes('arthralgia') ? 5 : 0),
        fever: data.fever || false,
        conditionId,
        activityScore: score,
        secondaryScore: secondary,
        scoringComponents,
        // Endocrine-specific fields
        coldSensitivity: norm('coldSensitivity'),
        weightChange: norm('weightChange') || norm('weightChanges'),
        cognitiveFunction: norm('brainFog') || norm('cognitiveFunction'),
        // Skin-specific
        skinSeverity: norm('skinSeverity'),
        bodyAreaAffected: norm('bodyAreaAffected'),
        itching: norm('itching'),
        // Neuro-specific
        numbnessTingling: norm('numbnessTingling'),
        visionIssues: norm('visionIssues'),
        balanceIssues: norm('balanceIssues'),
        // Joint-specific
        morningStiffness: norm('morningStiffness'),
        swollenJoints: norm('swollenJoints'),
        tenderJoints: norm('tenderJoints'),
        hbiScore: isCrohns ? score : 0,
        cdaiEstimate: isCrohns ? secondary : 0,
      });
      // Auto-run correlation analysis after symptom save (non-blocking)
      runCorrelationAnalysisAction().catch(() => {});
      return `Symptoms saved — ${conditionProfile.scoring.name}: ${score} (${severity.label})`;
    }

    if (data.type === 'food') {
      const skipped = data.skipped === true;

      if (skipped) {
        await addFoodEntry({
          date: today, timestamp: now.getTime(),
          mealType: data.mealType || 'lunch', description: 'Skipped',
          skipped: true, foodItems: [], compounds: null, mealRisk: null, notes: '',
        });
        return `${data.mealType || 'Meal'} skipped — noted`;
      }

      let foodItems: FoodItem[] = (data.foods || []).map((f: any) => ({ name: f.name, quantity: f.quantity || 100, unit: f.unit || 'g' }));
      let compounds: CompoundProfile | null = null;
      let mealRisk: 'low' | 'medium' | 'high' | null = null;

      const mergedNutrients: Record<string, number> = {};
      for (const food of foodItems) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/food/search?query=${encodeURIComponent(food.name)}&pageSize=1`);
          if (res.ok) {
            const d = await res.json();
            const first = d.foods?.[0];
            if (first) {
              food.fdcId = first.fdcId;
              const nutrients: Record<string, number> = {};
              for (const n of first.foodNutrients || []) {
                if (n.nutrientName && n.value !== undefined) {
                  nutrients[n.nutrientName] = n.value;
                  mergedNutrients[n.nutrientName] = (mergedNutrients[n.nutrientName] || 0) + n.value;
                }
              }
              food.nutrients = nutrients;
            }
          }
        } catch { /* continue */ }
      }

      if (Object.keys(mergedNutrients).length > 0) {
        const foodNamesList = foodItems.map((f: FoodItem) => f.name);
        const analysis = analyzeWithFooDB(mergedNutrients, foodNamesList);
        mealRisk = analysis.overallRisk;
        compounds = {
          totalFiber: mergedNutrients['Fiber, total dietary'] || 0,
          insolubleFiber: 0, lactose: mergedNutrients['Lactose'] || 0,
          fructose: mergedNutrients['Fructose'] || 0, caffeine: mergedNutrients['Caffeine'] || 0,
          alcohol: mergedNutrients['Alcohol, ethyl'] || 0, fodmapScore: 0,
          riskCompounds: analysis.flareCompounds.map(c => ({ name: c.name, amount: c.amount, riskRank: c.riskRank, direction: c.direction })),
        };
      }

      await addFoodEntry({
        date: today, timestamp: now.getTime(),
        mealType: data.mealType || 'lunch', description: data.description || '',
        skipped: false, foodItems, compounds, mealRisk, notes: '',
      });
      return `${data.mealType || 'Meal'} saved${mealRisk ? ` — ${mealRisk} risk` : ''}`;
    }

    if (data.type === 'sleep') {
      const noSleep = data.noSleep === true;
      const bed = noSleep ? '00:00' : (data.bedtime || '23:00');
      const wake = noSleep ? '07:00' : (data.wakeTime || '07:00');
      const tBed = profile?.targetBedtime || '22:00';
      const tWake = profile?.targetWakeTime || '07:00';
      const duration = noSleep ? 0 : getSleepDuration(bed, wake);
      const jetLag = noSleep ? 999 : calculateSocialJetLag(bed, wake, tBed, tWake);
      const score = noSleep ? 0 : calculateCircadianScore(bed, wake, tBed, tWake);
      const target = getProgressiveBedtimeTarget(bed, tBed, 1);

      await addSleepEntry({
        date: today, bedtime: bed, wakeTime: wake,
        duration, quality: noSleep ? 1 : (data.quality || 3), socialJetLagMinutes: jetLag,
        circadianScore: score, targetBedtime: target, metTarget: false,
      });
      if (noSleep) return 'Noted — no sleep last night';
      return `Sleep saved — Circadian score: ${score}/100, ${Math.floor(duration/60)}h ${duration%60}m`;
    }

    if (data.type === 'mood') {
      await addMoodEntry({
        date: today, timestamp: now.getTime(),
        mood: data.mood || 5, energy: data.energy || 5,
        stress: data.stress || 3, anxiety: data.anxiety || 3,
        notes: data.notes || '',
      });
      return `Mood saved — ${data.mood >= 7 ? 'Glad you\'re feeling good!' : data.mood >= 4 ? 'Noted, tracking patterns.' : 'Hang in there.'}`;
    }

    return 'Saved';
  }

  const sendMessage = useCallback(async (text: string, imageBase64?: string) => {
    if ((!text.trim() && !imageBase64) || processing) return;

    const userMsg: AgentMessage = {
      id: crypto.randomUUID(), role: 'user', text: text.trim(), timestamp: Date.now(),
      image: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : undefined,
    };
    setMessages(prev => [...prev, userMsg]);
    await addChatMessage({ timestamp: userMsg.timestamp, role: 'user', content: text.trim() });

    setInput('');
    setPendingActions(null);
    setProcessing(true);

    try {
      const contextData = await getContextData();
      const triggersCtx = await getPersonalTriggersForAgentAction();
      const history = messages.slice(-10).map((m: any) => ({
        role: m.role === 'aafiya' ? 'assistant' : 'user',
        content: m.text,
      }));

      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history,
          collected_data: Object.keys(pendingContext).length > 0 ? pendingContext : undefined,
          context_data: contextData,
          image_base64: imageBase64,
          cycle_day: profile?.cycleStartDate
            ? getCycleInfo(profile.cycleStartDate, new Date().toISOString().split('T')[0], profile.cycleLength || 28).cycleDay
            : null,
          condition_id: (profile as any)?.conditionId || 'crohns',
          triggers_context: triggersCtx || undefined,
        }),
      });

      if (!res.ok) throw new Error('Agent failed');

      const data = await res.json();

      let savedSummary: string | undefined;
      let savedType: string | undefined;

      if (data.auto_save && data.save_data) {
        try {
          savedSummary = await saveData(data.save_data);
          savedType = data.save_data.type;
          setPendingContext({});
        } catch (err) {
          console.error('Auto-save failed:', err);
        }
      }

      const aafiyaMsg: AgentMessage = {
        id: crypto.randomUUID(), role: 'aafiya', text: data.reply, timestamp: Date.now(),
        actions: data.needs_more || undefined,
        savedType, savedSummary,
      };
      setMessages(prev => [...prev, aafiyaMsg]);
      await addChatMessage({ timestamp: aafiyaMsg.timestamp, role: 'assistant', content: data.reply });

      if (data.needs_more && data.needs_more.length > 0) {
        setPendingActions(data.needs_more);
        if (data.extracted) {
          setPendingContext(prev => ({ ...prev, ...data.extracted }));
        }
      } else {
        setPendingActions(null);
        setPendingContext({});
      }
    } catch {
      const errMsg: AgentMessage = {
        id: crypto.randomUUID(), role: 'aafiya', text: "Sorry, I had trouble processing that. Could you try again?", timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setProcessing(false);
      inputRef.current?.focus();
    }
  }, [messages, processing, pendingContext, profile]);

  // Handle check-in redirects from log pages
  const checkinHandled = useRef(false);
  useEffect(() => {
    if (!loaded || checkinHandled.current) return;
    const params = new URLSearchParams(window.location.search);
    const checkin = params.get('checkin');
    if (checkin) {
      checkinHandled.current = true;
      const checkinMessages: Record<string, string> = {
        symptoms: "I want to do my daily check-in",
        food: "I want to log what I ate",
        sleep: "I want to log my sleep",
        mood: "I want to check in about my mood",
      };
      const msg = checkinMessages[checkin];
      if (msg) {
        setTimeout(() => sendMessage(msg), 500);
      }
      window.history.replaceState({}, '', '/');
    }
  }, [loaded, sendMessage]);

  function handleActionRespond(data: Record<string, any>) {
    const merged = { ...pendingContext, ...data };
    setPendingContext(merged);
    setPendingActions(null);
    sendMessage(`Here are my answers: ${JSON.stringify(data)}`);
  }

  async function toggleSTT() {
    if (isListening) {
      mediaRecorderRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 1000) return;

        setInput('Transcribing...');
        try {
          const form = new FormData();
          form.append('file', audioBlob, 'voice.webm');
          const res = await fetch('/api/ai/stt', { method: 'POST', body: form });
          const data = await res.json();
          if (data.text) {
            setInput(data.text);
            setTimeout(() => sendMessage(data.text), 300);
          } else {
            setInput('');
          }
        } catch {
          setInput('');
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsListening(true);
    } catch {
      alert('Microphone access denied');
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      sendMessage(input || 'I ate this', base64);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  if (!loaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          </svg>
        </div>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary" style={{ animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary" style={{ animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '200ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary" style={{ animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '400ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[100dvh]">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            </svg>
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-text-primary tracking-tight">Aafiya</h1>
            <p className="text-[11px] text-text-tertiary">Your wellness companion</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <a href="/insights" className="p-2 rounded-lg hover:bg-bg-secondary transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-text-tertiary"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
          </a>
          <a href="/more" className="p-2 rounded-lg hover:bg-bg-secondary transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-text-tertiary">
              <circle cx="12" cy="5" r="1.5" fill="currentColor" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /><circle cx="12" cy="19" r="1.5" fill="currentColor" />
            </svg>
          </a>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {flareRisk && messages.length <= 1 && <DashboardCard flareRisk={flareRisk} />}

        {messages.map((msg: any) => (
          msg.role === 'aafiya' ? <AafiyaBubble key={msg.id} msg={msg} /> : <UserBubble key={msg.id} msg={msg} />
        ))}

        {pendingActions && pendingActions.length > 0 && !processing && (
          <ActionUI actions={pendingActions} onRespond={handleActionRespond} />
        )}

        {processing && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              </svg>
            </div>
            <div className="flex gap-1.5 pt-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-text-quaternary" style={{ animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-text-quaternary" style={{ animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '200ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-text-quaternary" style={{ animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '400ms' }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-5 pb-6 pt-3 border-t border-border shrink-0">
        <div className="flex items-center gap-2 p-1.5 rounded-xl border border-border bg-bg focus-within:border-accent/40 focus-within:shadow-[0_0_0_2px_rgba(16,163,127,0.08)] transition-all">
          <button onClick={() => fileRef.current?.click()}
            className="p-2 rounded-lg hover:bg-bg-secondary transition-colors shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-text-tertiary">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
            </svg>
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />

          <input ref={inputRef} type="text" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Tell Aafiya anything..."
            className="flex-1 py-2 text-[14px] text-text-primary placeholder:text-text-quaternary bg-transparent outline-none"
            disabled={processing}
          />

          <button onClick={toggleSTT}
            className={`p-2 rounded-lg transition-colors shrink-0 ${
              isListening ? 'bg-red text-white' : 'hover:bg-bg-secondary'
            }`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isListening ? 'white' : 'currentColor'} strokeWidth="1.8" className={isListening ? '' : 'text-text-tertiary'}>
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
            </svg>
          </button>

          <button onClick={() => sendMessage(input)} disabled={!input.trim() || processing}
            className="p-2 rounded-lg bg-accent text-white shrink-0 disabled:opacity-25 hover:bg-accent-hover transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>
          </button>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-0.5 scrollbar-none">
          {[
            { label: 'Symptoms', msg: "I want to log my symptoms" },
            { label: 'Food', msg: "I want to log what I ate" },
            { label: 'Sleep', msg: "I want to log my sleep" },
            { label: 'Mood', msg: "I want to check in about my mood" },
            { label: 'How am I?', msg: "How am I doing? Give me my risk assessment" },
          ].map(q => (
            <button key={q.label} onClick={() => sendMessage(q.msg)}
              className="px-3 py-1.5 rounded-lg border border-border text-[12px] font-medium text-text-secondary whitespace-nowrap hover:bg-bg-secondary hover:text-text-primary transition-colors shrink-0">
              {q.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
