import { Routes } from '@angular/router';

export const NOTIFICATION_SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./notification-settings-page/notification-settings-page').then(
        module => module.NotificationSettingsPageComponent
      )
  }
];
