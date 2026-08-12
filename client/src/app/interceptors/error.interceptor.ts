import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

const SILENT_STATUS_CODES = [401]; // handled by authInterceptor / route guards

/** Surfaces API errors as PrimeNG toast notifications, except silent statuses like 401. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!SILENT_STATUS_CODES.includes(error.status)) {
        const message = error.error?.message || error.message || 'An unexpected error occurred';
        messageService.add({
          severity: error.status === 429 ? 'warn' : 'error',
          summary: `Error ${error.status || ''}`.trim(),
          detail: message,
          life: 6000,
        });
      }
      return throwError(() => error);
    })
  );
};
