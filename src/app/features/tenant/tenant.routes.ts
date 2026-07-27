import { Routes } from '@angular/router';

import { roleGuard } from '../../core/guards/role.guard';

const tenantRoles = [
  'TENANT_ADMIN',
  'ADMIN',
];

const tenantRouteData = {
  userTypes: tenantRoles,
};

export const TENANT_ROUTES: Routes = [
  {
    path: 'entry',
    canActivate: [roleGuard],
    data: {
      ...tenantRouteData,
      pageTitle: 'Tenant Workspace',
    },
    loadComponent: () =>
      import('./entry/entry').then(
        (module) =>
          module.TenantEntryComponent,
      ),
  },
  {
    path: 'categories',
    canActivate: [roleGuard],
    data: {
      ...tenantRouteData,
      pageTitle: 'Site Categories',
    },
    loadComponent: () =>
      import('./entry/entry').then(
        (module) =>
          module.TenantEntryComponent,
      ),
  },
  {
    path: 'dashboard',
    canActivate: [roleGuard],
    data: {
      ...tenantRouteData,
      pageTitle: 'Dashboard',
    },
    loadChildren: () =>
      import(
        './dashboard/dashboard.routes'
      ).then(
        (module) =>
          module.TENANT_DASHBOARD_ROUTES,
      ),
  },
  {
    path: 'sites',
    canActivate: [roleGuard],
    data: {
      ...tenantRouteData,
      pageTitle: 'Sites',
    },
    loadChildren: () =>
      import('./sites/sites.routes').then(
        (module) =>
          module.SITE_ROUTES,
      ),
  },
  {
    path: 'devices',
    canActivate: [roleGuard],
    data: {
      ...tenantRouteData,
      pageTitle: 'Devices',
    },
    loadChildren: () =>
      import(
        './devices/devices.routes'
      ).then(
        (module) =>
          module.DEVICE_ROUTES,
      ),
  },
  {
    path: 'alerts',
    canActivate: [roleGuard],
    data: {
      ...tenantRouteData,
      pageTitle: 'Alerts',
    },
    loadChildren: () =>
      import(
        './alerts/alerts.routes'
      ).then(
        (module) =>
          module.ALERT_ROUTES,
      ),
  },
  {
    path: 'tickets',
    canActivate: [roleGuard],
    data: {
      ...tenantRouteData,
      pageTitle: 'Tickets',
    },
    loadChildren: () =>
      import(
        './tickets/tickets.routes'
      ).then(
        (module) =>
          module.TICKET_ROUTES,
      ),
  },
  {
    path: 'work-orders',
    canActivate: [roleGuard],
    data: {
      ...tenantRouteData,
      pageTitle: 'Work Orders',
    },
    loadChildren: () =>
      import(
        './work-orders/work-orders.routes'
      ).then(
        (module) =>
          module.WORK_ORDER_ROUTES,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'entry',
  },
];