import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse } from '../models/user.model';
import { SignupRequest, LoginRequest } from '../dto/user.dto';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/users`;
  private readonly tokenKey = 'taskflow_token';
  private toast = inject(ToastService);

  private currentUserSignal = signal<User | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUserSignal());
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'Admin');
  readonly isLeader = computed(() => this.currentUserSignal()?.role === 'Leader');

  constructor(private http: HttpClient, private router: Router) {
    this.loadUser();
  }

  signup(data: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, data).pipe(
      tap((res) => {
        this.setSession(res.token, res.data);
        this.toast.success('Account created successfully!');
      }),
      catchError((err) => {
        this.toast.error(err.error?.message || 'Signup failed');
        return throwError(() => err);
      }),
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((res) => {
        this.setSession(res.token, res.data);
        this.toast.success('Welcome back!');
      }),
      catchError((err) => {
        this.toast.error(err.error?.message || 'Login failed');
        return throwError(() => err);
      }),
    );
  }

  getProfile(): Observable<{ status: string; data: User }> {
    return this.http.get<{ status: string; data: User }>(`${this.apiUrl}/profile`).pipe(
      tap((res) => this.currentUserSignal.set(res.data)),
    );
  }

  updateProfile(data: Partial<User>): Observable<{ status: string; data: User }> {
    return this.http.patch<{ status: string; data: User }>(`${this.apiUrl}/profile`, data).pipe(
      tap((res) => {
        this.currentUserSignal.set(res.data);
        this.toast.success('Profile updated');
      }),
      catchError((err) => {
        this.toast.error(err.error?.message || 'Update failed');
        return throwError(() => err);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setSession(token: string, user: User): void {
    localStorage.setItem(this.tokenKey, token);
    this.currentUserSignal.set(user);
  }

  private loadUser(): void {
    const token = this.getToken();
    if (token) {
      this.getProfile().subscribe({
        error: () => {
          localStorage.removeItem(this.tokenKey);
          this.currentUserSignal.set(null);
        },
      });
    }
  }
}
