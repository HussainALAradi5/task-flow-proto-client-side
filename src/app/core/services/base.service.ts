import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, expand, EMPTY, reduce, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResult } from '../interfaces/paginated-result.interface';
import { PaginationParams } from '../interfaces/pagination-params.interface';
import { ApiResponse } from '../interfaces/api-response.interface';
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

  getAllPages<T>(endpoint: string, includeInactive = false): Observable<T[]> {
    const limit = 100;
    return this.getAll<T>(endpoint, { page: 1, limit }, undefined, undefined, includeInactive).pipe(
      expand((response) => response.pagination.page < response.pagination.totalPages
        ? this.getAll<T>(endpoint, { page: response.pagination.page + 1, limit }, undefined, undefined, includeInactive)
        : EMPTY),
      map((response) => response.data),
      reduce((items, page) => [...items, ...page], [] as T[]),
    );
  }

  getById<T>(endpoint: string, id: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  create<T>(endpoint: string, data: object, successMsg?: string): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, data).pipe(
      tap({
        next: () => { if (successMsg) this.toast.success(successMsg); },
        error: (err: { error?: { message?: string } }) => this.toast.error(err.error?.message || 'Operation failed'),
      }),
    );
  }

  update<T>(endpoint: string, id: string, data: object, successMsg?: string): Observable<ApiResponse<T>> {
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
