export type NotificationSeverity =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export interface NotificationConfig {
  id: number;
  name: string;
  eventType: string;
  subject: string;
  body: string;
  severity: NotificationSeverity;
  emailEnabled: boolean;
  smsEnabled: boolean;
  websocketEnabled: boolean;
  emailRecipients: string;
  phoneRecipients: string;
  active: boolean;
}

export type NotificationConfigPayload =
  Omit<NotificationConfig, 'id'>;
