import { BookText, Timer, ListTodo, Repeat, Target, Clock } from 'lucide-react';
import type { AppData, Page } from '../types';
import { getGreeting, formatLongDate, pct } from '../utils';

export function Dashboard({ data, onNavigate }: { data: AppData; onNavigate: (p: Page) => void }) {
  const name = data.preferences.displayName || 'there';
  const habitsToday = data.habits.filter(
    (h) => h.records[new Date().toISOString().slice(0, 10)]
  );
  const habitsCompletion = data.habits.length > 0 ? pct(habitsToday.length, data.habits.length) : 0;
  const goalsAchieved = data.goals.filter((g) => g.current >= g.target).length;

  const stats: {
    label: string;
    value: string | number;
    icon: typeof BookText;
    page: Page;
  }[] = [
    { label: 'Notes', value: data.notes.length, icon: BookText, page: 'notes' },
    { label: 'Active Habits', value: data.habits.length, icon: Repeat, page: 'habits' },
    { label: 'Habits Done Today', value: `${habitsToday.length}/${data.habits.length}`, icon: Clock, page: 'habits' },
    { label: 'Goals Tracked', value: data.goals.length, icon: Target, page: 'goals' },
  ];

  const quickActions: { label: string; icon: typeof BookText; page: Page }[] = [
    { label: 'Create a Note', icon: BookText, page: 'notes' },
    { label: 'Start Focus', icon: Timer, page: 'focus' },
    { label: 'Add a Task', icon: ListTodo, page: 'tasks' },
  ];

  return (
    <div className="animate-fade-up space-y-6">
      {/* Greeting */}
      <div className="rounded-2xl p-6 md:p-8" style={{ background: '#ffffff', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
        <h1 className="text-2xl md:text-3xl font-bold font-display" style={{ color: 'var(--accent)' }}>
          {getGreeting(name)}, {name}!
        </h1>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
          {formatLongDate()}
        </p>

        {/* Habit progress bar */}
        {data.habits.length > 0 && (
          <div className="mt-5 max-w-sm">
            <div className="flex justify-between text-xs mb-1.5">
              <span style={{ color: 'var(--text-muted)' }}>Today&apos;s habits</span>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{habitsCompletion}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elev)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${habitsCompletion}%`, background: 'var(--accent)' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <button key={s.label} onClick={() => onNavigate(s.page)} className="card card-hover text-left">
              <div
                className="flex items-center justify-center w-11 h-11 rounded-xl mb-3"
                style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
              >
                <Icon size={20} />
              </div>
              <div className="text-2xl font-bold font-display" style={{ color: 'var(--accent)' }}>
                {s.value}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text)' }}>
                {s.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="card">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={() => onNavigate(a.page)}
                className="flex flex-col items-center gap-2 py-5 rounded-xl transition-all duration-200"
                style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <Icon size={22} style={{ color: 'var(--accent)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                  {a.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Recent notes */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
              Recent Notes
            </h3>
            <button className="text-xs" style={{ color: 'var(--accent)' }} onClick={() => onNavigate('notes')}>
              View all
            </button>
          </div>
          {data.notes.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--text-dim)' }}>
              No notes yet.
            </p>
          ) : (
            <div className="space-y-2">
              {[...data.notes]
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .slice(0, 4)
                .map((n) => (
                  <button
                    key={n.id}
                    onClick={() => onNavigate('notes')}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all"
                    style={{ background: 'var(--bg-elev)' }}
                  >
                    <span className="text-sm flex-1 truncate" style={{ color: 'var(--text)' }}>
                      {n.title || 'Untitled'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {n.category}
                    </span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Habits overview */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
              Habits Today
            </h3>
            <button className="text-xs" style={{ color: 'var(--accent)' }} onClick={() => onNavigate('habits')}>
              View all
            </button>
          </div>
          {data.habits.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--text-dim)' }}>
              No habits yet.
            </p>
          ) : (
            <div className="space-y-2">
              {data.habits.slice(0, 4).map((h) => {
                const done = h.records[new Date().toISOString().slice(0, 10)];
                return (
                  <div key={h.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-elev)' }}>
                    <span className="text-base">{h.icon}</span>
                    <span className="text-sm flex-1 truncate" style={{ color: 'var(--text)' }}>
                      {h.name}
                    </span>
                    <span className="text-xs font-medium" style={{ color: done ? 'var(--success)' : 'var(--text-dim)' }}>
                      {done ? 'Done' : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Goals overview */}
        <div className="card md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
              Goals Progress
            </h3>
            <button className="text-xs" style={{ color: 'var(--accent)' }} onClick={() => onNavigate('goals')}>
              View all
            </button>
          </div>
          {data.goals.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--text-dim)' }}>
              No goals yet.
            </p>
          ) : (
            <div className="space-y-2">
              {data.goals.slice(0, 4).map((g) => {
                const percentage = pct(g.current, g.target);
                return (
                  <div key={g.id} className="px-3 py-2 rounded-lg" style={{ background: 'var(--bg-elev)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm truncate" style={{ color: 'var(--text)' }}>
                        {g.name}
                      </span>
                      <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#e0e0e0' }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min(percentage, 100)}%`, background: 'var(--accent)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
