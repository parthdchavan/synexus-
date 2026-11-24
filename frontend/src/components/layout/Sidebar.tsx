import * as React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  Layers,
  Terminal,
  Cpu,
  Radio,
  Zap,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isPlanned?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'Workbench',
    items: [
      { to: '/overview', label: 'Overview', icon: Activity },
      { to: '/experiments', label: 'Experiments', icon: Layers },
      { to: '/live-monitor', label: 'Live Monitor', icon: Terminal, badge: 'Live' },
    ],
  },
  {
    group: 'Hardware & Capture',
    items: [
      { to: '/devices', label: 'Devices & Harness', icon: Cpu },
      { to: '/evidence', label: 'Evidence Captures', icon: Radio },
      { to: '/glitch', label: 'Fault Injection', icon: Zap, isPlanned: true },
      { to: '/timing', label: 'Timing Analysis', icon: Clock },
    ],
  },
  {
    group: 'System',
    items: [{ to: '/settings', label: 'Settings', icon: Settings }],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={cn(
          'h-full border-r border-[var(--border)] bg-[var(--bg)] flex flex-col justify-between transition-all duration-150 select-none z-50 font-sans',
          collapsed ? 'w-14' : 'w-[220px]',
          'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:w-64 max-md:shadow-2xl',
          !mobileOpen && 'max-md:-translate-x-full'
        )}
      >
        {/* Top Header / Brand */}
        <div>
          <div className="h-12 border-b border-[var(--border)] flex items-center justify-between px-3.5">
            {(!collapsed || mobileOpen) && (
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-5 h-5 rounded-[4px] bg-[var(--accent-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--accent-text)]">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-[13.5px] tracking-tight text-[var(--text)]">
                  Synexus
                </span>
                <span className="font-mono text-[10.5px] text-[var(--text-muted)] px-1 py-0.2 bg-[var(--surface-sunken)] rounded border border-[var(--border)]">
                  v0.4
                </span>
              </div>
            )}
            {collapsed && !mobileOpen && (
              <div className="w-full flex justify-center">
                <div className="w-6 h-6 rounded-[4px] bg-[var(--accent-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--accent-text)]">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Groups */}
          <div className="py-3 px-2 space-y-4">
            {NAV_GROUPS.map((grp) => (
              <div key={grp.group} className="space-y-0.5">
                {(!collapsed || mobileOpen) && (
                  <div className="px-2 pb-1 text-[11.5px] font-medium text-[var(--text-muted)]">
                    {grp.group}
                  </div>
                )}
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onCloseMobile}
                      title={collapsed && !mobileOpen ? item.label : undefined}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 px-2 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors',
                          isActive
                            ? 'bg-[var(--accent-subtle)] text-[var(--accent-text)] border-l-2 border-[var(--accent)] pl-2'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-sunken)] border-l-2 border-transparent',
                          collapsed && !mobileOpen && 'justify-center px-0 border-l-0'
                        )
                      }
                    >
                      <Icon className="w-4 h-4 flex-shrink-0 stroke-[1.8]" />
                      {(!collapsed || mobileOpen) && (
                        <span className="truncate flex-1">{item.label}</span>
                      )}
                      {(!collapsed || mobileOpen) && item.isPlanned && (
                        <Badge variant="planned" size="sm">
                          Planned
                        </Badge>
                      )}
                      {(!collapsed || mobileOpen) && item.badge && !item.isPlanned && (
                        <span className="font-mono text-[9px] font-medium px-1.5 py-0.2 rounded bg-[var(--status-ok-bg)] text-[var(--status-ok-fg)] border border-[var(--status-ok-border)]">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Collapse Toggle (Desktop only) */}
        <div className="p-2 border-t border-[var(--border)] hidden md:block">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center h-7 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-sunken)] transition-colors cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span className="ml-2 text-[12px] font-medium">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
