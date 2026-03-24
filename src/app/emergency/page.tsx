'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { UserProfile } from '@/lib/db';
import { getProfile } from '@/actions/profile';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import protocolData from '@/data/emergency-protocol.json';

function AccordionSection({ title, children, defaultOpen = false, danger = false }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  danger?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-xl overflow-hidden ${danger ? 'border-2 border-red-300' : 'border border-border'}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
          danger ? 'bg-red-50 hover:bg-red-100' : 'bg-bg hover:bg-bg-secondary'
        }`}
      >
        <span className={`text-sm font-semibold ${danger ? 'text-red-600' : 'text-text-primary'}`}>
          {title}
        </span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`transition-transform ${open ? 'rotate-180' : ''} ${danger ? 'text-red-500' : 'text-text-secondary'}`}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className={`px-4 py-3 ${danger ? 'bg-red-50/50' : 'bg-bg'}`}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function EmergencyPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const p = await getProfile();
      setProfile(p || null);
    }
    load();
  }, []);

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    });
  }

  function getERInfoText(): string {
    const lines = [];
    if (profile) {
      lines.push(`Patient: ${profile.name}`);
      lines.push(`Diagnosis: ${profile.diagnosis}`);
      if (profile.diseaseLocation) lines.push(`Location: ${profile.diseaseLocation}`);
      if (profile.medications.length > 0) lines.push(`Medications: ${profile.medications.join(', ')}`);
      if (profile.doctorName) lines.push(`GI Doctor: ${profile.doctorName}`);
      if (profile.doctorContact) lines.push(`Doctor Contact: ${profile.doctorContact}`);
    }
    lines.push('');
    lines.push('Key points for ER staff:');
    lines.push('- I have Crohn\'s disease and may be immunosuppressed');
    lines.push('- Avoid NSAIDs (ibuprofen, naproxen, aspirin)');
    lines.push('- Please contact my gastroenterologist');
    return lines.join('\n');
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link href="/more" className="p-1 rounded-lg hover:bg-bg-secondary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-xl font-semibold text-text-primary">Emergency Protocol</h1>
      </div>

      {/* Disclaimer */}
      <Card padding="sm" className="bg-[#F97316]/10 border border-[#F97316]/20 mb-4">
        <p className="text-[10px] text-[#F97316]">{protocolData.meta.disclaimer}</p>
      </Card>

      {/* Emergency Call Button */}
      {profile?.doctorContact && (
        <a href={`tel:${profile.doctorContact}`} className="block mb-4">
          <Button fullWidth variant="danger" size="lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Call {profile.doctorName || 'Doctor'}
          </Button>
        </a>
      )}

      <div className="space-y-3">
        {/* 1. Assess Severity */}
        <AccordionSection title="1. Assess Severity" defaultOpen={true}>
          <p className="text-xs text-text-secondary mb-3">{protocolData.assessSeverity.description}</p>
          <div className="space-y-3">
            {protocolData.assessSeverity.questions.map((q, i) => (
              <div key={i} className="border-b border-border pb-3 last:border-0">
                <p className="text-sm font-medium text-text-primary mb-2">{q.question}</p>
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <Badge variant="success">Mild</Badge>
                    <span className="text-[11px] text-text-secondary flex-1">{q.mild}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="warning">Mod</Badge>
                    <span className="text-[11px] text-text-secondary flex-1">{q.moderate}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="danger">Severe</Badge>
                    <span className="text-[11px] text-text-secondary flex-1">{q.severe}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AccordionSection>

        {/* 2. Immediate Actions */}
        <AccordionSection title="2. Immediate Actions">
          <p className="text-xs text-text-secondary mb-3">{protocolData.immediateActions.description}</p>
          <div className="space-y-3">
            {protocolData.immediateActions.steps.map(s => (
              <div key={s.step} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-accent">{s.step}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{s.action}</p>
                  <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">{s.details}</p>
                </div>
              </div>
            ))}
          </div>
        </AccordionSection>

        {/* 3. When to Call Doctor */}
        <AccordionSection title="3. When to Call Your Doctor">
          <p className="text-xs text-text-secondary mb-3">{protocolData.whenToCallDoctor.description}</p>
          <div className="space-y-2">
            {protocolData.whenToCallDoctor.criteria.map((c, i) => (
              <label key={i} className="flex items-start gap-2">
                <input type="checkbox" className="mt-1 accent-accent" />
                <span className="text-xs text-text-primary leading-relaxed">{c}</span>
              </label>
            ))}
          </div>
        </AccordionSection>

        {/* 4. When to Go to ER */}
        <AccordionSection title="4. When to Go to the ER" danger={true}>
          <p className="text-xs text-red-600 mb-3">{protocolData.whenToGoER.description}</p>
          <div className="space-y-2">
            {protocolData.whenToGoER.criteria.map((c, i) => (
              <div key={i} className="flex items-start gap-2 bg-red-50 rounded-lg px-2 py-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 mt-0.5 flex-shrink-0">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span className="text-xs text-red-600 leading-relaxed">{c}</span>
              </div>
            ))}
          </div>
        </AccordionSection>

        {/* 5. What to Tell ER */}
        <AccordionSection title="5. What to Tell ER Staff">
          <p className="text-xs text-text-secondary mb-3">{protocolData.whatToTellER.description}</p>

          {/* Copy-able text */}
          <button
            onClick={() => copyToClipboard(getERInfoText(), 'er-info')}
            className="w-full mb-3 px-3 py-2 rounded-lg bg-bg-secondary border border-border text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-accent">
                {copiedText === 'er-info' ? 'Copied!' : 'Tap to copy your ER info'}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            </div>
          </button>

          <div className="space-y-2">
            {protocolData.whatToTellER.checklist.map((item, i) => (
              <div key={i} className="border-b border-border pb-2 last:border-0">
                <p className="text-xs font-medium text-text-primary">{item.item}</p>
                <p className="text-[10px] text-text-secondary mt-0.5">{item.detail}</p>
              </div>
            ))}
          </div>
        </AccordionSection>

        {/* 6. Hospital Bag */}
        <AccordionSection title="6. Hospital Bag Checklist">
          <p className="text-xs text-text-secondary mb-3">{protocolData.hospitalBag.description}</p>
          <div className="space-y-2">
            {protocolData.hospitalBag.items.map((item, i) => (
              <label key={i} className="flex items-start gap-2">
                <input type="checkbox" className="mt-1 accent-accent" />
                <div>
                  <span className="text-xs font-medium text-text-primary">{item.item}</span>
                  <p className="text-[10px] text-text-secondary">{item.detail}</p>
                </div>
              </label>
            ))}
          </div>
        </AccordionSection>

        {/* 7. Diet During Flare */}
        <AccordionSection title="7. Diet During Flare">
          <p className="text-xs text-text-secondary mb-3">{protocolData.dietDuringFlare.description}</p>
          {protocolData.dietDuringFlare.phases.map((phase, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <p className="text-xs font-semibold text-text-primary mb-2">{phase.phase}</p>
              <div className="space-y-1">
                {phase.recommendations.map((rec, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <span className="text-[10px] text-accent mt-0.5">&#8226;</span>
                    <span className="text-[11px] text-text-secondary leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs font-semibold text-text-primary mb-2">General Principles</p>
            <div className="space-y-1">
              {protocolData.dietDuringFlare.generalPrinciples.map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[10px] text-accent mt-0.5">&#8226;</span>
                  <span className="text-[11px] text-text-secondary leading-relaxed">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </AccordionSection>
      </div>
    </div>
  );
}
