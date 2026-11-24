import * as React from 'react';
import { Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ClockBadge } from '../../components/ui/ClockBadge';

export const TimingPage: React.FC = () => {
  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--accent-text)]" />
            <h1 className="text-[18px] font-semibold tracking-tight text-[var(--text)]">
              Timing Analysis & Software Jitter Metrics
            </h1>
          </div>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
            Interim mode: software timestamps only. FPGA timing is planned.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            Recalculate Sigma
          </Button>
          <Button variant="primary" size="sm">
            Export Trace Dataset
          </Button>
        </div>
      </div>

      {/* Main Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BLE Cryptographic Key Exchange Timing */}
        <div className="p-4 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-[var(--accent-text)]">EXP-0089</span>
              <span className="text-[13px] font-medium text-[var(--text)]">
                BLE LL_ENC_REQ Timing Distribution
              </span>
            </div>
            <ClockBadge />
          </div>

          <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
            Measuring software timestamped AES-CCM session key derivation latency across 1,842 link-layer handshakes between nRF52840-DK and Target ESP32.
          </p>

          <div className="p-3 rounded-[6px] bg-[var(--surface-sunken)] border border-[var(--border)] font-mono text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Mean Handshake Delay:</span>
              <span className="text-[var(--text)] tabular-nums">2,448.2 µs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Host Scheduling Jitter:</span>
              <span className="text-[var(--text)] tabular-nums">±1.8 ms</span>
            </div>
            <div className="flex justify-between text-[var(--status-warn-fg)]">
              <span>Max Outlier Delta:</span>
              <span className="tabular-nums font-semibold">+731.8 µs (Flagged)</span>
            </div>
          </div>
        </div>

        {/* Challenge-Response Characterization */}
        <div className="p-4 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-[var(--accent-text)]">EXP-0042</span>
              <span className="text-[13px] font-medium text-[var(--text)]">
                Target ESP32 Challenge-Response Delta
              </span>
            </div>
            <ClockBadge />
          </div>

          <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
            UART characterization on COM3 at 115200 baud. Verifying software nonce propagation delay under normal operating load.
          </p>

          <div className="p-3 rounded-[6px] bg-[var(--surface-sunken)] border border-[var(--border)] font-mono text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Target Device:</span>
              <span className="text-[var(--text)]">Target ESP32 (COM3)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Average Response Time:</span>
              <span className="text-[var(--text)] tabular-nums">14.2 ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Timeout Threshold:</span>
              <span className="text-[var(--status-ok-fg)] tabular-nums font-semibold">250 ms (Passed)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
