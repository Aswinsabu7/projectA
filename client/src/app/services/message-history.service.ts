import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, PaginationMeta } from '../shared/models/api-response.model';
import { MessageHistory, MessageType } from '../shared/models/message-history.model';

export interface MessageQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  messageType?: string;
}

@Injectable({ providedIn: 'root' })
export class MessageHistoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/messages`;

  list(query: MessageQuery): Observable<{ items: MessageHistory[]; meta: PaginationMeta }> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value));
    });
    return this.http
      .get<ApiResponse<MessageHistory[]>>(this.baseUrl, { params })
      .pipe(map((res) => ({ items: res.data, meta: res.meta! })));
  }

  send(subscriberId: string, messageType: MessageType): Observable<MessageHistory> {
    return this.http
      .post<ApiResponse<MessageHistory>>(`${this.baseUrl}/send`, { subscriberId, messageType })
      .pipe(map((res) => res.data));
  }

  resend(id: string): Observable<MessageHistory> {
    return this.http.post<ApiResponse<MessageHistory>>(`${this.baseUrl}/${id}/resend`, {}).pipe(map((res) => res.data));
  }
}
