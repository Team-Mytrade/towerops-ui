import {
  Severity,
  WorkOrderStatus
} from '../../../../core/models/application.enums';

import {
  WorkOrderFormOption,
  WorkOrderFormValue
} from '../models/work-order-form.models';

export const WORK_ORDER_FORM_STATUS_OPTIONS:
  WorkOrderFormOption<WorkOrderStatus>[] = [
    {
      label: 'Created',
      value: 'CREATED',
      description: 'Work order has been created but not assigned.'
    },
    {
      label: 'Assigned',
      value: 'ASSIGNED',
      description: 'A technician has been assigned.'
    },
    {
      label: 'Scheduled',
      value: 'SCHEDULED',
      description: 'The work has been scheduled.'
    },
    {
      label: 'In Progress',
      value: 'IN_PROGRESS',
      description: 'The technician has started the work.'
    },
    {
      label: 'Completed',
      value: 'COMPLETED',
      description: 'The field work has been completed.'
    },
    {
      label: 'Verified',
      value: 'VERIFIED',
      description: 'The completed work has been verified.'
    },
    {
      label: 'Closed',
      value: 'CLOSED',
      description: 'The work order is fully closed.'
    },
    {
      label: 'Cancelled',
      value: 'CANCELLED',
      description: 'The work order has been cancelled.'
    }
  ];

export const WORK_ORDER_FORM_SEVERITY_OPTIONS:
  WorkOrderFormOption<Severity>[] = [
    {
      label: 'Low',
      value: 'LOW',
      description: 'Can be handled during normal operations.'
    },
    {
      label: 'Medium',
      value: 'MEDIUM',
      description: 'Requires attention within the planned schedule.'
    },
    {
      label: 'High',
      value: 'HIGH',
      description: 'Requires prompt operational attention.'
    },
    {
      label: 'Critical',
      value: 'CRITICAL',
      description: 'Requires immediate action.'
    }
  ];

export const WORK_ORDER_PRIORITY_OPTIONS:
  WorkOrderFormOption<number>[] = [
    {
      label: 'Priority 1 · Critical',
      value: 1,
      description: 'Immediate response required.'
    },
    {
      label: 'Priority 2 · High',
      value: 2,
      description: 'Resolve as soon as possible.'
    },
    {
      label: 'Priority 3 · Medium',
      value: 3,
      description: 'Handle within the planned schedule.'
    },
    {
      label: 'Priority 4 · Low',
      value: 4,
      description: 'Routine operational work.'
    }
  ];

export const CREATE_WORK_ORDER_INITIAL_VALUE:
  WorkOrderFormValue = {
    workOrderCode: '',

    title: '',
    description: '',

    status: 'CREATED',
    severity: 'MEDIUM',
    priority: 3,

    technicianId: null,

    siteId: null,
    deviceId: null,
    alertId: null,
    ticketId: null,

    scheduledAt: null,
    estimatedHours: null,

    startedAt: null,
    completedAt: null,

    laborHours: null,
    resolution: '',
    remarks: ''
  };

export const WORK_ORDER_TITLE_MAX_LENGTH = 150;
export const WORK_ORDER_DESCRIPTION_MAX_LENGTH = 2000;
export const WORK_ORDER_RESOLUTION_MAX_LENGTH = 3000;
export const WORK_ORDER_REMARKS_MAX_LENGTH = 2000;

export const WORK_ORDER_ESTIMATED_HOURS_MIN = 0.25;
export const WORK_ORDER_ESTIMATED_HOURS_MAX = 999;

export const WORK_ORDER_LABOR_HOURS_MIN = 0;
export const WORK_ORDER_LABOR_HOURS_MAX = 999;