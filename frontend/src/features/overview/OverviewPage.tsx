import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Layers,
  Terminal,
  Cpu,
  ArrowUpRight,
  AlertTriangle,
  Play,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { dataSource } from '../../api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ClockBadge } from '../../components/ui/ClockBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import { StatusDot } from '../../components/ui/StatusDot';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDuration, formatTimestamp } from '../../lib/utils';

// 15-minute timeseries for Event Rate Chart
const EVENT_RATE_DATA = [
  { time: '15m', nrf52840: 8.4, target_esp32: 5.1 },
  { time: '14m', nrf52840: 8.9, target_esp32: 5.3 },
  { time: '13m', nrf52840: 8.1, target_esp32: 4.8 },
  { time: '12m', nrf52840: 9.2, target_esp32: 5.6 },
  { time: '11m', nrf52840: 9.7, target_esp32: 5.4 },
  { time: '10m', nrf52840: 8.6, target_esp32: 4.9 },
  { time: '9m', nrf52840: 9.1, target_esp32: 5.2 },
  { time: '8m', nrf52840: 9.5, target_esp32: 5.8 },
  { time: '7m', nrf52840: 8.8, target_esp32: 5.0 },
  { time: '6m', nrf52840: 9.4, target_esp32: 5.7 },
  { time: '5m', nrf52840: 10.1, target_esp32: 6.1 },
  { time: '4m', nrf52840: 9.3, target_esp32: 5.4 },
  { time: '3m', nrf52840: 8.9, target_esp32: 5.2 },
  { time: '2m', nrf52840: 9.6, target_esp32: 5.6 },
  { time: 'now', nrf52840: 9.2, target_esp32: 5.6 },
];

export const OverviewPage: React.FC = () => {
  const [viewState, setViewState] = React.useState<'normal' | 'loading' | 'empty' | 'error'>('normal');

  const { data: experiments, isLoading: expLoading, error: expError, refetch } = useQuery({
    queryKey: ['experiments'],
    queryFn: () => dataSource.getExperiments(),
  });

  const { data: devices, isLoading: devLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => dataSource.getDevices(),
  });

  const { data: recentEvents } = useQuery({
    queryKey: ['recent-events'],
    queryFn: () => dataSource.getEvents({ limit: 7 }),
  });

  if (viewState === 'loading' || expLoading || devLoading) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-9 w-full rounded-[6px]" />
        <Skeleton className="h-24 w-full rounded-[8px]" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <Skeleton className="lg:col-span-8 h-72 rounded-[8px]" />
          <Skeleton className="lg:col-span-4 h-72 rounded-[8px]" />
        </div>
        <Skeleton className="h-64 rounded-[8px]" />
      </div>
    );
  }

  if (viewState === 'error' || expError) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6 rounded-[8px] border border-[var(--status-error-border)] bg-[var(--status-error-bg)] text-center font-sans">
        <AlertTriangle className="w-8 h-8 text-[var(--status-error-fg)] mx-auto mb-3" />
        <h3 className="text-[15px] font-semibold text-[var(--text)] mb-1">
          Telemetry Fetch Failed
        </h3>
        <p className="text-[13px] text-[var(--text-secondary)] mb-4">
          Communication timed out while querying active target harness on COM7 (115200 baud).
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Retry Connection
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewState('normal')}>
            Reset to Normal
          </Button>
        </div>
      </div>
    );
  }

  if (viewState === 'empty' || (!experiments || experiments.length === 0)) {
    return (
      <div className="max-w-xl mx-auto mt-16 font-sans">
        <EmptyState
          icon={Layers}
          title="No Experiments Configured"
          description="Create a new cryptographic timing or authentication experiment to begin collecting UART and BLE telemetry."
          actionLabel="Initialize EXP-0001"
          onAction={() => setViewState('normal')}
        />
      </div>
    );
  }

  const activeExp = experiments.find((e) => e.status === 'running') || experiments[0];
  const connectedCount = devices?.filter((d) => d.status === 'connected').length || 2;
  const totalCount = devices?.length || 5;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8 font-sans">
      {/* 1. Header with Dev Menu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div>
          <h1 className="text-[23px] font-semibold tracking-tight text-[var(--text)] leading-tight">
            Lab Workbench Overview
          </h1>
          <p className="text-[12px] text-[var(--text-muted)] mt-1">
            Interim mode: software timestamps only. FPGA timing is planned.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Dev-only state switcher */}
          {import.meta.env.DEV && (
            <div className="hidden sm:inline-flex items-center gap-1 rounded-[4px] border border-[var(--border-strong)] bg-[var(--surface-sunken)] p-0.5 text-[10.5px]">
              <span className="px-1 text-[var(--text-muted)] font-mono">Dev:</span>
              {(['normal', 'loading', 'empty', 'error'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setViewState(st)}
                  className={`px-1.5 py-0.5 rounded-[3px] font-mono uppercase ${
                    viewState === st
                      ? 'bg-[var(--surface)] text-[var(--text)] font-semibold shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          )}

          <Link to="/experiments">
            <Button variant="primary" size="sm">
              <Play className="w-3 h-3 fill-current" />
              New Run
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Active Experiment Slim Banner */}
      {activeExp && (
        <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <StatusDot status={activeExp.status === 'running' ? 'busy' : 'ok'} pulse />
            <span className="font-mono text-[11.5px] font-semibold text-[var(--accent-text)]">
              {activeExp.id}
            </span>
            <span className="text-[var(--text-muted)] text-[12px]">/</span>
            <span className="text-[13.5px] font-medium text-[var(--text)] truncate">
              {activeExp.name}
            </span>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Thin progress bar */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-[11.5px] text-[var(--text-muted)]">Progress:</span>
              <div className="w-24 h-1.5 rounded-full bg-[var(--surface-sunken)] border border-[var(--border)] overflow-hidden">
                <div className="h-full bg-[var(--accent)] w-[64%]" />
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11.5px] text-[var(--text-secondary)] font-mono tabular-nums">
              <span>{activeExp.eventCount} evts</span>
              <span className="text-[var(--text-muted)]">·</span>
              <span>{formatDuration(activeExp.durationMs)}</span>
            </div>

            <Link to="/experiments">
              <Button variant="secondary" size="xs" className="h-6 px-2 text-[11.5px]">
                Details
                <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 3. Single-Panel KPI Strip (4 metrics separated by vertical 1px dividers with sparklines) */}
      <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)] shadow-xs">
        {/* Metric 1: Devices online */}
        <div className="p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11.5px] font-medium text-[var(--text-muted)] mb-1">
              Devices online
            </div>
            <div className="text-[28px] font-semibold tracking-tight text-[var(--text)] tabular-nums font-sans leading-none">
              {connectedCount} / {totalCount}
            </div>
            <div className="text-[11.5px] text-[var(--text-secondary)] mt-1.5">
              3 planned
            </div>
          </div>
          {/* Sparkline */}
          <svg className="w-16 h-8 text-[var(--status-ok-fg)]" viewBox="0 0 64 32" fill="none">
            <polyline
              points="0,20 16,20 32,12 48,12 64,6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Metric 2: Event rate */}
        <div className="p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11.5px] font-medium text-[var(--text-muted)] mb-1">
              Event rate
            </div>
            <div className="text-[28px] font-semibold tracking-tight text-[var(--text)] tabular-nums font-sans leading-none">
              14.8 <span className="text-[14px] font-normal text-[var(--text-muted)]">ev/s</span>
            </div>
            <div className="text-[11.5px] text-[var(--text-secondary)] mt-1.5">
              +1.2 ev/s vs avg
            </div>
          </div>
          <svg className="w-16 h-8 text-[var(--accent-text)]" viewBox="0 0 64 32" fill="none">
            <polyline
              points="0,22 12,18 24,24 36,14 48,16 64,8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Metric 3: Active sessions */}
        <div className="p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11.5px] font-medium text-[var(--text-muted)] mb-1">
              Active sessions
            </div>
            <div className="text-[28px] font-semibold tracking-tight text-[var(--text)] tabular-nums font-sans leading-none">
              1 <span className="text-[14px] font-normal text-[var(--text-muted)]">running</span>
            </div>
            <div className="text-[11.5px] text-[var(--text-secondary)] mt-1.5">
              EXP-0089 active
            </div>
          </div>
          <svg className="w-16 h-8 text-[var(--accent-text)]" viewBox="0 0 64 32" fill="none">
            <polyline
              points="0,24 16,16 32,16 48,10 64,10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Metric 4: Anomalies flagged */}
        <div className="p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11.5px] font-medium text-[var(--text-muted)] mb-1">
              Anomalies flagged
            </div>
            <div className="text-[28px] font-semibold tracking-tight text-[var(--status-warn-fg)] tabular-nums font-sans leading-none">
              1
            </div>
            <div className="text-[11.5px] text-[var(--text-secondary)] mt-1.5">
              BLE jitter (+731 µs)
            </div>
          </div>
          <svg className="w-16 h-8 text-[var(--status-warn-fg)]" viewBox="0 0 64 32" fill="none">
            <polyline
              points="0,26 20,26 32,18 44,22 64,12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* 4. Middle Section: Event Rate Visual Anchor (65% width) + Devices List (35% width) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 65%: Event Rate Chart */}
        <div className="lg:col-span-8 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--accent-text)]" />
              <h2 className="text-[14.5px] font-semibold text-[var(--text)]">
                Event Ingest Rate (Last 15 Minutes)
              </h2>
            </div>
            <span className="text-[11.5px] text-[var(--text-muted)]">
              Split by telemetry source (events/sec)
            </span>
          </div>

          <div className="h-56 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={EVENT_RATE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="nrfGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="espGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="var(--text-muted)"
                  fontSize={11.5}
                  fontFamily="var(--font-mono)"
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  fontSize={11.5}
                  fontFamily="var(--font-mono)"
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickFormatter={(val) => `${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border-strong)',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  itemStyle={{ padding: 0 }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', fontFamily: 'var(--font-mono)', paddingTop: '8px' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Area
                  type="monotone"
                  dataKey="nrf52840"
                  name="nrf52840_software"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#nrfGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="target_esp32"
                  name="target_esp32"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#espGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 35%: Devices List (Plain rows with 1px dividers, 32px height) */}
        <div className="lg:col-span-4 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[var(--accent-text)]" />
              <h2 className="text-[14.5px] font-semibold text-[var(--text)]">
                Devices Matrix
              </h2>
            </div>
            <Link to="/devices">
              <Button variant="secondary" size="xs" className="h-6 px-2 text-[11.5px]">
                Manage
                <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {devices?.map((dev) => {
              const isPlanned = dev.status === 'planned';
              return (
                <div
                  key={dev.id}
                  className="h-8 flex items-center justify-between text-[13px] hover:bg-[var(--surface-sunken)] transition-colors px-1"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {!isPlanned && (
                      <StatusDot status={dev.status === 'connected' ? 'ok' : 'offline'} />
                    )}
                    <span className={`font-medium truncate ${isPlanned ? 'text-[var(--text-muted)]' : 'text-[var(--text)]'}`}>
                      {dev.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isPlanned ? (
                      <Badge variant="planned" size="sm">
                        Planned
                      </Badge>
                    ) : (
                      <span className="font-mono text-[10.5px] text-[var(--text-secondary)] tabular-nums">
                        {dev.port} · {dev.baudRate}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Bottom Row: Recent Telemetry Table at Full Width (Plain rows, 32px height, 1px dividers) */}
      <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[var(--accent-text)]" />
            <h2 className="text-[14.5px] font-semibold text-[var(--text)]">
              Recent Security Telemetry
            </h2>
          </div>
          <Link to="/live-monitor">
            <Button variant="secondary" size="xs" className="h-6 px-2 text-[11.5px]">
              Live Stream
              <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="h-7 text-[11.5px] font-medium text-[var(--text-muted)] border-b border-[var(--border)] select-none">
                <th className="px-2 w-24">Time</th>
                <th className="px-2 w-28">Type</th>
                <th className="px-2 w-36">Source</th>
                <th className="px-2">Event</th>
                <th className="px-2 w-24">Clock</th>
                <th className="px-2 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {recentEvents?.events.map((evt) => (
                <tr
                  key={evt.id}
                  className="h-8 hover:bg-[var(--surface-sunken)] transition-colors"
                >
                  <td className="px-2 font-mono text-[11.5px] text-[var(--text-muted)] tabular-nums whitespace-nowrap">
                    {formatTimestamp(evt.timestamp)}
                  </td>
                  <td className="px-2">
                    <Badge variant={evt.type === 'BLE_EVENT' ? 'default' : 'outline'} size="sm">
                      {evt.type}
                    </Badge>
                  </td>
                  <td className="px-2 font-mono text-[11.5px] text-[var(--accent-text)] truncate max-w-[140px]">
                    {evt.source}
                  </td>
                  <td className="px-2 font-medium text-[13px] text-[var(--text)] truncate max-w-[200px]">
                    {evt.details.event}
                  </td>
                  <td className="px-2">
                    <ClockBadge clock={evt.clock} />
                  </td>
                  <td className="px-2 font-mono text-[11px] text-[var(--text-secondary)] text-right truncate max-w-[280px]">
                    {evt.details.payload || (evt.details.status && `[${evt.details.status}]`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
