'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { UserProfile } from '@/lib/db';
import { getProfile, upsertProfile, updateProfile } from '@/actions/profile';
import { getRecentSymptoms } from '@/actions/symptoms';
import { getRecentFood } from '@/actions/food';
import { getRecentSleep } from '@/actions/sleep';
import { getRecentMedications } from '@/actions/medications';
import { getRecentCycle } from '@/actions/cycle';
import { getRecentMood } from '@/actions/mood';
import { getExperiments } from '@/actions/experiments';
import { getChatHistory, clearChatHistory } from '@/actions/chat';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CONDITION_OPTIONS } from '@/lib/conditions/index';
import { usePushNotifications } from '@/lib/usePushNotifications';

export default function MorePage() {
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    name: '',
    conditionId: 'crohns',
    diagnosis: '',
    diseaseLocation: '',
    medications: [],
    targetBedtime: '22:00',
    targetWakeTime: '07:00',
    cycleStartDate: '',
    cycleLength: 28,
    doctorName: '',
    doctorContact: '',
    onboardingComplete: false,
    trackCycle: true,
    gender: '',
    medicationTimings: [],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [detectedTimezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [medInput, setMedInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const {
    supported: notifSupported,
    permission: notifPermission,
    isSubscribed: notifSubscribed,
    loading: notifLoading,
    subscribe: notifSubscribe,
    unsubscribe: notifUnsubscribe,
  } = usePushNotifications();
  const [notifToggling, setNotifToggling] = useState(false);

  useEffect(() => {
    async function load() {
      const p = await getProfile();
      if (p) {
        setProfile(p);
      }
      const stored = localStorage.getItem('aafiya-dark-mode');
      const isDark = stored === 'true';
      setDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    }
    load();
  }, []);

  async function saveProfile() {
    setSaving(true);
    try {
      if (profile.id) {
        await updateProfile({ ...profile });
      } else {
        await upsertProfile({ ...profile });
        const saved = await getProfile();
        if (saved) setProfile(saved);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  }

  function addMedication() {
    if (!medInput.trim()) return;
    setProfile(prev => ({
      ...prev,
      medications: [...prev.medications, medInput.trim()],
    }));
    setMedInput('');
  }

  function removeMedication(index: number) {
    setProfile(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  }

  async function exportData() {
    const [symptoms, food, sleep, meds, cycle, mood, experiments, chat, profileData] = await Promise.all([
      getRecentSymptoms(9999),
      getRecentFood(9999),
      getRecentSleep(9999),
      getRecentMedications(9999),
      getRecentCycle(9999),
      getRecentMood(9999),
      getExperiments(),
      getChatHistory(),
      getProfile(),
    ]);

    const data = { symptoms, food, sleep, medications: meds, cycle, mood, experiments, chat, profile: profileData };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aafiya-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function clearAllData() {
    await clearChatHistory();
    setShowClearModal(false);
  }

  function toggleDarkMode() {
    const html = document.documentElement;
    const newDark = !html.classList.contains('dark');
    html.classList.toggle('dark', newDark);
    setDarkMode(newDark);
    localStorage.setItem('aafiya-dark-mode', String(newDark));
  }

  const navLinks = [
    { href: '/report', label: 'Doctor Report', description: 'Generate a report for your doctor', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7C3AED]">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    )},
    { href: '/emergency', label: 'Emergency Protocol', description: 'Flare emergency steps and ER info', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    )},
    { href: '/experiments', label: 'Experiments', description: 'N-of-1 clinical trials', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    )},
  ];

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <h1 className="text-xl font-semibold text-text-primary mb-6">More</h1>

      {/* Navigation Links */}
      <div className="space-y-2 mb-6">
        {navLinks.map(link => (
          <Link key={link.href} href={link.href}>
            <Card padding="md" className="flex items-center gap-3 hover:shadow-sm transition-shadow mb-2">
              <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center flex-shrink-0">
                {link.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{link.label}</p>
                <p className="text-[11px] text-text-secondary">{link.description}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Card>
          </Link>
        ))}
      </div>

      {/* Profile Settings */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-text-primary mb-3">Profile Settings</p>
        <div className="space-y-3">
          <Card padding="md">
            <label className="block text-xs font-medium text-text-secondary mb-1">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your name"
              className="w-full px-3 py-2 rounded-lg bg-bg-secondary text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent/30"
            />
          </Card>

          <Card padding="md">
            <label className="block text-xs font-medium text-text-secondary mb-1">Condition</label>
            <select
              value={profile.conditionId}
              onChange={e => setProfile(prev => ({ ...prev, conditionId: e.target.value as any }))}
              className="w-full px-3 py-2 rounded-lg bg-bg-secondary text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent/30"
            >
              {CONDITION_OPTIONS.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </Card>

          <Card padding="md">
            <label className="block text-xs font-medium text-text-secondary mb-1">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'female', label: 'Female' },
                { value: 'male', label: 'Male' },
                { value: 'other', label: 'Other' },
              ].map(g => (
                <button
                  key={g.value}
                  onClick={() => setProfile(prev => ({
                    ...prev,
                    gender: g.value,
                    ...(g.value === 'male' ? { trackCycle: false } : {}),
                  }))}
                  className={`px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                    profile.gender === g.value
                      ? 'bg-accent text-white'
                      : 'bg-bg-secondary text-text-primary hover:bg-bg-tertiary'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </Card>

          <Card padding="md">
            <label className="block text-xs font-medium text-text-secondary mb-1">Additional Details</label>
            <input
              type="text"
              value={profile.diseaseLocation}
              onChange={e => setProfile(prev => ({ ...prev, diseaseLocation: e.target.value }))}
              placeholder="e.g., affected areas, severity, type"
              className="w-full px-3 py-2 rounded-lg bg-bg-secondary text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent/30"
            />
          </Card>

          <Card padding="md">
            <label className="block text-xs font-medium text-text-secondary mb-1">Doctor Name</label>
            <input
              type="text"
              value={profile.doctorName}
              onChange={e => setProfile(prev => ({ ...prev, doctorName: e.target.value }))}
              placeholder="Gastroenterologist name"
              className="w-full px-3 py-2 rounded-lg bg-bg-secondary text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent/30"
            />
          </Card>

          <Card padding="md">
            <label className="block text-xs font-medium text-text-secondary mb-1">Doctor Contact</label>
            <input
              type="tel"
              value={profile.doctorContact}
              onChange={e => setProfile(prev => ({ ...prev, doctorContact: e.target.value }))}
              placeholder="Phone number"
              className="w-full px-3 py-2 rounded-lg bg-bg-secondary text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent/30"
            />
          </Card>

          {/* Medications */}
          <Card padding="md">
            <label className="block text-xs font-medium text-text-secondary mb-1">Medications</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={medInput}
                onChange={e => setMedInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addMedication()}
                placeholder="Add medication"
                className="flex-1 px-3 py-2 rounded-lg bg-bg-secondary text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent/30"
              />
              <Button size="sm" onClick={addMedication}>Add</Button>
            </div>
            {profile.medications.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {profile.medications.map((med, i) => (
                  <button
                    key={i}
                    onClick={() => removeMedication(i)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-bg-secondary border border-border text-text-primary text-xs font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                  >
                    {med}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Sleep Targets */}
          <div className="grid grid-cols-2 gap-3">
            <Card padding="md">
              <label className="block text-xs font-medium text-text-secondary mb-1">Target Bedtime</label>
              <input
                type="time"
                value={profile.targetBedtime}
                onChange={e => setProfile(prev => ({ ...prev, targetBedtime: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-bg-secondary text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent/30"
              />
            </Card>
            <Card padding="md">
              <label className="block text-xs font-medium text-text-secondary mb-1">Target Wake Time</label>
              <input
                type="time"
                value={profile.targetWakeTime}
                onChange={e => setProfile(prev => ({ ...prev, targetWakeTime: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-bg-secondary text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent/30"
              />
            </Card>
          </div>

          {/* Medication Timings */}
          {profile.medications.length > 0 && (
          <Card padding="md">
            <label className="block text-xs font-medium text-text-secondary mb-2">Medication Timings</label>
            <p className="text-[11px] text-text-tertiary mb-3">Set when you take each medication for timely reminders.</p>
            <div className="space-y-3">
              {profile.medications.map((med: string) => {
                const timing = profile.medicationTimings?.find((t: any) => t.name === med);
                const times = timing?.times || [];
                return (
                  <div key={med} className="p-2.5 rounded-lg bg-bg-secondary">
                    <p className="text-[12px] font-medium text-text-primary mb-1.5">{med}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {times.map((time: string, ti: number) => (
                        <div key={ti} className="flex items-center gap-1">
                          <input
                            type="time"
                            value={time}
                            onChange={e => {
                              setProfile(prev => ({
                                ...prev,
                                medicationTimings: prev.medicationTimings.map((t: any) =>
                                  t.name === med
                                    ? { ...t, times: t.times.map((tt: string, tti: number) => tti === ti ? e.target.value : tt) }
                                    : t
                                ),
                              }));
                            }}
                            className="px-2 py-1 rounded bg-bg text-[12px] text-text-primary border border-border outline-none focus:ring-1 focus:ring-accent/30"
                          />
                          {times.length > 1 && (
                            <button
                              onClick={() => setProfile(prev => ({
                                ...prev,
                                medicationTimings: prev.medicationTimings.map((t: any) =>
                                  t.name === med ? { ...t, times: t.times.filter((_: string, tti: number) => tti !== ti) } : t
                                ),
                              }))}
                              className="text-text-tertiary hover:text-red-500"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setProfile(prev => {
                            const existing = prev.medicationTimings.find((t: any) => t.name === med);
                            if (existing) {
                              return {
                                ...prev,
                                medicationTimings: prev.medicationTimings.map((t: any) =>
                                  t.name === med ? { ...t, times: [...t.times, '08:00'] } : t
                                ),
                              };
                            }
                            return {
                              ...prev,
                              medicationTimings: [...prev.medicationTimings, { name: med, times: ['08:00'] }],
                            };
                          });
                        }}
                        className="px-2 py-1 rounded bg-accent/10 text-accent text-[11px] font-medium hover:bg-accent/20"
                      >
                        {times.length === 0 ? 'Set time' : '+ Add time'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          )}

          {/* Cycle Tracking Toggle — hidden for males */}
          {profile.gender !== 'male' && (
          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">Cycle Tracking</p>
                <p className="text-[11px] text-text-secondary">Track menstrual cycle phases</p>
              </div>
              <button
                onClick={() => setProfile(prev => ({ ...prev, trackCycle: !prev.trackCycle }))}
                className={`relative w-12 h-7 rounded-full transition-colors ${profile.trackCycle ? 'bg-accent' : 'bg-border'}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${profile.trackCycle ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </Card>
          )}

          {/* Cycle Config */}
          {profile.gender !== 'male' && profile.trackCycle && (
          <div className="grid grid-cols-2 gap-3">
            <Card padding="md">
              <label className="block text-xs font-medium text-text-secondary mb-1">Cycle Start Date</label>
              <input
                type="date"
                value={profile.cycleStartDate}
                onChange={e => setProfile(prev => ({ ...prev, cycleStartDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-bg-secondary text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent/30"
              />
            </Card>
            <Card padding="md">
              <label className="block text-xs font-medium text-text-secondary mb-1">Cycle Length</label>
              <input
                type="number"
                value={profile.cycleLength}
                onChange={e => setProfile(prev => ({ ...prev, cycleLength: parseInt(e.target.value) || 28 }))}
                min={21}
                max={45}
                className="w-full px-3 py-2 rounded-lg bg-bg-secondary text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent/30"
              />
            </Card>
          </div>
          )}

          {/* Timezone */}
          <Card padding="md">
            <label className="block text-xs font-medium text-text-secondary mb-1">Timezone</label>
            <input
              type="text"
              value={profile.timezone}
              onChange={e => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
              placeholder={detectedTimezone}
              className="w-full px-3 py-2 rounded-lg bg-bg-secondary text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent/30"
            />
            {profile.timezone !== detectedTimezone && (
              <button
                onClick={() => setProfile(prev => ({ ...prev, timezone: detectedTimezone }))}
                className="text-[11px] text-accent font-medium mt-1.5"
              >
                Reset to detected: {detectedTimezone}
              </button>
            )}
            <p className="text-[10px] text-text-tertiary mt-1">
              Detected: {detectedTimezone}. Used for scheduling reminders at the right local time.
            </p>
          </Card>

          <Button fullWidth onClick={saveProfile} disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <Card padding="md" className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Dark Mode</p>
            <p className="text-[11px] text-text-secondary">Easier on the eyes at night</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-12 h-7 rounded-full transition-colors ${darkMode ? 'bg-accent' : 'bg-border'}`}
          >
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </Card>

      {/* Notifications */}
      {notifSupported && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-text-primary mb-3">Notifications</p>
          <Card padding="md">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-text-primary">Push Notifications</p>
                <p className="text-[11px] text-text-secondary">
                  Reminders for check-ins, medication, and more
                </p>
              </div>
              <button
                disabled={notifLoading || notifToggling || notifPermission === 'denied'}
                onClick={async () => {
                  setNotifToggling(true);
                  try {
                    if (notifSubscribed) {
                      await notifUnsubscribe();
                    } else {
                      await notifSubscribe();
                    }
                  } catch (err) {
                    console.error('Notification toggle failed:', err);
                  } finally {
                    setNotifToggling(false);
                  }
                }}
                className={`relative w-12 h-7 rounded-full transition-colors disabled:opacity-40 ${notifSubscribed ? 'bg-accent' : 'bg-border'}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${notifSubscribed ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                notifPermission === 'granted'
                  ? 'bg-green-500'
                  : notifPermission === 'denied'
                  ? 'bg-red-500'
                  : 'bg-yellow-500'
              }`} />
              <p className="text-[11px] text-text-tertiary">
                {notifPermission === 'granted'
                  ? 'Permission granted'
                  : notifPermission === 'denied'
                  ? 'Permission blocked by browser'
                  : 'Permission not yet requested'}
              </p>
            </div>
            {notifPermission === 'denied' && (
              <p className="text-[11px] text-text-secondary mt-2 leading-relaxed">
                Notifications are blocked. To re-enable, open your browser settings and allow notifications for this site, then reload the page.
              </p>
            )}
          </Card>
        </div>
      )}

      {/* Data Management */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-text-primary mb-3">Data Management</p>
        <div className="space-y-2">
          <Button fullWidth variant="secondary" onClick={exportData}>
            Export All Data as JSON
          </Button>
          <Button fullWidth variant="danger" onClick={() => setShowClearModal(true)}>
            Clear All Data
          </Button>
        </div>
      </div>

      {/* About */}
      <Card padding="md" className="mb-4">
        <p className="text-sm font-semibold text-text-primary mb-1">About Aafiya</p>
        <p className="text-xs text-text-secondary leading-relaxed">
          Aafiya (Arabic for &quot;wellness/health&quot;) is your personal wellness companion.
          It helps you track how you feel, what you eat, sleep, mood, and cycles, then uses research-backed
          algorithms to spot patterns and help you stay well. All data is stored locally on your device.
        </p>
        <p className="text-[10px] text-text-tertiary mt-2">
          This app does not replace professional medical advice. Always consult your gastroenterologist.
        </p>
      </Card>

      {/* Clear Data Modal */}
      <Modal open={showClearModal} onClose={() => setShowClearModal(false)} title="Clear All Data?">
        <p className="text-sm text-text-secondary mb-4">
          This will permanently delete all your symptom logs, food entries, sleep data, experiments, and chat history.
          Your profile settings will be preserved. This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" fullWidth onClick={() => setShowClearModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" fullWidth onClick={clearAllData}>
            Delete Everything
          </Button>
        </div>
      </Modal>
    </div>
  );
}
