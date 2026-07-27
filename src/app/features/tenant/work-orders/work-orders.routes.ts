import { Routes } from '@angular/router';

import { roleGuard } from '../../../core/guards/role.guard';

const TENANT_USER_TYPES = [
  'TENANT_ADMIN',
  'ADMIN'
];

export const WORK_ORDER_ROUTES: Routes = [
  {
    path: '',
    title: 'Work Orders',
    canActivate: [roleGuard],
    data: {
      userTypes: TENANT_USER_TYPES,
      pageTitle: 'Work Orders'
    },
    loadComponent: () =>
      import('./work-orders').then(
        module => module.WorkOrdersComponent
      )
  },
  {
    path: 'create',
    title: 'Create Work Order',
    canActivate: [roleGuard],
    data: {
      userTypes: TENANT_USER_TYPES,
      mode: 'CREATE',
      pageTitle: 'Create Work Order'
    },
    loadComponent: () =>
      import('./work-order-form/work-order-form').then(
        module => module.WorkOrderFormComponent
      )
  },
  {
    path: ':id/edit',
    title: 'Edit Work Order',
    canActivate: [roleGuard],
    data: {
      userTypes: TENANT_USER_TYPES,
      mode: 'EDIT',
      pageTitle: 'Edit Work Order'
    },
    loadComponent: () =>
      import('./work-order-form/work-order-form').then(
        module => module.WorkOrderFormComponent
      )
  },
  {
    path: ':id',
    title: 'Work Order Details',
    canActivate: [roleGuard],
    data: {
      userTypes: TENANT_USER_TYPES,
      pageTitle: 'Work Order Details'
    },
    loadComponent: () =>
      import('./work-order-detail/work-order-detail').then(
        module => module.WorkOrderDetailComponent
      )
  }
];