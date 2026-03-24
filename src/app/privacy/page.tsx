'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CONSENT_PURPOSES, CONSENT_DESCRIPTIONS, type ConsentPurpose } from '@/lib/privacy/constants';
import {
  getConsentsAction,
  grantConsentsAction,
  revokeConsentAction,
  exportDataAction,
  deleteAccountAction,
  getDataStatsAction,
  getAuditLogsAction,
} from '@/actions/privacy';

export default function PrivacyPage() {
  const router = useRouter();
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<{ totalRecords: number; oldestDate: string | null; newestDate: string | null } | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [c, s, logs] = await Promise.all([
          getConsentsAction(),
          getDataStatsAction(),
          getAuditLogsAction(20),
        ]);
        setConsents(c);
        setStats(s);
        setAuditLogs(logs);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function toggleConsent(purpose: ConsentPurpose) {
    if (CONSENT_DESCRIPTIONS[purpose].required) return;
    const current = consents[purpose];
    if (current) {
      await revokeConsentAction(purpose);
    } else {
      await grantConsentsAction([purpose]);
    }
    setConsents(prev => ({ ...prev, [purpose]: !current }));
  }

  async function handleExport() {
    setExporting(true);
    try {
      const data = await exportDataAction();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aafiya-data-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteAccountAction();
      router.push('/auth/signin');
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/more" className="w-9 h-9 rounded-lg border border-border bg-bg flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Privacy & Data</h1>
          <p className="text-[11px] text-text-tertiary">GDPR & DPDA Compliance</p>
        </div>
      </div>

      {/* Data Stats */}
      {stats && (
        <Card padding="md" className="mb-4">
          <p className="text-sm font-semibold text-text-primary mb-2">Your Data</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-accent">{stats.totalRecords}</p>
              <p className="text-[10px] text-text-tertiary">Records</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-secondary">{stats.oldestDate || '—'}</p>
              <p className="text-[10px] text-text-tertiary">Oldest</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-secondary">{stats.newestDate || '—'}</p>
              <p className="text-[10px] text-text-tertiary">Newest</p>
            </div>
          </div>
        </Card>
      )}

      {/* Consent Management */}
      <p className="text-sm font-semibold text-text-primary mb-3">Consent Management</p>
      <div className="space-y-2 mb-6">
        {CONSENT_PURPOSES.map(purpose => {
          const desc = CONSENT_DESCRIPTIONS[purpose];
          return (
            <Card key={purpose} padding="sm">
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-text-primary">{desc.title}</p>
                    {desc.required && (
                      <span className="text-[8px] px-1 py-0.5 rounded bg-accent/10 text-accent font-medium">Required</span>
                    )}
                  </div>
                  <p className="text-[10px] text-text-tertiary mt-0.5 line-clamp-1">{desc.description}</p>
                </div>
                <button
                  onClick={() => toggleConsent(purpose)}
                  disabled={desc.required}
                  className={`w-10 h-5 rounded-full transition-all relative ${
                    consents[purpose] ? 'bg-accent' : 'bg-bg-tertiary'
                  } ${desc.required ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm absolute top-[2px] transition-transform ${
                    consents[purpose] ? 'translate-x-[22px]' : 'translate-x-[2px]'
                  }`} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Data Actions */}
      <p className="text-sm font-semibold text-text-primary mb-3">Your Rights</p>
      <div className="space-y-2 mb-6">
        <Button fullWidth variant="secondary" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting...' : 'Export All My Data (JSON)'}
        </Button>
        <p className="text-[10px] text-text-quaternary text-center">
          GDPR Art. 20 — Right to Data Portability
        </p>
      </div>

      {/* Audit Log */}
      {auditLogs.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-text-primary mb-3">Recent Activity Log</p>
          <Card padding="sm">
            <div className="max-h-40 overflow-y-auto space-y-1">
              {auditLogs.map((log: any) => (
                <div key={log.id} className="flex items-center gap-2 text-[10px]">
                  <span className="text-text-quaternary">{new Date(log.timestamp).toLocaleString()}</span>
                  <span className={`px-1 py-0.5 rounded text-[9px] font-medium ${
                    log.action === 'create' ? 'bg-green-100 text-green-700' :
                    log.action === 'delete' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{log.action}</span>
                  <span className="text-text-tertiary">{log.entity}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Danger Zone */}
      <div className="border border-red-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-red-600 mb-2">Danger Zone</p>
        <p className="text-[11px] text-text-tertiary mb-3">
          This permanently deletes your account and all health data. This action cannot be undone.
        </p>
        {!showDeleteConfirm ? (
          <Button fullWidth variant="danger" onClick={() => setShowDeleteConfirm(true)}>
            Delete My Account & All Data
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-red-600 font-medium text-center">Are you absolutely sure?</p>
            <div className="flex gap-2">
              <Button fullWidth variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button fullWidth variant="danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Yes, Delete Everything'}
              </Button>
            </div>
          </div>
        )}
        <p className="text-[10px] text-text-quaternary text-center mt-2">
          GDPR Art. 17 — Right to Erasure
        </p>
      </div>
    </div>
  );
}
