import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../shared/models/api-response.model';
import { AppSettings } from '../shared/models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/settings`;

  get(): Observable<AppSettings> {
    return this.http.get<ApiResponse<AppSettings>>(this.baseUrl).pipe(map((res) => res.data));
  }

  update(payload: Partial<AppSettings>): Observable<AppSettings> {
    return this.http.put<ApiResponse<AppSettings>>(this.baseUrl, payload).pipe(map((res) => res.data));
  }
}
