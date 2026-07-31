import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../../core/api/api.types';
import { AuthService } from '../../../core/auth/auth.service';
import { BaseService } from '../../../core/base/base.service';
import { SiteCategorySummary } from './entry.models';

@Injectable({
  providedIn: 'root'
})
export class TenantEntryService extends BaseService {
  private readonly authService = inject(AuthService);

  getCategorySummary():
    Observable<ApiResponse<SiteCategorySummary[]>> {
    const tenantId = this.authService.tenantId();

    return this.api.get<SiteCategorySummary[]>(
      '/sites/category/summary',
      {
        headers: tenantId
          ? { 'X-Tenant-Id': tenantId }
          : undefined
      }
    );
  }
}
