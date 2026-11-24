import { z } from 'zod';
import {
  ClockTypeSchema,
  SecurityEventTypeSchema,
  SecurityEventSchema,
  DeviceSchema,
  ExperimentSchema,
  EvidenceSchema,
} from './schemas';

export type ClockType = z.infer<typeof ClockTypeSchema>;
export type SecurityEventType = z.infer<typeof SecurityEventTypeSchema>;
export type SecurityEvent = z.infer<typeof SecurityEventSchema>;
export type Device = z.infer<typeof DeviceSchema>;
export type Experiment = z.infer<typeof ExperimentSchema>;
export type EvidenceItem = z.infer<typeof EvidenceSchema>;

export interface ConnectionState {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  port: string | null;
  baudRate: number | null;
  activeDeviceName: string | null;
  eventsPerSecond: number;
  bufferSize: number;
  lastHeartbeat: number | null;
}

export interface GetEventsParams {
  experimentId?: string;
  type?: SecurityEventType;
  clock?: ClockType;
  limit?: number;
  offset?: number;
  search?: string;
  startTime?: number;
  endTime?: number;
}

export interface PaginatedEvents {
  events: SecurityEvent[];
  total: number;
  limit: number;
  offset: number;
}
