import * as React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ClockType } from '../../types';

interface ClockBadgeProps {
  clock?: ClockType;
  frequency?: string;
  className?: string;
}

/**
 * ClockBadge: In interim mode, hardware FPGA clocks are planned and inactive.
 * Spec requirement: "Interim mode: show only the SW clock badge. Remove every HW badge on all pages."
 */
export const ClockBadge: React.FC<ClockBadgeProps> = ({ className }) => {
  return (
    <span
      title="Software timestamp: Host OS driver / scheduler clock (Interim mode: FPGA timing is planned)"
      className={cn(
        'inline-flex items-center gap-1 font-mono text-[10px] font-medium tracking-tight',
        'px-1.5 py-0.5 rounded-[4px] bg-[var(--surface-sunken)] text-[var(--text-muted)] border border-[var(--border-strong)] select-none',
        className
      )}
    >
      <Clock className="w-3 h-3 stroke-[2]" />
      <span>SW-HOST</span>
    </span>
  );
};
