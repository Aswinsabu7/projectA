import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

let refreshInProgress$: Observable<string> | null = null;

const AUTH_EXEMPT_PATHS = ['/auth/login', '/auth/refresh-token'];

function isExempt(url: string): boolean {
  return AUTH_EXEMPT_PATHS.some((p) => url.includes(p));
}

/**
 * Attaches the Bearer access token to outgoing API requests and transparently
 * refreshes it on a 401 response (single in-flight refresh shared across
 * concurrent requests), retrying the original request once.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);

  const token = tokenStorage.getAccessToken();
  const headers: Record<string, string> = {};
  if (token && !isExempt(req.url)) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const authorizedReq = req.clone({ setHeaders: headers, withCredentials: true });

  return next(authorizedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isExempt(req.url)) {
        return throwError(() => error);
      }

      if (!refreshInProgress$) {
        refreshInProgress$ = authService.refreshAccessToken();
      }

      return refreshInProgress$.pipe(
        switchMap((newToken) => {
          refreshInProgress$ = null;
          const retriedReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` }, withCredentials: true });
          return next(retriedReq);
        }),
        catchError((refreshError) => {
          refreshInProgress$ = null;
          authService.clearSession();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
