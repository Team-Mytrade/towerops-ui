import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/api/api.types';
import { BaseService } from '../../../core/base/base.service';
import { TenantUser, UserPayload } from './user.models';

@Injectable({ providedIn: 'root' })
export class UserService extends BaseService {
  private readonly endpoint = 'users';

  getUsers(): Observable<ApiResponse<TenantUser[]>> {
    return this.api.get<TenantUser[]>(this.endpoint);
  }

  getById(id: number | string): Observable<ApiResponse<TenantUser>> {
    return this.api.get<TenantUser>(this.buildUrl(this.endpoint, id));
  }

  create(payload: UserPayload): Observable<ApiResponse<TenantUser>> {
    return this.api.post<TenantUser, UserPayload>(this.endpoint, payload);
  }

  update(
    id: number | string,
    payload: UserPayload
  ): Observable<ApiResponse<TenantUser>> {
    return this.api.put<TenantUser, UserPayload>(
      this.buildUrl(this.endpoint, id),
      payload
    );
  }

  delete(id: number | string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(this.buildUrl(this.endpoint, id));
  }
}
