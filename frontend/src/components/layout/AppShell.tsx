import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { CommandPalette } from './CommandPalette';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import type { ConnectionState } from '../../types';
import { dataSource } from '../../api';

export type ThemeMode = 'light' | 'dark' | 'system';

export const AppShell: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const [themeMode, setThemeMode] = React.useState<ThemeMode>(() => {
    const urlTheme = new URLSearchParams(window.location.search).get('theme') as ThemeMode;
    if (urlTheme === 'light' || urlTheme === 'dark') return urlTheme;
    return (localStorage.getItem('synexus_theme') as ThemeMode) || 'dark';
  });

  const [connection, setConnection] = React.useState<ConnectionState>({
    status: 'connected',
    port: 'COM7',
    baudRate: 115200,
    activeDeviceName: 'nRF52840-DK (BLE Blade)',
    eventsPerSecond: 14.8,
    bufferSize: 1024,
    lastHeartbeat: Date.now(),
  });

  React.useEffect(() => {
    dataSource.getConnectionState().then((state) => {
      setConnection(state);
    });
  }, []);

  const applyTheme = React.useCallback((mode: ThemeMode) => {
    const isDark =
      mode === 'dark' ||
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    localStorage.setItem('synexus_theme', mode);
  }, []);

  React.useEffect(() => {
    applyTheme(themeMode);
  }, [themeMode, applyTheme]);

  const toggleTheme = React.useCallback(() => {
    setThemeMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  }, [applyTheme]);

  useKeyboardShortcuts({
    onOpenCommandPalette: () => setCommandPaletteOpen(true),
  });

  const isCurrentDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] font-sans antialiased">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        <TopBar
          connection={connection}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onToggleTheme={toggleTheme}
          isDark={isCurrentDark}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 bg-[var(--bg)]">
          <Outlet />
        </main>
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onToggleTheme={toggleTheme}
        isDark={isCurrentDark}
      />
    </div>
  );
};
