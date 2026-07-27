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
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
];