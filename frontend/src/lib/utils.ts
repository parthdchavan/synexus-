import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(ts: number | string | Date, options?: { showMs?: boolean }): string {
  const d = new Date(ts);
  const iso = d.toISOString();
  if (options?.showMs) {
    return iso.replace('T', ' ').replace('Z', ' UTC');
  }
  return iso.substring(11, 19) + '.' + String(d.getMilliseconds()).padStart(3, '0');
}

export function formatDuration(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(1)} µs`;
  if (ms < 1000) return `${ms.toFixed(2)} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)} s`;
  return `${(ms / 60000).toFixed(1)} m`;
}
