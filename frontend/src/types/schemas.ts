import { z } from 'zod';

export const ClockTypeSchema = z.enum(['software', 'hardware']);

export const SecurityEventTypeSchema = z.enum([
  'BLE_EVENT',
  'TARGET_RESPONSE',
  'SYSTEM',
  'GLITCH_FIRED',
]);

export const SecurityEventSchema = z.object({
  id: z.string(),
  type: SecurityEventTypeSchema,
  timestamp: z.number().int().positive(),
  source: z.string(),
  details: z.object({
    event: z.string(),
    payload: z.string().optional(),
    rssi: z.number().optional(),
    channel: z.number().optional(),
    latencyUs: z.number().optional(),
    voltageMv: z.number().optional(),
    rawHex: z.string().optional(),
    status: z.string().optional(),
  }).passthrough(),
  clock: ClockTypeSchema.default('software'),
  isPlanned: z.boolean().optional(),
});

export const DeviceStatusSchema = z.enum(['connected', 'disconnected', 'planned', 'busy', 'error']);

export const DeviceCapabilitySchema = z.enum([
  'BLE_SNIFFER',
  'UART_MONITOR',
  'VOLTAGE_GLITCH',
  'CLOCK_GLITCH',
  'FPGA_TRIGGER',
  'POWER_ANALYSIS',
]);

export const DeviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  model: z.string(),
  type: z.enum(['NRF52840_DK', 'TARGET_ESP32', 'ESP32_CORE', 'UPDUINO_FPGA', 'GLITCH_BLADE']),
  status: DeviceStatusSchema,
  port: z.string().optional(),
  baudRate: z.number().int().positive().optional(),
  firmwareVersion: z.string(),
  capabilities: z.array(DeviceCapabilitySchema),
  lastPing: z.number().optional(),
});

export const ExperimentStatusSchema = z.enum([
  'completed',
  'running',
  'failed',
  'aborted',
  'draft',
]);

export const ExperimentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  targetDevice: z.string(),
  targetArch: z.string(),
  status: ExperimentStatusSchema,
  startedAt: z.number(),
  durationMs: z.number(),
  eventCount: z.number(),
  anomalyDetected: z.boolean(),
  glitchTriggerStatus: z.enum(['inactive', 'armed', 'planned']).default('planned'),
  parameters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  tags: z.array(z.string()),
});

export const EvidenceSchema = z.object({
  id: z.string(),
  experimentId: z.string(),
  name: z.string(),
  type: z.enum(['LOG_CAPTURE', 'OSCILLOSCOPE_TRACE', 'MEMORY_DUMP', 'PCAP', 'TIMING_ANALYSIS']),
  sizeBytes: z.number(),
  createdAt: z.number(),
  hashSha256: z.string(),
  metadata: z.record(z.string(), z.any()),
});
