import { HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, from, switchMap, of } from 'rxjs';
import { EncryptionService } from '../services/encryption.service';

const EXEMPT_PATHS = ['/auth/login', '/auth/refresh-token'];

function isExempt(url: string): boolean {
  return EXEMPT_PATHS.some((p) => url.includes(p));
}

function decryptResponseIfNeeded(
  event: HttpEvent<unknown>,
  encryptionService: EncryptionService
): Observable<HttpEvent<unknown>> {
  if (event instanceof HttpResponse && event.body && (event.body as { payload?: string }).payload) {
    return from(encryptionService.decrypt((event.body as { payload: string }).payload)).pipe(
      switchMap((decryptedBody) => of(event.clone({ body: decryptedBody })))
    );
  }
  return of(event);
}

/**
 * Mirrors the backend's payload encryption middleware: when enabled, encrypts
 * outgoing JSON bodies to `{ payload: "<base64>" }` and transparently decrypts
 * `{ payload: "<base64>" }` API responses back into their original JSON shape.
 * No-ops entirely when `environment.encryptionEnabled` is false.
 */
export const encryptionInterceptor: HttpInterceptorFn = (req, next) => {
  const encryptionService = inject(EncryptionService);

  if (!encryptionService.enabled || isExempt(req.url)) {
    return next(req);
  }

  const encryptRequest$: Observable<string | null> = req.body ? from(encryptionService.encrypt(req.body)) : of(null);

  return encryptRequest$.pipe(
    switchMap((payload) => {
      const outgoingReq = payload !== null ? req.clone({ body: { payload } }) : req;
      return next(outgoingReq).pipe(switchMap((event) => decryptResponseIfNeeded(event, encryptionService)));
    })
  );
};

