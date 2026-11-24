import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText, Search } from 'lucide-react';
import { dataSource } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatTimestamp } from '../../lib/utils';

export const EvidencePage: React.FC = () => {
  const [search, setSearch] = React.useState('');

  const { data: evidence, isLoading } = useQuery({
    queryKey: ['evidence'],
    queryFn: () => dataSource.getEvidence(),
  });

  const filtered = (evidence || []).filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.experimentId.toLowerCase().includes(search.toLowerCase()) ||
      item.hashSha256.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight text-[var(--text)]">
            Evidence & Binary Captures
          </h1>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
            Cryptographic SHA-256 verified packet bursts and memory dumps (Interim mode: software clock)
          </p>
        </div>

        <Button variant="secondary" size="sm" className="gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Export All (ZIP)
        </Button>
      </div>

      {/* Filter */}
      <div className="relative max-w-md">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--text-muted)]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by capture name, experiment ID, or SHA-256 hash..."
          className="pl-8"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24 font-mono">ID</TableHead>
              <TableHead className="w-28 font-mono">Experiment</TableHead>
              <TableHead>File Name & Artifact Type</TableHead>
              <TableHead className="font-mono">SHA-256 Checksum</TableHead>
              <TableHead className="text-right w-24">Size</TableHead>
              <TableHead className="text-right w-28">Created</TableHead>
              <TableHead className="text-right w-24">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id} className="hover:bg-[var(--surface-sunken)] transition-colors">
                <TableCell className="font-mono text-[11px] text-[var(--text-muted)]">
                  {item.id}
                </TableCell>
                <TableCell className="font-mono text-[12px] font-semibold text-[var(--accent-text)]">
                  {item.experimentId}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-[var(--text)] text-[13px] flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>{item.name}</span>
                  </div>
                  <div className="font-mono text-[10px] text-[var(--text-muted)] mt-0.5">
                    {item.type}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-[11px] text-[var(--text-secondary)]">
                  <span title={item.hashSha256}>
                    {item.hashSha256.substring(0, 16)}...{item.hashSha256.substring(56)}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono text-[12px] tabular-nums">
                  {(item.sizeBytes / 1024).toFixed(1)} KB
                </TableCell>
                <TableCell className="text-right font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
                  {formatTimestamp(item.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="xs" className="gap-1">
                    <Download className="w-3 h-3" />
                    Raw
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
