import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../../../core/api/api.types';
import { BaseService } from '../../../../core/base/base.service';
import { Alert, AlertPayload } from '../models/alert.models';

@Injectable({ providedIn: 'root' })
export class AlertService extends BaseService {
  private readonly endpoint = 'alerts';

  getAlerts(_query?: unknown): Observable<ApiResponse<Alert[]>> {
    return this.api.get<Alert[]>(
      this.endpoint,
      this.withoutUserHeader()
    ).pipe(map(response => this.normalizeResponse(response)));
  }

  getOpen(): Observable<ApiResponse<Alert[]>> {
    return this.api.get<Alert[]>(
      this.buildUrl(this.endpoint, 'open'),
      this.withoutUserHeader()
    ).pipe(map(response => this.normalizeResponse(response)));
  }

  getById(id: number | string): Observable<ApiResponse<Alert>> {
    return this.api.get<Alert>(
      this.buildUrl(this.endpoint, id),
      this.withoutUserHeader()
    ).pipe(map(response => this.normalizeResponse(response)));
  }

  getByDevice(deviceId: string): Observable<ApiResponse<Alert[]>> {
    return this.api.get<Alert[]>(
      this.buildUrl(this.endpoint, 'device', deviceId),
      this.withoutUserHeader()
    ).pipe(map(response => this.normalizeResponse(response)));
  }

  create(payload: AlertPayload): Observable<ApiResponse<Alert>> {
    return this.api.post<Alert, AlertPayload>(
      this.endpoint,
      payload,
      this.withoutUserHeader()
    ).pipe(map(response => this.normalizeResponse(response)));
  }

  acknowledge(id: number | string): Observable<ApiResponse<Alert>> {
    return this.api.put<Alert, Record<string, never>>(
      this.buildUrl(this.endpoint, id, 'acknowledge'),
      {},
      this.withoutUserHeader()
    ).pipe(map(response => this.normalizeResponse(response)));
  }

  resolve(id: number | string): Observable<ApiResponse<Alert>> {
    return this.api.put<Alert, Record<string, never>>(
      this.buildUrl(this.endpoint, id, 'resolve'),
      {},
      this.withoutUserHeader()
    ).pipe(map(response => this.normalizeResponse(response)));
  }

  delete(id: number | string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(
      this.buildUrl(this.endpoint, id),
      this.withoutUserHeader()
    );
  }

  private normalizeResponse<T>(
    response: ApiResponse<T> | T
  ): ApiResponse<T> {
    if (
      response !== null &&
      typeof response === 'object' &&
      'data' in response &&
      'success' in response
    ) {
      return response as ApiResponse<T>;
    }

    return {
      timestamp: Date.now(),
      success: true,
      message: '',
      data: response as T
    };
  }
}
