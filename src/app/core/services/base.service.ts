import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResult, PaginationParams } from '../models/pagination.model';
import { ApiResponse } from '../models/api-response.model';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class BaseService {
  protected http = inject(HttpClient);
  protected toast = inject(ToastService);
  protected baseUrl = environment.apiUrl;

  getAll<T>(endpoint: string, params?: PaginationParams, search?: string, exactMatch?: boolean, includeInactive?: boolean): Observable<PaginatedResult<T>> {
    let httpParams = new HttpParams();
    if (params) {
      httpParams = httpParams.set('page', params.page.toString()).set('limit', params.limit.toString());
    }
    if (search) {
      httpParams = httpParams.set('search', search);
    }
    if (exactMatch) {
      httpParams = httpParams.set('exactMatch', 'true');
    }
    if (includeInactive) {
      httpParams = httpParams.set('includeInactive', 'true');
    }
    return this.http.get<PaginatedResult<T>>(`${this.baseUrl}/${endpoint}`, { params: httpParams });
  }

  getById<T>(endpoint: string, id: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  create<T>(endpoint: string, data: Partial<T>, successMsg?: string): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, data).pipe(
      tap({
        next: () => { if (successMsg) this.toast.success(successMsg); },
        error: (err: { error?: { message?: string } }) => this.toast.error(err.error?.message || 'Operation failed'),
      }),
    );
  }

  update<T>(endpoint: string, id: string, data: Partial<T>, successMsg?: string): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}/${endpoint}/${id}`, data).pipe(
      tap({
        next: () => { if (successMsg) this.toast.success(successMsg); },
        error: (err: { error?: { message?: string } }) => this.toast.error(err.error?.message || 'Operation failed'),
      }),
    );
  }

  delete<T>(endpoint: string, id: string, successMsg?: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}/${endpoint}/${id}`).pipe(
      tap({
        next: () => { if (successMsg) this.toast.success(successMsg); },
        error: (err: { error?: { message?: string } }) => this.toast.error(err.error?.message || 'Operation failed'),
      }),
    );
  }
}
