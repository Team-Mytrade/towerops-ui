import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../../../core/api/api.types';
import { BaseService } from '../../../../core/base/base.service';
import {
  Permission,
  PermissionPayload
} from '../models/permission.models';

@Injectable({ providedIn: 'root' })
export class PermissionService extends BaseService {
  private readonly endpoint = 'permissions';

  getPermissions(): Observable<ApiResponse<Permission[]>> {
    return this.api.get<Permission[]>(this.endpoint);
  }

  getById(id: number): Observable<ApiResponse<Permission>> {
    return this.api.get<Permission>(
      this.buildUrl(this.endpoint, id)
    );
  }

  create(
    payload: PermissionPayload
  ): Observable<ApiResponse<Permission>> {
    return this.api.post<Permission, PermissionPayload>(
      this.endpoint,
      payload
    );
  }

  update(
    id: number,
    payload: PermissionPayload
  ): Observable<ApiResponse<Permission>> {
    return this.api.put<Permission, PermissionPayload>(
      this.buildUrl(this.endpoint, id),
      payload
    );
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(
      this.buildUrl(this.endpoint, id)
    );
  }
}
