import { QueryParams } from '../../../../core/api/api-query.types';

import {
  Priority,
  Severity,
  SiteCategory,
  TicketSource,
  TicketStatus
} from '../../../../core/models/application.enums';

export interface Ticket {
  id: number;

  ticketCode: string;
  title: string;
  description: string;

  priority: Priority;
  severity: Severity;
  status: TicketStatus;
  source: TicketSource;

  tenantId: string;

  siteId: number | null;
  siteCode?: string | null;
  siteName?: string | null;
  siteCategory?: SiteCategory | null;

  deviceId?: number | null;
  deviceCode?: string | null;
  deviceName?: string | null;

  alertId?: number | null;
  alertCode?: string | null;

  assignedTechnicianId?: number | null;
  assignedTechnicianCode?: string | null;
  assignedTechnicianName?: string | null;

  workOrderId?: number | null;
  workOrderCode?: string | null;

  estimatedResolutionAt?: string | null;
  responseDueAt?: string | null;
  resolutionDueAt?: string | null;

  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
  verifiedAt?: string | null;
  closedAt?: string | null;

  resolution?: string | null;
  remarks?: string | null;

  createdBy?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface TicketPayload {
  title: string;
  description: string;

  priority: Priority;
  severity: Severity;
  source: TicketSource;

  siteId: number;
  deviceId?: number | null;
  alertId?: number | null;

  assignedTechnicianId?: number | null;
  estimatedResolutionAt?: string | null;

  remarks?: string;
}

export interface TicketListQuery extends QueryParams {
  search?: string;

  status?: TicketStatus;
  priority?: Priority;
  severity?: Severity;
  source?: TicketSource;

  siteId?: number;
  deviceId?: number;
  technicianId?: number;
  alertId?: number;
  workOrderId?: number;

  fromDate?: string;
  toDate?: string;

  page?: number;
  size?: number;
  sort?: string;
}

export interface AssignTechnicianPayload {
  technicianId: number;
  remarks?: string;
}

export interface UpdateTicketStatusPayload {
  status: TicketStatus;
  remarks?: string;
}

export interface UpdateTicketPriorityPayload {
  priority: Priority;
  remarks?: string;
}

export interface VerifyTicketPayload {
  verified: boolean;
  remarks?: string;
}

export interface CloseTicketPayload {
  resolution: string;
  remarks?: string;
}

export interface RejectTicketPayload {
  reason: string;
  remarks?: string;
}

export interface TicketSummary {
  total: number;
  open: number;
  assigned: number;
  acknowledged: number;
  inProgress: number;
  onHold: number;
  completed: number;
  resolved: number;
  verified: number;
  closed: number;
  rejected: number;
  cancelled: number;
  reopened: number;

  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface TicketTimelineItem {
  id: number;
  action: string;
  description: string;

  performedBy?: string | null;
  performedByUserId?: number | null;
  performedAt: string;

  icon?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface TicketComment {
  id: number;
  comment: string;

  commentedBy?: string | null;
  commentedByUserId?: number | null;

  createdAt: string;
  editedAt?: string | null;
}

export interface CreateTicketCommentPayload {
  comment: string;
}

export interface TicketAttachment {
  id: number;

  fileName: string;
  fileType: string;
  fileSize: number;

  uploadedBy?: string | null;
  uploadedAt: string;

  downloadUrl?: string | null;
}

export interface TicketSla {
  responseDueAt?: string | null;
  resolutionDueAt?: string | null;

  responseRemainingMinutes?: number | null;
  resolutionRemainingMinutes?: number | null;

  responseBreached: boolean;
  resolutionBreached: boolean;
}

export interface TicketWorkOrderResponse {
  workOrderId: number;
  workOrderCode: string;
}

export interface CreateTicketPayload {
  alarmId: number;
  deviceId: string;
  tenantId: string;
  siteCode: string;
  ruleId: number;
  title: string;
  description: string;
  severity: Severity;
  assignedUserId: number;
  assignedUserName: string;
}
