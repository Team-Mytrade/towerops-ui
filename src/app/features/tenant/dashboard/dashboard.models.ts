import {
  Severity,
  SiteCategory,
  SiteHealthStatus,
  WorkOrderStatus
} from '../../../core/models/application.enums';

export interface CategoryDashboardSummary {
  category: SiteCategory;

  sites: {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
    offline: number;
    maintenance: number;
    unknown: number;
  };

  devices: {
    total: number;
    online: number;
    offline: number;
  };

  openAlerts: number;
  criticalAlerts: number;
  openTickets: number;
  openWorkOrders: number;
  averageFuelLevel?: number | null;
  slaBreaches: number;
}

export interface DashboardMapSite {
  siteId: number;
  siteCode: string;
  siteName: string;
  category: SiteCategory;
  latitude: number;
  longitude: number;
  healthStatus: SiteHealthStatus;
  deviceCount: number;
  openAlerts: number;
}

export interface DashboardAlert {
  id: number;
  alertCode: string;
  siteCode?: string;
  siteName?: string;
  deviceId?: string;
  message: string;
  severity: Severity;
  timestamp: string;
  status: string;
}

export interface DashboardWorkOrder {
  id: number;
  workOrderCode: string;
  title: string;
  technicianName?: string | null;
  scheduledAt?: string | null;
  status: WorkOrderStatus;
}