import {
  Severity,
  SiteCategory,
  WorkOrderStatus
} from '../../../../core/models/application.enums';

export type WorkOrderFormMode =
  | 'CREATE'
  | 'EDIT';

export type WorkOrderFormSubmitAction =
  | 'SAVE_DRAFT'
  | 'CREATE'
  | 'UPDATE';

export interface WorkOrderFormOption<TValue> {
  label: string;
  value: TValue;
  description?: string;
  disabled?: boolean;
}

export interface WorkOrderTechnicianOption {
  label: string;
  value: number;

  technicianCode?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  active?: boolean;
}


export interface WorkOrderSiteOption {
  label: string;
  value: number;

  siteCode: string;
  siteName: string;

  category?: SiteCategory | null;
  healthStatus?: string | null;
}

export interface WorkOrderDeviceOption {
  label: string;
  value: number;
  deviceCode: string;
  deviceName: string;
  siteId?: number | null;
  category?: string | null;
  status?: string | null;
}

export interface WorkOrderAlertOption {
  label: string;
  value: number;
  alertCode: string;
  message: string;
  siteId?: number | null;
  siteCode?: string | null;
  siteName?: string | null;
  deviceId?: number | null;
  deviceCode?: string | null;
  deviceName?: string | null;
  ticketId?: number | null;
  severity?: Severity | null;
}

export interface WorkOrderTicketOption {
  label: string;
  value: number;
  ticketCode: string;
  title: string;
  siteId?: number | null;
  siteCode?: string | null;
  siteName?: string | null;
  deviceId?: number | null;
  deviceCode?: string | null;
  deviceName?: string | null;
  alertId?: number | null;
  alertCode?: string | null;
  severity?: Severity | null;
  status?: string | null;
}

export interface WorkOrderSiteContext {
  siteId: number;
  siteCode: string;
  siteName: string;
  category?: SiteCategory | null;
  healthStatus?: string | null;

  devices: {
    total: number;
    online: number;
    offline: number;
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

/**
 * Raw value represented by the Work Order reactive form.
 *
 * Dates are stored as Date objects in the form and converted to
 * ISO strings before sending them to the API.
 */
export interface WorkOrderFormValue {
  workOrderCode: string;

  title: string;
  description: string;

  status: WorkOrderStatus;
  severity: Severity | null;
  priority: number | null;

  technicianId: number | null;

  siteId: number | null;
  deviceId: number | null;
  alertId: number | null;
  ticketId: number | null;

  scheduledAt: Date | null;
  estimatedHours: number | null;

  startedAt: Date | null;
  completedAt: Date | null;

  laborHours: number | null;
  resolution: string;
  remarks: string;
}

export interface CreateWorkOrderRequest {
  workOrderCode: string;

  title: string;
  description: string;

  status: WorkOrderStatus;
  severity: Severity | null;
  priority: number | null;

  technicianId: number | null;

  siteId: number | null;
  deviceId: number | null;
  alertId: number | null;
  ticketId: number | null;

  scheduledAt: string | null;
  estimatedHours: number | null;

  startedAt: string | null;
  completedAt: string | null;

  laborHours: number | null;
  resolution: string;
  remarks: string;
}

export type UpdateWorkOrderRequest =
  CreateWorkOrderRequest;

export interface WorkOrderAssignRequest {
  technicianId: number;
  scheduledAt?: string | null;
  remarks?: string | null;
}

export interface WorkOrderCompleteRequest {
  completedAt: string;
  resolution: string;
  laborHours: number;
  remarks?: string | null;
}

export interface WorkOrderVerificationRequest {
  remarks?: string | null;
}

export interface WorkOrderFormQueryContext {
  siteId?: number | null;
  deviceId?: number | null;
  alertId?: number | null;
  ticketId?: number | null;
}