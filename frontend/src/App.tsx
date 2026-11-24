import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';

// Features
import { OverviewPage } from './features/overview/OverviewPage';
import { ExperimentsPage } from './features/experiments/ExperimentsPage';
import { LiveMonitorPage } from './features/live-monitor/LiveMonitorPage';
import { DevicesPage } from './features/devices/DevicesPage';
import { EvidencePage } from './features/evidence/EvidencePage';
import { GlitchPage } from './features/glitch/GlitchPage';
import { TimingPage } from './features/timing/TimingPage';
import { SettingsPage } from './features/settings/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30s cache
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="experiments" element={<ExperimentsPage />} />
            <Route path="live-monitor" element={<LiveMonitorPage />} />
            <Route path="devices" element={<DevicesPage />} />
            <Route path="evidence" element={<EvidencePage />} />
            <Route path="glitch" element={<GlitchPage />} />
            <Route path="timing" element={<TimingPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
