import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from './api.types';
import { QueryParams, QueryValue } from './api-query.types';


export interface ApiRequestOptions {
  query?: QueryParams;
  context?: HttpContext;
  headers?:
    | HttpHeaders
    | Record<
        string,
        string | string[]
      >;
}
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  get<TResponse>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Observable<ApiResponse<TResponse>> {
    return this.http.get<ApiResponse<TResponse> | TResponse>(
      this.resolveUrl(endpoint),
      {
        params: this.createParams(options?.query),
        context: options?.context,
        headers: options?.headers
      }
    ).pipe(map(response => this.normalizeResponse(response)));
  }

  post<TResponse, TPayload = unknown>(
    endpoint: string,
    payload?: TPayload,
    options?: ApiRequestOptions
  ): Observable<ApiResponse<TResponse>> {
    return this.http.post<ApiResponse<TResponse> | TResponse>(
      this.resolveUrl(endpoint),
      payload ?? {},
      {
        params: this.createParams(options?.query),
        context: options?.context,
        headers: options?.headers
      }
    ).pipe(map(response => this.normalizeResponse(response)));
  }

  put<TResponse, TPayload>(
    endpoint: string,
    payload: TPayload,
    options?: ApiRequestOptions
  ): Observable<ApiResponse<TResponse>> {
    return this.http.put<ApiResponse<TResponse> | TResponse>(
      this.resolveUrl(endpoint),
      payload,
      {
        params: this.createParams(options?.query),
        context: options?.context,
        headers: options?.headers
      }
    ).pipe(map(response => this.normalizeResponse(response)));
  }

  patch<TResponse, TPayload = unknown>(
    endpoint: string,
    payload?: TPayload,
    options?: ApiRequestOptions
  ): Observable<ApiResponse<TResponse>> {
    return this.http.patch<ApiResponse<TResponse> | TResponse>(
      this.resolveUrl(endpoint),
      payload ?? {},
      {
        params: this.createParams(options?.query),
        context: options?.context,
        headers: options?.headers
      }
    ).pipe(map(response => this.normalizeResponse(response)));
  }

  delete<TResponse>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Observable<ApiResponse<TResponse>> {
    return this.http.delete<ApiResponse<TResponse> | TResponse>(
      this.resolveUrl(endpoint),
      {
        params: this.createParams(options?.query),
        context: options?.context,
        headers: options?.headers
      }
    ).pipe(map(response => this.normalizeResponse(response)));
  }

  postFormData<TResponse>(
  endpoint: string,
  payload: FormData,
  options?: ApiRequestOptions
): Observable<ApiResponse<TResponse>> {
  return this.http.post<ApiResponse<TResponse> | TResponse>(
    this.resolveUrl(endpoint),
    payload,
    {
      params: this.createParams(
        options?.query
      ),
      context: options?.context,
      headers: options?.headers
    }
  ).pipe(map(response => this.normalizeResponse(response)));
}

  private normalizeResponse<T>(
    response: ApiResponse<T> | T
  ): ApiResponse<T> {
    if (
      response !== null &&
      typeof response === 'object' &&
      'data' in response &&
      'success' in response
    ) {
      return response as ApiResponse<T>;
    }

    return {
      timestamp: Date.now(),
      success: true,
      message: '',
      data: response as T
    };
  }

  private resolveUrl(endpoint: string): string {
    const normalizedEndpoint = endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;

    return `${this.baseUrl}${normalizedEndpoint}`;
  }

  private createParams(
    query?: Record<string, QueryValue>
  ): HttpParams {
    let params = new HttpParams();

    if (!query) {
      return params;
    }

    for (const [key, value] of Object.entries(query)) {
      if (
        value !== null &&
        value !== undefined &&
        value !== ''
      ) {
        params = params.set(key, String(value));
      }
    }

    return params;
  }
}
