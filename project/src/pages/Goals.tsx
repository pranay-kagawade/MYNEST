import { useState } from 'react';
import { Plus, Trash2, Target, TrendingUp } from 'lucide-react';
import type { AppData, Goal } from '../types';
import { uid, pct } from '../utils';
import { useToast } from '../components/Toast';
import { Modal, ConfirmDialog } from '../components/Modal';
import { EmptyState, SectionHeader, PageContainer } from '../components/UI';

export function Goals({ data, update }: { data: AppData; update: (fn: (p: AppData) => AppData) => void }) {
  const { notify } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', current: 0, target: 100, unit: '' });

  function openNew() {
    setForm({ name: '', current: 0, target: 100, unit: '' });
    setShowForm(true);
  }

  function save() {
    if (!form.name.trim()) {
      notify('Goal name is required', 'error');
      return;
    }
    if (form.target <= 0) {
      notify('Target must be greater than 0', 'error');
      return;
    }
    const goal: Goal = {
      id: uid(),
      name: form.name.trim(),
      current: Math.max(0, Number(form.current) || 0),
      target: Number(form.target) || 1,
      unit: form.unit.trim(),
      createdAt: Date.now(),
    };
    update((d) => ({ ...d, goals: [...d.goals, goal] }));
    notify('Goal created');
    setShowForm(false);
  }

  function adjust(id: string, delta: number) {
    update((d) => ({
      ...d,
      goals: d.goals.map((g) => {
        if (g.id !== id) return g;
        const next = Math.max(0, g.current + delta);
        return { ...g, current: Math.min(next, g.target * 10) };
      }),
    }));
  }

  function remove(id: string) {
    update((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) }));
    notify('Goal deleted', 'info');
  }

  return (
    <PageContainer>
      <SectionHeader
        title="Goals"
        subtitle={`${data.goals.length} goal${data.goals.length !== 1 ? 's' : ''} tracked`}
        action={
          <button className="btn-primary" onClick={openNew}>
            <Plus size={16} /> New Goal
          </button>
        }
      />

      {data.goals.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Target}
            title="No goals tracked"
            subtitle="Set a goal with a target and track your progress over time"
            action={
              <button className="btn-primary" onClick={openNew}>
                <Plus size={16} /> Create Goal
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.goals.map((goal) => {
            const percentage = pct(goal.current, goal.target);
            const done = goal.current >= goal.target;
            return (
              <div key={goal.id} className="card group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={18} style={{ color: done ? 'var(--success)' : 'var(--accent)' }} />
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                      {goal.name}
                    </h3>
                  </div>
                  <button
                    className="btn-icon !p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setDeleteId(goal.id)}
                  >
                    <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                  </button>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold font-display" style={{ color: done ? 'var(--success)' : 'var(--accent)' }}>
                    {goal.current}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    / {goal.target} {goal.unit}
                  </span>
                  <span className="text-sm ml-auto font-semibold" style={{ color: done ? 'var(--success)' : 'var(--text)' }}>
                    {percentage}%
                  </span>
                </div>

                <div className="h-3 rounded-full overflow-hidden mb-4" style={{ background: 'var(--bg-elev)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      background: done
                        ? 'linear-gradient(90deg, var(--success), var(--accent))'
                        : 'var(--accent)',
                    }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button className="btn-ghost !px-3 !py-2 text-sm" onClick={() => adjust(goal.id, -1)}>
                    −1
                  </button>
                  <button className="btn-ghost !px-3 !py-2 text-sm" onClick={() => adjust(goal.id, 1)}>
                    +1
                  </button>
                  <button className="btn-ghost !px-3 !py-2 text-sm" onClick={() => adjust(goal.id, 5)}>
                    +5
                  </button>
                  {done && (
                    <span className="badge ml-auto" style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--success)' }}>
                      Achieved!
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Goal">
        <div className="space-y-4">
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
              Goal Name <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              className="input"
              placeholder="e.g. Read 50 books, Run 100km..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Current
              </label>
              <input
                type="number"
                className="input"
                value={form.current}
                onChange={(e) => setForm({ ...form, current: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Target <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="number"
                className="input"
                value={form.target}
                onChange={(e) => setForm({ ...form, target: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Unit
              </label>
              <input
                className="input"
                placeholder="books, km..."
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={save}>
              Create Goal
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        title="Delete Goal"
        message="This goal and its progress will be permanently deleted."
        confirmLabel="Delete"
        danger
      />
    </PageContainer>
  );
}
