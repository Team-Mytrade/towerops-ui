import { Routes } from '@angular/router';

import { roleGuard } from '../../core/guards/role.guard';

export const PLATFORM_ROUTES: Routes = [
  {
    path: 'dashboard',
    canActivate: [roleGuard],
    data: {
      userTypes: ['SUPER_ADMIN'],
    },
    loadComponent: () =>
      import(
        './dashboard/platform-dashboard'
      ).then(
        (module) =>
          module.PlatformDashboard,
      ),
  },
  {
    path: 'tenants',
    canActivate: [roleGuard],
    data: {
      userTypes: ['SUPER_ADMIN'],
    },
    loadComponent: () =>
      import(
        './customers/customers-list'
      ).then(
        (module) =>
          module.CustomersListComponent,
      ),
  },
  {
    path: 'map',
    canActivate: [roleGuard],
    data: {
      userTypes: ['SUPER_ADMIN'],
    },
    loadComponent: () =>
      import('./map/platform-map').then(
        module => module.PlatformMapComponent,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
];
