import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Play,
  Pause,
  RotateCcw,
  Search,
  Lock,
  Unlock,
  Copy,
  Check,
  AlertCircle,
  Unplug,
  Code,
  Radio,
} from 'lucide-react';
import { dataSource } from '../../api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ClockBadge } from '../../components/ui/ClockBadge';
import { StatusDot } from '../../components/ui/StatusDot';
import { Skeleton } from '../../components/ui/Skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/Sheet';
import { formatTimestamp, formatDuration } from '../../lib/utils';
import type { SecurityEvent, ConnectionState } from '../../types';

export const LiveMonitorPage: React.FC = () => {
  const [events, setEvents] = React.useState<SecurityEvent[]>([]);
  const [isPaused, setIsPaused] = React.useState(false);
  const [autoScroll, setAutoScroll] = React.useState(true);
  const [filterType, setFilterType] = React.useState<string>('All');
  const [filterSource, setFilterSource] = React.useState<string>('All');
  const [search, setSearch] = React.useState('');
  const [newEventId, setNewEventId] = React.useState<string | null>(null);
  const [selectedEventIndex, setSelectedEventIndex] = React.useState<number | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Simulated state override for testing (Normal / Loading / Empty / Disconnected / Error)
  const [stateOverride, setStateOverride] = React.useState<'normal' | 'loading' | 'empty' | 'disconnected' | 'error'>('normal');

  const [connection, setConnection] = React.useState<ConnectionState>({
    status: 'connected',
    port: 'COM7',
    baudRate: 115200,
    activeDeviceName: 'nRF52840-DK (BLE Blade)',
    eventsPerSecond: 14.8,
    bufferSize: 1024,
    lastHeartbeat: Date.now(),
  });

  const terminalContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    dataSource.getConnectionState().then((state) => {
      setConnection(state);
    });
  }, []);

  const { isLoading, isError, refetch } = useQuery({
    queryKey: ['initial-events'],
    queryFn: async () => {
      const res = await dataSource.getEvents({ limit: 40 });
      setEvents(res.events);
      return res;
    },
  });

  React.useEffect(() => {
    if (stateOverride === 'disconnected' || stateOverride === 'error' || stateOverride === 'loading') {
      return;
    }

    const unsubscribe = dataSource.subscribeEvents((incoming) => {
      if (!isPaused && stateOverride === 'normal') {
        setEvents((prev) => {
          const updated = [incoming, ...prev];
          if (updated.length > 500) updated.pop();
          return updated;
        });
        setNewEventId(incoming.id);
        setTimeout(() => setNewEventId(null), 1000);
      }
    });

    return () => unsubscribe();
  }, [isPaused, stateOverride]);

  React.useEffect(() => {
    if (autoScroll && terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = 0;
    }
  }, [events, autoScroll]);

  const uniqueSources = React.useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => set.add(e.source));
    return Array.from(set);
  }, [events]);

  const filteredEvents = React.useMemo(() => {
    if (stateOverride === 'empty') return [];
    return events.filter((e) => {
      if (filterType !== 'All' && e.type !== filterType) return false;
      if (filterSource !== 'All' && e.source !== filterSource) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          e.id.toLowerCase().includes(q) ||
          e.source.toLowerCase().includes(q) ||
          e.details.event.toLowerCase().includes(q) ||
          (e.details.payload && e.details.payload.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [events, filterType, filterSource, search, stateOverride]);

  const selectedEvent = selectedEventIndex !== null ? filteredEvents[selectedEventIndex] : null;
  const previousEvent =
    selectedEventIndex !== null && selectedEventIndex < filteredEvents.length - 1
      ? filteredEvents[selectedEventIndex + 1]
      : null;

  const deltaMs =
    selectedEvent && previousEvent
      ? Math.abs(selectedEvent.timestamp - previousEvent.timestamp)
      : null;

  const handleCopyJson = () => {
    if (!selectedEvent) return;
    navigator.clipboard.writeText(JSON.stringify(selectedEvent, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleReconnect = async () => {
    setStateOverride('normal');
    await dataSource.connectSerial('COM7', 115200);
    const updated = await dataSource.getConnectionState();
    setConnection(updated);
  };

  return (
    <div className="space-y-2.5 h-[calc(100vh-4.75rem)] flex flex-col pb-1 font-sans">
      {/* 1. Precision Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 bg-[var(--surface)] p-2.5 rounded-[6px] border border-[var(--border)] flex-shrink-0">
        {/* Left: Connection Badge & Rate Counter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-[12px]">
            <StatusDot
              status={
                stateOverride === 'disconnected'
                  ? 'offline'
                  : stateOverride === 'error'
                  ? 'error'
                  : isPaused
                  ? 'warn'
                  : connection.status === 'connected'
                  ? 'ok'
                  : 'offline'
              }
              pulse={!isPaused && stateOverride === 'normal' && connection.status === 'connected'}
            />
            <span className="font-mono font-medium text-[var(--text)]">
              {stateOverride === 'disconnected'
                ? 'COM7 Disconnected'
                : stateOverride === 'error'
                ? 'COM7 Parity Error'
                : `${connection.port || 'COM7'} · ${connection.baudRate || 115200} 8N1`}
            </span>
            <span className="text-[var(--text-muted)] border-l border-[var(--border)] pl-1.5 tabular-nums font-mono text-[11px]">
              {stateOverride === 'disconnected' || isPaused ? '0.0 ev/s' : `${connection.eventsPerSecond.toFixed(1)} ev/s`}
            </span>
          </div>

          <span className="text-[12px] text-[var(--text-muted)] hidden sm:inline">
            Buffer: <span className="font-mono tabular-nums">{filteredEvents.length}</span> / 500
          </span>

          {isPaused && (
            <span className="font-sans text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--status-warn-bg)] text-[var(--status-warn-fg)] border border-[var(--status-warn-border)]">
              Buffer paused
            </span>
          )}
        </div>

        {/* Right: Controls (Pause/Resume, Clear, AutoScroll, Dev states) */}
        <div className="flex items-center gap-2">
          <Button
            variant={isPaused ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            className="gap-1.5 font-medium text-[12px]"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
            className="gap-1.5 text-[12px]"
            title="Auto-scroll lock toggle"
          >
            {autoScroll ? <Lock className="w-3.5 h-3.5 text-[var(--accent-text)]" /> : <Unlock className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
            <span className="hidden sm:inline">Auto-scroll</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEvents([])}
            className="text-[var(--text-muted)] hover:text-[var(--text)] px-2"
            title="Clear current event buffer"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span className="text-[12px]">Clear</span>
          </Button>

          {/* Dev-Only State Switcher */}
          {import.meta.env.DEV && (
            <div className="hidden xl:flex items-center gap-1 border-l border-[var(--border)] pl-2 text-[10.5px]">
              <span className="text-[var(--text-muted)] font-mono">Dev:</span>
              {(['normal', 'loading', 'empty', 'disconnected', 'error'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStateOverride(st)}
                  className={`px-1.5 py-0.5 rounded font-mono uppercase ${
                    stateOverride === st
                      ? 'bg-[var(--accent-subtle)] text-[var(--accent-text)] font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[var(--surface)] px-3 py-2 rounded-[6px] border border-[var(--border)] flex-shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payload, hex, event name..."
            className="h-7 w-full bg-transparent text-[12.5px] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none font-mono"
          />
        </div>

        {/* Filter by Type */}
        <div className="flex items-center gap-1 text-[12px]">
          <span className="text-[var(--text-muted)] font-medium mr-1">Type:</span>
          {['All', 'BLE_EVENT', 'TARGET_RESPONSE', 'SYSTEM'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2 py-0.5 rounded-[3px] text-[11.5px] transition-colors ${
                filterType === type
                  ? 'bg-[var(--surface-sunken)] text-[var(--text)] font-semibold border border-[var(--border-strong)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {type === 'All' ? 'All' : type}
            </button>
          ))}
        </div>

        {/* Filter by Source */}
        {uniqueSources.length > 0 && (
          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="text-[var(--text-muted)] font-medium">Source:</span>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="h-6 rounded-[3px] bg-[var(--surface-sunken)] border border-[var(--border-strong)] px-2 text-[11.5px] font-mono text-[var(--text)] outline-none focus:border-[var(--accent)]"
            >
              <option value="All">All sources</option>
              {uniqueSources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 3. Event Table / State Containers */}
      <div
        ref={terminalContainerRef}
        className="flex-1 overflow-y-auto rounded-[6px] border border-[var(--border)] bg-[var(--surface)] relative"
      >
        {/* Loading State */}
        {(stateOverride === 'loading' || isLoading) && (
          <div className="p-4 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}

        {/* Disconnected State */}
        {stateOverride === 'disconnected' && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Unplug className="w-10 h-10 text-[var(--text-muted)] mb-3" />
            <h3 className="text-[14.5px] font-semibold text-[var(--text)]">
              Serial Disconnected, COM7 Not Found
            </h3>
            <p className="max-w-md text-[13px] text-[var(--text-secondary)] mt-1 mb-4 leading-relaxed">
              The hardware target harness on COM7 is offline or the serial bridge was closed.
              Connect the physical USB UART adapter or rescan available ports.
            </p>
            <Button variant="primary" size="sm" onClick={handleReconnect}>
              Reconnect Hardware Interface
            </Button>
          </div>
        )}

        {/* Error State */}
        {(stateOverride === 'error' || isError) && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <AlertCircle className="w-10 h-10 text-[var(--status-error-fg)] mb-3" />
            <h3 className="text-[14.5px] font-semibold text-[var(--text)]">
              Telemetry Stream Desynchronization
            </h3>
            <p className="max-w-md text-[13px] text-[var(--text-secondary)] mt-1 mb-4 leading-relaxed">
              UART baud parity mismatch or buffer overflow detected while parsing frame headers.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setStateOverride('normal');
                refetch();
              }}
            >
              Retry Stream Ingestion
            </Button>
          </div>
        )}

        {/* Empty State */}
        {stateOverride !== 'loading' &&
          stateOverride !== 'disconnected' &&
          stateOverride !== 'error' &&
          filteredEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Radio className="w-10 h-10 text-[var(--text-muted)] mb-3 opacity-60 animate-pulse" />
              <h3 className="text-[14.5px] font-semibold text-[var(--text)]">
                Waiting for Events on COM7
              </h3>
              <p className="max-w-md text-[13px] text-[var(--text-secondary)] mt-1 mb-4 leading-relaxed">
                Hardware harness is listening at 115200 baud. Trigger a boot reset or transmit on the BLE interface to capture frames.
              </p>
              {search && (
                <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                  Clear Search Filter
                </Button>
              )}
            </div>
          )}

        {/* Normal Event Table */}
        {stateOverride === 'normal' && filteredEvents.length > 0 && (
          <table className="w-full text-left text-[13px] border-collapse">
            <thead className="bg-[var(--surface-sunken)] text-[var(--text-muted)] text-[11.5px] font-medium sticky top-0 z-10 border-b border-[var(--border)] select-none">
              <tr className="h-7">
                <th className="px-3 w-24">Time (UTC)</th>
                <th className="px-2 w-28">Type</th>
                <th className="px-2 w-32">Source</th>
                <th className="px-2">Event</th>
                <th className="px-2 w-24">Clock</th>
                <th className="px-3">Details preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredEvents.map((evt, idx) => {
                const isHighlight = evt.id === newEventId;
                const isSelected = selectedEventIndex === idx;

                return (
                  <tr
                    key={evt.id}
                    onClick={() => setSelectedEventIndex(idx)}
                    className={`h-7 transition-colors cursor-pointer select-text hover:bg-[var(--surface-sunken)] ${
                      isSelected
                        ? 'bg-[var(--accent-subtle)] border-l-2 border-[var(--accent)] text-[var(--text)] font-medium'
                        : isHighlight
                        ? 'bg-[var(--accent-subtle)]/50 border-l-2 border-[var(--accent)]'
                        : 'border-l-2 border-transparent'
                    }`}
                  >
                    <td className="px-3 tabular-nums font-mono text-[11.5px] text-[var(--text-muted)] whitespace-nowrap">
                      {formatTimestamp(evt.timestamp)}
                    </td>
                    <td className="px-2">
                      <span
                        className={`text-[10.5px] font-medium ${
                          evt.type === 'BLE_EVENT'
                            ? 'text-sky-500'
                            : evt.type === 'TARGET_RESPONSE'
                            ? 'text-emerald-500'
                            : 'text-amber-500'
                        }`}
                      >
                        {evt.type}
                      </span>
                    </td>
                    <td className="px-2 font-mono text-[11.5px] text-[var(--text-secondary)] truncate max-w-[130px]">
                      {evt.source}
                    </td>
                    <td className="px-2 font-medium text-[13px] text-[var(--text)] truncate max-w-[180px]">
                      {evt.details.event}
                    </td>
                    <td className="px-2">
                      <ClockBadge clock={evt.clock} />
                    </td>
                    <td className="px-3 font-mono text-[11px] text-[var(--text-secondary)] truncate max-w-[320px]">
                      {evt.details.payload || (
                        <span>
                          {evt.details.voltageMv !== undefined && `V=${evt.details.voltageMv}mV `}
                          {evt.details.latencyUs !== undefined && `Δt=${evt.details.latencyUs}µs `}
                          {evt.details.status && `[${evt.details.status}]`}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 4. Right-side Inspector Sheet for Selected Event */}
      <Sheet open={selectedEvent !== null} onOpenChange={(open) => !open && setSelectedEventIndex(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto font-sans">
          {selectedEvent && (
            <div className="space-y-4">
              <SheetHeader>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[11.5px] font-semibold text-[var(--accent-text)]">
                    {selectedEvent.id}
                  </span>
                  <Badge variant={selectedEvent.type === 'BLE_EVENT' ? 'default' : 'outline'} size="sm">
                    {selectedEvent.type}
                  </Badge>
                  <ClockBadge clock={selectedEvent.clock} />
                </div>
                <SheetTitle className="text-[15px] font-semibold text-[var(--text)]">
                  {selectedEvent.details.event}
                </SheetTitle>
              </SheetHeader>

              {/* Event Metadata Card */}
              <div className="p-3 rounded-[6px] bg-[var(--surface-sunken)] border border-[var(--border)] space-y-2 text-[12.5px]">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Timestamp:</span>
                  <span className="text-[var(--text)] font-mono tabular-nums">
                    {formatTimestamp(selectedEvent.timestamp, { showMs: true })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Source:</span>
                  <span className="text-[var(--accent-text)] font-mono font-medium">{selectedEvent.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Clock domain:</span>
                  <span className="text-[var(--text)]">
                    Host driver (software)
                  </span>
                </div>

                {/* Delta to Previous Event */}
                {deltaMs !== null && (
                  <div className="flex justify-between pt-1 border-t border-[var(--border)] text-[var(--status-ok-fg)]">
                    <span>Delta to prior event (Δt):</span>
                    <span className="font-mono font-medium tabular-nums">+{formatDuration(deltaMs)}</span>
                  </div>
                )}
              </div>

              {/* Formatted JSON Inspector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11.5px] font-medium text-[var(--text-muted)] flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5" />
                    Payload & details (JSON)
                  </label>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={handleCopyJson}
                    className="gap-1 text-[11.5px] h-6 px-2 text-[var(--text-secondary)] hover:text-[var(--text)]"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-[var(--status-ok-fg)]" />
                        <span className="text-[var(--status-ok-fg)]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </Button>
                </div>

                <pre className="p-3 rounded-[6px] bg-[var(--surface-sunken)] border border-[var(--border-strong)] font-mono text-[11.5px] text-[var(--text)] overflow-x-auto max-h-72 leading-relaxed">
                  {JSON.stringify(selectedEvent, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
