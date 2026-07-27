import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../../core/api/api.types';
import { BaseService } from '../../../core/base/base.service';
import { SiteCategorySummary } from './entry.models';

@Injectable({
  providedIn: 'root'
})
export class TenantEntryService extends BaseService {
  getCategorySummary():
    Observable<ApiResponse<SiteCategorySummary[]>> {
    return this.api.get<SiteCategorySummary[]>(
      '/sites/category/summary'
    );
  }
}