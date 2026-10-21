import { useState } from 'react';
import { Plus, Trash2, CalendarDays, Check } from 'lucide-react';
import type { AppData, PlannerEntry } from '../types';
import { uid } from '../utils';
import { useToast } from '../components/Toast';
import { Modal, ConfirmDialog } from '../components/Modal';
import { EmptyState, SectionHeader, PageContainer } from '../components/UI';

export function Planner({ data, update }: { data: AppData; update: (fn: (p: AppData) => AppData) => void }) {
  const { notify } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ time: '09:00', activity: '' });

  const entries = [...data.planner].sort((a, b) => a.time.localeCompare(b.time));
  const completedCount = entries.filter((e) => e.completed).length;

  function openNew() {
    setForm({ time: '09:00', activity: '' });
    setShowForm(true);
  }

  function save() {
    if (!form.activity.trim()) {
      notify('Activity is required', 'error');
      return;
    }
    const entry: PlannerEntry = {
      id: uid(),
      time: form.time,
      activity: form.activity.trim(),
      completed: false,
    };
    update((d) => ({ ...d, planner: [...d.planner, entry] }));
    notify('Activity added to schedule');
    setShowForm(false);
  }

  function toggle(id: string) {
    update((d) => ({
      ...d,
      planner: d.planner.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e)),
    }));
  }

  function remove(id: string) {
    update((d) => ({ ...d, planner: d.planner.filter((e) => e.id !== id) }));
    notify('Activity removed', 'info');
  }

  function formatTimeLabel(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  }

  return (
    <PageContainer>
      <SectionHeader
        title="Daily Planner"
        subtitle={`${completedCount}/${entries.length} activities completed today`}
        action={
          <button className="btn-primary" onClick={openNew}>
            <Plus size={16} /> Add Activity
          </button>
        }
      />

      {entries.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={CalendarDays}
            title="No activities planned"
            subtitle="Create a schedule for your day to stay on track"
            action={
              <button className="btn-primary" onClick={openNew}>
                <Plus size={16} /> Add Activity
              </button>
            }
          />
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          {/* Timeline */}
          <div className="relative">
            {entries.map((entry, i) => (
              <div
                key={entry.id}
                className="group flex items-stretch gap-4 px-5 py-4 transition-all"
                style={{
                  borderTop: i > 0 ? '1px solid var(--border-soft)' : 'none',
                  background: entry.completed ? 'rgba(45,212,191,0.04)' : 'transparent',
                }}
              >
                {/* Time column */}
                <div className="w-24 shrink-0 text-right">
                  <div className="text-sm font-semibold" style={{ color: entry.completed ? 'var(--accent)' : 'var(--text)' }}>
                    {formatTimeLabel(entry.time)}
                  </div>
                </div>

                {/* Line + dot */}
                <div className="relative flex flex-col items-center">
                  <div
                    className="w-3 h-3 rounded-full mt-1.5 shrink-0 transition-all"
                    style={{
                      background: entry.completed ? 'var(--accent)' : 'var(--bg-elev)',
                      border: `2px solid ${entry.completed ? 'var(--accent)' : 'var(--border)'}`,
                      boxShadow: entry.completed ? '0 0 8px var(--accent-glow)' : 'none',
                    }}
                  />
                </div>

                {/* Activity */}
                <div className="flex-1 flex items-center justify-between gap-3 min-w-0">
                  <button
                    onClick={() => toggle(entry.id)}
                    className="flex-1 text-left"
                  >
                    <span
                      className="text-sm"
                      style={{
                        color: 'var(--text)',
                        textDecoration: entry.completed ? 'line-through' : 'none',
                        opacity: entry.completed ? 0.6 : 1,
                      }}
                    >
                      {entry.activity}
                    </span>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      className="btn-icon !p-1.5"
                      onClick={() => toggle(entry.id)}
                      style={{ color: entry.completed ? 'var(--accent)' : 'var(--text-muted)' }}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      className="btn-icon !p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setDeleteId(entry.id)}
                    >
                      <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Activity">
        <div className="space-y-4">
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
              Time
            </label>
            <input
              type="time"
              className="input"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
              Activity <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              className="input"
              placeholder="e.g. Morning workout, Team meeting..."
              value={form.activity}
              onChange={(e) => setForm({ ...form, activity: e.target.value })}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={save}>
              Add to Schedule
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        title="Remove Activity"
        message="This activity will be removed from your schedule."
        confirmLabel="Remove"
        danger
      />
    </PageContainer>
  );
}
