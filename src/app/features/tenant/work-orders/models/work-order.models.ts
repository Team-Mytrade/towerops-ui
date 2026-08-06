import {
  Severity,
  SiteCategory,
  WorkOrderStatus
} from '../../../../core/models/application.enums';

export interface WorkOrder {
  id: number;
  tenantId?: string | null;
  workOrderCode: string;

  ticketId?: number | null;
  ticketCode?: string | null;

  alertId?: number | null;
  alertCode?: string | null;

  siteId?: number | null;
  siteCode?: string | null;
  siteName?: string | null;
  siteCategory?: SiteCategory | null;

  deviceId?: number | null;
  deviceCode?: string | null;
  deviceName?: string | null;

  technicianId?: number | null;
  technicianCode?: string | null;
  technicianName?: string | null;

  title: string;
  description?: string | null;

  status: WorkOrderStatus;
  priority?: number | null;
  severity?: Severity | null;

  scheduledAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  closedAt?: string | null;
  estimatedHours?: number | null;
  resolution?: string | null;
  laborHours?: number | null;
  remarks?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface WorkOrderPayload {
  tenantId: string;
  workOrderCode: string;

  ticketId?: number | null;
  alertId?: number | null;

  siteId?: number | null;
  deviceId?: number | null;
  technicianId?: number | null;

  title: string;
  description?: string | null;

  status: WorkOrderStatus;
  priority?: number | null;
  severity?: Severity | null;

  scheduledAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;

  resolution?: string | null;
  laborHours?: number | null;
  remarks?: string | null;
}

export interface WorkOrderListQuery {
  page?: number;
  size?: number;

  search?: string;
  category?: SiteCategory | null;
  status?: WorkOrderStatus | null;
  severity?: Severity | null;

  technicianId?: number | null;
  siteId?: number | null;

  fromDate?: string | null;
  toDate?: string | null;
}

export interface WorkOrderPage {
  content: WorkOrder[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  first?: boolean;
  last?: boolean;
}

export interface WorkOrderSummary {
  total: number;
  created: number;
  assigned: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  overdue: number;
}
