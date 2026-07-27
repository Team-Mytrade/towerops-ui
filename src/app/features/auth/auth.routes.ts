import { Routes } from '@angular/router';
import { publicOnlyGuard } from '../../core/guards/public-only.guard';


export const AUTH_ROUTES: Routes = [
  {
    path: '',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./login/login').then(
        module => module.Login
      )
  }
];