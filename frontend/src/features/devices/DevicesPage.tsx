import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Plug,
  Unplug,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { dataSource } from '../../api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusDot } from '../../components/ui/StatusDot';
import { Skeleton } from '../../components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import type { Device } from '../../types';

export const DevicesPage: React.FC = () => {
  const { data: devices, isLoading, refetch } = useQuery({
    queryKey: ['devices'],
    queryFn: () => dataSource.getDevices(),
  });

  const [connectingId, setConnectingId] = React.useState<string | null>(null);

  const handleToggleConnect = async (device: Device) => {
    if (device.status === 'planned' || !device.port || !device.baudRate) return;
    setConnectingId(device.id);
    if (device.status === 'connected') {
      await dataSource.disconnectSerial(device.port);
    } else {
      await dataSource.connectSerial(device.port, device.baudRate);
    }
    await refetch();
    setConnectingId(null);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight text-[var(--text)]">
            Hardware Devices & Harness Matrix
          </h1>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
            Interim mode: software timestamps only. FPGA timing is planned.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Rescan Ports
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-[6px]" />
          <Skeleton className="h-12 w-full rounded-[6px]" />
          <Skeleton className="h-12 w-full rounded-[6px]" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Active Devices Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24 font-mono">ID</TableHead>
                <TableHead>Target Device Name & Model</TableHead>
                <TableHead className="w-28 font-mono">Port</TableHead>
                <TableHead className="w-28 font-mono">Baud Rate</TableHead>
                <TableHead>Capabilities</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="text-right w-32">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices?.map((dev) => {
                const isPlanned = dev.status === 'planned';
                return (
                  <tr
                    key={dev.id}
                    className={`h-8 transition-colors border-b border-[var(--border)] ${
                      isPlanned
                        ? 'text-[var(--text-muted)] opacity-75'
                        : 'hover:bg-[var(--surface-sunken)] text-[var(--text)]'
                    }`}
                  >
                    <TableCell className="font-mono text-[12px] font-semibold text-[var(--accent-text)]">
                      {dev.id}
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium text-[13px] ${isPlanned ? 'text-[var(--text-secondary)]' : 'text-[var(--text)]'}`}>
                        {dev.name}
                      </div>
                      <div className="font-mono text-[11px] text-[var(--text-muted)]">
                        {dev.model} {dev.firmwareVersion !== 'unassigned' && `· FW: ${dev.firmwareVersion}`}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[12px]">
                      {isPlanned ? '—' : dev.port}
                    </TableCell>
                    <TableCell className="font-mono text-[12px] tabular-nums">
                      {isPlanned ? '—' : dev.baudRate}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {dev.capabilities.map((cap) => (
                          <span
                            key={cap}
                            className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-sunken)] text-[var(--text-muted)] border border-[var(--border)]"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isPlanned ? (
                        <Badge variant="planned" size="sm">
                          PLANNED
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <StatusDot
                            status={dev.status === 'connected' ? 'ok' : 'offline'}
                            pulse={dev.status === 'connected'}
                          />
                          <span className="text-[12px] capitalize font-medium text-[var(--text)]">
                            {dev.status}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isPlanned ? (
                        <span className="font-mono text-[11px] text-[var(--text-muted)]">—</span>
                      ) : (
                        <Button
                          variant={dev.status === 'connected' ? 'outline' : 'secondary'}
                          size="sm"
                          disabled={connectingId === dev.id}
                          onClick={() => handleToggleConnect(dev)}
                          className="gap-1.5"
                        >
                          {dev.status === 'connected' ? (
                            <>
                              <Unplug className="w-3 h-3 text-[var(--status-error-fg)]" />
                              Disconnect
                            </>
                          ) : (
                            <>
                              <Plug className="w-3 h-3 text-[var(--status-ok-fg)]" />
                              Connect
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </tr>
                );
              })}
            </TableBody>
          </Table>

          {/* Precision Timing Calibration Panel */}
          <div className="p-4 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] space-y-2">
            <h3 className="text-[13px] font-semibold text-[var(--text)] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--accent-text)]" />
              Timing Subsystem Calibration
            </h3>
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed max-w-3xl">
              Interim mode: software timestamps only. FPGA timing is planned. All current telemetry events originate from host serial driver timestamps on COM7 and COM3 at 115200 baud.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
