import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, PaginationMeta } from '../shared/models/api-response.model';
import { AuditLog } from '../shared/models/audit-log.model';

export interface AuditLogQuery {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  module?: string;
  from?: string;
  to?: string;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/audit-logs`;

  list(query: AuditLogQuery): Observable<{ items: AuditLog[]; meta: PaginationMeta }> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value));
    });
    return this.http
      .get<ApiResponse<AuditLog[]>>(this.baseUrl, { params })
      .pipe(map((res) => ({ items: res.data, meta: res.meta! })));
  }
}
