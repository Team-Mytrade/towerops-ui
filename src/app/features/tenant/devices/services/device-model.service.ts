import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs';

import {
  ApiResponse
} from '../../../../core/api/api.types';

import {
  BaseService
} from '../../../../core/base/base.service';

import {
  DeviceModel,
  DeviceModelListQuery,
  DeviceModelPayload
} from '../models/device-model.models';
import { QueryParams } from '../../../../core/api/api-query.types';

@Injectable({
  providedIn: 'root'
})
export class DeviceModelService extends BaseService {
  private readonly endpoint =
    'device-models';

  getDeviceModels(
    query?: DeviceModelListQuery
  ): Observable<ApiResponse<DeviceModel[]>> {
    return this.api.get<DeviceModel[]>(
      this.endpoint,
      this.withQuery(
        this.toQueryParams(query)
      )
    );
  }

  getById(
    deviceModelId: number | string
  ): Observable<ApiResponse<DeviceModel>> {
    return this.api.get<DeviceModel>(
      this.buildUrl(
        this.endpoint,
        deviceModelId
      )
    );
  }

  private toQueryParams(
    query?: DeviceModelListQuery
  ): QueryParams | undefined {
    if (!query) {
      return undefined;
    }

    return {
      category: query.category,
      protocol: query.protocol,
      connectivityType: query.connectivityType,
      enabled: query.enabled,
      page: query.page,
      size: query.size,
      sort: query.sort
    };
  }

    create(
    payload: DeviceModelPayload
  ): Observable<ApiResponse<DeviceModel>> {
    return this.api.post<
      DeviceModel,
      DeviceModelPayload
    >(
      this.endpoint,
      payload
    );
  }

  update(
    deviceModelId: number | string,
    payload: DeviceModelPayload
  ): Observable<ApiResponse<DeviceModel>> {
    return this.api.put<
      DeviceModel,
      DeviceModelPayload
    >(
      this.buildUrl(
        this.endpoint,
        deviceModelId
      ),
      payload
    );
  }

    delete(
    deviceModelId: number | string
  ): Observable<ApiResponse<void>> {
    return this.api.delete<void>(
      this.buildUrl(
        this.endpoint,
        deviceModelId
      )
    );
  }

  changeStatus(
    deviceModelId: number | string,
    enabled: boolean
  ): Observable<ApiResponse<DeviceModel>> {
    return this.api.patch<
      DeviceModel,
      { enabled: boolean }
    >(
      this.buildUrl(
        this.endpoint,
        deviceModelId,
        'status'
      ),
      {
        enabled
      }
    );
  }
}
