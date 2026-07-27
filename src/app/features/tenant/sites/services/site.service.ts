import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../../../core/api/api.types';
import { BaseService } from '../../../../core/base/base.service';
import { SiteCategory } from '../../../../core/models/application.enums';

import {
  Site,
  SiteListQuery,
  SitePayload
} from '../models/site.models';
import { SiteOperationalSummary, SiteTelemetryMetric, SiteDeviceSummary, SiteAlertSummary, SiteWorkOrderSummary } from '../models/site-detail.models';



@Injectable({
  providedIn: 'root'
})
export class SiteService extends BaseService {
  private readonly endpoint = 'sites';

  getSites(
    query?: SiteListQuery
  ): Observable<ApiResponse<Site[]>> {
    return this.api.get<Site[]>(
      this.endpoint,
      this.withQuery(query)
    );
  }

getById(
  siteId: number | string
): Observable<ApiResponse<Site>> {
  return this.api.get<Site>(
    this.buildUrl(
      this.endpoint,
      siteId
    ),
    this.withoutUserHeader()
  );
}

  getByCategory(
    category: SiteCategory,
    query?: Omit<SiteListQuery, 'category'>
  ): Observable<ApiResponse<Site[]>> {
    return this.api.get<Site[]>(
      this.buildUrl(
        this.endpoint,
        'category',
        category
      ),
      this.withQuery(query)
    );
  }

  create(
    payload: SitePayload
  ): Observable<ApiResponse<Site>> {
    return this.api.post<Site, SitePayload>(
      this.endpoint,
      payload
    );
  }

  update(
    siteId: number | string,
    payload: SitePayload
  ): Observable<ApiResponse<Site>> {
    return this.api.put<Site, SitePayload>(
      this.buildUrl(
        this.endpoint,
        siteId
      ),
      payload
    );
  }

  delete(
    siteId: number | string
  ): Observable<ApiResponse<void>> {
    return this.api.delete<void>(
      this.buildUrl(
        this.endpoint,
        siteId
      )
    );
  }

  enableSite(
    siteId: number | string
  ): Observable<ApiResponse<Site>> {
    return this.api.patch<Site>(
      this.buildUrl(
        this.endpoint,
        siteId,
        'enable'
      )
    );
  }

  disableSite(
    siteId: number | string,
    reason?: string
  ): Observable<ApiResponse<Site>> {
    return this.api.patch<
      Site,
      { reason?: string }
    >(
      this.buildUrl(
        this.endpoint,
        siteId,
        'disable'
      ),
      { reason }
    );
  }

  getOperationalSummary(
  siteId: number | string
): Observable<ApiResponse<SiteOperationalSummary>> {
  return this.api.get<SiteOperationalSummary>(
    this.buildUrl(
      this.endpoint,
      siteId,
      'summary'
    )
  );
}

getLatestTelemetry(
  siteId: number | string
): Observable<ApiResponse<SiteTelemetryMetric[]>> {
  return this.api.get<SiteTelemetryMetric[]>(
    this.buildUrl(
      this.endpoint,
      siteId,
      'telemetry',
      'latest'
    )
  );
}

getSiteDevices(
  siteId: number | string
): Observable<ApiResponse<SiteDeviceSummary[]>> {
  return this.api.get<SiteDeviceSummary[]>(
    this.buildUrl(
      'devices/site',
      siteId
    ),
        this.withoutUserHeader()

  );
}

getSiteAlerts(
  siteId: number | string,
  limit = 5
): Observable<ApiResponse<SiteAlertSummary[]>> {
  return this.api.get<SiteAlertSummary[]>(
    this.buildUrl(
      this.endpoint,
      siteId,
      'alerts'
    ),
    this.withQuery({
      page: 0,
      size: limit,
      status: 'OPEN'
    })
  );
}

getSiteWorkOrders(
  siteId: number | string,
  limit = 5
): Observable<ApiResponse<SiteWorkOrderSummary[]>> {
  return this.api.get<SiteWorkOrderSummary[]>(
    this.buildUrl(
      this.endpoint,
      siteId,
      'work-orders'
    ),
    this.withQuery({
      page: 0,
      size: limit
    })
  );
}
}