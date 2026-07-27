import { inject, Injectable } from '@angular/core';

import {
  ApiRequestOptions,
  ApiService
} from '../api/api.service';
import { ToastService } from '../services/toast.service';
import { BaseClass } from './base.class';
import { SKIP_USER_HEADER } from '../interceptors/http-context.tokens';
import { HttpContext } from '@angular/common/http';

export type UrlSegment =
  | string
  | number
  | null
  | undefined;

@Injectable()
export abstract class BaseService extends BaseClass {
  protected readonly api = inject(ApiService);
  protected readonly toast = inject(ToastService);

  protected showSuccess(message: string): void {
    this.toast.success(message);
  }

protected withoutUserHeader(
  options?: ApiRequestOptions
): ApiRequestOptions {
  return {
    ...options,
    context: (options?.context ?? new HttpContext()).set(
      SKIP_USER_HEADER,
      true
    )
  };
}


  protected showError(
    error: unknown,
    fallback?: string
  ): void {
    this.toast.showApiError(error, fallback);
  }

  protected buildUrl(
    baseEndpoint: string,
    ...segments: UrlSegment[]
  ): string {
    const normalizedBase =
      this.normalizeSegment(baseEndpoint);

    const normalizedSegments = segments
      .filter(
        (
          segment
        ): segment is string | number =>
          segment !== null &&
          segment !== undefined &&
          segment !== ''
      )
      .map(segment =>
        this.normalizeSegment(String(segment))
      )
      .filter(Boolean);

    return [
      normalizedBase,
      ...normalizedSegments
    ]
      .filter(Boolean)
      .join('/');
  }

  protected buildEndpoint(
    endpoint: string,
    ...segments: UrlSegment[]
  ): string {
    return this.buildUrl(endpoint, ...segments);
  }

  protected withQuery(
    query?: ApiRequestOptions['query']
  ): ApiRequestOptions {
    return { query };
  }

  protected withOptions(
    options?: ApiRequestOptions
  ): ApiRequestOptions {
    return options ?? {};
  }

  private normalizeSegment(segment: string): string {
    return segment.replace(/^\/+|\/+$/g, '');
  }
}