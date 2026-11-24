import type { DataSource } from './types';
import type {
  Device,
  Experiment,
  EvidenceItem,
  SecurityEvent,
  GetEventsParams,
  PaginatedEvents,
  ConnectionState,
} from '../types';

export class ApiDataSource implements DataSource {
  private baseUrl: string;
  private wsUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    this.wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/live';
  }

  async getDevices(): Promise<Device[]> {
    const res = await fetch(`${this.baseUrl}/devices`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch devices`);
    return res.json();
  }

  async getExperiments(): Promise<Experiment[]> {
    const res = await fetch(`${this.baseUrl}/experiments`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch experiments`);
    return res.json();
  }

  async getExperiment(id: string): Promise<Experiment | null> {
    const res = await fetch(`${this.baseUrl}/experiments/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch experiment ${id}`);
    return res.json();
  }

  async getEvents(params: GetEventsParams): Promise<PaginatedEvents> {
    const query = new URLSearchParams();
    if (params.experimentId) query.set('experiment_id', params.experimentId);
    if (params.type) query.set('type', params.type);
    if (params.clock) query.set('clock', params.clock);
    if (params.limit) query.set('limit', String(params.limit));
    if (params.offset) query.set('offset', String(params.offset));
    if (params.search) query.set('q', params.search);

    const res = await fetch(`${this.baseUrl}/events?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch events`);
    return res.json();
  }

  async getEvidence(experimentId?: string): Promise<EvidenceItem[]> {
    const url = experimentId
      ? `${this.baseUrl}/experiments/${experimentId}/evidence`
      : `${this.baseUrl}/evidence`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch evidence`);
    return res.json();
  }

  subscribeEvents(callback: (event: SecurityEvent) => void): () => void {
    const ws = new WebSocket(this.wsUrl);
    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        callback(data);
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };
    return () => {
      ws.close();
    };
  }

  async connectSerial(port: string, baudRate: number): Promise<{ success: boolean; port: string }> {
    const res = await fetch(`${this.baseUrl}/serial/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ port, baudRate }),
    });
    if (!res.ok) throw new Error(`Failed to connect to serial port ${port}`);
    return res.json();
  }

  async disconnectSerial(port: string): Promise<{ success: boolean }> {
    const res = await fetch(`${this.baseUrl}/serial/disconnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ port }),
    });
    if (!res.ok) throw new Error(`Failed to disconnect serial port ${port}`);
    return res.json();
  }

  async getConnectionState(): Promise<ConnectionState> {
    const res = await fetch(`${this.baseUrl}/serial/status`);
    if (!res.ok) throw new Error('Failed to fetch connection status');
    return res.json();
  }
}
