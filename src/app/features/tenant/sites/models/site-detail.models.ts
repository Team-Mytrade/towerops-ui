import {
  AlertStatus,
  Severity,
  SiteHealthStatus,
  WorkOrderStatus
} from '../../../../core/models/application.enums';

export interface SiteOperationalSummary {
  siteId: number;
  siteCode: string;
  siteName: string;
  category: string;
  healthStatus: SiteHealthStatus;
  lastTelemetryAt?: string | null;

  devices: {
    total: number;
    online: number;
    offline: number;
    maintenance: number;
  };

  alerts: {
    open: number;
    critical: number;
  };

  tickets: {
    open: number;
  };

  workOrders: {
    open: number;
  };
}

export interface SiteTelemetryMetric {
  metric: string;
  label: string;
  value: string | number | boolean | null;
  unit?: string | null;
  status?: SiteHealthStatus | null;
  recordedAt?: string | null;
}

export interface SiteAlertSummary {
  id: number;
  alertCode: string;
  message: string;
  severity: Severity;
  status: AlertStatus;
  deviceName?: string | null;
  createdAt: string;
}

export interface SiteWorkOrderSummary {
  id: number;
  workOrderCode: string;
  title: string;
  status: WorkOrderStatus;
  technicianName?: string | null;
  scheduledAt?: string | null;
}

export interface SiteDeviceSummary {
  id: number;
  deviceCode: string;
  deviceName: string;
  category: string;
  status: string;
  lastSeenAt?: string | null;
}