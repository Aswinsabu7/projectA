import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, PaginationMeta } from '../shared/models/api-response.model';
import { Subscriber, ImportPreviewResult } from '../shared/models/subscriber.model';

export interface SubscriberQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  platform?: string;
  status?: string;
}

export interface PagedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

@Injectable({ providedIn: 'root' })
export class SubscriberService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/subscribers`;

  list(query: SubscriberQuery): Observable<PagedResult<Subscriber>> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value));
    });

    return this.http
      .get<ApiResponse<Subscriber[]>>(this.baseUrl, { params })
      .pipe(map((res) => ({ items: res.data, meta: res.meta! })));
  }

  getById(id: string): Observable<Subscriber> {
    return this.http.get<ApiResponse<Subscriber>>(`${this.baseUrl}/${id}`).pipe(map((res) => res.data));
  }

  create(payload: Partial<Subscriber>): Observable<Subscriber> {
    return this.http.post<ApiResponse<Subscriber>>(this.baseUrl, payload).pipe(map((res) => res.data));
  }

  update(id: string, payload: Partial<Subscriber>): Observable<Subscriber> {
    return this.http.put<ApiResponse<Subscriber>>(`${this.baseUrl}/${id}`, payload).pipe(map((res) => res.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`).pipe(map(() => undefined));
  }

  exportExcel(query: SubscriberQuery): Observable<Blob> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value));
    });
    return this.http.get(`${this.baseUrl}/export`, { params, responseType: 'blob' });
  }

  downloadImportTemplate(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/import/template`, { responseType: 'blob' });
  }

  previewImport(file: File): Observable<ImportPreviewResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<ApiResponse<ImportPreviewResult>>(`${this.baseUrl}/import/preview`, formData)
      .pipe(map((res) => res.data));
  }

  confirmImport(rows: unknown[]): Observable<{ insertedCount: number }> {
    return this.http
      .post<ApiResponse<{ insertedCount: number }>>(`${this.baseUrl}/import/confirm`, { rows })
      .pipe(map((res) => res.data));
  }
}
