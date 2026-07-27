import {
  Severity,
  WorkOrderStatus
} from '../../../../core/models/application.enums';

export interface WorkOrderOption<T> {
  label: string;
  value: T;
}

export const WORK_ORDER_STATUSES: WorkOrderStatus[] = [
  'CREATED',
  'ASSIGNED',
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'VERIFIED',
  'CLOSED',
  'CANCELLED'
];

export const WORK_ORDER_STATUS_OPTIONS:
  WorkOrderOption<WorkOrderStatus>[] = [
    {
      label: 'Created',
      value: 'CREATED'
    },
    {
      label: 'Assigned',
      value: 'ASSIGNED'
    },
    {
      label: 'Scheduled',
      value: 'SCHEDULED'
    },
    {
      label: 'In Progress',
      value: 'IN_PROGRESS'
    },
    {
      label: 'Completed',
      value: 'COMPLETED'
    },
    {
      label: 'Verified',
      value: 'VERIFIED'
    },
    {
      label: 'Closed',
      value: 'CLOSED'
    },
    {
      label: 'Cancelled',
      value: 'CANCELLED'
    }
  ];

export const WORK_ORDER_SEVERITY_OPTIONS:
  WorkOrderOption<Severity>[] = [
    {
      label: 'Low',
      value: 'LOW'
    },
    {
      label: 'Medium',
      value: 'MEDIUM'
    },
    {
      label: 'High',
      value: 'HIGH'
    },
    {
      label: 'Critical',
      value: 'CRITICAL'
    }
  ];  