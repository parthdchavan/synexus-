import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'error' | 'planned' | 'software';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium transition-colors select-none',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px] rounded-[4px] gap-1' : 'px-2 py-0.5 text-[11px] rounded-[4px] gap-1.5',
        variant === 'default' &&
          'bg-[var(--surface-sunken)] text-[var(--text-secondary)] border border-[var(--border-strong)]',
        variant === 'outline' &&
          'bg-transparent text-[var(--text-muted)] border border-[var(--border)]',
        variant === 'success' &&
          'bg-[var(--status-ok-bg)] text-[var(--status-ok-fg)] border border-[var(--status-ok-border)]',
        variant === 'warning' &&
          'bg-[var(--status-warn-bg)] text-[var(--status-warn-fg)] border border-[var(--status-warn-border)]',
        variant === 'error' &&
          'bg-[var(--status-error-bg)] text-[var(--status-error-fg)] border border-[var(--status-error-border)]',
        variant === 'planned' &&
          'bg-[var(--status-planned-bg)] text-[var(--status-planned-fg)] border border-[var(--status-planned-border)]',
        variant === 'software' &&
          'bg-[var(--surface-sunken)] text-[var(--text-muted)] border border-[var(--border-strong)] font-mono',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
