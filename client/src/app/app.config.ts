import {
  ApplicationConfig,
  ErrorHandler,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  inject,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { MessageService, ConfirmationService } from 'primeng/api';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

// PrimeNG's default Aura dark-mode surface palette (zinc) bottoms out at
// near-black (#09090b/#18181b). Override it with a lighter, blue-grey tint
// so the dark theme reads as a soft slate rather than deep black.
const AppTheme = definePreset(Aura, {
  semantic: {
    colorScheme: {
      dark: {
        surface: {
          0: '#ffffff',
          50: '#eef1f5',
          100: '#e2e7ee',
          200: '#c7d0dc',
          300: '#a3b0c2',
          400: '#7c8ba3',
          500: '#5c6c85',
          600: '#4a596f',
          700: '#48566a',
          800: '#3a4658',
          900: '#2e3847',
          950: '#242c38',
        },
      },
    },
  },
});

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { encryptionInterceptor } from './interceptors/encryption.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { GlobalErrorHandler } from './core/error-handler/global-error-handler';
import { AuthService } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([encryptionInterceptor, authInterceptor, loadingInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: AppTheme,
        options: {
          darkModeSelector: '.app-dark',
          cssLayer: { name: 'primeng', order: 'primeng, tailwind-base, tailwind-utilities' },
        },
      },
      ripple: true,
    }),
    provideTranslateService({
      lang: 'en',
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),
    }),
    MessageService,
    ConfirmationService,
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return authService.bootstrap();
    }),
  ],
};
