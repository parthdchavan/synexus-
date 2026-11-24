import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = HelpCircle,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[8px] border border-dashed border-border-strong p-8 text-center bg-surface-1/40',
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-surface-2 border border-border-subtle mb-3 text-text-muted">
        <Icon className="h-5 w-5 stroke-[1.75]" />
      </div>
      <h3 className="text-[14px] font-semibold text-text-primary mb-1">{title}</h3>
      <p className="max-w-sm text-[12px] text-text-muted mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
