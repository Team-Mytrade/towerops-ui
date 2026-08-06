import { Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';

import { BaseService } from '../../../core/base/base.service';
import { AuthService } from '../../../core/auth/auth.service';
import { inject } from '@angular/core';

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
  private readonly auth = inject(AuthService);

  getWorkOrders(
    query: WorkOrderListQuery = {}
  ): Observable<ApiResponse<WorkOrderPage>> {
    return this.api.get<WorkOrder[]>(
      this.endpoint,
      query.status
        ? undefined
        : { query: this.buildQuery(query) }
    ).pipe(
      switchMap(response =>
        query.status
          ? this.api.get<WorkOrder[]>(
              `${this.endpoint}/status/${query.status}`
            )
          : [response]
      ),
      map(response => ({
        ...response,
        data: this.toPage(response.data ?? [], query)
      }))
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
    return this.api.get<WorkOrder[]>(this.endpoint).pipe(
      map(response => {
        const orders = this.filterOrders(response.data ?? [], query);
        return {
          ...response,
          data: this.summarize(orders)
        };
      })
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
    return this.updateFields(workOrderId, { technicianId, status: 'ASSIGNED' });
  }

  updateStatus(
    workOrderId: number,
    status: WorkOrder['status'],
    remarks?: string | null
  ): Observable<ApiResponse<WorkOrder>> {
    return this.updateFields(workOrderId, { status, remarks: remarks ?? null });
  }

  startWorkOrder(
    workOrderId: number,
    remarks?: string | null
  ): Observable<ApiResponse<WorkOrder>> {
    return this.updateFields(workOrderId, {
      status: 'IN_PROGRESS',
      startedAt: new Date().toISOString(),
      remarks: remarks ?? null
    });
  }

  completeWorkOrder(
    workOrderId: number,
    payload: {
      resolution: string;
      laborHours?: number | null;
      remarks?: string | null;
    }
  ): Observable<ApiResponse<WorkOrder>> {
    return this.updateFields(workOrderId, {
      ...payload,
      status: 'COMPLETED',
      completedAt: new Date().toISOString()
    });
  }

  verifyWorkOrder(
    workOrderId: number,
    remarks?: string | null
  ): Observable<ApiResponse<WorkOrder>> {
    return this.updateFields(workOrderId, { status: 'VERIFIED', remarks: remarks ?? null });
  }

  closeWorkOrder(
    workOrderId: number,
    remarks?: string | null
  ): Observable<ApiResponse<WorkOrder>> {
    return this.updateFields(workOrderId, { status: 'CLOSED', remarks: remarks ?? null });
  }

  cancelWorkOrder(
    workOrderId: number,
    remarks: string
  ): Observable<ApiResponse<WorkOrder>> {
    return this.updateFields(workOrderId, { status: 'CANCELLED', remarks });
  }

  private updateFields(
    workOrderId: number,
    changes: Partial<WorkOrderPayload>
  ): Observable<ApiResponse<WorkOrder>> {
    return this.getWorkOrderById(workOrderId).pipe(
      switchMap(response =>
        this.updateWorkOrder(workOrderId, {
          ...this.toPayload(response.data),
          ...changes
        })
      )
    );
  }

  private toPayload(order: WorkOrder): WorkOrderPayload {
    const {
      tenantId, workOrderCode, ticketId, alertId, technicianId, title,
      description, status, scheduledAt, startedAt, completedAt,
      resolution, laborHours, remarks
    } = order;
    return {
      tenantId: tenantId ?? this.auth.tenantId() ?? '',
      workOrderCode, ticketId, alertId, technicianId, title,
      description, status, scheduledAt, startedAt, completedAt,
      resolution, laborHours, remarks
    };
  }

  private filterOrders(
    orders: WorkOrder[],
    query: Partial<WorkOrderListQuery>
  ): WorkOrder[] {
    const search = query.search?.trim().toLowerCase();
    return orders.filter(order =>
      (!query.status || order.status === query.status) &&
      (!query.technicianId || order.technicianId === query.technicianId) &&
      (!query.siteId || order.siteId === query.siteId) &&
      (!query.category || order.siteCategory === query.category) &&
      (!query.severity || order.severity === query.severity) &&
      (!search || `${order.workOrderCode} ${order.title} ${order.description ?? ''}`
        .toLowerCase().includes(search))
    );
  }

  private toPage(orders: WorkOrder[], query: WorkOrderListQuery): WorkOrderPage {
    const filtered = this.filterOrders(orders, query);
    const page = query.page ?? 0;
    const size = query.size ?? Math.max(filtered.length, 1);
    const start = page * size;
    const totalPages = Math.ceil(filtered.length / size);
    return {
      content: filtered.slice(start, start + size),
      totalElements: filtered.length,
      totalPages,
      page,
      size,
      first: page === 0,
      last: page >= totalPages - 1
    };
  }

  private summarize(orders: WorkOrder[]): WorkOrderSummary {
    const count = (status: WorkOrder['status']) =>
      orders.filter(order => order.status === status).length;
    return {
      total: orders.length,
      created: count('CREATED'),
      assigned: count('ASSIGNED'),
      scheduled: count('SCHEDULED'),
      inProgress: count('IN_PROGRESS'),
      completed: count('COMPLETED'),
      overdue: 0
    };
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
