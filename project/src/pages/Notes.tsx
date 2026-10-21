import { useState } from 'react';
import { Plus, Search, Pin, PinOff, Edit2, Trash2, StickyNote } from 'lucide-react';
import type { AppData, Note } from '../types';
import { uid, formatDate, formatTime } from '../utils';
import { useToast } from '../components/Toast';
import { Modal, ConfirmDialog } from '../components/Modal';
import { EmptyState, SectionHeader, PageContainer } from '../components/UI';

const CATEGORIES = ['Personal', 'Work', 'Ideas', 'Lists', 'Other'];

export function Notes({ data, update }: { data: AppData; update: (fn: (p: AppData) => AppData) => void }) {
  const { notify } = useToast();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Note | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', category: 'Personal' });

  const filtered = data.notes
    .filter(
      (n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase()) ||
        n.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });

  function openNew() {
    setForm({ title: '', content: '', category: 'Personal' });
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(note: Note) {
    setForm({ title: note.title, content: note.content, category: note.category });
    setEditing(note);
    setShowForm(true);
  }

  function save() {
    if (!form.title.trim() && !form.content.trim()) {
      notify('Please add a title or some content', 'error');
      return;
    }
    if (editing) {
      update((d) => ({
        ...d,
        notes: d.notes.map((n) =>
          n.id === editing.id ? { ...n, ...form, updatedAt: Date.now() } : n
        ),
      }));
      notify('Note updated');
    } else {
      const note: Note = {
        id: uid(),
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category,
        pinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      update((d) => ({ ...d, notes: [note, ...d.notes] }));
      notify('Note created');
    }
    setShowForm(false);
  }

  function togglePin(id: string) {
    update((d) => ({
      ...d,
      notes: d.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    }));
  }

  function remove(id: string) {
    update((d) => ({ ...d, notes: d.notes.filter((n) => n.id !== id) }));
    notify('Note deleted', 'info');
  }

  return (
    <PageContainer>
      <SectionHeader
        title="Personal Notes"
        subtitle={`${data.notes.length} note${data.notes.length !== 1 ? 's' : ''} stored locally`}
        action={
          <button className="btn-primary" onClick={openNew}>
            <Plus size={16} /> New Note
          </button>
        }
      />

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
        <input
          className="input pl-10"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={StickyNote}
            title={search ? 'No notes found' : 'No notes yet'}
            subtitle={search ? 'Try a different search term' : 'Create your first note to get started'}
            action={
              !search && (
                <button className="btn-primary" onClick={openNew}>
                  <Plus size={16} /> Create Note
                </button>
              )
            }
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <div
              key={note.id}
              className="card card-hover group cursor-pointer"
              onClick={() => openEdit(note)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm truncate flex-1" style={{ color: 'var(--text)' }}>
                  {note.title || 'Untitled'}
                </h3>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="btn-icon !p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(note.id);
                    }}
                  >
                    {note.pinned ? <PinOff size={14} style={{ color: 'var(--warning)' }} /> : <Pin size={14} />}
                  </button>
                  <button
                    className="btn-icon !p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(note);
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="btn-icon !p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(note.id);
                    }}
                  >
                    <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                  </button>
                </div>
              </div>
              <p className="text-xs whitespace-pre-wrap line-clamp-4 mb-3" style={{ color: 'var(--text-muted)' }}>
                {note.content || 'No content'}
              </p>
              <div className="flex items-center justify-between">
                {note.pinned && (
                  <span className="badge" style={{ background: 'rgba(251,191,36,0.15)', color: 'var(--warning)' }}>
                    <Pin size={10} /> Pinned
                  </span>
                )}
                <span className="badge" style={{ background: 'var(--bg-elev)', color: 'var(--text-muted)' }}>
                  {note.category}
                </span>
                <span className="text-xs ml-auto" style={{ color: 'var(--text-dim)' }}>
                  {formatDate(note.updatedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Note' : 'New Note'}>
        <div className="space-y-4">
          <input
            className="input"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            autoFocus
          />
          <textarea
            className="input min-h-[160px] resize-y"
            placeholder="Write your note here..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
              Category
            </label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={save}>
              {editing ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        title="Delete Note"
        message="This note will be permanently deleted. This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </PageContainer>
  );
}
