import { Injectable, signal } from '@angular/core';

/**
 * Holds the short-lived JWT access token in memory only (never persisted to
 * localStorage/sessionStorage) to reduce the attack surface for XSS-based
 * token theft. The refresh token lives in a backend-issued httpOnly cookie,
 * so a page reload triggers a silent `/auth/refresh-token` call to re-hydrate
 * the access token (see AuthService.bootstrap()).
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly accessTokenSignal = signal<string | null>(null);
  readonly accessToken = this.accessTokenSignal.asReadonly();

  setAccessToken(token: string | null): void {
    this.accessTokenSignal.set(token);
  }

  getAccessToken(): string | null {
    return this.accessTokenSignal();
  }

  clear(): void {
    this.accessTokenSignal.set(null);
  }

  /** Decodes the payload of a JWT without verifying the signature (client-side use only). */
  decodePayload<T = Record<string, unknown>>(token: string): T | null {
    try {
      const [, payload] = token.split('.');
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(normalized)
          .split('')
          .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join('')
      );
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }
}
