'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/actions/profile';
import { addSleepEntry } from '@/actions/sleep';
import {
  calculateCircadianScore, calculateSocialJetLag, getSleepDuration,
  getProgressiveBedtimeTarget, getCircadianInsight,
} from '@/lib/circadian';
import Link from 'next/link';

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

const QUALITY_OPTIONS = [
  { value: 1, emoji: '😫', label: 'Awful' },
  { value: 2, emoji: '😔', label: 'Poor' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '😴', label: 'Great' },
];

export default function SleepLoggerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<'times' | 'quality' | 'done'>('times');

  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState(3);
  const [targetBedtime, setTargetBedtime] = useState('22:00');
  const [targetWakeTime, setTargetWakeTime] = useState('07:00');

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile();
        if (profile) {
          if (profile.targetBedtime) setTargetBedtime(profile.targetBedtime);
          if (profile.targetWakeTime) setTargetWakeTime(profile.targetWakeTime);
        }
      } catch { /* ignore */ }
    }
    loadProfile();
  }, []);

  const duration = useMemo(() => getSleepDuration(bedtime, wakeTime), [bedtime, wakeTime]);
  const jetLag = useMemo(() => calculateSocialJetLag(bedtime, wakeTime, targetBedtime, targetWakeTime), [bedtime, wakeTime, targetBedtime, targetWakeTime]);
  const circadianScore = useMemo(() => calculateCircadianScore(bedtime, wakeTime, targetBedtime, targetWakeTime), [bedtime, wakeTime, targetBedtime, targetWakeTime]);
  const insight = useMemo(() => getCircadianInsight(circadianScore, jetLag), [circadianScore, jetLag]);
  const progressiveTarget = useMemo(() => getProgressiveBedtimeTarget(bedtime, targetBedtime, 1), [bedtime, targetBedtime]);

  const durationHours = Math.floor(duration / 60);
  const durationMins = duration % 60;
  const scoreColor = circadianScore >= 70 ? 'text-accent' : circadianScore >= 40 ? 'text-amber-500' : 'text-red-500';

  async function handleSave() {
    setSaving(true);
    try {
      const now = new Date();
      await addSleepEntry({
        date: now.toISOString().split('T')[0],
        bedtime, wakeTime, duration, quality,
        socialJetLagMinutes: jetLag,
        circadianScore,
        targetBedtime: progressiveTarget,
        metTarget: jetLag <= 30,
      });
      setStep('done');
    } catch (err) {
      console.error('Failed to save sleep:', err);
      setSaving(false);
    }
  }

  function selectQuality(val: number) {
    setQuality(val);
    setTimeout(() => handleSave(), 500);
  }

  if (step === 'done') {
    const gutaMsg = circadianScore >= 70
      ? `Great rhythm! ${durationHours}h ${durationMins}m of sleep with a circadian score of ${circadianScore}. Keep this up — your clock genes will thank you.`
      : circadianScore >= 40
      ? `${durationHours}h ${durationMins}m with a circadian score of ${circadianScore}. Not bad! Your progressive target is bedtime by ${progressiveTarget} — small shifts make a big difference.`
      : `I see a circadian score of ${circadianScore}. Your sleep timing is quite far from your target. ${insight}`;

    return (
      <div className="max-w-md mx-auto px-5 pt-12 pb-28 space-y-5 animate-slide-up">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-violet-600 flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
          </div>
          <p className="text-lg font-semibold text-text-primary">Sleep logged</p>
        </div>

        {/* Score */}
        <div className="rounded-xl border border-border bg-bg p-5 text-center">
          <p className="text-[9px] text-text-tertiary font-semibold uppercase tracking-[0.15em]">Circadian Score</p>
          <p className={`text-4xl font-semibold mt-2 ${scoreColor}`}>{circadianScore}</p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs">
            <span className="text-text-secondary">{durationHours}h {durationMins}m slept</span>
            <span className="text-text-tertiary">|</span>
            <span className={jetLag > 120 ? 'text-red-500' : 'text-text-secondary'}>{Math.floor(jetLag / 60)}h {jetLag % 60}m jet lag</span>
          </div>
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
          <h1 className="text-base font-semibold text-text-primary">Log Sleep</h1>
          <p className="text-[10px] text-text-tertiary">Circadian rhythm tracking</p>
        </div>
      </div>

      {step === 'times' && (
        <>
          <GutaBubble>When did you go to bed and wake up?</GutaBubble>

          <div className="pl-10 animate-slide-up">
            <div className="rounded-xl border border-border bg-bg p-5 space-y-5">
              {/* Bedtime */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
                  </div>
                  <span className="text-sm font-semibold text-text-primary">Bedtime</span>
                </div>
                <input
                  type="time" value={bedtime} onChange={e => setBedtime(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border bg-bg text-sm font-semibold text-text-primary text-center w-28 outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>

              {/* Wake */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
                  </div>
                  <span className="text-sm font-semibold text-text-primary">Wake up</span>
                </div>
                <input
                  type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border bg-bg text-sm font-semibold text-text-primary text-center w-28 outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>

              {/* Live preview */}
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-text-secondary">Duration</span>
                <span className="text-sm font-semibold text-text-primary">{durationHours}h {durationMins}m</span>
              </div>
            </div>

            <button
              onClick={() => setStep('quality')}
              className="w-full mt-3 bg-text-primary text-white font-semibold py-3.5 rounded-xl tap text-sm"
            >
              Continue
            </button>
          </div>
        </>
      )}

      {step === 'quality' && (
        <>
          <GutaBubble>How was the quality of your sleep?</GutaBubble>
          <div className="pl-10 animate-slide-up">
            <div className="rounded-xl border border-border bg-bg p-4">
              <div className="flex justify-between">
                {QUALITY_OPTIONS.map(q => (
                  <button
                    key={q.value}
                    onClick={() => selectQuality(q.value)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-lg tap transition-all ${
                      quality === q.value ? 'bg-accent/10 scale-110' : ''
                    }`}
                  >
                    <span className="text-2xl">{q.emoji}</span>
                    <span className="text-[9px] font-semibold text-text-secondary">{q.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
