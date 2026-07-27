import {
  computed,
  inject,
  Injectable
} from '@angular/core';


import {
  SUPER_ADMIN_NAVIGATION,
  TECHNICIAN_NAVIGATION,
  TENANT_NAVIGATION
} from './navigation.config';
import {
  NavigationGroup,
  NavigationItem
} from './navigation.models';
import { AuthService } from '../core/auth/auth.service';
import { BaseService } from '../core/base/base.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService extends BaseService {
  private readonly authService = inject(AuthService);

  readonly groups = computed<NavigationGroup[]>(() => {
    switch (this.authService.userType()) {
      case 'SUPER_ADMIN':
        return SUPER_ADMIN_NAVIGATION;

      case 'TENANT_ADMIN':
      case 'ADMIN':
        return TENANT_NAVIGATION;

      case 'TECHNICIAN':
        return TECHNICIAN_NAVIGATION;

      default:
        return [];
    }
  });

  readonly items = computed<NavigationItem[]>(() =>
    this.groups().flatMap(group => group.items)
  );
findByUrl(
  url: string
): NavigationItem | null {
  const normalizedUrl =
    this.normalizeUrl(url);

  return (
    this.items()
      .filter(item => {
        const itemRoute =
          this.normalizeUrl(item.route);

        if (item.exact) {
          return normalizedUrl === itemRoute;
        }

        return (
          normalizedUrl === itemRoute ||
          normalizedUrl.startsWith(
            `${itemRoute}/`
          )
        );
      })
      .sort(
        (first, second) =>
          second.route.length -
          first.route.length
      )[0] ?? null
  );
}

private normalizeUrl(
  url: string
): string {
  const cleanUrl =
    url
      .split('?')[0]
      .split('#')[0];

  if (
    cleanUrl.length > 1 &&
    cleanUrl.endsWith('/')
  ) {
    return cleanUrl.slice(0, -1);
  }

  return cleanUrl;
}

}
