import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { CurrentUser } from '../auth/auth.models';
import { STORAGE_KEYS } from '../storage/storage.keys';
import { StorageService } from '../storage/storage.service';
import {
  SKIP_TENANT_HEADER,
  SKIP_USER_HEADER
} from './http-context.tokens';

export const tenantInterceptor: HttpInterceptorFn = (
  request,
  next
) => {
  const storage = inject(StorageService);

  const user = storage.get<CurrentUser>(
    STORAGE_KEYS.currentUser
  );

  if (!user) {
    return next(request);
  }

  const headers: Record<string, string> = {};

  if (
    !request.context.get(SKIP_TENANT_HEADER) &&
    user.tenantId &&
    user.tenantId !== 'DEFAULT'
  ) {
    headers['X-Tenant-Id'] = user.tenantId;
  }

  if (!request.context.get(SKIP_USER_HEADER)) {
    headers['X-User'] =
      user.userId > 0
        ? String(user.userId)
        : user.username;
  }

  if (Object.keys(headers).length === 0) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: headers
    })
  );
};