import { Component, effect, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { TeamService } from '../../features/team/services/team';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <a routerLink="/" class="flex items-center gap-2">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">TF</span>
            </div>
            <span class="hidden sm:inline text-xl font-bold text-gray-900 dark:text-white">TaskFlow</span>
          </a>

          <div class="flex items-center gap-2 sm:gap-4">
            <button
              (click)="themeService.toggle()"
              aria-label="Toggle color theme"
              class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              @if (themeService.theme() === 'light') {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            </button>

            @if (authService.isLoggedIn()) {
              <a routerLink="/notifications" aria-label="Notifications" class="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 01-6 0m6 0H9" /></svg>
                @if (notifications.unreadCount()) { <span class="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1 text-center text-xs text-white" [attr.aria-label]="notifications.unreadCount() + ' unread notifications'">{{ notifications.unreadCount() > 99 ? '99+' : notifications.unreadCount() }}</span> }
              </a>
              <a routerLink="/teams" class="px-2 py-1.5 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30">Teams @if (teams.pendingCount()) { <span class="ml-1 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white" [attr.aria-label]="teams.pendingCount() + ' pending invitations'">{{ teams.pendingCount() }}</span> }</a>
              <a routerLink="/profile" class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span class="text-blue-600 dark:text-blue-400 font-medium text-xs">{{ authService.currentUser()?.userName?.charAt(0)?.toUpperCase() }}</span>
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">{{ authService.currentUser()?.userName }}</span>
              </a>
              <button
                (click)="authService.logout()"
                class="px-2 sm:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Logout
              </button>
            } @else {
              <a routerLink="/auth/login" class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Sign in
              </a>
              <a routerLink="/auth/signup" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Get started
              </a>
            }
          </div>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent implements OnDestroy {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  teams = inject(TeamService);
  notifications = inject(NotificationService);
  private refreshTimer?: number;

  constructor() {
    effect(() => {
      if (this.authService.currentUser()) {
        this.teams.pendingInvitations().subscribe({ error: () => this.teams.pendingCount.set(0) });
        this.notifications.refreshCount();
      } else { this.teams.pendingCount.set(0); this.notifications.unreadCount.set(0); }
    });
    if (typeof window !== 'undefined') this.refreshTimer = window.setInterval(() => {
      if (this.authService.currentUser()) this.notifications.refreshCount();
    }, 30000);
  }

  ngOnDestroy(): void { if (this.refreshTimer) window.clearInterval(this.refreshTimer); }
}
