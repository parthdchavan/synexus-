import * as React from 'react';
import { Zap, Sliders, Info } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';

export const GlitchPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-[var(--status-planned-fg)]" />
            <h1 className="text-[18px] font-semibold tracking-tight text-[var(--text)]">
              Fault Injection & Crowbar Glitch Engine
            </h1>
            <Badge variant="planned" size="md">
              STATUS: PLANNED ARCHITECTURE
            </Badge>
          </div>
          <p className="text-[12px] text-[var(--text-muted)] mt-1">
            Interim mode: software timestamps only. FPGA timing and crowbar fault injection are planned.
          </p>
        </div>
      </div>

      {/* Safety Notice / Planned Architecture Banner */}
      <div className="p-4 rounded-[8px] border border-[var(--status-planned-border)] bg-[var(--status-planned-bg)] space-y-2">
        <div className="flex items-center gap-2 text-[var(--status-planned-fg)] font-semibold text-[13px]">
          <Info className="w-4 h-4" />
          <span>Planned Subsystem Notice</span>
        </div>
        <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
          The physical fault injection crowbar circuit (Glitch Blade) and UPduino FPGA trigger engine are currently marked as{' '}
          <strong className="font-semibold text-[var(--status-planned-fg)]">PLANNED</strong>. In interim mode, telemetry is software-clocked over USB serial at 115200 baud.
        </p>
      </div>

      {/* Mock Parameter Configuration */}
      <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--accent-text)]" />
            <h3 className="text-[14px] font-semibold text-[var(--text)]">
              Glitch Pulse Synthesis Parameters (Target: Target ESP32)
            </h3>
          </div>
          <span className="font-mono text-[11px] text-[var(--text-muted)]">Interlock: INHIBITED</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">
              Trigger Offset (µs)
            </label>
            <Input defaultValue="14.820" mono disabled />
            <span className="text-[10px] text-[var(--text-muted)]">Post-reset authentication challenge check</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">
              Pulse Duration (ns)
            </label>
            <Input defaultValue="85" mono disabled />
            <span className="text-[10px] text-[var(--text-muted)]">Quantized glitch duration (planned)</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">
              Crowbar Voltage Target (mV)
            </label>
            <Input defaultValue="1120" mono disabled />
            <span className="text-[10px] text-[var(--text-muted)]">Nominal: 3300 mV (VDD droop)</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="secondary" disabled className="gap-2">
            <Zap className="w-3.5 h-3.5 opacity-50" />
            Arm Crowbar Trigger (Inhibited in Planned Mode)
          </Button>
        </div>
      </div>
    </div>
  );
};
