import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center">
            <a routerLink="/" class="text-xl font-bold text-blue-600">TaskFlow</a>
          </div>
          <div class="flex items-center gap-4">
            @if (authService.isLoggedIn()) {
              <span class="text-sm text-gray-600">{{ authService.currentUser()?.userName }}</span>
              <button (click)="authService.logout()" class="text-sm text-red-600 hover:text-red-800">
                Logout
              </button>
            } @else {
              <a routerLink="/auth/login" class="text-sm text-blue-600 hover:text-blue-800">Login</a>
              <a routerLink="/auth/signup" class="text-sm text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">
                Sign Up
              </a>
            }
          </div>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  authService = inject(AuthService);
}
