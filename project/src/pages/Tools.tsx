import { useState } from 'react';
import { Calculator, FileText } from 'lucide-react';
import { SectionHeader, PageContainer } from '../components/UI';

export function Tools() {
  const [tab, setTab] = useState<'calculator' | 'counter'>('calculator');

  const tabs = [
    { key: 'calculator' as const, label: 'Calculator', icon: Calculator },
    { key: 'counter' as const, label: 'Word & Char Counter', icon: FileText },
  ];

  return (
    <PageContainer>
      <SectionHeader title="Useful Tools" subtitle="Calculator and text analyzer" />

      <div className="flex items-center gap-1 p-1 rounded-xl overflow-x-auto scrollbar-thin" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
              style={{
                background: tab === t.key ? '#ffffff' : 'transparent',
                color: tab === t.key ? 'var(--accent)' : 'var(--text-muted)',
                border: tab === t.key ? '1px solid var(--border)' : '1px solid transparent',
              }}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'calculator' && <CalculatorTool />}
      {tab === 'counter' && <CounterTool />}
    </PageContainer>
  );
}

function CalculatorTool() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');

  function input(val: string) {
    if (display === '0' && val !== '.') {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
  }

  function clear() {
    setDisplay('0');
    setExpression('');
  }

  function backspace() {
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  }

  function setOp(op: string) {
    if (expression) {
      calculate();
      setTimeout(() => {
        setExpression(display + ' ' + op + ' ');
        setDisplay('0');
      }, 0);
    } else {
      setExpression(display + ' ' + op + ' ');
      setDisplay('0');
    }
  }

  function calculate() {
    try {
      const fullExpr = expression + display;
      if (!/^[0-9+\-*/.\s]+$/.test(fullExpr)) {
        setDisplay('Error');
        return;
      }
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${fullExpr})`)();
      if (result === undefined || result === null || isNaN(result)) {
        setDisplay('Error');
      } else {
        const rounded = Math.round(result * 1e10) / 1e10;
        setDisplay(String(rounded));
        setExpression('');
      }
    } catch {
      setDisplay('Error');
    }
  }

  const keys = [
    { label: 'C', action: clear, type: 'fn' },
    { label: '⌫', action: backspace, type: 'fn' },
    { label: '÷', action: () => setOp('/'), type: 'op' },
    { label: '×', action: () => setOp('*'), type: 'op' },
    { label: '7', action: () => input('7'), type: 'num' },
    { label: '8', action: () => input('8'), type: 'num' },
    { label: '9', action: () => input('9'), type: 'num' },
    { label: '−', action: () => setOp('-'), type: 'op' },
    { label: '4', action: () => input('4'), type: 'num' },
    { label: '5', action: () => input('5'), type: 'num' },
    { label: '6', action: () => input('6'), type: 'num' },
    { label: '+', action: () => setOp('+'), type: 'op' },
    { label: '1', action: () => input('1'), type: 'num' },
    { label: '2', action: () => input('2'), type: 'num' },
    { label: '3', action: () => input('3'), type: 'num' },
    { label: '=', action: calculate, type: 'eq' },
    { label: '0', action: () => input('0'), type: 'num' },
    { label: '.', action: () => input('.'), type: 'num' },
  ];

  const keyStyles: Record<string, React.CSSProperties> = {
    fn: { background: 'var(--bg-elev)', color: 'var(--danger)' },
    op: { background: 'var(--bg-elev)', color: 'var(--accent)' },
    num: { background: '#ffffff', color: 'var(--text)', border: '1px solid var(--border)' },
    eq: { background: 'var(--accent)', color: '#ffffff', fontWeight: 700 },
  };

  return (
    <div className="card max-w-sm mx-auto">
      <div className="mb-4 p-4 rounded-xl text-right" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>
        <div className="text-xs h-4" style={{ color: 'var(--text-dim)' }}>
          {expression || '\u00A0'}
        </div>
        <div className="text-3xl font-display font-bold tabular-nums truncate" style={{ color: 'var(--text)' }}>
          {display}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {keys.map((k) => (
          <button
            key={k.label}
            onClick={k.action}
            className="flex items-center justify-center aspect-square rounded-xl text-lg font-medium transition-all hover:scale-95"
            style={keyStyles[k.type]}
          >
            {k.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CounterTool() {
  const [text, setText] = useState('');

  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length || 1 : 0;
  const paragraphs = text.trim() ? text.split(/\n\n+/).filter((p) => p.trim()).length : 0;
  const lines = text ? text.split('\n').length : 0;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  const stats = [
    { label: 'Characters', value: chars },
    { label: 'Characters (no spaces)', value: charsNoSpaces },
    { label: 'Words', value: words },
    { label: 'Sentences', value: sentences },
    { label: 'Paragraphs', value: paragraphs },
    { label: 'Lines', value: lines },
    { label: 'Reading time', value: `${readingTime} min` },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="card">
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
          Your Text
        </h3>
        <textarea
          className="input min-h-[280px] resize-y"
          placeholder="Type or paste your text here to see live statistics..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="btn-ghost mt-3 text-xs"
          onClick={() => setText('')}
          disabled={!text}
        >
          Clear text
        </button>
      </div>
      <div className="card">
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
          Statistics
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="p-4 rounded-xl" style={{ background: 'var(--bg-elev)' }}>
              <div className="text-2xl font-bold font-display" style={{ color: 'var(--accent)' }}>
                {s.value}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
