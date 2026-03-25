'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { upsertProfile } from '@/actions/profile';
import { seedMedicationTasksNow } from '@/actions/tasks';
import { Button } from '@/components/ui/Button';
import { CONDITION_OPTIONS, getConditionsByCategory, CATEGORY_LABELS, getConditionProfile } from '@/lib/conditions/index';
import type { ConditionId, ConditionProfile } from '@/lib/conditions/types';

const steps = ['welcome', 'condition', 'profile', 'sleep', 'cycle', 'medications', 'ready'] as const;
type Step = typeof steps[number];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('welcome');
  const [conditionId, setConditionId] = useState<ConditionId | null>(null);
  const [conditionProfile, setConditionProfile] = useState<ConditionProfile | null>(null);
  const [name, setName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [diseaseLocation, setDiseaseLocation] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorContact, setDoctorContact] = useState('');
  const [targetBedtime, setTargetBedtime] = useState('22:00');
  const [targetWakeTime, setTargetWakeTime] = useState('07:00');
  const [cycleStartDate, setCycleStartDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [gender, setGender] = useState('');
  const [trackCycle, setTrackCycle] = useState(true);
  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);
  const [medTimings, setMedTimings] = useState<{ name: string; times: string[] }[]>([]);

  const stepIndex = steps.indexOf(step);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  // Load condition profile when selected
  useEffect(() => {
    if (conditionId) {
      getConditionProfile(conditionId).then(p => {
        setConditionProfile(p);
        setDiagnosis(p.name);
      });
    }
  }, [conditionId]);

  // Auto-disable cycle tracking for males
  function handleGenderChange(g: string) {
    setGender(g);
    if (g === 'male') {
      setTrackCycle(false);
    }
  }

  function handleProfileNext() {
    setStep('sleep');
  }

  function handleSleepNext() {
    if (gender !== 'male' && conditionProfile?.cycleImpact.hasImpact && trackCycle) {
      setStep('cycle');
    } else {
      setStep('medications');
    }
  }

  async function complete() {
    // Detect the user's timezone from the browser
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    await upsertProfile({
      name,
      conditionId: conditionId!,
      diagnosis,
      diseaseLocation,
      medications: selectedMeds,
      targetBedtime,
      targetWakeTime,
      cycleStartDate,
      cycleLength,
      doctorName,
      doctorContact,
      onboardingComplete: true,
      trackCycle,
      gender,
      medicationTimings: medTimings,
      timezone: detectedTimezone,
    });
    // Immediately seed medication tasks for today
    if (medTimings.length > 0) {
      await seedMedicationTasksNow(medTimings);
    }
    router.push('/');
  }

  const inputClass = "w-full px-4 py-3 rounded-lg border border-border bg-bg text-text-primary placeholder:text-text-quaternary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all";
  const labelClass = "block text-[12px] font-medium text-text-secondary mb-1.5";

  const grouped = getConditionsByCategory();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress */}
      {step !== 'welcome' && (
        <div className="h-0.5 bg-bg-tertiary">
          <div className="h-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">

        {step === 'welcome' && (
          <div className="text-center animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-8">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-2">Aafiya</h1>
            <p className="text-text-secondary text-[15px] mb-1">Your personal autoimmune companion</p>
            <p className="text-text-tertiary text-[13px] mb-10">Built with science. Designed with care.</p>
            <p className="text-text-secondary text-[13px] mb-10 leading-relaxed max-w-[320px] mx-auto">
              Aafiya learns your unique patterns — food, sleep rhythms,
              how you feel — to help you stay ahead and feel your best.
            </p>
            <Button variant="primary" size="lg" fullWidth onClick={() => setStep('condition')}>
              Get Started
            </Button>
          </div>
        )}

        {step === 'condition' && (
          <div className="w-full animate-slide-up">
            <h2 className="text-xl font-semibold text-text-primary tracking-tight mb-1">Your Condition</h2>
            <p className="text-text-tertiary text-[13px] mb-6">
              Select your autoimmune condition. Aafiya will tailor everything — scoring, diet guidance, AI insights — to your specific needs.
            </p>

            <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1">
              {(Object.keys(grouped) as Array<keyof typeof grouped>).map(category => {
                const conditions = grouped[category];
                if (conditions.length === 0) return null;
                return (
                  <div key={category}>
                    <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                      {CATEGORY_LABELS[category]}
                    </p>
                    <div className="space-y-1.5">
                      {conditions.map(c => (
                        <button
                          key={c.id}
                          onClick={() => setConditionId(c.id)}
                          className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all ${
                            conditionId === c.id
                              ? 'bg-accent-light border border-accent/20 shadow-sm'
                              : 'border border-border hover:bg-bg-secondary'
                          }`}
                        >
                          <span className="text-xl">{c.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-text-primary truncate">{c.name}</p>
                            <p className="text-[11px] text-text-tertiary truncate">{c.description}</p>
                          </div>
                          {conditionId === c.id && (
                            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="ghost" onClick={() => setStep('welcome')}>Back</Button>
              <Button variant="primary" fullWidth onClick={() => setStep('profile')} disabled={!conditionId}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'profile' && (
          <div className="w-full animate-slide-up">
            <h2 className="text-xl font-semibold text-text-primary tracking-tight mb-1">About You</h2>
            <p className="text-text-tertiary text-[13px] mb-6">This stays on your device — never shared.</p>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Your Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="What should Aafiya call you?" className={inputClass} />
              </div>
              {conditionProfile && (
                <div className="p-3 rounded-xl bg-accent-bg border border-accent/10">
                  <p className="text-[12px] text-text-secondary">
                    <span className="font-medium text-accent">{conditionProfile.icon} {conditionProfile.name}</span>
                    {' — '}Aafiya will use {conditionProfile.scoring.name} scoring and tailor diet, sleep, and AI insights for your condition.
                  </p>
                </div>
              )}
              <div>
                <label className={labelClass}>Additional Details (optional)</label>
                <input type="text" value={diseaseLocation} onChange={e => setDiseaseLocation(e.target.value)}
                  placeholder={conditionProfile?.category === 'gastrointestinal' ? 'e.g., Ileal, Colonic, Ileocolonic' : 'e.g., affected areas, severity'}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Doctor&apos;s Name</label>
                <input type="text" value={doctorName} onChange={e => setDoctorName(e.target.value)}
                  placeholder="Optional" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Doctor&apos;s Contact</label>
                <input type="text" value={doctorContact} onChange={e => setDoctorContact(e.target.value)}
                  placeholder="Phone or email" className={inputClass} />
              </div>

              {/* Gender selection */}
              <div>
                <label className={labelClass}>Gender</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'female', label: 'Female' },
                    { value: 'male', label: 'Male' },
                    { value: 'other', label: 'Other' },
                  ].map(g => (
                    <button
                      key={g.value}
                      onClick={() => handleGenderChange(g.value)}
                      className={`px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                        gender === g.value
                          ? 'bg-accent text-white'
                          : 'border border-border text-text-primary hover:bg-bg-secondary'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cycle tracking opt-in — hidden for males */}
              {gender !== 'male' && (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <button
                  onClick={() => setTrackCycle(!trackCycle)}
                  className={`relative w-10 h-6 rounded-full transition-colors ${trackCycle ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${trackCycle ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <div>
                  <p className="text-[13px] font-medium text-text-primary">Track menstrual cycle</p>
                  <p className="text-[11px] text-text-tertiary">Helps Aafiya understand hormone-related patterns</p>
                </div>
              </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="ghost" onClick={() => setStep('condition')}>Back</Button>
              <Button variant="primary" fullWidth onClick={handleProfileNext}>Continue</Button>
            </div>
          </div>
        )}

        {step === 'sleep' && (
          <div className="w-full animate-slide-up">
            <h2 className="text-xl font-semibold text-text-primary tracking-tight mb-1">Sleep Target</h2>
            <p className="text-text-tertiary text-[13px] mb-6">
              What does your doctor recommend? We&apos;ll create a gradual plan.
            </p>

            <div className="space-y-4 p-4 rounded-xl border border-border">
              <div>
                <label className={labelClass}>Target Bedtime</label>
                <input type="time" value={targetBedtime} onChange={e => setTargetBedtime(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Target Wake Time</label>
                <input type="time" value={targetWakeTime} onChange={e => setTargetWakeTime(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="flex items-start gap-2.5 mt-4 p-3 rounded-lg bg-accent-bg border border-accent/10">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10A37F" strokeWidth="2" className="shrink-0 mt-0.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              <p className="text-[12px] text-text-secondary leading-relaxed">
                Good sleep helps your body heal and manage inflammation. Aafiya will help you get there gradually — no pressure.
              </p>
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="ghost" onClick={() => setStep('profile')}>Back</Button>
              <Button variant="primary" fullWidth onClick={handleSleepNext}>Continue</Button>
            </div>
          </div>
        )}

        {step === 'cycle' && (
          <div className="w-full animate-slide-up">
            <h2 className="text-xl font-semibold text-text-primary tracking-tight mb-1">Menstrual Cycle</h2>
            <p className="text-text-tertiary text-[13px] mb-6">
              {conditionProfile?.cycleImpact.prevalencePercent
                ? `${conditionProfile.cycleImpact.prevalencePercent}% of people with ${conditionProfile.shortName} report cycle-related symptom changes.`
                : 'Tracking your cycle helps Aafiya understand your patterns better.'}
            </p>

            <div className="space-y-4 p-4 rounded-xl border border-border">
              <div>
                <label className={labelClass}>Last Period Start Date</label>
                <input type="date" value={cycleStartDate} onChange={e => setCycleStartDate(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Typical Cycle Length (days)</label>
                <input type="number" value={cycleLength} onChange={e => setCycleLength(parseInt(e.target.value) || 28)}
                  min={21} max={45} className={inputClass} />
              </div>
            </div>

            <button onClick={() => setStep('medications')} className="text-[12px] text-accent font-medium mt-4 block mx-auto">
              Skip — I&apos;ll set this up later
            </button>

            <div className="flex gap-3 mt-8">
              <Button variant="ghost" onClick={() => setStep('sleep')}>Back</Button>
              <Button variant="primary" fullWidth onClick={() => setStep('medications')}>Continue</Button>
            </div>
          </div>
        )}

        {step === 'medications' && (
          <div className="w-full animate-slide-up">
            <h2 className="text-xl font-semibold text-text-primary tracking-tight mb-1">Current Medications</h2>
            <p className="text-text-tertiary text-[13px] mb-6">
              Select for adherence tracking. These are common medications for {conditionProfile?.shortName || 'your condition'}.
            </p>

            <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
              {/* Dynamic medication list from condition profile + universal supplements */}
              {[
                ...(conditionProfile?.commonMedications.map(m => m.name) || []),
                'Iron supplement', 'Vitamin D', 'Vitamin B12', 'Folic acid', 'Probiotics', 'Omega-3',
              ].filter((med, i, arr) => arr.indexOf(med) === i).map(med => (
                <div key={med}>
                  <label className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedMeds.includes(med)
                      ? 'bg-accent-light border border-accent/20'
                      : 'border border-border hover:bg-bg-secondary'
                  }`}>
                    <div className={`w-4.5 h-4.5 rounded flex items-center justify-center transition-all ${
                      selectedMeds.includes(med) ? 'bg-accent' : 'border-2 border-border'
                    }`}>
                      {selectedMeds.includes(med) && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                      )}
                    </div>
                    <input type="checkbox" checked={selectedMeds.includes(med)} className="hidden"
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedMeds(prev => [...prev, med]);
                          setMedTimings(prev => [...prev, { name: med, times: ['08:00'] }]);
                        } else {
                          setSelectedMeds(prev => prev.filter(m => m !== med));
                          setMedTimings(prev => prev.filter(t => t.name !== med));
                        }
                      }}
                    />
                    <span className="text-[13px] text-text-primary">{med}</span>
                  </label>
                  {/* Timing config for selected meds */}
                  {selectedMeds.includes(med) && (
                    <div className="ml-8 mt-1 mb-2 p-2 rounded-lg bg-bg-secondary">
                      <p className="text-[11px] text-text-tertiary mb-1.5">When do you take this?</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(medTimings.find(t => t.name === med)?.times || ['08:00']).map((time, ti) => (
                          <div key={ti} className="flex items-center gap-1">
                            <input
                              type="time"
                              value={time}
                              onChange={e => {
                                setMedTimings(prev => prev.map(t =>
                                  t.name === med
                                    ? { ...t, times: t.times.map((tt, tti) => tti === ti ? e.target.value : tt) }
                                    : t
                                ));
                              }}
                              className="px-2 py-1 rounded bg-bg text-[12px] text-text-primary border border-border outline-none focus:ring-1 focus:ring-accent/30"
                            />
                            {(medTimings.find(t => t.name === med)?.times.length || 0) > 1 && (
                              <button
                                onClick={() => setMedTimings(prev => prev.map(t =>
                                  t.name === med ? { ...t, times: t.times.filter((_, tti) => tti !== ti) } : t
                                ))}
                                className="text-text-tertiary hover:text-red-500"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => setMedTimings(prev => prev.map(t =>
                            t.name === med ? { ...t, times: [...t.times, '20:00'] } : t
                          ))}
                          className="px-2 py-1 rounded bg-accent/10 text-accent text-[11px] font-medium hover:bg-accent/20"
                        >
                          + Add time
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button onClick={() => setStep('ready')} className="text-[12px] text-accent font-medium mt-4 block mx-auto">
              Skip — I&apos;ll add these later
            </button>

            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={() => {
                if (trackCycle && conditionProfile?.cycleImpact.hasImpact) setStep('cycle');
                else setStep('sleep');
              }}>Back</Button>
              <Button variant="primary" fullWidth onClick={() => setStep('ready')}>Continue</Button>
            </div>
          </div>
        )}

        {step === 'ready' && (
          <div className="text-center animate-slide-up">
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mx-auto mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <h2 className="text-xl font-semibold text-text-primary tracking-tight mb-2">
              You&apos;re all set{name ? `, ${name}` : ''}
            </h2>
            <p className="text-text-secondary text-[13px] mb-2 leading-relaxed max-w-[300px] mx-auto">
              Aafiya is ready to learn your patterns and help you manage your {conditionProfile?.shortName || 'condition'}.
            </p>
            <p className="text-text-tertiary text-[12px] mb-10">
              {conditionProfile?.icon} Using {conditionProfile?.scoring.name} scoring tailored for {conditionProfile?.shortName}
            </p>

            <Button variant="primary" size="lg" fullWidth onClick={complete}>
              Enter Aafiya
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
