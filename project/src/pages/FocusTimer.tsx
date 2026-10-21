import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Coffee, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import { SectionHeader, PageContainer } from '../components/UI';

type Mode = 'focus' | 'break';
const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

export function FocusTimer() {
  const { notify } = useToast();
  const [mode, setMode] = useState<Mode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Session complete
            setRunning(false);
            if (mode === 'focus') {
              setSessions((s) => s + 1);
              notify('Focus session complete! Take a 5-minute break.', 'success');
              setMode('break');
              return BREAK_SECONDS;
            } else {
              notify('Break is over. Ready for another focus session?', 'info');
              setMode('focus');
              return FOCUS_SECONDS;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, mode, notify]);

  function start() {
    setRunning(true);
  }
  function pause() {
    setRunning(false);
  }
  function reset() {
    setRunning(false);
    setSecondsLeft(mode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS);
  }
  function switchMode(m: Mode) {
    setRunning(false);
    setMode(m);
    setSecondsLeft(m === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS);
  }

  const total = mode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS;
  const progress = ((total - secondsLeft) / total) * 100;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <PageContainer>
      <SectionHeader title="Focus Timer" subtitle="25-minute Pomodoro sessions to boost productivity" />

      <div className="card flex flex-col items-center py-8">
        {/* Mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl mb-8" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>
          <button
            onClick={() => switchMode('focus')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            style={{
              background: mode === 'focus' ? 'var(--bg-card)' : 'transparent',
              color: mode === 'focus' ? 'var(--accent)' : 'var(--text-muted)',
              border: mode === 'focus' ? '1px solid var(--border)' : '1px solid transparent',
            }}
          >
            <Timer size={14} /> Focus
          </button>
          <button
            onClick={() => switchMode('break')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            style={{
              background: mode === 'break' ? 'var(--bg-card)' : 'transparent',
              color: mode === 'break' ? 'var(--violet)' : 'var(--text-muted)',
              border: mode === 'break' ? '1px solid var(--border)' : '1px solid transparent',
            }}
          >
            <Coffee size={14} /> Break
          </button>
        </div>

        {/* Timer circle */}
        <div className="relative w-[300px] h-[300px] flex items-center justify-center mb-8">
          <svg width="300" height="300" className="-rotate-90 absolute">
            <circle
              cx="150"
              cy="150"
              r={radius}
              fill="none"
              stroke="var(--bg-elev)"
              strokeWidth="8"
            />
            <circle
              cx="150"
              cy="150"
              r={radius}
              fill="none"
              stroke={mode === 'focus' ? 'var(--accent)' : 'var(--violet)'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{
                transition: 'stroke-dashoffset 1s linear',
                filter: `drop-shadow(0 0 6px ${mode === 'focus' ? 'var(--accent-glow)' : 'var(--violet-glow)'})`,
              }}
            />
          </svg>
          <div className="text-center relative z-10">
            <div
              className="text-5xl font-bold font-display tabular-nums"
              style={{
                color: 'var(--text)',
                textShadow: running ? `0 0 20px ${mode === 'focus' ? 'var(--accent-glow)' : 'var(--violet-glow)'}` : 'none',
              }}
            >
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="text-sm mt-2 capitalize" style={{ color: 'var(--text-muted)' }}>
              {mode === 'focus' ? 'Focus Time' : 'Break Time'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-6">
          {!running ? (
            <button
              className="btn-primary !px-8 !py-3 text-base"
              onClick={start}
              style={mode === 'break' ? { background: 'var(--violet)', boxShadow: '0 0 16px var(--violet-glow)' } : {}}
            >
              <Play size={20} /> {secondsLeft === total ? 'Start' : 'Resume'}
            </button>
          ) : (
            <button className="btn-ghost !px-8 !py-3 text-base" onClick={pause}>
              <Pause size={20} /> Pause
            </button>
          )}
          <button className="btn-ghost !px-6 !py-3" onClick={reset}>
            <RotateCcw size={18} /> Reset
          </button>
        </div>

        {/* Sessions count */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>
          <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Sessions completed today: <span className="font-semibold" style={{ color: 'var(--text)' }}>{sessions}</span>
          </span>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
          How it works
        </h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { step: '1', title: 'Focus', desc: 'Work intensely for 25 minutes on a single task.' },
            { step: '2', title: 'Break', desc: 'Rest for 5 minutes when the session ends.' },
            { step: '3', title: 'Repeat', desc: 'Start another session to keep the momentum going.' },
          ].map((s) => (
            <div key={s.step} className="p-4 rounded-xl" style={{ background: 'var(--bg-elev)' }}>
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg mb-2 text-sm font-bold"
                style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}
              >
                {s.step}
              </div>
              <h4 className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                {s.title}
              </h4>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
