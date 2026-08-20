import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { GenericButtonComponent } from '../../../../shared/components/generic-button/generic-button.component';
import { GenericPasswordInputComponent } from '../../../../shared/components/generic-password-input/generic-password-input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, GenericButtonComponent, GenericPasswordInputComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div class="w-full max-w-md">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span class="text-white font-bold text-2xl">TF</span>
            </div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
            <p class="text-gray-500 dark:text-gray-400 mt-2">Sign in to your account</p>
          </div>
          <form (submit)="onSubmit($event)" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" [(ngModel)]="email" name="email" required
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="you@example.com" />
            </div>
            <app-generic-password-input id="login-password" label="Password" placeholder="Enter your password"
              [value]="password" (valueChange)="password = $event" [required]="true" />
            <app-generic-button type="submit" [loading]="loading()" class="w-full">Sign In</app-generic-button>
          </form>
          <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account? <a routerLink="/auth/signup" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);

  constructor() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/profile']);
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.loading.set(true);
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/profile']),
      error: () => this.loading.set(false),
    });
  }
}
