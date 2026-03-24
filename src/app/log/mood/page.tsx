'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addMoodEntry } from '@/actions/mood';
import Link from 'next/link';

type ConvoStep = 'mood' | 'energy' | 'stress' | 'notes' | 'done';

function GutaBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 animate-slide-up">
      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
        </svg>
      </div>
      <div className="rounded-xl rounded-bl-sm border border-border bg-bg-secondary px-4 py-3 max-w-[85%]">
        <p className="text-[13px] text-text-primary leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end animate-slide-up">
      <div className="bg-text-primary rounded-xl rounded-br-sm px-4 py-2.5">
        <p className="text-[13px] text-white font-medium">{children}</p>
      </div>
    </div>
  );
}

const MOOD_OPTIONS = [
  { value: 1, emoji: '😢', label: 'Awful' },
  { value: 3, emoji: '😔', label: 'Low' },
  { value: 5, emoji: '😐', label: 'Meh' },
  { value: 7, emoji: '🙂', label: 'Good' },
  { value: 9, emoji: '😊', label: 'Great' },
  { value: 10, emoji: '🥰', label: 'Amazing' },
];

const ENERGY_OPTIONS = [
  { value: 1, emoji: '🪫', label: 'Empty' },
  { value: 3, emoji: '😴', label: 'Drained' },
  { value: 5, emoji: '😐', label: 'Okay' },
  { value: 7, emoji: '💪', label: 'Good' },
  { value: 10, emoji: '⚡', label: 'Charged' },
];

const STRESS_OPTIONS = [
  { value: 1, emoji: '🧘', label: 'Calm' },
  { value: 3, emoji: '😌', label: 'Relaxed' },
  { value: 5, emoji: '😐', label: 'Some' },
  { value: 7, emoji: '😰', label: 'Stressed' },
  { value: 10, emoji: '🤯', label: 'Overwhelmed' },
];

export default function MoodLoggerPage() {
  const router = useRouter();
  const [step, setStep] = useState<ConvoStep>('mood');
  const [saving, setSaving] = useState(false);

  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [stress, setStress] = useState(3);
  const [anxiety, setAnxiety] = useState(3);
  const [notes, setNotes] = useState('');

  // Conversation history
  const history: { question: string; answer: string }[] = [];
  if (step !== 'mood') history.push({
    question: "How's your mood right now?",
    answer: `${MOOD_OPTIONS.find(m => m.value === mood)?.emoji} ${MOOD_OPTIONS.find(m => m.value === mood)?.label}`,
  });
  if (step !== 'mood' && step !== 'energy') history.push({
    question: "How's your energy level?",
    answer: `${ENERGY_OPTIONS.find(e => e.value === energy)?.emoji} ${ENERGY_OPTIONS.find(e => e.value === energy)?.label}`,
  });
  if (step === 'notes' || step === 'done') history.push({
    question: "Any stress or anxiety today?",
    answer: `${STRESS_OPTIONS.find(s => s.value === stress)?.emoji} ${STRESS_OPTIONS.find(s => s.value === stress)?.label}`,
  });

  function selectMood(val: number) {
    setMood(val);
    setTimeout(() => setStep('energy'), 400);
  }
  function selectEnergy(val: number) {
    setEnergy(val);
    setTimeout(() => setStep('stress'), 400);
  }
  function selectStress(val: number) {
    setStress(val);
    setAnxiety(val); // correlate
    setTimeout(() => setStep('notes'), 400);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const now = new Date();
      await addMoodEntry({
        date: now.toISOString().split('T')[0],
        timestamp: now.getTime(),
        mood, energy, stress, anxiety, notes,
      });
      setStep('done');
    } catch (err) {
      console.error('Failed to save mood:', err);
      setSaving(false);
    }
  }

  if (step === 'done') {
    const gutaMsg = mood >= 7
      ? "I'm glad you're feeling good! Positive days matter — they help establish your personal baseline."
      : mood >= 4
      ? "Thanks for checking in. I'll track how your mood correlates with your other patterns."
      : "I hear you. Remember, bad days are valid and they pass. I'm tracking everything so we can find patterns to help.";

    return (
      <div className="max-w-md mx-auto px-5 pt-12 pb-28 space-y-5 animate-slide-up">
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl">{MOOD_OPTIONS.find(m => m.value === mood)?.emoji}</div>
          <p className="text-lg font-semibold text-text-primary">Mood logged</p>
        </div>
        <GutaBubble>{gutaMsg}</GutaBubble>
        <Link href="/">
          <button className="w-full bg-accent text-white font-semibold py-3.5 rounded-xl tap">
            Done
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-5 pt-4 pb-28 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/log" className="w-9 h-9 rounded-lg border border-border bg-bg flex items-center justify-center tap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-text-primary"><path d="M15 18l-6-6 6-6" /></svg>
        </Link>
        <div>
          <h1 className="text-base font-semibold text-text-primary">Mood Check-in</h1>
          <p className="text-[10px] text-text-tertiary">Quick emotional snapshot</p>
        </div>
      </div>

      {/* Conversation history */}
      {history.map((h, i) => (
        <div key={i} className="space-y-2">
          <GutaBubble>{h.question}</GutaBubble>
          <UserBubble>{h.answer}</UserBubble>
        </div>
      ))}

      {/* Current step */}
      {step === 'mood' && (
        <>
          <GutaBubble>How&apos;s your mood right now?</GutaBubble>
          <div className="pl-10 animate-slide-up">
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map(m => (
                <button key={m.value} onClick={() => selectMood(m.value)}
                  className="flex flex-col items-center gap-1 rounded-lg border border-border bg-bg px-4 py-3 tap hover:bg-bg-secondary transition-all">
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] font-semibold text-text-secondary">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {step === 'energy' && (
        <>
          <GutaBubble>How&apos;s your energy level?</GutaBubble>
          <div className="pl-10 animate-slide-up">
            <div className="flex flex-wrap gap-2">
              {ENERGY_OPTIONS.map(e => (
                <button key={e.value} onClick={() => selectEnergy(e.value)}
                  className="flex flex-col items-center gap-1 rounded-lg border border-border bg-bg px-4 py-3 tap hover:bg-bg-secondary transition-all">
                  <span className="text-2xl">{e.emoji}</span>
                  <span className="text-[10px] font-semibold text-text-secondary">{e.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {step === 'stress' && (
        <>
          <GutaBubble>Any stress or anxiety today?</GutaBubble>
          <div className="pl-10 animate-slide-up">
            <div className="flex flex-wrap gap-2">
              {STRESS_OPTIONS.map(s => (
                <button key={s.value} onClick={() => selectStress(s.value)}
                  className="flex flex-col items-center gap-1 rounded-lg border border-border bg-bg px-4 py-3 tap hover:bg-bg-secondary transition-all">
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="text-[10px] font-semibold text-text-secondary">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {step === 'notes' && (
        <>
          <GutaBubble>Anything else on your mind? Totally optional.</GutaBubble>
          <div className="pl-10 space-y-3 animate-slide-up">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Type here or skip..."
              rows={3}
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-bg text-sm text-text-primary placeholder:text-text-quaternary resize-none outline-none focus:ring-2 focus:ring-accent/30"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-accent text-white font-semibold py-3.5 rounded-xl tap text-sm disabled:opacity-40"
            >
              {saving ? 'Saving...' : notes.trim() ? 'Save' : 'Skip & Save'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
