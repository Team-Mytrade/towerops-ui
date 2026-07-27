import { Routes } from '@angular/router';

import { roleGuard } from '../../../core/guards/role.guard';

const allowedUserTypes = [
  'TENANT_ADMIN',
  'ADMIN'
];

export const SITE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: {
      userTypes: allowedUserTypes
    },
    loadComponent: () =>
      import(
        './pages/sites-list/sites-list'
      ).then(
        module => module.SitesListComponent
      )
  },
  {
    path: ':siteId',
    canActivate: [roleGuard],
    data: {
      userTypes: allowedUserTypes
    },
    loadComponent: () =>
      import(
        './pages/site-details/site-details'
      ).then(
        module => module.SiteDetailComponent
      )
  }
];