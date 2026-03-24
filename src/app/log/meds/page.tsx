'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MedicationEntry } from '@/lib/db';
import { getProfile, updateProfile, upsertProfile } from '@/actions/profile';
import { getMedicationsByDateRange, bulkAddMedications } from '@/actions/medications';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import medicationsData from '@/data/medications.json';

interface MedConfig {
  name: string;
  dosage: string;
}

export default function MedsLoggerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const [configuredMeds, setConfiguredMeds] = useState<MedConfig[]>([]);
  const [medLogs, setMedLogs] = useState<Record<string, { taken: boolean; time: string }>>({});
  const [showAddMed, setShowAddMed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [weeklyAdherence, setWeeklyAdherence] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Load configured medications from profile
        const profile = await getProfile();
        const profileMeds: string[] = (profile?.medications as string[]) || [];
        const meds = profileMeds.map((name: string) => ({ name, dosage: '' }));
        setConfiguredMeds(meds);

        // Initialize med logs
        const initialLogs: Record<string, { taken: boolean; time: string }> = {};
        meds.forEach(med => {
          initialLogs[med.name] = { taken: false, time: '' };
        });
        setMedLogs(initialLogs);

        // Calculate weekly adherence
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        const weekMeds = await getMedicationsByDateRange(weekAgo, today);
        if (weekMeds.length > 0) {
          const taken = weekMeds.filter(m => m.taken).length;
          setWeeklyAdherence(Math.round((taken / weekMeds.length) * 100));
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function toggleMed(name: string) {
    setMedLogs(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        taken: !prev[name]?.taken,
        time: !prev[name]?.taken ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : prev[name]?.time || '',
      },
    }));
  }

  async function addMedication(name: string) {
    const newMed: MedConfig = { name, dosage: '' };
    setConfiguredMeds(prev => [...prev, newMed]);
    setMedLogs(prev => ({ ...prev, [name]: { taken: false, time: '' } }));
    setShowAddMed(false);
    setSearchQuery('');

    // Save to profile
    try {
      const profile = await getProfile();
      if (profile) {
        const currentMeds = profile.medications || [];
        await updateProfile({ medications: [...currentMeds, name] });
      } else {
        await upsertProfile({
          name: '',
          conditionId: 'crohns',
          diagnosis: '',
          diseaseLocation: '',
          medications: [name],
          targetBedtime: '22:00',
          targetWakeTime: '07:00',
          cycleStartDate: '',
          cycleLength: 28,
          doctorName: '',
          doctorContact: '',
          onboardingComplete: false,
          trackCycle: true,
        });
      }
    } catch {
      // ignore
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const now = new Date();
      const date = now.toISOString().split('T')[0];

      const entries = configuredMeds.map(med => ({
        date,
        medication: med.name,
        dosage: med.dosage,
        taken: medLogs[med.name]?.taken || false,
        time: medLogs[med.name]?.time || '',
        notes: '',
      }));

      await bulkAddMedications(entries);
      setSaved(true);
      setTimeout(() => router.push('/log'), 1200);
    } catch (err) {
      console.error('Failed to save meds:', err);
      setSaving(false);
    }
  }

  const filteredMeds = medicationsData.medications.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (saved) {
    return (
      <div className="max-w-md mx-auto px-4 pt-20 flex flex-col items-center gap-4 animate-slide-up">
        <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-text-primary">Medications Logged</p>
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
        <h1 className="text-lg font-semibold text-text-primary">Medications</h1>
      </div>

      {/* Weekly Adherence */}
      {weeklyAdherence !== null && (
        <Card padding="md" className="text-center">
          <p className="text-xs font-medium text-text-secondary">Weekly Adherence</p>
          <p className={`text-3xl font-semibold mt-1 ${
            weeklyAdherence >= 90 ? 'text-accent' : weeklyAdherence >= 70 ? 'text-amber-500' : 'text-red-500'
          }`}>
            {weeklyAdherence}%
          </p>
          <div className="w-full h-2 rounded-full bg-bg-tertiary mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                weeklyAdherence >= 90 ? 'bg-accent' : weeklyAdherence >= 70 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${weeklyAdherence}%` }}
            />
          </div>
        </Card>
      )}

      {/* Medication List */}
      {configuredMeds.length > 0 ? (
        <div className="space-y-2">
          {configuredMeds.map(med => {
            const isChecked = medLogs[med.name]?.taken || false;
            return (
              <Card key={med.name} padding="md">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleMed(med.name)}
                    className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      isChecked
                        ? 'bg-accent border-accent text-white'
                        : 'border-border text-transparent'
                    }`}
                  >
                    {isChecked && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isChecked ? 'text-accent line-through' : 'text-text-primary'}`}>
                      {med.name}
                    </p>
                    {isChecked && medLogs[med.name]?.time && (
                      <p className="text-[10px] text-text-tertiary">
                        Taken at {medLogs[med.name].time}
                      </p>
                    )}
                  </div>
                  {isChecked && (
                    <Badge variant="success">Done</Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card padding="lg" className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-3">
            <span className="text-2xl">💊</span>
          </div>
          <p className="text-sm font-semibold text-text-primary">No medications configured</p>
          <p className="text-xs text-text-secondary mt-1">
            Add your medications to start tracking adherence
          </p>
        </Card>
      )}

      {/* Add Medication */}
      {!showAddMed ? (
        <Button fullWidth variant="ghost" onClick={() => setShowAddMed(true)}>
          + Add Medication
        </Button>
      ) : (
        <Card padding="md" className="animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-text-primary">Add Medication</p>
            <button
              onClick={() => { setShowAddMed(false); setSearchQuery(''); }}
              className="text-text-secondary text-sm"
            >
              Cancel
            </button>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search medications..."
            className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-quaternary outline-none focus:ring-2 focus:ring-accent/30 mb-3"
            autoFocus
          />
          <div className="max-h-48 overflow-y-auto space-y-1">
            {filteredMeds.slice(0, 10).map(med => (
              <button
                key={med.name}
                onClick={() => addMedication(med.name)}
                className="w-full text-left rounded-lg px-3 py-2 hover:bg-bg-secondary transition-colors"
              >
                <p className="text-sm font-medium text-text-primary">{med.name}</p>
                <p className="text-[10px] text-text-tertiary">{med.class}</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Save */}
      {configuredMeds.length > 0 && (
        <Button fullWidth size="lg" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Daily Log'}
        </Button>
      )}
    </div>
  );
}
