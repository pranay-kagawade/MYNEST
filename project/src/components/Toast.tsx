import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastCtx {
  notify: (message: string, type?: ToastType) => void;
}

const Ctx = createContext<ToastCtx>({ notify: () => {} });

export function useToast() {
  return useContext(Ctx);
}

const icons = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const colors: Record<ToastType, string> = {
  success: 'var(--success)',
  error: 'var(--danger)',
  info: 'var(--accent)',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <Ctx.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              className="toast-enter flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg"
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${colors[t.type]}`,
              }}
            >
              <Icon size={18} style={{ color: colors[t.type], flexShrink: 0, marginTop: 1 }} />
              <span className="text-sm flex-1" style={{ color: 'var(--text)' }}>
                {t.message}
              </span>
              <button onClick={() => remove(t.id)} className="btn-icon !p-0.5">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}
