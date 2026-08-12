import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, PaginationMeta } from '../shared/models/api-response.model';
import { Permission, Role } from '../shared/models/role.model';

export interface RoleQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/roles`;
  private readonly permissionsUrl = `${environment.apiUrl}/permissions`;

  list(query: RoleQuery): Observable<{ items: Role[]; meta: PaginationMeta }> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value));
    });
    return this.http
      .get<ApiResponse<Role[]>>(this.baseUrl, { params })
      .pipe(map((res) => ({ items: res.data, meta: res.meta! })));
  }

  getActiveRoles(): Observable<Role[]> {
    return this.http.get<ApiResponse<Role[]>>(`${this.baseUrl}/active`).pipe(map((res) => res.data));
  }

  getById(id: string): Observable<Role> {
    return this.http.get<ApiResponse<Role>>(`${this.baseUrl}/${id}`).pipe(map((res) => res.data));
  }

  create(payload: Partial<Role>): Observable<Role> {
    return this.http.post<ApiResponse<Role>>(this.baseUrl, payload).pipe(map((res) => res.data));
  }

  update(id: string, payload: Partial<Role>): Observable<Role> {
    return this.http.put<ApiResponse<Role>>(`${this.baseUrl}/${id}`, payload).pipe(map((res) => res.data));
  }

  setStatus(id: string, isActive: boolean): Observable<Role> {
    return this.http
      .patch<ApiResponse<Role>>(`${this.baseUrl}/${id}/status`, { isActive })
      .pipe(map((res) => res.data));
  }

  assignPermissions(id: string, permissions: string[]): Observable<Role> {
    return this.http
      .patch<ApiResponse<Role>>(`${this.baseUrl}/${id}/permissions`, { permissions })
      .pipe(map((res) => res.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`).pipe(map(() => undefined));
  }

  getPermissionsGrouped(): Observable<Record<string, Permission[]>> {
    return this.http
      .get<ApiResponse<Record<string, Permission[]>>>(`${this.permissionsUrl}/grouped`)
      .pipe(map((res) => res.data));
  }
}
