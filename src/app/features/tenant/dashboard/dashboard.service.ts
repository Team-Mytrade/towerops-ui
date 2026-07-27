import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../../core/api/api.types';
import { BaseService } from '../../../core/base/base.service';
import { SiteCategory } from '../../../core/models/application.enums';
import {
  CategoryDashboardSummary,
  DashboardAlert,
  DashboardMapSite,
  DashboardWorkOrder
} from './dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class TenantDashboardService extends BaseService {
  getSummary(
    category: SiteCategory
  ): Observable<ApiResponse<CategoryDashboardSummary>> {
    return this.api.get<CategoryDashboardSummary>(
      `/dashboard/categories/${category}`
    );
  }

  getMapSites(
    category: SiteCategory
  ): Observable<ApiResponse<DashboardMapSite[]>> {
    return this.api.get<DashboardMapSite[]>(
      `/map/sites/category/${category}`
    );
  }

  getCriticalAlerts(
    category: SiteCategory,
    limit = 5
  ): Observable<ApiResponse<DashboardAlert[]>> {
    return this.api.get<DashboardAlert[]>(
      `/dashboard/categories/${category}/critical-alerts`,
      {
        query: {
          limit
        }
      }
    );
  }

  getActiveWorkOrders(
    category: SiteCategory,
    limit = 5
  ): Observable<ApiResponse<DashboardWorkOrder[]>> {
    return this.api.get<DashboardWorkOrder[]>(
      `/dashboard/categories/${category}/active-work-orders`,
      {
        query: {
          limit
        }
      }
    );
  }
}