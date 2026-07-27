import { Routes } from '@angular/router';

import { roleGuard } from '../../../core/guards/role.guard';

export const TENANT_DASHBOARD_ROUTES: Routes = [
  {
    path: ':category',
    canActivate: [roleGuard],
    data: {
      userTypes: ['TENANT_ADMIN', 'ADMIN']
    },
    loadComponent: () =>
      import('./dashboard').then(
        module => module.TenantDashboardComponent
      ),
    title: 'Tenant Dashboard | TowerOps'
  }
];