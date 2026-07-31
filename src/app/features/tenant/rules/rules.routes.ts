import { Routes } from '@angular/router';

export const RULE_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./rules-page/rules-page').then(
        module => module.RulesPageComponent
      )
  }
];
