import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, PaginationMeta } from '../shared/models/api-response.model';
import { AppUser } from '../shared/models/user.model';

export interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  list(query: UserQuery): Observable<{ items: AppUser[]; meta: PaginationMeta }> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value));
    });
    return this.http.get<ApiResponse<AppUser[]>>(this.baseUrl, { params }).pipe(
      map((res) => ({ items: res.data, meta: res.meta! }))
    );
  }

  getById(id: string): Observable<AppUser> {
    return this.http.get<ApiResponse<AppUser>>(`${this.baseUrl}/${id}`).pipe(map((res) => res.data));
  }

  create(payload: Partial<AppUser> & { password: string }): Observable<AppUser> {
    return this.http.post<ApiResponse<AppUser>>(this.baseUrl, payload).pipe(map((res) => res.data));
  }

  update(id: string, payload: Partial<AppUser>): Observable<AppUser> {
    return this.http.put<ApiResponse<AppUser>>(`${this.baseUrl}/${id}`, payload).pipe(map((res) => res.data));
  }

  setStatus(id: string, status: 'Active' | 'Inactive'): Observable<AppUser> {
    return this.http
      .patch<ApiResponse<AppUser>>(`${this.baseUrl}/${id}/status`, { status })
      .pipe(map((res) => res.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`).pipe(map(() => undefined));
  }
}
