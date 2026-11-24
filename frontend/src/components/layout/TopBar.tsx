import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, Command, Menu } from 'lucide-react';
import { Button } from '../ui/Button';
import { StatusDot } from '../ui/StatusDot';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip';
import type { ConnectionState } from '../../types';

interface TopBarProps {
  connection: ConnectionState;
  onOpenCommandPalette: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
  onToggleSidebar: () => void;
  onOpenMobileMenu?: () => void;
}

const ROUTE_TITLES: Record<string, string[]> = {
  '/': ['Workbench', 'Overview'],
  '/overview': ['Workbench', 'Overview'],
  '/experiments': ['Workbench', 'Experiments'],
  '/live-monitor': ['Workbench', 'Live Monitor'],
  '/devices': ['Hardware', 'Devices & Harness'],
  '/evidence': ['Hardware', 'Evidence Captures'],
  '/glitch': ['Hardware', 'Fault Injection (Planned)'],
  '/timing': ['Analysis', 'Timing Analysis'],
  '/settings': ['System', 'Workbench Settings'],
};

export const TopBar: React.FC<TopBarProps> = ({
  connection,
  onOpenCommandPalette,
  onToggleTheme,
  isDark,
  onOpenMobileMenu,
}) => {
  const location = useLocation();
  const breadcrumbs = ROUTE_TITLES[location.pathname] || ['Synexus', 'Workbench'];

  return (
    <header className="h-12 w-full border-b border-[var(--border)] bg-[var(--surface)] px-3 sm:px-4 flex items-center justify-between z-20 select-none font-sans">
      {/* Left: Mobile Menu + Breadcrumbs */}
      <div className="flex items-center gap-2 text-[12.5px]">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 rounded-[4px] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-sunken)] transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <span className="font-semibold text-[var(--text)] tracking-tight">Synexus</span>
        <span className="text-[var(--text-muted)] hidden sm:inline">/</span>
        <span className="text-[var(--text-secondary)] hidden sm:inline">{breadcrumbs[0]}</span>
        <span className="text-[var(--text-muted)]">/</span>
        <span className="font-medium text-[var(--text)] truncate max-w-[140px] sm:max-w-none">{breadcrumbs[1]}</span>
      </div>

      {/* Right: Controls & Connection Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Connection Badge */}
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-[4px] bg-[var(--surface-sunken)] border border-[var(--border)] cursor-pointer hover:border-[var(--border-strong)] transition-colors">
                <StatusDot
                  status={connection.status === 'connected' ? 'ok' : 'offline'}
                  pulse={connection.status === 'connected'}
                />
                <span className="font-mono text-[11px] text-[var(--text)] tabular-nums">
                  {connection.status === 'connected'
                    ? `${connection.port || 'COM7'}`
                    : 'Offline'}
                </span>
                {connection.status === 'connected' && (
                  <span className="font-mono text-[10.5px] text-[var(--text-muted)] border-l border-[var(--border-strong)] pl-1.5 tabular-nums hidden sm:inline">
                    {connection.eventsPerSecond.toFixed(1)} ev/s
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {connection.status === 'connected'
                ? `Active target: ${connection.activeDeviceName || 'Harness'} (Buffer: ${connection.bufferSize} events)`
                : 'Hardware interface is offline. Click to configure serial.'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Command Palette Trigger */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenCommandPalette}
          className="h-7 px-2 text-[12px] text-[var(--text-secondary)] hover:text-[var(--text)] font-normal"
        >
          <Command className="w-3.5 h-3.5 opacity-70" />
          <span className="hidden sm:inline ml-1 font-sans">Commands</span>
          <kbd className="hidden lg:inline ml-2 font-mono text-[10px] bg-[var(--surface-sunken)] px-1 py-0.2 rounded border border-[var(--border)] text-[var(--text-muted)]">
            Ctrl+K
          </kbd>
        </Button>

        {/* Theme Toggle */}
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleTheme}
                className="h-7 w-7 text-[var(--text-muted)] hover:text-[var(--text)]"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-[var(--accent-text)]" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Switch to {isDark ? 'Light' : 'Dark'} theme</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
};
