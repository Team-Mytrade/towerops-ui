import { QueryParams } from '../../../../core/api/api-query.types';
import { PageRequest } from '../../../../core/api/api.types';

export type DeviceStatus =
  | 'ACTIVE'
  | 'ONLINE'
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

export interface Device {
  id: number;

  deviceCode: string;
  serialNumber: string;
  deviceName: string;

  category: DeviceCategory;
  status: DeviceStatus;

  deviceModelId?: number | null;
  deviceModelCode?: string | null;
  deviceModelName?: string | null;
  manufacturer?: string | null;

  siteId?: number | null;
  siteCode?: string | null;
  siteName?: string | null;

  firmwareVersion?: string | null;
  ipAddress?: string | null;
  macAddress?: string | null;

  lastSeenAt?: string | null;
  lastTelemetryAt?: string | null;

  healthScore?: number | null;
  openAlerts?: number;

  enabled: boolean;
  active: boolean;

  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface DevicePayload {
  deviceCode: string;
  serialNumber: string;
  deviceName: string;
  category: DeviceCategory;
  deviceModelId: number | null;
  siteId: number | null;
  firmwareVersion: string;
  ipAddress: string;
  macAddress: string;
  status: DeviceStatus;
}

export interface DeviceListQuery extends QueryParams {
  siteId?: number;
  category?: DeviceCategory;
  modelId?: number;
  status?: DeviceStatus;
  enabled?: boolean;
  active?: boolean;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface DeviceModel {
  id: number;
  modelCode: string;
  modelName: string;
  manufacturer?: string | null;
  description?: string | null;
  category?: DeviceCategory | null;
  enabled?: boolean;
}

export interface DeviceModelListQuery
  extends PageRequest {
  category?: DeviceCategory;
  enabled?: boolean;
}
export interface DeviceLookup {
  id: number;
  deviceCode: string;
  deviceName: string;
}