import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../shared/models/api-response.model';

export interface DashboardWidgets {
  totalSubscribers: number;
  activeSubscribers: number;
  expiredSubscribers: number;
  renewalDue: number;
  expiringIn3Days: number;
  expiringIn2Days: number;
  expiringIn1Day: number;
  revenueCollected: number;
}

export interface DashboardCharts {
  monthlyGrowth: { label: string; count: number }[];
  subscribersByPlatform: { platform: string; count: number }[];
  revenueTrend: { label: string; revenue: number }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  getWidgets(): Observable<DashboardWidgets> {
    return this.http.get<ApiResponse<DashboardWidgets>>(`${this.baseUrl}/widgets`).pipe(map((res) => res.data));
  }

  getCharts(months = 6): Observable<DashboardCharts> {
    return this.http
      .get<ApiResponse<DashboardCharts>>(`${this.baseUrl}/charts`, { params: { months } })
      .pipe(map((res) => res.data));
  }
}
