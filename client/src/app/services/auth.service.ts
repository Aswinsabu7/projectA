import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../shared/models/api-response.model';
import { AuthenticatedUser } from '../shared/models/user.model';
import { TokenStorageService } from './token-storage.service';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: { _id: string; username: string; role: { _id: string; name: string; permissions: { key: string }[] } };
}

interface JwtPayload {
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);

  private readonly currentUserSignal = signal<AuthenticatedUser | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly permissions = computed(() => this.currentUserSignal()?.permissions ?? []);
  readonly roleName = computed(() => this.currentUserSignal()?.role ?? null);

  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  hasPermission(key: string): boolean {
    const user = this.currentUserSignal();
    if (!user) return false;
    if (user.role === 'Super Admin') return true;
    return user.permissions.includes(key);
  }

  hasAnyPermission(keys: string[]): boolean {
    return keys.some((k) => this.hasPermission(k));
  }

  hasRole(...roles: string[]): boolean {
    const role = this.currentUserSignal()?.role;
    return !!role && roles.includes(role);
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/auth/login`, { username, password }).pipe(
      map((res) => res.data),
      tap((data) => this.applySession(data.accessToken))
    );
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  /** Attempts a silent refresh using the httpOnly refresh-token cookie (called on app bootstrap). */
  bootstrap(): Observable<boolean> {
    return this.refreshAccessToken().pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  refreshAccessToken(): Observable<string> {
    return this.http
      .post<ApiResponse<{ accessToken: string }>>(`${environment.apiUrl}/auth/refresh-token`, {}, { withCredentials: true })
      .pipe(
        map((res) => res.data.accessToken),
        tap((accessToken) => this.applySession(accessToken))
      );
  }

  private applySession(accessToken: string): void {
    this.tokenStorage.setAccessToken(accessToken);
    const payload = this.tokenStorage.decodePayload<JwtPayload & AuthenticatedUser & { sub: string }>(accessToken);
    if (payload) {
      this.currentUserSignal.set({
        id: payload.sub,
        username: payload.username,
        role: payload.role,
        roleId: payload.roleId,
        permissions: payload.permissions || [],
      });
      this.scheduleAutoRefresh(payload.exp);
    }
  }

  private scheduleAutoRefresh(expUnixSeconds: number): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    const msUntilExpiry = expUnixSeconds * 1000 - Date.now();
    const refreshInMs = Math.max(msUntilExpiry - environment.tokenRefreshSkewSeconds * 1000, 5000);

    this.refreshTimer = setTimeout(() => {
      this.refreshAccessToken().subscribe({ error: () => this.clearSession() });
    }, refreshInMs);
  }

  clearSession(redirectToLogin = true): void {
    this.tokenStorage.clear();
    this.currentUserSignal.set(null);
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    if (redirectToLogin) this.router.navigate(['/auth/login']);
  }
}
