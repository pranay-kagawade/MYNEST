import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, CheckSquare, ListFilter } from 'lucide-react';
import type { AppData, Task } from '../types';
import { uid } from '../utils';
import { useToast } from '../components/Toast';
import { Modal, ConfirmDialog } from '../components/Modal';
import { EmptyState, SectionHeader, PageContainer } from '../components/UI';

type Filter = 'all' | 'pending' | 'completed';

export function Tasks({ data, update }: { data: AppData; update: (fn: (p: AppData) => AppData) => void }) {
  const { notify } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ subject: '', title: '', description: '' });

  const filtered = data.tasks.filter((t) => {
    if (filter === 'pending' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;
    return (
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      (t.subject || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  const grouped: Record<string, Task[]> = {};
  filtered.forEach((t) => {
    const subj = t.subject || 'General';
    if (!grouped[subj]) grouped[subj] = [];
    grouped[subj].push(t);
  });
  const subjects = Object.keys(grouped).sort();
  subjects.forEach((s) => {
    grouped[s].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return b.createdAt - a.createdAt;
    });
  });

  function openNew() {
    setForm({ subject: '', title: '', description: '' });
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(task: Task) {
    setForm({ subject: task.subject || '', title: task.title, description: task.description });
    setEditing(task);
    setShowForm(true);
  }

  function save() {
    if (!form.title.trim()) {
      notify('Task title is required', 'error');
      return;
    }
    const subject = form.subject.trim() || 'General';
    if (editing) {
      update((d) => ({
        ...d,
        tasks: d.tasks.map((t) =>
          t.id === editing.id
            ? { ...t, subject, title: form.title.trim(), description: form.description.trim() }
            : t
        ),
      }));
      notify('Task updated');
    } else {
      const task: Task = {
        id: uid(),
        title: form.title.trim(),
        description: form.description.trim(),
        subject,
        priority: 'medium',
        dueDate: null,
        completed: false,
        createdAt: Date.now(),
      };
      update((d) => ({ ...d, tasks: [task, ...d.tasks] }));
      notify('Task added');
    }
    setShowForm(false);
  }

  function toggle(id: string) {
    update((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    }));
  }

  function remove(id: string) {
    update((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) }));
    notify('Task deleted', 'info');
  }

  const counts = {
    all: data.tasks.length,
    pending: data.tasks.filter((t) => !t.completed).length,
    completed: data.tasks.filter((t) => t.completed).length,
  };

  return (
    <PageContainer>
      <SectionHeader
        title="Task Manager"
        subtitle={`${counts.pending} pending · ${counts.completed} completed`}
        action={
          <button className="btn-primary" onClick={openNew}>
            <Plus size={16} /> Add Task
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
          <input
            className="input pl-10"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>
          <ListFilter size={14} className="ml-2" style={{ color: 'var(--text-dim)' }} />
          {(['all', 'pending', 'completed'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
              style={{
                background: filter === f ? 'var(--bg-card)' : 'transparent',
                color: filter === f ? 'var(--accent)' : 'var(--text-muted)',
                border: filter === f ? '1px solid var(--border)' : '1px solid transparent',
              }}
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={CheckSquare}
            title={search || filter !== 'all' ? 'No tasks found' : 'No tasks yet'}
            subtitle={search || filter !== 'all' ? 'Try adjusting your filters' : 'Add your first task to get organized'}
            action={
              !search && filter === 'all' && (
                <button className="btn-primary" onClick={openNew}>
                  <Plus size={16} /> Add Task
                </button>
              )
            }
          />
        </div>
      ) : (
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{ background: '#ffffff', boxShadow: 'var(--shadow-card)' }}
        >
          {subjects.map((subject) => (
            <div key={subject} className="mb-6 last:mb-0">
              <h3
                className="font-display font-bold text-lg pb-2 mb-2"
                style={{
                  color: '#f97316',
                  borderBottom: '2px solid #fed7aa',
                }}
              >
                {subject}
              </h3>
              <div>
                {grouped[subject].map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-start gap-2 py-2.5 px-2 -mx-2 rounded-lg transition-all hover:bg-orange-50"
                  >
                    <button
                      onClick={() => toggle(task.id)}
                      className="flex-1 text-left"
                    >
                      <span
                        className="text-sm block"
                        style={{
                          color: task.completed ? '#9ca3af' : '#1a1a1a',
                          textDecoration: task.completed ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </span>
                      {task.description && (
                        <span
                          className="text-xs block mt-0.5"
                          style={{
                            color: task.completed ? '#d1d5db' : '#6b7280',
                            textDecoration: task.completed ? 'line-through' : 'none',
                          }}
                        >
                          {task.description}
                        </span>
                      )}
                    </button>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-0.5">
                      <button className="btn-icon !p-1" onClick={() => openEdit(task)}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn-icon !p-1" onClick={() => setDeleteId(task.id)}>
                        <Trash2 size={14} style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Task' : 'Add Task'}>
        <div className="space-y-4">
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
              Subject
            </label>
            <input
              className="input"
              placeholder="e.g. Math, Science, Personal..."
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              autoFocus
            />
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-dim)' }}>
              Tasks are grouped by subject. Leave blank for &quot;General&quot;.
            </p>
          </div>
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
              Title <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              className="input"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
              Description
            </label>
            <textarea
              className="input min-h-[100px] resize-y"
              placeholder="Optional details..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={save}>
              {editing ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        title="Delete Task"
        message="This task will be permanently deleted."
        confirmLabel="Delete"
        danger
      />
    </PageContainer>
  );
}
