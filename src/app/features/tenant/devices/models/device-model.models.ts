import {
  PageRequest
} from '../../../../core/api/api.types';

import {
  DeviceCategory
} from './device.models';

export type DeviceProtocol =
  | 'MQTT'
  | 'HTTP'
  | 'HTTPS'
  | 'MODBUS'
  | 'SNMP'
  | 'WEBSOCKET'
  | 'LORA'
  | 'ZIGBEE'
  | 'BLE'
  | 'CUSTOM';

export type DeviceConnectivityType =
  | 'ETHERNET'
  | 'WIFI'
  | 'CELLULAR'
  | 'LORA'
  | 'ZIGBEE'
  | 'BLUETOOTH'
  | 'SATELLITE'
  | 'SERIAL'
  | 'OTHER';

export interface DeviceModel {
  id: number;

  modelCode: string;
  modelName: string;
  manufacturer: string | null;

  category: DeviceCategory;
  description: string | null;

  protocol: DeviceProtocol | null;
  connectivityType:
    DeviceConnectivityType | null;

  defaultFirmwareVersion: string | null;

  supportedMetrics: string[];

  samplingIntervalSeconds: number | null;
  heartbeatIntervalSeconds: number | null;

  enabled: boolean;

  deviceCount?: number | null;

  createdAt?: string | null;
  updatedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface DeviceModelPayload {
  modelCode: string;
  modelName: string;
  manufacturer: string | null;

  category: DeviceCategory;
  description: string | null;

  protocol: DeviceProtocol | null;
  connectivityType:
    DeviceConnectivityType | null;

  defaultFirmwareVersion: string | null;

  supportedMetrics: string[];

  samplingIntervalSeconds: number | null;
  heartbeatIntervalSeconds: number | null;

  enabled: boolean;
}

export interface DeviceModelListQuery
  extends PageRequest {
  category?: DeviceCategory;
  protocol?: DeviceProtocol;
  connectivityType?: DeviceConnectivityType;
  enabled?: boolean;
}