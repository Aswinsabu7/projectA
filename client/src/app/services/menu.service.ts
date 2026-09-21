import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../shared/models/api-response.model';

export interface MenuItem {
  _id: string;
  key: string;
  label: string;
  icon: string;
  route: string;
  permission: string;
  order: number;
  parentKey: string | null;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/menu-items`;

  private readonly menuItemsSignal = signal<MenuItem[]>([]);
  readonly menuItems = this.menuItemsSignal.asReadonly();

  loadMenuItems(): Observable<ApiResponse<MenuItem[]>> {
    return this.http.get<ApiResponse<MenuItem[]>>(this.url).pipe(
      tap((res) => this.menuItemsSignal.set(res.data))
    );
  }

  getAll(): Observable<ApiResponse<MenuItem[]>> {
    return this.http.get<ApiResponse<MenuItem[]>>(`${this.url}/all`);
  }

  getById(id: string): Observable<ApiResponse<MenuItem>> {
    return this.http.get<ApiResponse<MenuItem>>(`${this.url}/${id}`);
  }

  create(item: Partial<MenuItem>): Observable<ApiResponse<MenuItem>> {
    return this.http.post<ApiResponse<MenuItem>>(this.url, item);
  }

  update(id: string, item: Partial<MenuItem>): Observable<ApiResponse<MenuItem>> {
    return this.http.put<ApiResponse<MenuItem>>(`${this.url}/${id}`, item);
  }

  delete(id: string): Observable<ApiResponse<MenuItem>> {
    return this.http.delete<ApiResponse<MenuItem>>(`${this.url}/${id}`);
  }
}
