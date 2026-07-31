import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../../core/api/api.types';
import { BaseService } from '../../../core/base/base.service';
import {
  Technician,
  TechnicianPayload
} from '../models/technician.models';

@Injectable({ providedIn: 'root' })
export class TechnicianService extends BaseService {
  private readonly endpoint = 'technicians';

  getTechnicians(_query?: unknown): Observable<ApiResponse<Technician[]>> {
    return this.api.get<Technician[]>(
      this.endpoint,
      this.withoutUserHeader()
    );
  }

  getById(id: number | string): Observable<ApiResponse<Technician>> {
    return this.api.get<Technician>(
      this.buildUrl(this.endpoint, id),
      this.withoutUserHeader()
    );
  }

  getBySite(siteCode: string): Observable<ApiResponse<Technician[]>> {
    return this.api.get<Technician[]>(
      this.buildUrl(this.endpoint, 'site', siteCode),
      this.withoutUserHeader()
    );
  }

  getAvailable(): Observable<ApiResponse<Technician[]>> {
    return this.api.get<Technician[]>(
      this.buildUrl(this.endpoint, 'available'),
      this.withoutUserHeader()
    );
  }

  create(payload: TechnicianPayload): Observable<ApiResponse<Technician>> {
    return this.api.post<Technician, TechnicianPayload>(
      this.endpoint,
      payload
    );
  }

  update(
    id: number | string,
    payload: TechnicianPayload
  ): Observable<ApiResponse<Technician>> {
    return this.api.put<Technician, TechnicianPayload>(
      this.buildUrl(this.endpoint, id),
      payload
    );
  }

  delete(id: number | string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(this.buildUrl(this.endpoint, id));
  }
}
