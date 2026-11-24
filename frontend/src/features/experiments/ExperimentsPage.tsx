import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Layers,
  Search,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { dataSource } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { StatusDot } from '../../components/ui/StatusDot';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/Sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';
import { formatDuration } from '../../lib/utils';
import type { Experiment } from '../../types';

export const ExperimentsPage: React.FC = () => {
  const [search, setSearch] = React.useState('');
  const [selectedExp, setSelectedExp] = React.useState<Experiment | null>(null);

  const { data: experiments, isLoading, isError, refetch } = useQuery({
    queryKey: ['experiments'],
    queryFn: () => dataSource.getExperiments(),
  });

  const filtered = (experiments || []).filter(
    (e) =>
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.targetDevice.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight text-[var(--text)]">
            Experiments Directory
          </h1>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
            Interim mode: software timestamps only. FPGA timing is planned.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm">
            <Layers className="w-3.5 h-3.5" />
            New Experiment
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--text-muted)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search experiments by ID, target device, or name..."
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          Status
        </Button>
      </div>

      {/* Content States */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-[6px]" />
          <Skeleton className="h-12 w-full rounded-[6px]" />
          <Skeleton className="h-12 w-full rounded-[6px]" />
        </div>
      ) : isError ? (
        <div className="p-8 text-center border border-[var(--status-error-border)] rounded-[8px] bg-[var(--status-error-bg)]">
          <AlertCircle className="w-7 h-7 text-[var(--status-error-fg)] mx-auto mb-2" />
          <h3 className="text-[14px] font-semibold text-[var(--text)]">Failed to load experiments</h3>
          <p className="text-[12px] text-[var(--text-muted)] mb-3">Error contacting hardware experiment store.</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No experiments found"
          description={`No results matching "${search}".`}
          actionLabel="Clear filter"
          onAction={() => setSearch('')}
        />
      ) : (
        /* Experiments Precision Table */
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28 font-mono">ID</TableHead>
              <TableHead>Experiment Name</TableHead>
              <TableHead>Target Device & Architecture</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="text-right w-24">Events</TableHead>
              <TableHead className="text-right w-28">Duration</TableHead>
              <TableHead className="w-24">Anomaly</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((exp) => (
              <TableRow
                key={exp.id}
                onClick={() => setSelectedExp(exp)}
                className="cursor-pointer hover:bg-[var(--surface-sunken)] transition-colors"
              >
                <TableCell className="font-mono text-[12px] font-semibold text-[var(--accent-text)]">
                  {exp.id}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-[var(--text)] text-[13px]">{exp.name}</div>
                  <div className="text-[11px] text-[var(--text-muted)] line-clamp-1">{exp.description}</div>
                </TableCell>
                <TableCell>
                  <div className="text-[12px] text-[var(--text)]">{exp.targetDevice}</div>
                  <div className="font-mono text-[10px] text-[var(--text-muted)]">{exp.targetArch}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <StatusDot
                      status={exp.status === 'running' ? 'busy' : exp.status === 'completed' ? 'ok' : 'error'}
                    />
                    <span className="text-[12px] capitalize font-medium text-[var(--text)]">{exp.status}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-[12px] tabular-nums">
                  {exp.eventCount}
                </TableCell>
                <TableCell className="text-right font-mono text-[12px] tabular-nums text-[var(--text-secondary)]">
                  {formatDuration(exp.durationMs)}
                </TableCell>
                <TableCell>
                  {exp.anomalyDetected ? (
                    <Badge variant="warning" size="sm">
                      FLAGGED
                    </Badge>
                  ) : (
                    <span className="text-[11px] text-[var(--text-muted)] font-mono">NOMINAL</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Slide-out Inspection Sheet for Selected Experiment */}
      <Sheet open={!!selectedExp} onOpenChange={(open) => !open && setSelectedExp(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedExp && (
            <div className="space-y-4 font-sans">
              <SheetHeader>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[12px] font-semibold text-[var(--accent-text)]">
                    {selectedExp.id}
                  </span>
                  <Badge variant={selectedExp.anomalyDetected ? 'warning' : 'outline'} size="sm">
                    {selectedExp.anomalyDetected ? 'Anomaly Flagged' : 'Nominal'}
                  </Badge>
                  <Badge variant="planned" size="sm">
                    Glitch: {selectedExp.glitchTriggerStatus.toUpperCase()}
                  </Badge>
                </div>
                <SheetTitle>{selectedExp.name}</SheetTitle>
              </SheetHeader>

              <div className="space-y-3 text-[12px]">
                <div>
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">Description</label>
                  <p className="text-[var(--text-secondary)] mt-1 leading-relaxed">{selectedExp.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-[6px] bg-[var(--surface-sunken)] border border-[var(--border)]">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase block">Target Device</span>
                    <span className="font-medium text-[var(--text)] text-[12px]">{selectedExp.targetDevice}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase block">Architecture</span>
                    <span className="font-mono text-[var(--text)] text-[11px]">{selectedExp.targetArch}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase block">Duration</span>
                    <span className="font-mono text-[var(--text)] text-[12px]">{formatDuration(selectedExp.durationMs)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase block">Total Events</span>
                    <span className="font-mono text-[var(--text)] text-[12px]">{selectedExp.eventCount}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">
                    Configured Parameters (JSON)
                  </label>
                  <pre className="mt-1 p-3 rounded-[6px] bg-[var(--surface-sunken)] border border-[var(--border-strong)] font-mono text-[11px] text-[var(--text)] overflow-x-auto">
                    {JSON.stringify(selectedExp.parameters, null, 2)}
                  </pre>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">Tags</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedExp.tags.map((tag) => (
                      <span key={tag} className="font-mono text-[11px] px-2 py-0.5 rounded bg-[var(--surface-sunken)] text-[var(--text-secondary)] border border-[var(--border)]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
