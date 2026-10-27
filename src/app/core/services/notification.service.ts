import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../interfaces/notification.interface';
import { PaginatedResult } from '../interfaces/paginated-result.interface';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/notifications`;
  unreadCount = signal(0);

  list(page = 1, unread = false): Observable<PaginatedResult<Notification> & { unreadCount: number }> {
    return this.http.get<PaginatedResult<Notification> & { unreadCount: number }>(this.url, { params: { page, limit: 20, unread } }).pipe(
      tap((response) => this.unreadCount.set(response.unreadCount)),
    );
  }
  refreshCount(): void {
    this.http.get<ApiResponse<{ unreadCount: number }>>(`${this.url}/unread-count`).subscribe({
      next: (response) => this.unreadCount.set(response.data.unreadCount),
      error: () => this.unreadCount.set(0),
    });
  }
  read(id: string): Observable<ApiResponse<Notification>> {
    return this.http.patch<ApiResponse<Notification>>(`${this.url}/${id}/read`, {});
  }
  readAll(): Observable<ApiResponse<unknown>> {
    return this.http.patch<ApiResponse<unknown>>(`${this.url}/read-all`, {});
  }
}
