import { useState } from 'react';
import { Plus, Trash2, Repeat, Flame, Check, Calendar } from 'lucide-react';
import type { AppData, Habit } from '../types';
import { uid, todayKey, pct } from '../utils';
import { useToast } from '../components/Toast';
import { Modal, ConfirmDialog } from '../components/Modal';
import { EmptyState, SectionHeader, PageContainer } from '../components/UI';

const HABIT_ICONS = ['💪', '📚', '💧', '🏃', '🧘', '🥗', '😴', '✍️', '🎯', '🌱', '🎸', '💻'];

function calculateStreak(records: Record<string, boolean>): number {
  let streak = 0;
  const today = new Date();
  // If today not done, start from yesterday
  let day = new Date(today);
  if (!records[todayKey(day)]) {
    day.setDate(day.getDate() - 1);
  }
  while (records[todayKey(day)]) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

function last7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(todayKey(d));
  }
  return days;
}

export function Habits({ data, update }: { data: AppData; update: (fn: (p: AppData) => AppData) => void }) {
  const { notify } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', icon: '💪' });

  const days = last7Days();
  const today = todayKey();

  function openNew() {
    setForm({ name: '', icon: '💪' });
    setShowForm(true);
  }

  function save() {
    if (!form.name.trim()) {
      notify('Habit name is required', 'error');
      return;
    }
    const habit: Habit = {
      id: uid(),
      name: form.name.trim(),
      icon: form.icon,
      createdAt: Date.now(),
      records: {},
    };
    update((d) => ({ ...d, habits: [...d.habits, habit] }));
    notify('Habit created');
    setShowForm(false);
  }

  function toggleDay(id: string, dateKey: string) {
    update((d) => ({
      ...d,
      habits: d.habits.map((h) => {
        if (h.id !== id) return h;
        const records = { ...h.records };
        if (records[dateKey]) {
          delete records[dateKey];
        } else {
          records[dateKey] = true;
        }
        return { ...h, records };
      }),
    }));
  }

  function remove(id: string) {
    update((d) => ({ ...d, habits: d.habits.filter((h) => h.id !== id) }));
    notify('Habit deleted', 'info');
  }

  return (
    <PageContainer>
      <SectionHeader
        title="Habit Tracker"
        subtitle={`${data.habits.length} active habit${data.habits.length !== 1 ? 's' : ''}`}
        action={
          <button className="btn-primary" onClick={openNew}>
            <Plus size={16} /> New Habit
          </button>
        }
      />

      {data.habits.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Repeat}
            title="No habits yet"
            subtitle="Start building routines by creating your first habit"
            action={
              <button className="btn-primary" onClick={openNew}>
                <Plus size={16} /> Create Habit
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {data.habits.map((habit) => {
            const streak = calculateStreak(habit.records);
            const last30 = Array.from({ length: 30 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (29 - i));
              return todayKey(d);
            });
            const completed30 = last30.filter((k) => habit.records[k]).length;
            const completionPct = pct(completed30, 30);

            return (
              <div key={habit.id} className="card group">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center w-11 h-11 rounded-xl text-xl"
                      style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}
                    >
                      {habit.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                        {habit.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--warning)' }}>
                          <Flame size={12} /> {streak} day streak
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {completionPct}% (30d)
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn-icon opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setDeleteId(habit.id)}
                  >
                    <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                  </button>
                </div>

                {/* Last 7 days */}
                <div className="flex items-center gap-1.5 sm:gap-2 mb-3">
                  {days.map((dayKey) => {
                    const done = habit.records[dayKey];
                    const isToday = dayKey === today;
                    const d = new Date(dayKey);
                    return (
                      <button
                        key={dayKey}
                        onClick={() => toggleDay(habit.id, dayKey)}
                        className="flex flex-col items-center gap-1 flex-1 transition-all"
                      >
                        <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                          {d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2)}
                        </span>
                        <div
                          className="flex items-center justify-center w-full aspect-square max-w-[40px] rounded-lg transition-all"
                          style={{
                            background: done ? 'var(--accent)' : 'var(--bg-elev)',
                            border: `1px solid ${done ? 'var(--accent)' : isToday ? 'var(--accent)' : 'var(--border)'}`,
                            boxShadow: done ? '0 0 12px var(--accent-glow)' : 'none',
                          }}
                        >
                          {done && <Check size={16} color="#05070d" strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 30-day progress */}
                <div className="flex items-center gap-2">
                  <Calendar size={12} style={{ color: 'var(--text-dim)' }} />
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elev)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${completionPct}%`,
                        background: 'linear-gradient(90deg, var(--accent), var(--violet))',
                      }}
                    />
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {completed30}/30
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Habit">
        <div className="space-y-4">
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
              Habit Name <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              className="input"
              placeholder="e.g. Drink water, Read 30 min..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {HABIT_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setForm({ ...form, icon })}
                  className="flex items-center justify-center aspect-square rounded-lg text-lg transition-all"
                  style={{
                    background: form.icon === icon ? 'var(--accent-glow)' : 'var(--bg-elev)',
                    border: `1px solid ${form.icon === icon ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={save}>
              Create Habit
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        title="Delete Habit"
        message="This habit and all its records will be permanently deleted."
        confirmLabel="Delete"
        danger
      />
    </PageContainer>
  );
}
