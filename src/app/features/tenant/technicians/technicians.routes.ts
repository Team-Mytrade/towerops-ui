import { Routes } from '@angular/router';
import { roleGuard } from '../../../core/guards/role.guard';

export const TECHNICIAN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: {
      userTypes: ['TENANT_ADMIN', 'ADMIN'],
      pageTitle: 'Technicians'
    },
    loadComponent: () =>
      import('./technicians-page').then(
        module => module.TechniciansPageComponent
      )
  }
];
