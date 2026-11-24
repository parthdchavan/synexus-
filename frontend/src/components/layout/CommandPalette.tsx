import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Activity,
  Terminal,
  Cpu,
  Layers,
  Zap,
  Clock,
  Settings,
  Sun,
  Moon,
  Radio,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/Dialog';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleTheme: () => void;
  isDark: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  onToggleTheme,
  isDark,
}) => {
  const [query, setQuery] = React.useState('');
  const navigate = useNavigate();

  const commands = [
    { id: 'nav-overview', label: 'Go to Overview / Dashboard', shortcut: 'g o', icon: Activity, action: () => navigate('/overview') },
    { id: 'nav-monitor', label: 'Go to Live Monitor & Console', shortcut: 'g l', icon: Terminal, action: () => navigate('/live-monitor') },
    { id: 'nav-experiments', label: 'Go to Experiments', shortcut: 'g e', icon: Layers, action: () => navigate('/experiments') },
    { id: 'nav-devices', label: 'Go to Hardware Devices', shortcut: 'g d', icon: Cpu, action: () => navigate('/devices') },
    { id: 'nav-evidence', label: 'Go to Evidence Captures', shortcut: 'g c', icon: Radio, action: () => navigate('/evidence') },
    { id: 'nav-glitch', label: 'Go to Fault Injection (Planned)', shortcut: 'g f', icon: Zap, action: () => navigate('/glitch') },
    { id: 'nav-timing', label: 'Go to Timing Analysis', shortcut: 'g t', icon: Clock, action: () => navigate('/timing') },
    { id: 'nav-settings', label: 'Go to Settings', shortcut: 'g s', icon: Settings, action: () => navigate('/settings') },
    { id: 'toggle-theme', label: `Switch to ${isDark ? 'Light' : 'Dark'} Theme`, shortcut: 'Ctrl+T', icon: isDark ? Sun : Moon, action: onToggleTheme },
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (cmd: typeof commands[0]) => {
    cmd.action();
    onOpenChange(false);
    setQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden bg-[var(--surface)] border border-[var(--border-strong)] rounded-[8px] shadow-[var(--shadow-floating)]">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>
        <div className="flex items-center px-3 border-b border-[var(--border)] bg-[var(--surface-sunken)]">
          <Search className="w-4 h-4 text-[var(--text-muted)] mr-2 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to screen... (Esc to exit)"
            className="h-10 w-full bg-transparent text-[13px] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none"
            autoFocus
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-1 divide-y divide-[var(--border)]/40">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-[12px] text-[var(--text-muted)]">
              No matching commands
            </div>
          ) : (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => handleSelect(cmd)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left text-[13px] hover:bg-[var(--surface-sunken)] rounded-[4px] text-[var(--text)] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-text)] transition-colors" />
                    <span>{cmd.label}</span>
                  </div>
                  <kbd className="font-mono text-[11px] text-[var(--text-muted)] bg-[var(--surface-sunken)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                    {cmd.shortcut}
                  </kbd>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
