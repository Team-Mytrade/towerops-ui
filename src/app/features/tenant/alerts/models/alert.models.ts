import { QueryParams } from '../../../../core/api/api-query.types';
import {
  Severity,
  SiteCategory
} from '../../../../core/models/application.enums';

export type AlertStatus =
  | 'OPEN'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'SUPPRESSED';

export interface Alert {
  id: number;
  alertCode: string;
  title: string;
  message: string;

  severity: Severity;
  status: AlertStatus;

  category?: string | null;
  ruleId?: number | null;
  ruleName?: string | null;

  siteId?: number | null;
  siteCode?: string | null;
  siteName?: string | null;
  siteCategory?: SiteCategory | null;

  deviceId?: number | null;
  deviceCode?: string | null;
  deviceName?: string | null;

  acknowledgedBy?: string | null;
  acknowledgedAt?: string | null;

  resolvedBy?: string | null;
  resolvedAt?: string | null;

  createdAt: string;
  updatedAt?: string | null;

  ticketId?: number | null;
  ticketCode?: string | null;
}

export interface AlertListQuery extends QueryParams {
  search?: string;
  severity?: Severity;
  status?: AlertStatus;
  siteId?: number;
  deviceId?: number;
  category?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AcknowledgeAlertPayload {
  remarks?: string;
}

export interface ResolveAlertPayload {
  resolution: string;
  remarks?: string;
}