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
import { SecurityEventSchema } from '../types/schemas';
import {
  INITIAL_DEVICES,
  INITIAL_EXPERIMENTS,
  INITIAL_EVIDENCE,
  INITIAL_EVENTS,
} from './mockData';

export class MockDataSource implements DataSource {
  private devices: Device[] = [...INITIAL_DEVICES];
  private experiments: Experiment[] = [...INITIAL_EXPERIMENTS];
  private evidence: EvidenceItem[] = [...INITIAL_EVIDENCE];
  private events: SecurityEvent[] = [...INITIAL_EVENTS];
  private subscribers: Set<(event: SecurityEvent) => void> = new Set();
  private streamInterval: any = null;

  private connectionState: ConnectionState = {
    status: 'connected',
    port: 'COM7',
    baudRate: 115200,
    activeDeviceName: 'nRF52840-DK (BLE Blade)',
    eventsPerSecond: 14.8,
    bufferSize: 1024,
    lastHeartbeat: Date.now(),
  };

  constructor() {
    this.startBackgroundStream();
  }

  private startBackgroundStream() {
    if (this.streamInterval) return;

    let counter = 100;

    this.streamInterval = setInterval(() => {
      if (this.connectionState.status !== 'connected') return;

      counter++;
      const isBle = Math.random() > 0.45;

      const rawEvent = {
        id: `EVT-STREAM-${counter}`,
        type: isBle ? ('BLE_EVENT' as const) : ('TARGET_RESPONSE' as const),
        timestamp: Date.now(),
        source: isBle ? 'nrf52840_software' : 'target_esp32',
        details: isBle
          ? {
              event: 'ATT_HANDLE_VALUE_NTF',
              payload: `Handle: 0x0014, Val: ${Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0')}`,
              rssi: -50 - Math.floor(Math.random() * 20),
              channel: 37,
              latencyUs: +(1.2 + Math.random() * 3).toFixed(2),
            }
          : {
              event: 'UART_HEARTBEAT_ACK',
              payload: `Heap: ${184200 + Math.floor(Math.random() * 4000)}B, Core Load: ${(12 + Math.random() * 6).toFixed(1)}%`,
              status: 'NOMINAL',
            },
        clock: 'software' as const,
      };

      const parsed = SecurityEventSchema.safeParse(rawEvent);
      if (parsed.success) {
        this.events.unshift(parsed.data);
        if (this.events.length > 500) {
          this.events.pop();
        }
        this.subscribers.forEach((cb) => cb(parsed.data));
      }
    }, 1800);
  }

  async getDevices(): Promise<Device[]> {
    await this.delay(30);
    return [...this.devices];
  }

  async getExperiments(): Promise<Experiment[]> {
    await this.delay(40);
    return [...this.experiments];
  }

  async getExperiment(id: string): Promise<Experiment | null> {
    await this.delay(30);
    const exp = this.experiments.find((e) => e.id === id);
    return exp ? { ...exp } : null;
  }

  async getEvents(params: GetEventsParams): Promise<PaginatedEvents> {
    await this.delay(50);
    let filtered = [...this.events];

    if (params.type) {
      filtered = filtered.filter((e) => e.type === params.type);
    }
    if (params.clock) {
      filtered = filtered.filter((e) => e.clock === params.clock);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.id.toLowerCase().includes(q) ||
          e.source.toLowerCase().includes(q) ||
          e.details.event.toLowerCase().includes(q) ||
          (e.details.payload && e.details.payload.toLowerCase().includes(q))
      );
    }

    const limit = params.limit || 50;
    const offset = params.offset || 0;
    const slice = filtered.slice(offset, offset + limit);

    return {
      events: slice,
      total: filtered.length,
      limit,
      offset,
    };
  }

  async getEvidence(experimentId?: string): Promise<EvidenceItem[]> {
    await this.delay(40);
    if (!experimentId) return [...this.evidence];
    return this.evidence.filter((e) => e.experimentId === experimentId);
  }

  subscribeEvents(callback: (event: SecurityEvent) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  async connectSerial(port: string, baudRate: number): Promise<{ success: boolean; port: string }> {
    await this.delay(80);
    this.connectionState = {
      ...this.connectionState,
      status: 'connected',
      port,
      baudRate,
      activeDeviceName: port === 'COM7' ? 'nRF52840-DK (BLE Blade)' : 'Target ESP32',
      lastHeartbeat: Date.now(),
    };
    return { success: true, port };
  }

  async disconnectSerial(_port: string): Promise<{ success: boolean }> {
    await this.delay(60);
    this.connectionState = {
      ...this.connectionState,
      status: 'disconnected',
      port: null,
      baudRate: null,
      activeDeviceName: null,
      eventsPerSecond: 0,
      lastHeartbeat: null,
    };
    return { success: true };
  }

  async getConnectionState(): Promise<ConnectionState> {
    return { ...this.connectionState };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
