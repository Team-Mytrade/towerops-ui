import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { STORAGE_KEYS } from '../storage/storage.keys';
import { StorageService } from '../storage/storage.service';
import { SKIP_AUTH } from './http-context.tokens';

export const authInterceptor: HttpInterceptorFn = (
  request,
  next
) => {
  if (request.context.get(SKIP_AUTH)) {
    return next(request);
  }

  const storage = inject(StorageService);
  const token = storage.get<string>(
    STORAGE_KEYS.accessToken
  );

  if (!token) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  );
};