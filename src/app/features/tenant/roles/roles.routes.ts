import { Routes } from '@angular/router';

export const ROLE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./access-control-workspace/access-control-workspace').then(
        module => module.AccessControlWorkspaceComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./roles-page/roles-page').then(
            module => module.RolesPageComponent
          )
      },
      {
        path: 'permissions',
        loadComponent: () =>
          import('./permissions-page/permissions-page').then(
            module => module.PermissionsPageComponent
          )
      }
    ]
  }
];
