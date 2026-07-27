import { HttpContextToken } from '@angular/common/http';

export const SKIP_AUTH = new HttpContextToken<boolean>(
  () => false
);

export const SKIP_TENANT_HEADER =
  new HttpContextToken<boolean>(() => false);

export const SKIP_USER_HEADER =
  new HttpContextToken<boolean>(() => false);