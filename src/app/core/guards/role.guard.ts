import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import { UserType } from '../models/application.enums';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = route => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowedTypes =
    (route.data['userTypes'] as UserType[] | undefined) ?? [];

  if (
    allowedTypes.length === 0 ||
    auth.hasUserType(...allowedTypes)
  ) {
    return true;
  }

  return router.parseUrl(auth.getDefaultRoute());
};