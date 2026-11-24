import * as React from 'react';
import { Save, HardDrive, Terminal } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight text-[var(--text)]">
            Workbench & Protocol Settings
          </h1>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
            Configure serial communication parameters and hardware endpoints
          </p>
        </div>

        <Button variant="primary" size="sm" className="gap-1.5">
          <Save className="w-3.5 h-3.5" />
          Save Preferences
        </Button>
      </div>

      {/* Data Source Configuration */}
      <div className="p-4 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <h3 className="text-[13px] font-semibold text-[var(--text)] flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[var(--accent-text)]" />
            Backend API & Data Source
          </h3>
          <Badge variant="outline" size="sm">
            VITE_DATA_SOURCE: {import.meta.env.VITE_DATA_SOURCE || 'mock'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">
              FastAPI REST URL
            </label>
            <Input defaultValue="http://localhost:8000/api/v1" mono />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">
              WebSocket Telemetry Feed URL
            </label>
            <Input defaultValue="ws://localhost:8000/ws/live" mono />
          </div>
        </div>
      </div>

      {/* Serial Port Settings */}
      <div className="p-4 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] space-y-4">
        <h3 className="text-[13px] font-semibold text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)] pb-2">
          <HardDrive className="w-4 h-4 text-[var(--accent-text)]" />
          Serial Communication Defaults
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">Default Port</label>
            <Input defaultValue="COM7" mono />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">Baud Rate</label>
            <Input defaultValue="115200" mono disabled />
            <span className="text-[10px] text-[var(--text-muted)]">Fixed at 115200 baud for interim mode</span>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">Buffer Limit</label>
            <Input defaultValue="1024" mono />
          </div>
        </div>
      </div>
    </div>
  );
};
