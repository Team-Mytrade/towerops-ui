import { Routes } from '@angular/router';

import { roleGuard } from '../../../core/guards/role.guard';

const allowedUserTypes = [
  'TENANT_ADMIN',
  'ADMIN',
];

const guardedRouteData = {
  userTypes: allowedUserTypes,
};

const DEVICE_WORKSPACE_ROUTES: Routes = [
  /*
   * Device Models
   *
   * These routes must remain above ":deviceId".
   * Otherwise Angular treats "models" as a device ID.
   */
  {
    path: 'models',
    canActivate: [roleGuard],
    data: {
      ...guardedRouteData,
      pageTitle: 'Device Models',
    },
    loadComponent: () =>
      import(
        './pages/device-models-list/device-models-list'
      ).then(
        (module) =>
          module.DeviceModelsListComponent,
      ),
  },
  {
    path: 'models/create',
    canActivate: [roleGuard],
    data: {
      ...guardedRouteData,
      pageTitle: 'Create Device Model',
    },
    loadComponent: () =>
      import(
        './pages/device-model-form/device-model-form'
      ).then(
        (module) =>
          module.DeviceModelFormComponent,
      ),
  },
  {
    path: 'models/:id/edit',
    canActivate: [roleGuard],
    data: {
      ...guardedRouteData,
      pageTitle: 'Edit Device Model',
    },
    loadComponent: () =>
      import(
        './pages/device-model-form/device-model-form'
      ).then(
        (module) =>
          module.DeviceModelFormComponent,
      ),
  },
  {
    path: 'models/:id',
    canActivate: [roleGuard],
    data: {
      ...guardedRouteData,
      pageTitle: 'Device Model Details',
    },
    loadComponent: () =>
      import(
        './pages/device-model-detail/device-model-detail'
      ).then(
        (module) =>
          module.DeviceModelDetailComponent,
      ),
  },

  {
    path: 'credentials',
    canActivate: [roleGuard],
    data: {
      ...guardedRouteData,
      pageTitle: 'Device Credentials',
    },
    loadComponent: () =>
      import(
        './pages/device-credentials/device-credentials-list'
      ).then(
        (module) =>
          module.DeviceCredentialsListComponent,
      ),
  },

  /*
   * Devices
   */
  {
    path: '',
    pathMatch: 'full',
    canActivate: [roleGuard],
    data: {
      ...guardedRouteData,
      pageTitle: 'Devices',
    },
    loadComponent: () =>
      import(
        './pages/devices-list/devices-list'
      ).then(
        (module) =>
          module.DevicesListComponent,
      ),
  },
  {
    path: 'create',
    canActivate: [roleGuard],
    data: {
      ...guardedRouteData,
      pageTitle: 'Create Device',
    },
    loadComponent: () =>
      import(
        './pages/device-form/device-form'
      ).then(
        (module) =>
          module.DeviceFormComponent,
      ),
  },
  {
    path: ':deviceId/edit',
    canActivate: [roleGuard],
    data: {
      ...guardedRouteData,
      pageTitle: 'Edit Device',
    },
    loadComponent: () =>
      import(
        './pages/device-form/device-form'
      ).then(
        (module) =>
          module.DeviceFormComponent,
      ),
  },
  {
    path: ':deviceId',
    canActivate: [roleGuard],
    data: {
      ...guardedRouteData,
      pageTitle: 'Device Details',
    },
    loadComponent: () =>
      import(
        './pages/device-detail/device-detail'
      ).then(
        (module) =>
          module.DeviceDetailComponent,
      ),
  },
];

export const DEVICE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './pages/device-workspace/device-workspace'
      ).then(
        module =>
          module.DeviceWorkspaceComponent,
      ),
    children: DEVICE_WORKSPACE_ROUTES,
  },
];
