import * as React from 'react';
import { cn } from '../../lib/utils';

export interface StatusDotProps {
  status: 'ok' | 'warn' | 'error' | 'planned' | 'offline' | 'busy';
  label?: string;
  pulse?: boolean;
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  label,
  pulse = false,
  className,
}) => {
  return (
    <div className={cn('inline-flex items-center gap-1.5 select-none', className)}>
      <span className="relative flex h-2 w-2">
        {pulse && status === 'ok' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--status-ok-fg)] opacity-75" />
        )}
        {pulse && status === 'busy' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-2 w-2',
            status === 'ok' && 'bg-[var(--status-ok-fg)]',
            status === 'warn' && 'bg-[var(--status-warn-fg)]',
            status === 'error' && 'bg-[var(--status-error-fg)]',
            status === 'planned' && 'bg-[var(--status-planned-fg)]',
            status === 'busy' && 'bg-[var(--accent)]',
            status === 'offline' && 'bg-[var(--text-muted)]'
          )}
        />
      </span>
      {label && (
        <span className="text-[12px] font-medium text-[var(--text-secondary)] capitalize">
          {label}
        </span>
      )}
    </div>
  );
};
