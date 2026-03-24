'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile, updateProfile, upsertProfile } from '@/actions/profile';
import { addCycleEntry } from '@/actions/cycle';
import { getCycleInfo, PHASE_LABELS, PHASE_COLORS, CyclePhase } from '@/lib/cyclePhase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function CycleLoggerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const [cycleStartDate, setCycleStartDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [hasSetup, setHasSetup] = useState(false);
  const [flowIntensity, setFlowIntensity] = useState(0);
  const [pain, setPain] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile();
        if (profile?.cycleStartDate) {
          setCycleStartDate(profile.cycleStartDate);
          setCycleLength(profile.cycleLength || 28);
          setHasSetup(true);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const cycleInfo = useMemo(() => {
    if (!cycleStartDate) return null;
    return getCycleInfo(cycleStartDate, today, cycleLength);
  }, [cycleStartDate, today, cycleLength]);

  async function handleSetup() {
    if (!cycleStartDate) return;
    try {
      const profile = await getProfile();
      if (profile) {
        await updateProfile({ cycleStartDate, cycleLength });
      } else {
        await upsertProfile({
          name: '',
          conditionId: 'crohns',
          diagnosis: '',
          diseaseLocation: '',
          medications: [],
          targetBedtime: '22:00',
          targetWakeTime: '07:00',
          cycleStartDate,
          cycleLength,
          doctorName: '',
          doctorContact: '',
          onboardingComplete: false,
          trackCycle: true,
        });
      }
      setHasSetup(true);
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  }

  async function handleSave() {
    if (!cycleInfo) return;
    setSaving(true);
    try {
      const now = new Date();
      await addCycleEntry({
        date: now.toISOString().split('T')[0],
        cycleDay: cycleInfo.cycleDay,
        phase: cycleInfo.phase,
        flowIntensity,
        pain,
        notes,
      });
      setSaved(true);
      setTimeout(() => router.push('/log'), 1200);
    } catch (err) {
      console.error('Failed to save cycle:', err);
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (saved) {
    return (
      <div className="max-w-md mx-auto px-4 pt-20 flex flex-col items-center gap-4 animate-slide-up">
        <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-pink-600" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-text-primary">Cycle Entry Logged</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-24 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/log" className="w-9 h-9 rounded-lg border border-border bg-bg flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-text-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold text-text-primary">Cycle Tracking</h1>
      </div>

      {/* Setup Phase */}
      {!hasSetup && (
        <Card padding="lg">
          <div className="text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-pink-100 flex items-center justify-center">
              <span className="text-2xl">🌸</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Set Up Cycle Tracking</p>
              <p className="text-xs text-text-secondary mt-1">
                Your cycle phases can affect how you feel. Tracking helps Aafiya spot patterns and support you better.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-primary mb-2">When did your last period start?</p>
              <input
                type="date"
                value={cycleStartDate}
                onChange={e => setCycleStartDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-text-primary mb-2">Average cycle length (days)</p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setCycleLength(Math.max(21, cycleLength - 1))}
                  className="w-8 h-8 rounded-lg border border-border bg-bg-secondary flex items-center justify-center text-sm font-semibold text-text-primary"
                >
                  -
                </button>
                <span className="text-xl font-semibold text-text-primary tabular-nums">{cycleLength}</span>
                <button
                  onClick={() => setCycleLength(Math.min(40, cycleLength + 1))}
                  className="w-8 h-8 rounded-lg bg-pink-500 text-white flex items-center justify-center text-sm font-semibold"
                >
                  +
                </button>
              </div>
            </div>
            <Button fullWidth variant="danger" onClick={handleSetup} disabled={!cycleStartDate}>
              Save & Continue
            </Button>
          </div>
        </Card>
      )}

      {/* Phase Info */}
      {hasSetup && cycleInfo && (
        <>
          {/* Current Phase Banner */}
          <Card
            padding="lg"
            className="text-center"
          >
            <div
              className="absolute inset-0 rounded-xl opacity-10"
              style={{ backgroundColor: PHASE_COLORS[cycleInfo.phase] }}
            />
            <div className="relative">
              <div
                className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2"
                style={{ backgroundColor: PHASE_COLORS[cycleInfo.phase] + '20' }}
              >
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: PHASE_COLORS[cycleInfo.phase] }} />
              </div>
              <p className="text-lg font-semibold text-text-primary">
                {PHASE_LABELS[cycleInfo.phase]} Phase
              </p>
              <p className="text-sm text-text-secondary">
                Day {cycleInfo.cycleDay} &middot; {cycleInfo.phaseDaysRemaining} days remaining
              </p>
              <div className="flex justify-center mt-2">
                <Badge variant={cycleInfo.riskModifier > 1.2 ? 'danger' : cycleInfo.riskModifier > 1.05 ? 'warning' : 'success'}>
                  Risk: {cycleInfo.riskModifier > 1.0 ? '+' : ''}{Math.round((cycleInfo.riskModifier - 1) * 100)}%
                </Badge>
              </div>
            </div>
          </Card>

          {/* Warning */}
          {cycleInfo.warning && (
            <div className="bg-pink-50 border border-pink-200 rounded-lg px-4 py-3">
              <p className="text-xs text-pink-700 font-medium">{cycleInfo.warning}</p>
            </div>
          )}

          {/* Phase Symptoms */}
          {cycleInfo.symptoms.length > 0 && (
            <Card padding="md">
              <p className="text-sm font-semibold text-text-primary mb-2">What to watch for</p>
              <div className="space-y-1.5">
                {cycleInfo.symptoms.map((symptom, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ backgroundColor: PHASE_COLORS[cycleInfo.phase] }} />
                    <p className="text-xs text-text-secondary">{symptom}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Flow Intensity */}
          <Card padding="md">
            <Slider label="Flow Intensity" value={flowIntensity} onChange={setFlowIntensity} min={0} max={5} />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-text-tertiary">None</span>
              <span className="text-[10px] text-text-tertiary">Very Heavy</span>
            </div>
          </Card>

          {/* Pain */}
          <Card padding="md">
            <Slider label="Pain" value={pain} onChange={setPain} min={0} max={10} />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-text-tertiary">No pain</span>
              <span className="text-[10px] text-text-tertiary">Severe</span>
            </div>
          </Card>

          {/* Notes */}
          <Card padding="md">
            <p className="text-sm font-semibold text-text-primary mb-2">Notes</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any cycle-related observations..."
              className="w-full h-16 rounded-lg border border-border bg-bg p-3 text-sm text-text-primary placeholder:text-text-quaternary resize-none outline-none focus:ring-2 focus:ring-accent/30"
            />
          </Card>

          {/* Save */}
          <Button fullWidth size="lg" variant="danger" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Cycle Entry'}
          </Button>
        </>
      )}
    </div>
  );
}
