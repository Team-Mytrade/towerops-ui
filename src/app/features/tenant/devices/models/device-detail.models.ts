import {
  Severity,
  SiteHealthStatus
} from '../../../../core/models/application.enums';

import {
  DeviceStatus
} from './device.models';

export interface DeviceHealthSummary {
  deviceId: number;
  status: DeviceStatus;
  healthStatus: SiteHealthStatus;
  healthScore: number | null;

  connected: boolean;
  lastSeenAt: string | null;
  lastTelemetryAt: string | null;

  uptimePercentage?: number | null;
  signalStrength?: number | null;
  batteryLevel?: number | null;

  openAlerts: number;
  criticalAlerts: number;
}

export interface DeviceTelemetryMetric {
  metric: string;
  label: string;
  value: string | number | boolean | null;
  unit?: string | null;
  status?: SiteHealthStatus | null;
  recordedAt?: string | null;
}

export interface DeviceEvent {
  id: number;
  eventType: string;
  message: string;
  severity: Severity;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
}

export interface DeviceAlertSummary {
  id: number;
  alertCode: string;
  message: string;
  severity: Severity;
  status: string;
  createdAt: string;
}

export interface DeviceCredentialSummary {
  id: number;
  credentialType: string;
  username?: string | null;
  status: string;
  createdAt?: string | null;
  expiresAt?: string | null;
  lastRotatedAt?: string | null;
}

