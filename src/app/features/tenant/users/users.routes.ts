import { Routes } from '@angular/router';
import { roleGuard } from '../../../core/guards/role.guard';

export const USER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: {
      userTypes: ['TENANT_ADMIN', 'ADMIN'],
      pageTitle: 'Users'
    },
    loadComponent: () =>
      import('./users-page').then(module => module.UsersPageComponent)
  }
];
