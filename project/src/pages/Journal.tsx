import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, BookText } from 'lucide-react';
import type { AppData, JournalEntry } from '../types';
import { uid, todayKey, formatDate } from '../utils';
import { useToast } from '../components/Toast';
import { Modal, ConfirmDialog } from '../components/Modal';
import { EmptyState, SectionHeader, PageContainer } from '../components/UI';

const MOODS = [
  { key: 'great', label: 'Great', emoji: '😄' },
  { key: 'good', label: 'Good', emoji: '🙂' },
  { key: 'okay', label: 'Okay', emoji: '😐' },
  { key: 'low', label: 'Low', emoji: '😕' },
  { key: 'tough', label: 'Tough', emoji: '😢' },
];

export function Journal({ data, update }: { data: AppData; update: (fn: (p: AppData) => AppData) => void }) {
  const { notify } = useToast();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ date: todayKey(), title: '', mood: 'good', content: '' });

  const filtered = data.journal
    .filter(
      (e) =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.content.toLowerCase().includes(search.toLowerCase()) ||
        e.date.includes(search)
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  function openNew() {
    setForm({ date: todayKey(), title: '', mood: 'good', content: '' });
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(entry: JournalEntry) {
    setForm({ date: entry.date, title: entry.title, mood: entry.mood, content: entry.content });
    setEditing(entry);
    setShowForm(true);
  }

  function save() {
    if (!form.content.trim() && !form.title.trim()) {
      notify('Please write something before saving', 'error');
      return;
    }
    if (editing) {
      update((d) => ({
        ...d,
        journal: d.journal.map((e) =>
          e.id === editing.id
            ? { ...e, date: form.date, title: form.title.trim(), mood: form.mood, content: form.content.trim(), updatedAt: Date.now() }
            : e
        ),
      }));
      notify('Journal entry updated');
    } else {
      const entry: JournalEntry = {
        id: uid(),
        date: form.date,
        title: form.title.trim(),
        mood: form.mood,
        content: form.content.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      update((d) => ({ ...d, journal: [entry, ...d.journal] }));
      notify('Journal entry saved');
    }
    setShowForm(false);
  }

  function remove(id: string) {
    update((d) => ({ ...d, journal: d.journal.filter((e) => e.id !== id) }));
    notify('Entry deleted', 'info');
  }

  function getMood(key: string) {
    return MOODS.find((m) => m.key === key) || MOODS[1];
  }

  return (
    <PageContainer>
      <SectionHeader
        title="Personal Journal"
        subtitle={`${data.journal.length} entr${data.journal.length !== 1 ? 'ies' : 'y'}`}
        action={
          <button className="btn-primary" onClick={openNew}>
            <Plus size={16} /> New Entry
          </button>
        }
      />

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
        <input
          className="input pl-10"
          placeholder="Search journal entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={BookText}
            title={search ? 'No entries found' : 'No journal entries yet'}
            subtitle={search ? 'Try a different search' : 'Start writing your thoughts and reflections'}
            action={
              !search && (
                <button className="btn-primary" onClick={openNew}>
                  <Plus size={16} /> Write Entry
                </button>
              )
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((entry) => {
            const mood = getMood(entry.mood);
            return (
              <div key={entry.id} className="card card-hover group">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center w-11 h-11 rounded-xl text-xl"
                      style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}
                    >
                      {mood.emoji}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                        {entry.title || 'Untitled'}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(new Date(entry.date).getTime())}
                        </span>
                        <span className="badge" style={{ background: 'var(--bg-elev)', color: 'var(--text-muted)' }}>
                          {mood.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="btn-icon !p-1.5" onClick={() => openEdit(entry)}>
                      <Edit2 size={14} />
                    </button>
                    <button className="btn-icon !p-1.5" onClick={() => setDeleteId(entry.id)}>
                      <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                    </button>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-muted)' }}>
                  {entry.content}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Entry' : 'New Journal Entry'} maxWidth="max-w-xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Date
              </label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Mood
              </label>
              <select
                className="input"
                value={form.mood}
                onChange={(e) => setForm({ ...form, mood: e.target.value })}
              >
                {MOODS.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.emoji} {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
              Title
            </label>
            <input
              className="input"
              placeholder="Give your entry a title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
              Entry
            </label>
            <textarea
              className="input min-h-[200px] resize-y"
              placeholder="Write your thoughts, reflections, or anything on your mind..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={save}>
              {editing ? 'Save Changes' : 'Save Entry'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        title="Delete Entry"
        message="This journal entry will be permanently deleted."
        confirmLabel="Delete"
        danger
      />
    </PageContainer>
  );
}
