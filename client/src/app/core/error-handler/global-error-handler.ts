import { ErrorHandler, Injectable, NgZone, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
 * Global error handler - catches uncaught exceptions anywhere in the app
 * (template errors, RxJS subscription errors without a handler, etc.) and
 * surfaces a friendly toast instead of a blank screen, while still logging
 * the full error to the console for diagnostics.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly zone = inject(NgZone);
  private readonly messageService = inject(MessageService);

  handleError(error: unknown): void {
    // eslint-disable-next-line no-console
    console.error('Unhandled application error:', error);

    this.zone.run(() => {
      this.messageService.add({
        severity: 'error',
        summary: 'Unexpected Error',
        detail: 'Something went wrong. Please try again or contact support if the issue persists.',
        life: 6000,
      });
    });
  }
}
