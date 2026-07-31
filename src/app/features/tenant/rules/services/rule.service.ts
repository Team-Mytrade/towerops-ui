import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ApiResponse } from '../../../../core/api/api.types';
import { BaseService } from '../../../../core/base/base.service';
import {
  DeviceRuleQuery,
  Rule,
  RulePayload
} from '../models/rule.models';

@Injectable({ providedIn: 'root' })
export class RuleService extends BaseService {
  private readonly endpoint = 'rules';

  create(payload: RulePayload): Observable<Rule> {
    return this.api
      .post<Rule, RulePayload>(this.endpoint, payload)
      .pipe(map(response => this.unwrap<Rule>(response)));
  }

  getForDevice(query: DeviceRuleQuery): Observable<Rule[]> {
    return this.api
      .get<Rule[]>(
        this.buildUrl(this.endpoint, 'device'),
        this.withQuery(query)
      )
      .pipe(map(response => this.unwrap<Rule[]>(response)));
  }

  private unwrap<T>(response: ApiResponse<T> | T): T {
    if (
      response !== null &&
      typeof response === 'object' &&
      'data' in response
    ) {
      return (response as ApiResponse<T>).data;
    }

    return response as T;
  }
}
