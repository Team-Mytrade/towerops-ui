import { WorkOrder } from '../models/work-order.models';

import {
  CreateWorkOrderRequest,
  UpdateWorkOrderRequest,
  WorkOrderFormValue
} from '../models/work-order-form.models';

import { Technician } from '../../../technician/models/technician.models';
import { Site } from '../../sites/models/site.models';

import {
  WorkOrderSiteOption,
  WorkOrderTechnicianOption
} from '../models/work-order-form.models';

export function mapTechniciansToOptions(
  technicians: Technician[]
): WorkOrderTechnicianOption[] {
  return technicians.map(
    technician => ({
      label:
        technician.technicianName ??
        technician.technicianCode ??
        `Technician #${technician.id}`,

      value:
        technician.id,

      technicianCode:
        technician.technicianCode,

      email:
        technician.email,

      phoneNumber:
        technician.phoneNumber,

      active:
        technician.active
    })
  );
}

export function mapSitesToOptions(
  sites: Site[]
): WorkOrderSiteOption[] {
  return sites.map(
    site => ({
      label:
        site.siteName ??
        site.siteCode ??
        `Site #${site.id}`,

      value:
        site.id,

      siteCode:
        site.siteCode,

      siteName:
        site.siteName,

      category:
        site.category ?? null,

      healthStatus:
        site.healthStatus ?? null
    })
  );
}
export function mapWorkOrderToForm(
  workOrder: WorkOrder
): WorkOrderFormValue {
  return {
    workOrderCode:
      normalizeText(workOrder.workOrderCode),

    title:
      normalizeText(workOrder.title),

    description:
      normalizeText(workOrder.description),

    status:
      workOrder.status ?? 'CREATED',

    severity:
      workOrder.severity ?? null,

    priority:
      toNullableNumber(workOrder.priority),

    technicianId:
      toNullableNumber(workOrder.technicianId),

    siteId:
      toNullableNumber(workOrder.siteId),

    deviceId:
      toNullableNumber(workOrder.deviceId),

    alertId:
      toNullableNumber(workOrder.alertId),

    ticketId:
      toNullableNumber(workOrder.ticketId),

    scheduledAt:
      toNullableDate(workOrder.scheduledAt),

    estimatedHours:
      toNullableNumber(workOrder.estimatedHours),

    startedAt:
      toNullableDate(workOrder.startedAt),

    completedAt:
      toNullableDate(workOrder.completedAt),

    laborHours:
      toNullableNumber(workOrder.laborHours),

    resolution:
      normalizeText(workOrder.resolution),

    remarks:
      normalizeText(workOrder.remarks)
  };
}

/**
 * Maps the reactive-form value into the create API payload.
 */
export function mapFormToCreateRequest(
  formValue: WorkOrderFormValue
): CreateWorkOrderRequest {
  return {
    workOrderCode:
      normalizeText(formValue.workOrderCode),

    title:
      normalizeText(formValue.title),

    description:
      normalizeText(formValue.description),

    status:
      formValue.status,

    severity:
      formValue.severity,

    priority:
      toNullableNumber(formValue.priority),

    technicianId:
      toNullableNumber(formValue.technicianId),

    siteId:
      toNullableNumber(formValue.siteId),

    deviceId:
      toNullableNumber(formValue.deviceId),

    alertId:
      toNullableNumber(formValue.alertId),

    ticketId:
      toNullableNumber(formValue.ticketId),

    scheduledAt:
      toNullableIsoString(formValue.scheduledAt),

    estimatedHours:
      toNullableNumber(formValue.estimatedHours),

    startedAt:
      toNullableIsoString(formValue.startedAt),

    completedAt:
      toNullableIsoString(formValue.completedAt),

    laborHours:
      toNullableNumber(formValue.laborHours),

    resolution:
      normalizeText(formValue.resolution),

    remarks:
      normalizeText(formValue.remarks)
  };
}

/**
 * Maps the reactive-form value into the update API payload.
 *
 * Currently create and update payloads share the same shape.
 */
export function mapFormToUpdateRequest(
  formValue: WorkOrderFormValue
): UpdateWorkOrderRequest {
  return mapFormToCreateRequest(formValue);
}

/**
 * Converts an API date string into a valid Date object.
 */
function toNullableDate(
  value: Date | string | null | undefined
): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : new Date(value.getTime());
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

/**
 * Converts a form date into an ISO-8601 API value.
 */
function toNullableIsoString(
  value: Date | string | null | undefined
): string | null {
  const date = toNullableDate(value);

  return date
    ? date.toISOString()
    : null;
}

function toNullableNumber(
  value: number | string | null | undefined
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : null;
}

function normalizeText(
  value: string | null | undefined
): string {
  return value?.trim() ?? '';
}