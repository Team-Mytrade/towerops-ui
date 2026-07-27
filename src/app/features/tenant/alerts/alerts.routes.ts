import { Routes } from '@angular/router';

import { roleGuard } from '../../../core/guards/role.guard';

const allowedUserTypes = [
  'TENANT_ADMIN',
  'ADMIN'
];

export const ALERT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: {
      userTypes: allowedUserTypes
    },
    loadComponent: () =>
      import(
        './pages/alerts-list/alerts-list'
      ).then(
        module => module.AlertsListComponent
      )
  }
];