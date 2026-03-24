'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CONSENT_PURPOSES, CONSENT_DESCRIPTIONS, type ConsentPurpose } from '@/lib/privacy/constants';
import { grantConsentsAction } from '@/actions/privacy';

export default function ConsentPage() {
  const router = useRouter();
  const [consents, setConsents] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const p of CONSENT_PURPOSES) {
      initial[p] = CONSENT_DESCRIPTIONS[p].required; // Auto-grant required
    }
    return initial;
  });
  const [saving, setSaving] = useState(false);

  async function handleAccept() {
    setSaving(true);
    try {
      const granted = CONSENT_PURPOSES.filter(p => consents[p]);
      await grantConsentsAction(granted);
      router.push('/onboarding');
    } catch (err) {
      console.error('Failed to save consents:', err);
      setSaving(false);
    }
  }

  const requiredMet = CONSENT_PURPOSES
    .filter(p => CONSENT_DESCRIPTIONS[p].required)
    .every(p => consents[p]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-accent/15 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-text-primary">Your Privacy Matters</h1>
          <p className="text-sm text-text-secondary mt-2">
            Aafiya processes sensitive health data. Please review and consent to how we use it.
          </p>
        </div>

        <div className="space-y-3">
          {CONSENT_PURPOSES.map(purpose => {
            const desc = CONSENT_DESCRIPTIONS[purpose];
            return (
              <Card key={purpose} padding="md">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => {
                      if (desc.required) return; // Can't toggle required
                      setConsents(prev => ({ ...prev, [purpose]: !prev[purpose] }));
                    }}
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      consents[purpose]
                        ? 'bg-accent border-accent text-white'
                        : 'border-border'
                    } ${desc.required ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {consents[purpose] && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text-primary">{desc.title}</p>
                      {desc.required && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium">Required</span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-tertiary mt-1 leading-relaxed">{desc.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* GDPR/DPDA Rights Notice */}
        <Card padding="sm" className="bg-bg-secondary">
          <p className="text-[10px] text-text-quaternary leading-relaxed">
            <strong className="text-text-tertiary">Your Rights (GDPR/DPDA):</strong> You can withdraw consent, export your data, or delete your account at any time from Settings &gt; Privacy. Your health data is encrypted with AES-256-GCM. We never sell or share your data with third parties.
          </p>
        </Card>

        <Button
          fullWidth
          size="lg"
          onClick={handleAccept}
          disabled={!requiredMet || saving}
        >
          {saving ? 'Saving...' : 'Accept & Continue'}
        </Button>
      </div>
    </div>
  );
}
