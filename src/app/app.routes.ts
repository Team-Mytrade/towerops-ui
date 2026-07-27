import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(
        module => module.AUTH_ROUTES
      )
  },
  {
    path: '',
    loadChildren: () =>
      import('./layout/layout.routes').then(
        module => module.LAYOUT_ROUTES
      )
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];