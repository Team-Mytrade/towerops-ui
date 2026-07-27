import { Routes } from '@angular/router';

import { authGuard } from '../core/guards/auth.guard';

export const LAYOUT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shell/shell').then(
        module => module.ShellComponent
      ),
    children: [
      {
        path: 'platform',
        loadChildren: () =>
          import('../features/platform/platform.routes').then(
            module => module.PLATFORM_ROUTES
          )
      },
      {
        path: 'tenant',
        loadChildren: () =>
          import('../features/tenant/tenant.routes').then(
            module => module.TENANT_ROUTES
          )
      },
      // {
      //   path: 'technician',
      //   loadChildren: () =>
      //     import('../features/technician/technician.routes').then(
      //       module => module.TECHNICIAN_ROUTES
      //     )
      // },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'tenant/entry'
      }
    ]
  }
];