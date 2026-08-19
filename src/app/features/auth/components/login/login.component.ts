import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { GenericInputComponent } from '../../../../shared/components/generic-input/generic-input.component';
import { GenericButtonComponent } from '../../../../shared/components/generic-button/generic-button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, GenericInputComponent, GenericButtonComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to TaskFlow</h2>
        </div>
        <form class="mt-8 space-y-6" (submit)="onSubmit($event)">
          @if (error()) {
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {{ error() }}
            </div>
          }
          <div class="rounded-md shadow-sm space-y-4">
            <app-generic-input
              id="email"
              label="Email address"
              type="email"
              placeholder="Enter your email"
              [required]="true"
            />
            <app-generic-input
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              [required]="true"
            />
          </div>
          <div>
            <app-generic-button type="submit" [loading]="loading()">
              Sign in
            </app-generic-button>
          </div>
          <div class="text-center">
            <a routerLink="/auth/signup" class="text-blue-600 hover:text-blue-800">
              Don't have an account? Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  onSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const email = (form.querySelector('#email') as HTMLInputElement).value;
    const password = (form.querySelector('#password') as HTMLInputElement).value;

    this.loading.set(true);
    this.error.set(null);

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.router.navigate(['/board']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Login failed');
        this.loading.set(false);
      },
    });
  }
}
