import { useState } from 'react';
import { Menu, Sparkles, ArrowRight } from 'lucide-react';
import { useAppData } from './storage';
import { ToastProvider, useToast } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Notes } from './pages/Notes';
import { Tasks } from './pages/Tasks';
import { Habits } from './pages/Habits';
import { FocusTimer } from './pages/FocusTimer';
import { Planner } from './pages/Planner';
import { Journal } from './pages/Journal';
import { Tools } from './pages/Tools';
import { Goals } from './pages/Goals';
import { Settings } from './pages/Settings';
import type { Page } from './types';

function WelcomeScreen({ onComplete }: { onComplete: (name: string) => void }) {
  const { notify } = useToast();
  const [name, setName] = useState('');

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      notify('Please enter your name to continue', 'error');
      return;
    }
    onComplete(trimmed);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#ffffff' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 md:p-10 animate-fade-up"
        style={{ background: '#ffffff', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div
            className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'var(--accent)' }}
          >
            <Sparkles size={32} color="#ffffff" />
          </div>
          <h1 className="text-3xl font-bold font-display" style={{ color: 'var(--accent)' }}>
            Welcome to MYNEST!
          </h1>
          <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
            Your personal space to organize your day.
          </p>
        </div>

        {/* Name input */}
        <div className="space-y-3">
          <label className="text-sm font-medium block" style={{ color: 'var(--text)' }}>
            What should we call you?
          </label>
          <input
            className="input"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          <button className="btn-primary w-full !py-3 text-base" onClick={handleSubmit}>
            Let&apos;s Get Started <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MainApp() {
  const { data, update, replaceAll, resetAll, isFirstTime } = useAppData();
  const [page, setPage] = useState<Page>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (isFirstTime) {
    return (
      <WelcomeScreen
        onComplete={(name) => {
          update((d) => ({ ...d, preferences: { ...d.preferences, displayName: name } }));
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar
        current={page}
        onNavigate={setPage}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header
          className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 h-16"
          style={{ background: '#ffffff', borderBottom: '1px solid var(--border)' }}
        >
          <button className="btn-icon" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-lg"
              style={{ background: 'var(--accent)' }}
            >
              <Sparkles size={14} color="#ffffff" />
            </div>
            <span className="font-display font-bold" style={{ color: 'var(--text)' }}>
              MYNEST
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          {page === 'dashboard' && <Dashboard data={data} onNavigate={setPage} />}
          {page === 'notes' && <Notes data={data} update={update} />}
          {page === 'tasks' && <Tasks data={data} update={update} />}
          {page === 'habits' && <Habits data={data} update={update} />}
          {page === 'focus' && <FocusTimer />}
          {page === 'planner' && <Planner data={data} update={update} />}
          {page === 'journal' && <Journal data={data} update={update} />}
          {page === 'tools' && <Tools />}
          {page === 'goals' && <Goals data={data} update={update} />}
          {page === 'settings' && (
            <Settings data={data} update={update} replaceAll={replaceAll} resetAll={resetAll} />
          )}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}

export default App;
