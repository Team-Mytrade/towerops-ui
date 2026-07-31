import { Severity } from '../../../../core/models/application.enums';

export type AlertStatus = 'OPEN' | 'RESOLVED';

export interface Alert {
  id: number;
  alertCode: string;
  deviceId: string;
  ruleId: number;
  ruleName: string;
  alertType: string;
  severity: Severity;
  message: string;
  acknowledged: boolean;
  timestamp: string;
  status: AlertStatus;

  // Optional display context supplied by some aggregate endpoints.
  title?: string;
  siteId?: number | null;
  siteCode?: string | null;
  siteName?: string | null;
  deviceCode?: string | null;
  deviceName?: string | null;
  ticketId?: number | null;
  ticketCode?: string | null;
}

export interface AlertPayload {
  deviceId: string;
  ruleId: number;
  ruleName: string;
  alertType: string;
  severity: Severity;
  message: string;
}
