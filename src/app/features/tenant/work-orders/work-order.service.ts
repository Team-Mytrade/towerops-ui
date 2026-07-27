import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseService } from '../../../core/base/base.service';

import {
  WorkOrder,
  WorkOrderListQuery,
  WorkOrderPage,
  WorkOrderPayload,
  WorkOrderSummary
} from './models/work-order.models';
import { QueryParams } from '../../../core/api/api-query.types';
import { ApiResponse } from '../../../core/api/api.types';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderService extends BaseService {
  private readonly endpoint = '/work-orders';

  getWorkOrders(
    query: WorkOrderListQuery = {}
  ): Observable<ApiResponse<WorkOrderPage>> {
    return this.api.get<WorkOrderPage>(
      this.endpoint,
      {
        query: this.buildQuery(query)
      }
    );
  }

  getWorkOrderById(
    workOrderId: number
  ): Observable<ApiResponse<WorkOrder>> {
    return this.api.get<WorkOrder>(
      `${this.endpoint}/${workOrderId}`
    );
  }

  getSummary(
    query: Pick<
      WorkOrderListQuery,
      'category' | 'technicianId' | 'siteId'
    > = {}
  ): Observable<ApiResponse<WorkOrderSummary>> {
    return this.api.get<WorkOrderSummary>(
      `${this.endpoint}/summary`,
      {
        query: this.buildQuery(query)
      }
    );
  }

  createWorkOrder(
    payload: WorkOrderPayload
  ): Observable<ApiResponse<WorkOrder>> {
    return this.api.post<
      WorkOrder,
      WorkOrderPayload
    >(
      this.endpoint,
      payload
    );
  }

  updateWorkOrder(
    workOrderId: number,
    payload: WorkOrderPayload
  ): Observable<ApiResponse<WorkOrder>> {
    return this.api.put<
      WorkOrder,
      WorkOrderPayload
    >(
      `${this.endpoint}/${workOrderId}`,
      payload
    );
  }

  deleteWorkOrder(
  workOrderId: number
): Observable<ApiResponse<void>> {
  return this.api.delete<void>(
    `${this.endpoint}/${workOrderId}`
  );
}

  assignTechnician(
    workOrderId: number,
    technicianId: number
  ): Observable<ApiResponse<WorkOrder>> {
    return this.api.patch<
      WorkOrder,
      {
        technicianId: number;
      }
    >(
      `${this.endpoint}/${workOrderId}/assign`,
      {
        technicianId
      }
    );
  }

  updateStatus(
    workOrderId: number,
    status: WorkOrder['status'],
    remarks?: string | null
  ): Observable<ApiResponse<WorkOrder>> {
    return this.api.patch<
      WorkOrder,
      {
        status: WorkOrder['status'];
        remarks: string | null;
      }
    >(
      `${this.endpoint}/${workOrderId}/status`,
      {
        status,
        remarks: remarks ?? null
      }
    );
  }

  startWorkOrder(
    workOrderId: number,
    remarks?: string | null
  ): Observable<ApiResponse<WorkOrder>> {
    return this.api.patch<
      WorkOrder,
      {
        remarks: string | null;
      }
    >(
      `${this.endpoint}/${workOrderId}/start`,
      {
        remarks: remarks ?? null
      }
    );
  }

  completeWorkOrder(
    workOrderId: number,
    payload: {
      resolution: string;
      laborHours?: number | null;
      remarks?: string | null;
    }
  ): Observable<ApiResponse<WorkOrder>> {
    return this.api.patch<
      WorkOrder,
      {
        resolution: string;
        laborHours?: number | null;
        remarks?: string | null;
      }
    >(
      `${this.endpoint}/${workOrderId}/complete`,
      payload
    );
  }

  verifyWorkOrder(
    workOrderId: number,
    remarks?: string | null
  ): Observable<ApiResponse<WorkOrder>> {
    return this.api.patch<
      WorkOrder,
      {
        remarks: string | null;
      }
    >(
      `${this.endpoint}/${workOrderId}/verify`,
      {
        remarks: remarks ?? null
      }
    );
  }

  closeWorkOrder(
    workOrderId: number,
    remarks?: string | null
  ): Observable<ApiResponse<WorkOrder>> {
    return this.api.patch<
      WorkOrder,
      {
        remarks: string | null;
      }
    >(
      `${this.endpoint}/${workOrderId}/close`,
      {
        remarks: remarks ?? null
      }
    );
  }

  cancelWorkOrder(
    workOrderId: number,
    remarks: string
  ): Observable<ApiResponse<WorkOrder>> {
    return this.api.patch<
      WorkOrder,
      {
        remarks: string;
      }
    >(
      `${this.endpoint}/${workOrderId}/cancel`,
      {
        remarks
      }
    );
  }

  private buildQuery(
    query: WorkOrderListQuery
  ): QueryParams {
    const params: QueryParams = {};

    if (query.page !== undefined) {
      params['page'] = query.page;
    }

    if (query.size !== undefined) {
      params['size'] = query.size;
    }

    if (query.search?.trim()) {
      params['search'] = query.search.trim();
    }

    if (query.category) {
      params['category'] = query.category;
    }

    if (query.status) {
      params['status'] = query.status;
    }

    if (query.severity) {
      params['severity'] = query.severity;
    }

    if (
      query.technicianId !== null &&
      query.technicianId !== undefined
    ) {
      params['technicianId'] =
        query.technicianId;
    }

    if (
      query.siteId !== null &&
      query.siteId !== undefined
    ) {
      params['siteId'] = query.siteId;
    }

    if (query.fromDate) {
      params['fromDate'] = query.fromDate;
    }

    if (query.toDate) {
      params['toDate'] = query.toDate;
    }

    return params;
  }

  
}