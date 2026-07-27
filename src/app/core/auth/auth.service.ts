import { HttpContext } from '@angular/common/http';
import {
  computed,
  inject,
  Injectable,
  signal
} from '@angular/core';
import { Router } from '@angular/router';
import {
  catchError,
  map,
  Observable,
  tap,
  throwError
} from 'rxjs';

import { ApiService } from '../api/api.service';
import { ApiResponse } from '../api/api.types';
import {
  SKIP_AUTH,
  SKIP_TENANT_HEADER,
  SKIP_USER_HEADER
} from '../interceptors/http-context.tokens';
import { STORAGE_KEYS } from '../storage/storage.keys';
import { StorageService } from '../storage/storage.service';
import {
  CurrentUser,
  LoginRequest,
  LoginResponse
} from './auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  private readonly tokenState = signal<string | null>(
    this.storage.get<string>(STORAGE_KEYS.accessToken)
  );

  private readonly currentUserState = signal<CurrentUser | null>(
    this.storage.get<CurrentUser>(STORAGE_KEYS.currentUser)
  );

  readonly token = this.tokenState.asReadonly();
  readonly currentUser = this.currentUserState.asReadonly();

  readonly isAuthenticated = computed(
    () => Boolean(this.tokenState() && this.currentUserState())
  );

  readonly userType = computed(
    () => this.currentUserState()?.userType ?? null
  );

  readonly tenantId = computed(
    () => this.currentUserState()?.tenantId ?? null
  );

  readonly technicianId = computed(
    () => this.currentUserState()?.technicianId ?? null
  );

  readonly roles = computed(
    () => this.currentUserState()?.roles ?? []
  );

  readonly permissions = computed(
    () => this.currentUserState()?.permissions ?? []
  );

  login(payload: LoginRequest): Observable<CurrentUser> {
    const context = new HttpContext()
      .set(SKIP_AUTH, true)
      .set(SKIP_TENANT_HEADER, true)
      .set(SKIP_USER_HEADER, true);

    return this.api
      .post<LoginResponse, LoginRequest>(
        '/auth/login',
        payload,
        { context }
      )
      .pipe(
        map(response => response.data),

        tap(loginResponse => {
          this.setToken(loginResponse.token);
        }),

        map(loginResponse =>
          this.mapLoginResponseToCurrentUser(loginResponse)
        ),

        tap(user => {
          this.setCurrentUser(user);
        }),

        catchError(error => {
          this.clearSession();
          return throwError(() => error);
        })
      );
  }

  /**
   * This should become the session source of truth once
   * GET /api/v1/auth/me is available.
   */
  loadCurrentUser(): Observable<CurrentUser> {
    return this.api.get<CurrentUser>('/auth/me').pipe(
      map((response: ApiResponse<CurrentUser>) => response.data),

      tap(user => {
        this.setCurrentUser(user);
      }),

      catchError(error => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  restoreSession(): Observable<CurrentUser> | null {
    if (!this.tokenState()) {
      return null;
    }

    return this.loadCurrentUser();
  }

  logout(): void {
    this.clearSession();
    void this.router.navigateByUrl('/login');
  }

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  hasAllPermissions(requiredPermissions: string[]): boolean {
    return requiredPermissions.every(permission =>
      this.hasPermission(permission)
    );
  }

  hasAnyPermission(requiredPermissions: string[]): boolean {
    return requiredPermissions.some(permission =>
      this.hasPermission(permission)
    );
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  hasAnyRole(requiredRoles: string[]): boolean {
    return requiredRoles.some(role => this.hasRole(role));
  }

  hasUserType(...types: CurrentUser['userType'][]): boolean {
    const currentType = this.userType();

    return currentType !== null && types.includes(currentType);
  }

  getDefaultRoute(): string {
    switch (this.userType()) {
      case 'SUPER_ADMIN':
        return '/platform/dashboard';

      case 'TENANT_ADMIN':
      case 'ADMIN':
        return '/tenant/entry';

      case 'TECHNICIAN':
        return '/technician/dashboard';

      default:
        return '/login';
    }
  }

  clearSession(): void {
    this.storage.remove(STORAGE_KEYS.accessToken);
    this.storage.remove(STORAGE_KEYS.currentUser);
    this.storage.remove(STORAGE_KEYS.selectedCategory);

    this.tokenState.set(null);
    this.currentUserState.set(null);
  }

  private setToken(token: string): void {
    this.storage.set(STORAGE_KEYS.accessToken, token);
    this.tokenState.set(token);
  }

  private setCurrentUser(user: CurrentUser): void {
    this.storage.set(STORAGE_KEYS.currentUser, user);
    this.currentUserState.set(user);
  }

  private mapLoginResponseToCurrentUser(
    response: LoginResponse
  ): CurrentUser {
    return {
      userId: 0,
      username: response.username,
      tenantId: response.tenantId,
      userType: response.userType,
      technicianId: null,
      roles: response.roles ?? [],
      permissions: response.permissions ?? []
    };
  }
}