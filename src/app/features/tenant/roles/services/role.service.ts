import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../../../core/api/api.types';
import { BaseService } from '../../../../core/base/base.service';
import { Role, RolePayload } from '../models/role.models';

@Injectable({ providedIn: 'root' })
export class RoleService extends BaseService {
  private readonly endpoint = 'roles';

  getRoles(): Observable<ApiResponse<Role[]>> {
    return this.api.get<Role[]>(this.endpoint);
  }

  getById(id: number): Observable<ApiResponse<Role>> {
    return this.api.get<Role>(
      this.buildUrl(this.endpoint, id)
    );
  }

  create(payload: RolePayload): Observable<ApiResponse<Role>> {
    return this.api.post<Role, RolePayload>(
      this.endpoint,
      payload
    );
  }

  update(
    id: number,
    payload: RolePayload
  ): Observable<ApiResponse<Role>> {
    return this.api.put<Role, RolePayload>(
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
