import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../../core/api/api.types';
import { BaseService } from '../../../core/base/base.service';
import {
  Customer,
  CustomerPayload
} from './customer.models';

@Injectable({
  providedIn: 'root'
})
export class CustomerService extends BaseService {
  private readonly endpoint = 'tenants';

  getCustomers(): Observable<ApiResponse<Customer[]>> {
    return this.api.get<Customer[]>(this.endpoint);
  }

  getById(
    id: number
  ): Observable<ApiResponse<Customer>> {
    return this.api.get<Customer>(
      this.buildUrl(this.endpoint, id)
    );
  }

  create(
    payload: CustomerPayload
  ): Observable<ApiResponse<Customer>> {
    return this.api.post<Customer, CustomerPayload>(
      this.endpoint,
      payload
    );
  }

  update(
    id: number,
    payload: CustomerPayload
  ): Observable<ApiResponse<Customer>> {
    return this.api.put<Customer, CustomerPayload>(
      this.buildUrl(this.endpoint, id),
      payload
    );
  }

  delete(
    id: number
  ): Observable<ApiResponse<void>> {
    return this.api.delete<void>(
      this.buildUrl(this.endpoint, id)
    );
  }
}
