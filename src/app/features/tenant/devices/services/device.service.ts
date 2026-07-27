import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../../../core/api/api.types';
import { BaseService } from '../../../../core/base/base.service';

import {
  Device,
  DeviceListQuery,
  DevicePayload,
  DeviceStatus
} from '../models/device.models';
import { DeviceHealthSummary, DeviceTelemetryMetric, DeviceEvent, DeviceAlertSummary, DeviceCredentialSummary } from '../models/device-detail.models';

@Injectable({
  providedIn: 'root'
})
export class DeviceService extends BaseService {
  private readonly endpoint = 'devices';

  getDevices(
    query?: DeviceListQuery
  ): Observable<ApiResponse<Device[]>> {
    return this.api.get<Device[]>(
      this.endpoint,
      this.withQuery(query)
    );
  }

  getById(
    deviceId: number | string
  ): Observable<ApiResponse<Device>> {
    return this.api.get<Device>(
      this.buildUrl(
        this.endpoint,
        deviceId
      )
    );
  }

  create(
    payload: DevicePayload
  ): Observable<ApiResponse<Device>> {
    return this.api.post<
      Device,
      DevicePayload
    >(
      this.endpoint,
      payload
    );
  }

  update(
    deviceId: number | string,
    payload: DevicePayload
  ): Observable<ApiResponse<Device>> {
    return this.api.put<
      Device,
      DevicePayload
    >(
      this.buildUrl(
        this.endpoint,
        deviceId
      ),
      payload
    );
  }

  assignSite(
    deviceId: number | string,
    siteId: number
  ): Observable<ApiResponse<Device>> {
    return this.api.patch<
      Device,
      { siteId: number }
    >(
      this.buildUrl(
        this.endpoint,
        deviceId,
        'assign-site'
      ),
      {
        siteId
      }
    );
  }

  changeStatus(
    deviceId: number | string,
    status: DeviceStatus,
    reason?: string
  ): Observable<ApiResponse<Device>> {
    return this.api.patch<
      Device,
      {
        status: DeviceStatus;
        reason?: string;
      }
    >(
      this.buildUrl(
        this.endpoint,
        deviceId,
        'status'
      ),
      {
        status,
        reason
      }
    );
  }

  retire(
    deviceId: number | string,
    reason: string
  ): Observable<ApiResponse<Device>> {
    return this.api.patch<
      Device,
      { reason: string }
    >(
      this.buildUrl(
        this.endpoint,
        deviceId,
        'retire'
      ),
      {
        reason
      }
    );
  }

  getHealth(
  deviceId: number | string
): Observable<ApiResponse<DeviceHealthSummary>> {
  return this.api.get<DeviceHealthSummary>(
    this.buildUrl(
      this.endpoint,
      deviceId,
      'health'
    )
  );
}

getLatestTelemetry(
  deviceId: number | string
): Observable<ApiResponse<DeviceTelemetryMetric[]>> {
  return this.api.get<DeviceTelemetryMetric[]>(
    this.buildUrl(
      this.endpoint,
      deviceId,
      'telemetry',
      'latest'
    )
  );
}

getEvents(
  deviceId: number | string,
  limit = 10
): Observable<ApiResponse<DeviceEvent[]>> {
  return this.api.get<DeviceEvent[]>(
    this.buildUrl(
      this.endpoint,
      deviceId,
      'events'
    ),
    this.withQuery({
      page: 0,
      size: limit,
      sort: 'createdAt,desc'
    })
  );
}

getAlerts(
  deviceId: number | string,
  limit = 5
): Observable<ApiResponse<DeviceAlertSummary[]>> {
  return this.api.get<DeviceAlertSummary[]>(
    this.buildUrl(
      this.endpoint,
      deviceId,
      'alerts'
    ),
    this.withQuery({
      page: 0,
      size: limit,
      status: 'OPEN'
    })
  );
}

getCredentials(
  deviceId: number | string
): Observable<ApiResponse<DeviceCredentialSummary[]>> {
  return this.api.get<DeviceCredentialSummary[]>(
    this.buildUrl(
      this.endpoint,
      deviceId,
      'credentials'
    )
  );
}
}