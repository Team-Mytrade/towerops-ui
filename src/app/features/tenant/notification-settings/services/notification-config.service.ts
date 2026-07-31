import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiResponse } from '../../../../core/api/api.types';
import { BaseService } from '../../../../core/base/base.service';
import {
  NotificationConfig,
  NotificationConfigPayload
} from '../models/notification-config.models';

type RawOrEnvelope<T> = T | ApiResponse<T>;

@Injectable({ providedIn: 'root' })
export class NotificationConfigService extends BaseService {
  private readonly endpoint = 'notification-configs';

  getConfigs(): Observable<NotificationConfig[]> {
    return (
      this.api.get<NotificationConfig[]>(this.endpoint) as unknown as
        Observable<RawOrEnvelope<NotificationConfig[]>>
    ).pipe(map(response => this.unwrap(response)));
  }

  getById(id: number): Observable<NotificationConfig> {
    return (
      this.api.get<NotificationConfig>(
        this.buildUrl(this.endpoint, id)
      ) as unknown as Observable<RawOrEnvelope<NotificationConfig>>
    ).pipe(map(response => this.unwrap(response)));
  }

  create(
    payload: NotificationConfigPayload
  ): Observable<NotificationConfig> {
    return (
      this.api.post<NotificationConfig, NotificationConfigPayload>(
        this.endpoint,
        payload
      ) as unknown as Observable<RawOrEnvelope<NotificationConfig>>
    ).pipe(map(response => this.unwrap(response)));
  }

  update(
    id: number,
    payload: NotificationConfigPayload
  ): Observable<NotificationConfig> {
    return (
      this.api.put<NotificationConfig, NotificationConfigPayload>(
        this.buildUrl(this.endpoint, id),
        payload
      ) as unknown as Observable<RawOrEnvelope<NotificationConfig>>
    ).pipe(map(response => this.unwrap(response)));
  }

  delete(id: number): Observable<void> {
    return this.api
      .delete<void>(this.buildUrl(this.endpoint, id))
      .pipe(map(() => undefined));
  }

  private unwrap<T>(response: RawOrEnvelope<T>): T {
    if (
      response !== null &&
      typeof response === 'object' &&
      !Array.isArray(response) &&
      'data' in response
    ) {
      return (response as ApiResponse<T>).data;
    }
    return response as T;
  }
}
