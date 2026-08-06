import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const TECHNICIAN_ROUTES: Routes = [
  {
    path: 'dashboard',
    canActivate: [roleGuard],
    data: { userTypes: ['TECHNICIAN'], pageTitle: 'Technician Dashboard' },
    loadComponent: () => import('./technician-dashboard').then(module => module.TechnicianDashboard),
    title: 'Technician Dashboard | TowerOps'
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
];
