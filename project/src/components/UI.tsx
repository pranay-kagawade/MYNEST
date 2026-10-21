import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({
  icon: Icon = Inbox,
  title,
  subtitle,
  action,
}: {
  icon?: typeof Inbox;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
        style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}
      >
        <Icon size={28} style={{ color: 'var(--text-dim)' }} />
      </div>
      <h3 className="text-base font-medium mb-1" style={{ color: 'var(--text)' }}>
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm mb-4 max-w-xs" style={{ color: 'var(--text-muted)' }}>
          {subtitle}
        </p>
      )}
      {action}
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
      <div>
        <h2 className="text-xl font-semibold font-display" style={{ color: 'var(--text)' }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="animate-fade-up space-y-6">{children}</div>;
}
