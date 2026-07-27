export type UserType =
  | 'SUPER_ADMIN'
  | 'TENANT_ADMIN'
  | 'ADMIN'
  | 'TECHNICIAN'
  | 'CUSTOMER';

export type SiteCategory =
  | 'TOWER'
  | 'BUILDING'
  | 'WAREHOUSE'
  | 'TELECOM'
  | 'POWER'
  | 'GENERATOR'
  | 'FACILITY'
  | 'MARINE'
  | 'AVIATION'
  | 'DEFENSE'
  | 'AI_OPS_CENTER';

export type SiteHealthStatus =
  | 'HEALTHY'
  | 'WARNING'
  | 'CRITICAL'
  | 'OFFLINE'
  | 'MAINTENANCE'
  | 'UNKNOWN';

export type Severity =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL'
  | 'ERROR';

export type Priority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';


export type AlertStatus =
  | 'OPEN'
  | 'ACTIVE'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'SUPPRESSED';

export type AlertSource =
  | 'RULE_ENGINE'
  | 'DEVICE'
  | 'SYSTEM'
  | 'USER'
  | 'API'
  | 'MONITORING';

export type TicketStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'VERIFIED'
  | 'RESOLVED'
  | 'CONFIRMED'
  | 'CLOSED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'REOPENED';

export type TicketSource =
  | 'ALERT'
  | 'RULE_ENGINE'
  | 'DEVICE'
  | 'SYSTEM'
  | 'MANUAL'
  | 'API'
  | 'MONITORING';

export type WorkOrderStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'VERIFIED'
  | 'APPROVED'
  | 'CLOSED'
  | 'CANCELLED'
  | 'REOPENED';

export type WorkOrderPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type TechnicianStatus =
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'ON_DUTY'
  | 'OFF_DUTY'
  | 'ON_SITE'
  | 'TRAVELLING'
  | 'ON_LEAVE'
  | 'INACTIVE';

export type TechnicianSkill =
  | 'RF'
  | 'POWER'
  | 'GENERATOR'
  | 'HVAC'
  | 'NETWORK'
  | 'ELECTRICAL'
  | 'SECURITY'
  | 'GENERAL';

export type DeviceStatus =
  | 'ONLINE'
  | 'ACTIVE'
  | 'OFFLINE'
  | 'INACTIVE'
  | 'MAINTENANCE'
  | 'FAULT'
  | 'RETIRED'
  | 'UNKNOWN';

export type DeviceCategory =
  | 'SENSOR'
  | 'GATEWAY'
  | 'GENERATOR'
  | 'POWER_METER'
  | 'FUEL_SENSOR'
  | 'TEMPERATURE_SENSOR'
  | 'BATTERY'
  | 'TRANSMITTER'
  | 'RECEIVER'
  | 'NETWORK_DEVICE'
  | 'CAMERA'
  | 'ACCESS_CONTROL'
  | 'OTHER';

export type RuleStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'DRAFT';

export type RuleCategory =
  | 'CONDITION'
  | 'REGEX'
  | 'THRESHOLD'
  | 'RANGE'
  | 'STATE_CHANGE'
  | 'ABSENCE'
  | 'AGGREGATION'
  | 'SCHEDULE'
  | 'GEO_FENCE'
  | 'DUPLICATE'
  | 'SCRIPT';

export type RuleScope =
  | 'GLOBAL'
  | 'TENANT'
  | 'SITE'
  | 'DEVICE';

export type RuleAction =
  | 'ALERT'
  | 'TICKET'
  | 'NOTIFICATION'
  | 'WEBHOOK'
  | 'EMAIL'
  | 'SMS';

export type MaintenanceType =
  | 'PREVENTIVE'
  | 'CORRECTIVE'
  | 'EMERGENCY'
  | 'PREDICTIVE';

export type DashboardPeriod =
  | 'TODAY'
  | 'WEEK'
  | 'MONTH'
  | 'QUARTER'
  | 'YEAR';

export type MapLayer =
  | 'STREET'
  | 'SATELLITE'
  | 'TERRAIN';

export type NotificationType =
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING'
  | 'ERROR';

export type NotificationChannel =
  | 'IN_APP'
  | 'EMAIL'
  | 'SMS'
  | 'PUSH'
  | 'WEBHOOK';

export type AttachmentType =
  | 'IMAGE'
  | 'VIDEO'
  | 'PDF'
  | 'DOCUMENT'
  | 'AUDIO'
  | 'OTHER';