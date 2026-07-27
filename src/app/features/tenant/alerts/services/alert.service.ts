import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../../../core/api/api.types';
import { BaseService } from '../../../../core/base/base.service';

import {
  AcknowledgeAlertPayload,
  Alert,
  AlertListQuery,
  ResolveAlertPayload
} from '../models/alert.models';

@Injectable({
  providedIn: 'root'
})
export class AlertService extends BaseService {
  private readonly endpoint = 'alerts';

  getAlerts(
    query?: AlertListQuery
  ): Observable<ApiResponse<Alert[]>> {
    return this.api.get<Alert[]>(
      this.endpoint,
      this.withQuery(query)
    );
  }

  getById(
    alertId: number | string
  ): Observable<ApiResponse<Alert>> {
    return this.api.get<Alert>(
      this.buildUrl(this.endpoint, alertId)
    );
  }

  acknowledge(
    alertId: number | string,
    payload: AcknowledgeAlertPayload = {}
  ): Observable<ApiResponse<Alert>> {
    return this.api.patch<
      Alert,
      AcknowledgeAlertPayload
    >(
      this.buildUrl(
        this.endpoint,
        alertId,
        'acknowledge'
      ),
      payload
    );
  }

  resolve(
    alertId: number | string,
    payload: ResolveAlertPayload
  ): Observable<ApiResponse<Alert>> {
    return this.api.patch<
      Alert,
      ResolveAlertPayload
    >(
      this.buildUrl(
        this.endpoint,
        alertId,
        'resolve'
      ),
      payload
    );
  }

  suppress(
    alertId: number | string,
    remarks?: string
  ): Observable<ApiResponse<Alert>> {
    return this.api.patch<
      Alert,
      { remarks?: string }
    >(
      this.buildUrl(
        this.endpoint,
        alertId,
        'suppress'
      ),
      { remarks }
    );
  }

  reopen(
    alertId: number | string
  ): Observable<ApiResponse<Alert>> {
    return this.api.patch<Alert>(
      this.buildUrl(
        this.endpoint,
        alertId,
        'reopen'
      )
    );
  }

  createTicket(
    alertId: number | string
  ): Observable<ApiResponse<{
    ticketId: number;
    ticketCode: string;
  }>> {
    return this.api.post(
      this.buildUrl(
        this.endpoint,
        alertId,
        'create-ticket'
      )
    );
  }
}