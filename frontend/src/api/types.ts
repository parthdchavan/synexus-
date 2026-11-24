import type {
  Device,
  Experiment,
  EvidenceItem,
  SecurityEvent,
  GetEventsParams,
  PaginatedEvents,
  ConnectionState,
} from '../types';

export interface DataSource {
  getDevices(): Promise<Device[]>;
  getExperiments(): Promise<Experiment[]>;
  getExperiment(id: string): Promise<Experiment | null>;
  getEvents(params: GetEventsParams): Promise<PaginatedEvents>;
  getEvidence(experimentId?: string): Promise<EvidenceItem[]>;
  subscribeEvents(callback: (event: SecurityEvent) => void): () => void;
  connectSerial(port: string, baudRate: number): Promise<{ success: boolean; port: string }>;
  disconnectSerial(port: string): Promise<{ success: boolean }>;
  getConnectionState(): Promise<ConnectionState>;
}
