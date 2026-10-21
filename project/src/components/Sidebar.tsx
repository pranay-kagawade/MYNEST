import {
  LayoutDashboard,
  StickyNote,
  CheckSquare,
  Repeat,
  Timer,
  CalendarDays,
  BookText,
  Wrench,
  Target,
  Settings,
  X,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import type { Page } from '../types';

const navItems: { page: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'notes', label: 'Notes', icon: StickyNote },
  { page: 'tasks', label: 'Tasks', icon: CheckSquare },
  { page: 'habits', label: 'Habit Tracker', icon: Repeat },
  { page: 'focus', label: 'Focus Timer', icon: Timer },
  { page: 'planner', label: 'Daily Planner', icon: CalendarDays },
  { page: 'journal', label: 'Journal', icon: BookText },
  { page: 'tools', label: 'Useful Tools', icon: Wrench },
  { page: 'goals', label: 'Goals', icon: Target },
  { page: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({
  current,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  collapsed,
  onToggleCollapse,
}: {
  current: Page;
  onNavigate: (p: Page) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const width = collapsed ? 72 : 260;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-10 h-screen shrink-0 transition-all duration-300 flex flex-col`}
        style={{
          width: mobileOpen ? 260 : width,
          background: '#ffffff',
          borderRight: '1px solid var(--border)',
          transform: mobileOpen ? 'translateX(0)' : window.innerWidth < 1024 ? 'translateX(-100%)' : 'translateX(0)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between px-4 h-16 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
              style={{ background: 'var(--accent)' }}
            >
              <Sparkles size={18} color="#ffffff" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div
                  className="font-display font-bold text-lg leading-none"
                  style={{ color: 'var(--text)' }}
                >
                  MYNEST
                </div>
                <div
                  className="text-[10px] tracking-widest mt-0.5"
                  style={{ color: 'var(--text-dim)' }}
                >
                  PERSONAL DASHBOARD
                </div>
              </div>
            )}
          </div>
          <button className="btn-icon lg:hidden shrink-0" onClick={onCloseMobile}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const active = current === item.page;
            const Icon = item.icon;
            return (
              <button
                key={item.page}
                onClick={() => {
                  onNavigate(item.page);
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative"
                style={{
                  background: active ? 'var(--accent-bg)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'var(--bg-elev)';
                    e.currentTarget.style.color = 'var(--text)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }
                }}
                title={collapsed ? item.label : undefined}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                    style={{ background: 'var(--accent)' }}
                  />
                )}
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:flex px-3 py-3 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-elev)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>

        {!collapsed && (
          <div className="px-4 py-3 shrink-0 lg:hidden" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
              Data stored locally. No account needed.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
