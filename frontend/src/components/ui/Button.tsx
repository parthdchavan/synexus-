import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors select-none',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)]',
          'disabled:opacity-40 disabled:pointer-events-none cursor-pointer',
          // Variants
          variant === 'primary' &&
            'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] active:bg-[var(--accent-hover)] border border-transparent shadow-none',
          variant === 'secondary' &&
            'bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-sunken)] border border-[var(--border-strong)] shadow-none',
          variant === 'outline' &&
            'bg-transparent text-[var(--text)] hover:bg-[var(--surface-sunken)] border border-[var(--border-strong)]',
          variant === 'ghost' &&
            'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-sunken)] border border-transparent',
          variant === 'danger' &&
            'bg-[var(--status-error-bg)] text-[var(--status-error-fg)] hover:opacity-90 border border-[var(--status-error-border)]',
          variant === 'subtle' &&
            'bg-[var(--surface-sunken)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)] border border-[var(--border)]',
          // Sizes (dense engineering sizing)
          size === 'xs' && 'h-6 px-2 text-[11px] rounded-[4px] gap-1',
          size === 'sm' && 'h-7 px-2.5 text-[12px] rounded-[6px] gap-1.5',
          size === 'md' && 'h-8 px-3 text-[13px] rounded-[6px] gap-2',
          size === 'lg' && 'h-9 px-4 text-[14px] rounded-[6px] gap-2',
          size === 'icon' && 'h-8 w-8 p-0 rounded-[6px]',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
