import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', mono, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-8 w-full rounded-[6px] border border-border-strong bg-surface-2 px-2.5 py-1 text-[13px] text-text-primary',
          'placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent',
          'disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          mono && 'font-mono text-[12px]',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
