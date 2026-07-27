import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import {
  provideRouter,
  withComponentInputBinding
} from '@angular/router';

import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { tenantInterceptor } from './core/interceptors/tenant.interceptor';
import { MessageService } from 'primeng/api';
import { TowerOpsPreset } from './core/theme/towerops-theme';

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    provideBrowserGlobalErrorListeners(),

    provideRouter(
      routes,
      withComponentInputBinding()
    ),

    provideHttpClient(
      withInterceptors([
        authInterceptor,
        tenantInterceptor,
        errorInterceptor
      ])
    ),

    providePrimeNG({
      ripple: true,
      inputStyle: 'outlined',
      theme: {
        preset: TowerOpsPreset,
        options: {
          darkModeSelector: '.towerops-dark',
          cssLayer: {
            name: 'primeng',
            order: 'reset, primeng, towerops'
          }
        }
      }
    })
  ]
};