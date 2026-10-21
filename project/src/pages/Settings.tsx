import { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, User, Database } from 'lucide-react';
import type { AppData } from '../types';
import { useToast } from '../components/Toast';
import { ConfirmDialog } from '../components/Modal';
import { SectionHeader, PageContainer } from '../components/UI';

export function Settings({
  data,
  update,
  replaceAll,
  resetAll,
}: {
  data: AppData;
  update: (fn: (p: AppData) => AppData) => void;
  replaceAll: (data: AppData) => boolean;
  resetAll: () => void;
}) {
  const { notify } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showReset, setShowReset] = useState(false);
  const [name, setName] = useState(data.preferences.displayName);

  function saveName() {
    const trimmed = name.trim();
    if (!trimmed) {
      notify('Display name cannot be empty', 'error');
      setName(data.preferences.displayName);
      return;
    }
    update((d) => ({ ...d, preferences: { ...d.preferences, displayName: trimmed } }));
    notify('Display name updated');
  }

  function exportData() {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mynest-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify('Backup exported successfully');
  }

  function importData(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        const ok = replaceAll(parsed);
        if (ok) {
          notify('Backup imported successfully');
        } else {
          notify('Invalid backup file. Data format not recognized.', 'error');
        }
      } catch {
        notify('Could not read the file. Make sure it is a valid JSON backup.', 'error');
      }
    };
    reader.onerror = () => notify('Failed to read file', 'error');
    reader.readAsText(file);
  }

  const dataCounts = [
    { label: 'Notes', value: data.notes.length },
    { label: 'Tasks', value: data.tasks.length },
    { label: 'Habits', value: data.habits.length },
    { label: 'Planner', value: data.planner.length },
    { label: 'Journal', value: data.journal.length },
    { label: 'Goals', value: data.goals.length },
  ];

  return (
    <PageContainer>
      <SectionHeader title="Settings" subtitle="Customize your experience and manage your data" />

      {/* Profile */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <User size={18} style={{ color: 'var(--accent)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Display Name
          </h3>
        </div>
        <div className="flex gap-3 max-w-sm">
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveName()}
            placeholder="Your name"
          />
          <button className="btn-primary" onClick={saveName}>
            Save
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          This name appears in your dashboard greeting.
        </p>
      </div>

      {/* Data */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Database size={18} style={{ color: 'var(--accent)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Data &amp; Backup
          </h3>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
          {dataCounts.map((c) => (
            <div key={c.label} className="text-center p-3 rounded-xl" style={{ background: 'var(--bg-elev)' }}>
              <div className="text-lg font-bold font-display" style={{ color: 'var(--accent)' }}>
                {c.value}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {c.label}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-elev)' }}>
            <div className="flex items-center gap-3">
              <Download size={18} style={{ color: 'var(--accent)' }} />
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Export Data
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Download all your data as a JSON backup file
                </div>
              </div>
            </div>
            <button className="btn-ghost" onClick={exportData}>
              <Download size={16} /> Export
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-elev)' }}>
            <div className="flex items-center gap-3">
              <Upload size={18} style={{ color: 'var(--accent)' }} />
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Import Data
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Restore from a previously exported JSON backup
                </div>
              </div>
            </div>
            <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
              <Upload size={16} /> Import
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) importData(file);
                e.target.value = '';
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-xl" style={{ background: 'var(--danger-glow)', border: '1px solid var(--danger)' }}>
            <div className="flex items-center gap-3">
              <RotateCcw size={18} style={{ color: 'var(--danger)' }} />
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Reset All Data
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Delete everything and start fresh. This cannot be undone.
                </div>
              </div>
            </div>
            <button className="btn-danger" onClick={() => setShowReset(true)}>
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs py-4" style={{ color: 'var(--text-dim)' }}>
        MYNEST — All data is stored locally in your browser. No account, no server, no tracking.
      </p>

      <ConfirmDialog
        open={showReset}
        onClose={() => setShowReset(false)}
        onConfirm={() => {
          resetAll();
          setName('');
          notify('All data has been reset', 'info');
        }}
        title="Reset All Data"
        message="This will permanently delete all your notes, tasks, habits, planner entries, journal entries, goals, and preferences. This action cannot be undone. Consider exporting a backup first."
        confirmLabel="Yes, Reset Everything"
        danger
      />
    </PageContainer>
  );
}
